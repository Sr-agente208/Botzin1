const baileys = require("@systemzero/baileys");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    jidNormalizedUser 
} = baileys;
const { Boom } = require("@hapi/boom");
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const express = require("express");
const qrcode = require("qrcode");
const chalk = require("chalk");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = null;
let pairingCodeData = null;
let connectionStatus = "Iniciando...";

// SERVIDOR WEB PRIORITÁRIO PARA O RAILWAY
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Black Lotus - Conexão</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #0a0a0a; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #1a1a1a; padding: 2rem; border-radius: 15px; border: 1px solid #4a148c; box-shadow: 0 0 20px rgba(74, 20, 140, 0.3); text-align: center; max-width: 90%; }
            h1 { color: #9c27b0; margin-bottom: 1rem; }
            .status { margin: 1rem 0; font-weight: bold; color: #ffeb3b; }
            img { background: white; padding: 10px; border-radius: 10px; margin-top: 1rem; max-width: 100%; }
            .code { background: #2d2d2d; padding: 1rem; border-radius: 5px; font-family: monospace; font-size: 1.5rem; color: #00e676; margin-top: 1rem; letter-spacing: 3px; }
            .footer { margin-top: 2rem; font-size: 0.8rem; color: #666; }
        </style>
        <script>setTimeout(() => { location.reload(); }, 20000);</script>
    </head>
    <body>
        <div class="card">
            <h1>🪷 Black Lotus Bot</h1>
            <div class="status">Status: ${connectionStatus}</div>
            ${qrCodeData ? `<h3>Escanear QR Code:</h3><img src="${qrCodeData}" alt="QR Code">` : ""}
            ${pairingCodeData ? `<h3>Código de Pareamento:</h3><div class="code">${pairingCodeData}</div>` : ""}
            ${!qrCodeData && !pairingCodeData && connectionStatus === "Aguardando Conexão..." ? "<p>Gerando métodos de conexão... aguarde.</p>" : ""}
        </div>
        <div class="footer">Sr.Agente208 & Black Lotus System</div>
    </body>
    </html>`;
    res.send(html);
});

app.listen(port, "0.0.0.0", () => {
    console.log(chalk.magenta(`[WEB] Servidor rodando na porta ${port}`));
});

// SISTEMA DE AUTO-PING LOCAL PARA EVITAR HIBERNAÇÃO
setInterval(() => {
    // Usando 127.0.0.1 para garantir comunicação interna sem depender de DNS/URL externa
    axios.get(`http://127.0.0.1:${port}`).then(() => {
        console.log(chalk.blue("[KEEP-ALIVE] Pulso local enviado com sucesso."));
    }).catch((err) => {
        // Se falhar o local, tenta o Railway Static URL se existir
        if (process.env.RAILWAY_STATIC_URL) {
            axios.get(`https://${process.env.RAILWAY_STATIC_URL}`).catch(() => {});
        }
        console.log(chalk.red("[KEEP-ALIVE] Pulso local falhou, tentando alternativa..."));
    });
}, 120000); // A cada 2 minutos

async function startBot() {
    const sessionDir = path.resolve(__dirname, "session");
    
    // RESTAURAÇÃO DE SESSÃO VIA VARIÁVEL DE AMBIENTE
    if (process.env.SESSION_DATA && !fs.existsSync(sessionDir)) {
        console.log(chalk.yellow("[SESSION] Restaurando sessão via SESSION_DATA..."));
        try {
            const creds = Buffer.from(process.env.SESSION_DATA, 'base64').toString('utf-8');
            fs.ensureDirSync(sessionDir);
            fs.writeFileSync(path.join(sessionDir, "creds.json"), creds);
            console.log(chalk.green("[SESSION] Sessão restaurada com sucesso!"));
        } catch (e) {
            console.log(chalk.red("[SESSION] Erro ao restaurar SESSION_DATA:"), e.message);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
    });

    // LÓGICA DE PAREAMENTO AUTOMÁTICO
    if (!conn.authState.creds.registered && process.env.NUMERO) {
        connectionStatus = "Gerando Código de Pareamento...";
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(process.env.NUMERO.replace(/\D/g, ""));
                pairingCodeData = code;
                console.log(chalk.green(`[PAREAMENTO] Código: ${code}`));
                connectionStatus = "Aguardando Pareamento...";
            } catch (e) {
                console.log(chalk.red("[PAREAMENTO] Erro:"), e.message);
            }
        }, 5000);
    }

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = await qrcode.toDataURL(qr);
            connectionStatus = "Aguardando Conexão...";
            console.log(chalk.yellow("[QR] Novo QR Code gerado."));
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
            console.log(chalk.red(`[CONEXÃO] Fechada. Motivo: ${lastDisconnect.error?.message}. Reconectando: ${shouldReconnect}`));
            connectionStatus = "Desconectado. Reconectando...";
            qrCodeData = null;
            pairingCodeData = null;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            connectionStatus = "Conectado e Online!";
            qrCodeData = null;
            pairingCodeData = null;
            console.log(chalk.green("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"));
            console.log(chalk.green("┃  🪷 BLACK LOTUS ESTÁ ONLINE  ┃"));
            console.log(chalk.green("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"));
            
            // EXPORTAR SESSION_DATA PARA O LOG
            setTimeout(() => {
                const credsFile = path.join(sessionDir, "creds.json");
                if (fs.existsSync(credsFile)) {
                    const creds = fs.readFileSync(credsFile, "utf-8");
                    const sessionString = Buffer.from(creds).toString("base64");
                    console.log(chalk.yellow("\n=== [IMPORTANTE] COPIE SEU SESSION_DATA ABAIXO ==="));
                    console.log(chalk.white(sessionString));
                    console.log(chalk.yellow("==================================================\n"));
                }
            }, 5000);
        }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            require("./index")(conn, chatUpdate);
        } catch (err) {
            console.log(chalk.red("[ERRO INDEX]:"), err);
        }
    });
}

// INICIALIZAÇÃO BLINDADA
process.on("uncaughtException", (err) => {
    console.log(chalk.red("[CRITICAL ERROR]:"), err.message);
});

process.on("unhandledRejection", (reason) => {
    console.log(chalk.red("[PROMISE REJECTION]:"), reason);
});

startBot().catch(err => console.log(chalk.red("[START ERROR]:"), err));
