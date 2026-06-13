const baileys = require("@systemzero/baileys");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
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
let socketStatus = "closed";

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
        <script>setTimeout(() => { location.reload(); }, 15000);</script>
    </head>
    <body>
        <div class="card">
            <h1>🪷 Black Lotus Bot</h1>
            <div class="status">Status: ${connectionStatus}</div>
            ${qrCodeData ? `<h3>Escanear QR Code:</h3><img src="${qrCodeData}" alt="QR Code">` : ""}
            ${pairingCodeData ? `<h3>Código de Pareamento:</h3><div class="code">${pairingCodeData}</div>` : ""}
            ${!qrCodeData && !pairingCodeData ? "<p>Aguardando resposta do servidor WhatsApp...</p>" : ""}
        </div>
        <div class="footer">Sr.Agente208 & Black Lotus System</div>
    </body>
    </html>`;
    res.send(html);
});

app.listen(port, "0.0.0.0", () => {
    console.log(chalk.magenta(`[WEB] Servidor rodando na porta ${port}`));
});

// SISTEMA DE AUTO-PING LOCAL
setInterval(() => {
    axios.get(`http://127.0.0.1:${port}`).catch(() => {});
}, 120000);

async function startBot() {
    const sessionDir = path.resolve(__dirname, "session");
    
    // Se a sessão estiver corrompida (muitos arquivos pequenos ou erros de reconexão), limpa
    if (socketStatus === "reconnecting_loop") {
        console.log(chalk.red("[SESSION] Detectado loop de reconexão. Limpando sessão..."));
        await fs.remove(sessionDir);
        socketStatus = "closed";
    }

    if (process.env.SESSION_DATA && !fs.existsSync(sessionDir)) {
        try {
            const creds = Buffer.from(process.env.SESSION_DATA, 'base64').toString('utf-8');
            await fs.ensureDir(sessionDir);
            await fs.writeFile(path.join(sessionDir, "creds.json"), creds);
            console.log(chalk.green("[SESSION] Restaurada via SESSION_DATA!"));
        } catch (e) {}
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
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = await qrcode.toDataURL(qr);
            connectionStatus = "Aguardando Escaneamento...";
        }

        if (connection === "close") {
            socketStatus = "closed";
            const code = (lastDisconnect.error instanceof Boom) ? lastDisconnect.error.output.statusCode : 0;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            
            console.log(chalk.red(`[CONEXÃO] Fechada (Código: ${code}). Reconectando: ${shouldReconnect}`));
            
            if (code === 401 || code === 440) {
                socketStatus = "reconnecting_loop";
                connectionStatus = "Sessão Expirada. Limpando...";
            } else {
                connectionStatus = "Reconectando...";
            }

            qrCodeData = null;
            pairingCodeData = null;
            if (shouldReconnect) setTimeout(startBot, 5000);
        } else if (connection === "open") {
            socketStatus = "open";
            connectionStatus = "Online!";
            qrCodeData = null;
            pairingCodeData = null;
            console.log(chalk.green("[CONEXÃO] Bot Black Lotus está online!"));
            
            setTimeout(async () => {
                const credsFile = path.join(sessionDir, "creds.json");
                if (await fs.pathExists(credsFile)) {
                    const creds = await fs.readFile(credsFile, "utf-8");
                    const sessionString = Buffer.from(creds).toString("base64");
                    console.log(chalk.yellow("\n=== [SESSION_DATA] ===\n" + sessionString + "\n======================\n"));
                }
            }, 5000);
        }
    });

    // PAREAMENTO MAIS SEGURO
    if (!conn.authState.creds.registered && process.env.NUMERO) {
        setTimeout(async () => {
            if (socketStatus === "open" || connectionStatus === "Online!") return;
            try {
                connectionStatus = "Gerando Código...";
                const code = await conn.requestPairingCode(process.env.NUMERO.replace(/\D/g, ""));
                pairingCodeData = code;
                connectionStatus = "Aguardando Pareamento...";
                console.log(chalk.green(`[PAREAMENTO] Código: ${code}`));
            } catch (e) {
                console.log(chalk.red("[PAREAMENTO] Falha:"), e.message);
                if (e.message.includes("Closed")) {
                    setTimeout(startBot, 10000);
                }
            }
        }, 10000);
    }

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

process.on("uncaughtException", (err) => {
    console.log(chalk.red("[ERRO CRÍTICO]:"), err.message);
});

startBot().catch(err => console.log(chalk.red("[ERRO START]:"), err));
