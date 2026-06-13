const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    jidDecode,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@systemzero/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs-extra");
const chalk = require("chalk");
const figlet = require("figlet");
const path = require("path");
const express = require("express");
const QRCode = require("qrcode");

// ─── CONFIGURAÇÕES E CAMINHOS ─────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_PATH = path.resolve(__dirname, "session");
let currentQR = null;
let pairingCode = null;
let botStatus = "aguardando";

// ─── PERSISTÊNCIA DE SESSÃO (RAILWAY) ──────────────────────────────────────────
function restaurarSessao() {
    const sessionData = process.env.SESSION_DATA;
    if (!sessionData) return false;
    try {
        fs.ensureDirSync(SESSION_PATH);
        const decoded = Buffer.from(sessionData, "base64").toString("utf-8");
        const creds = JSON.parse(decoded);
        const credsPath = path.join(SESSION_PATH, "creds.json");
        fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
        console.log(chalk.green("[RAILWAY] Sessão restaurada via SESSION_DATA!"));
        return true;
    } catch (e) {
        console.log(chalk.red("[RAILWAY] Erro ao restaurar SESSION_DATA: " + e.message));
        return false;
    }
}

function gerarSessionData() {
    try {
        const credsPath = path.join(SESSION_PATH, "creds.json");
        if (!fs.existsSync(credsPath)) return;
        const creds = fs.readFileSync(credsPath, "utf-8");
        const encoded = Buffer.from(creds).toString("base64");
        console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(chalk.yellow("  SALVE ESTE VALOR COMO SESSION_DATA NO RAILWAY:"));
        console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(chalk.white(encoded));
        console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
    } catch (e) {}
}

// ─── SERVIDOR WEB ─────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
    if (botStatus === "conectado") {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Black Lotus</title><style>body{background:#0a0a0a;color:#fff;font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}h1{color:#7c3aed;}</style></head><body><h1>🪷 Black Lotus Online</h1><p>Sessão ativa e protegida.</p></body></html>`);
    }
    let qrImage = currentQR ? await QRCode.toDataURL(currentQR, { width: 280 }) : null;
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Conectar Black Lotus</title><meta http-equiv="refresh" content="20"><style>body{background:#0a0a0a;color:#fff;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:20px;}h1{color:#7c3aed;}.box{background:#111;border:2px solid #7c3aed;border-radius:16px;padding:24px;text-align:center;max-width:400px;}.code{background:#1a0a2e;border:2px solid #7c3aed;border-radius:12px;padding:20px;font-size:32px;font-weight:bold;color:#a78bfa;margin:10px 0;letter-spacing:5px;}</style></head><body><h1>🪷 Black Lotus Bot</h1><div class="box"><h2>Pareamento</h2>${pairingCode ? `<div class="code">${pairingCode}</div><p>Digite no WhatsApp</p>` : currentQR ? `<img src="${qrImage}"/><p>Escaneie o QR Code</p>` : `<p>Gerando conexão...</p>`}</div></body></html>`);
});
app.listen(PORT, () => console.log(chalk.green(`[WEB] Porta ${PORT}`)));

// ─── NÚCLEO DO BOT ────────────────────────────────────────────────────────────
let isReconnecting = false;

async function startSystemZR() {
    if (isReconnecting) return;
    isReconnecting = true;
    
    restaurarSessao();
    fs.ensureDirSync(SESSION_PATH);
    
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    console.log(chalk.magenta(figlet.textSync("Black Lotus", { font: "Small" })));

    const systemZR = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        browser: Browsers.ubuntu("Chrome"),
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        getMessage: async (key) => ({ conversation: "Olá!" })
    });

    // Código de Pareamento Automático
    if (!state.creds.registered && process.env.NUMERO) {
        setTimeout(async () => {
            try {
                pairingCode = await systemZR.requestPairingCode(process.env.NUMERO.replace(/[^0-9]/g, ""));
                console.log(chalk.green(`[WA] Código: ${pairingCode}`));
            } catch (e) {}
        }, 5000);
    }

    systemZR.ev.on("creds.update", saveCreds);

    systemZR.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) currentQR = qr;
        if (connection === "close") {
            const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                fs.removeSync(SESSION_PATH);
                process.exit(1);
            } else {
                isReconnecting = false;
                setTimeout(startSystemZR, 5000);
            }
        } else if (connection === "open") {
            botStatus = "conectado";
            console.log(chalk.green("\n✅ Black Lotus Conectado!\n"));
            gerarSessionData();
            isReconnecting = false;
        }
    });

    systemZR.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message || mek.key.remoteJid === "status@broadcast") return;
            await require("./index")(systemZR, chatUpdate);
        } catch (err) {}
    });

    return systemZR;
}

startSystemZR();
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
