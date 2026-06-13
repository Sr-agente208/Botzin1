const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    jidDecode,
    Browsers
} = require("@systemzero/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs-extra");
const chalk = require("chalk");
const figlet = require("figlet");
const path = require("path");
const express = require("express");
const QRCode = require("qrcode");

// ─── SERVIDOR WEB ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
let currentQR = null;
let pairingCode = null;
let botStatus = "aguardando";

app.get("/", async (req, res) => {
    if (botStatus === "conectado") {
        return res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Black Lotus Bot</title>
<style>body{background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}
h1{color:#7c3aed;} p{color:#aaa;}</style></head>
<body><h1>🪷 Black Lotus Conectado!</h1><p>O domínio absoluto começou.</p></body></html>`);
    }

    let qrImage = null;
    if (currentQR) {
        try {
            qrImage = await QRCode.toDataURL(currentQR, {
                width: 280, margin: 2,
                color: { dark: "#000000", light: "#ffffff" }
            });
        } catch (e) {}
    }

    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Black Lotus Bot - Conectar</title>
<meta http-equiv="refresh" content="20">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;flex-direction:column;gap:20px;}
h1{color:#7c3aed;font-size:28px;text-align:center;}
.container{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;width:100%;max-width:800px;}
.box{background:#111;border:2px solid #7c3aed;border-radius:16px;padding:24px;text-align:center;flex:1;min-width:260px;}
.box h2{color:#a78bfa;margin-bottom:16px;font-size:18px;}
.box p{color:#888;font-size:13px;margin-top:10px;}
.code{background:#1a0a2e;border:2px solid #7c3aed;border-radius:12px;padding:20px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#a78bfa;margin:10px 0;}
.step{background:#1a1a1a;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:13px;color:#ccc;text-align:left;}
.step span{color:#7c3aed;font-weight:bold;}
.spin{border:4px solid #333;border-top:4px solid #7c3aed;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:20px auto;}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.badge{background:#7c3aed;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;display:inline-block;margin-bottom:12px;}
</style></head>
<body>
<h1>🪷 Black Lotus Bot</h1>
<p style="color:#888;font-size:13px">Página atualiza automaticamente a cada 20s</p>
<div class="container">
  <div class="box">
    <span class="badge">📱 OPÇÃO 1</span>
    <h2>Código de Pareamento</h2>
    ${pairingCode ? `
    <div class="code">${pairingCode}</div>
    <div class="step"><span>1.</span> Aparelhos conectados > Conectar com número</div>
    <div class="step"><span>2.</span> Digite o código acima</div>
    ` : `
    <div class="spin"></div>
    <p>Aguardando número...</p>
    <p style="font-size:11px">Configure a variável <b>NUMERO</b> no Railway</p>
    `}
  </div>
  <div class="box">
    <span class="badge">📷 OPÇÃO 2</span>
    <h2>QR Code</h2>
    ${qrImage ? `
    <img src="${qrImage}" alt="QR Code" width="240" height="240" style="border-radius:8px;margin:0 auto;"/>
    <p>Escaneie com o WhatsApp</p>
    ` : `
    <div class="spin"></div>
    <p>Gerando QR Code...</p>
    `}
  </div>
</div>
</body></html>`);
});

app.listen(PORT, () => {
    console.log(chalk.green(`[WEB] Servidor rodando na porta ${PORT}`));
});

// ─── SESSION DATA ─────────────────────────────────────────────────────────────
const SESSION_PATH = path.resolve(__dirname, "session");

function restaurarSessao() {
    const sessionData = process.env.SESSION_DATA;
    if (!sessionData) return false;
    try {
        fs.ensureDirSync(SESSION_PATH);
        const decoded = Buffer.from(sessionData, "base64").toString("utf-8");
        const creds = JSON.parse(decoded);
        const credsPath = path.join(SESSION_PATH, "creds.json");
        if (!fs.existsSync(credsPath)) {
            fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
            console.log(chalk.green("[RAILWAY] Sessao restaurada!"));
        }
        return true;
    } catch (e) { return false; }
}

function gerarSessionData() {
    try {
        const credsPath = path.join(SESSION_PATH, "creds.json");
        if (!fs.existsSync(credsPath)) return;
        const creds = fs.readFileSync(credsPath, "utf-8");
        const encoded = Buffer.from(creds).toString("base64");
        console.log(chalk.yellow("\nSALVE ESTE VALOR COMO SESSION_DATA NO RAILWAY:\n") + chalk.white(encoded) + "\n");
    } catch (e) {}
}

const _NOISE = /Closing open session|closing session|closed session|SessionEntry|chainKey|registrationId|currentRatchet|ephemeralKeyPair|lastRemoteEphemeralKey|rootKey|indexInfo|baseKey|remoteIdentityKey|pendingPreKey|Bad MAC|Retry count|retrying/i;
const _w = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, enc, cb) => { if (_NOISE.test(c)) { if (typeof cb === "function") cb(); return true; } return _w(c, enc, cb); };

let isReconnecting = false;

async function startSystemZR() {
    if (isReconnecting) return;
    isReconnecting = true;
    currentQR = null;
    pairingCode = null;
    botStatus = "aguardando";

    restaurarSessao();
    fs.ensureDirSync(SESSION_PATH);

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    console.log(chalk.magenta(figlet.textSync("Black Lotus", { font: "Small" })));
    console.log(chalk.magenta(`\nIniciando Black Lotus Bot v2.5.2...\n`));

    const systemZR = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: Browsers.ubuntu("Chrome"), // Browser padrão para melhor compatibilidade
        printQRInTerminal: false,
        syncFullHistory: true, // Sincronização completa
        shouldSyncHistoryMessage: () => true,
        getMessage: async (key) => ({ conversation: "Ola!" })
    });

    // PAREAMENTO AUTOMÁTICO
    const NUMERO = process.env.NUMERO;
    if (!state.creds.registered && NUMERO) {
        setTimeout(async () => {
            try {
                pairingCode = await systemZR.requestPairingCode(NUMERO.replace(/[^0-9]/g, "").trim());
                console.log(chalk.green(`\n✅ CÓDIGO DE PAREAMENTO GERADO: `) + chalk.white.bold(pairingCode));
            } catch (e) {
                console.log(chalk.red("\n❌ Erro ao gerar código de pareamento: " + e.message));
            }
        }, 5000);
    }

    systemZR.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;
            if (mek.key.remoteJid === "status@broadcast") return;
            
            // Log de recebimento para depuração no Railway
            console.log(chalk.cyan(`[MSG] Recebida de: ${mek.key.remoteJid}`));
            
            await require("./index")(systemZR, chatUpdate);
        } catch (err) {
            console.error(chalk.red("[ERRO INDEX]:"), err);
        }
    });

    systemZR.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) currentQR = qr;
        if (connection === "connecting") console.log(chalk.yellow("[WA] Conectando..."));
        if (connection === "close") {
            const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red("Sessao encerrada."));
                process.exit(1);
            } else {
                isReconnecting = false;
                setTimeout(startSystemZR, 5000);
            }
        } else if (connection === "open") {
            botStatus = "conectado";
            currentQR = null;
            pairingCode = null;
            console.log(chalk.green("\n✅ Black Lotus conectado e sincronizado!\n"));
            isReconnecting = false;
            gerarSessionData();
        }
    });

    systemZR.ev.on("creds.update", saveCreds);
    
    process.on("uncaughtException", (err) => { console.error("Uncaught Exception:", err); });
    process.on("unhandledRejection", (reason, promise) => { console.error("Unhandled Rejection:", reason); });

    return systemZR;
}

startSystemZR();
