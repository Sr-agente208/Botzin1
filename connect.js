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
const axios = require("axios");

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_PATH = path.resolve(__dirname, "session");
let currentQR = null;
let pairingCode = null;
let botStatus = "aguardando";

// ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────────
function restaurarSessao() {
    const sessionData = process.env.SESSION_DATA;
    if (!sessionData) return false;
    try {
        fs.ensureDirSync(SESSION_PATH);
        const decoded = Buffer.from(sessionData, "base64").toString("utf-8");
        const creds = JSON.parse(decoded);
        fs.writeFileSync(path.join(SESSION_PATH, "creds.json"), JSON.stringify(creds, null, 2));
        console.log(chalk.green("[RAILWAY] Sessão restaurada via SESSION_DATA!"));
        return true;
    } catch (e) { return false; }
}

function gerarSessionData() {
    try {
        const credsPath = path.join(SESSION_PATH, "creds.json");
        if (!fs.existsSync(credsPath)) return;
        const encoded = Buffer.from(fs.readFileSync(credsPath, "utf-8")).toString("base64");
        console.log(chalk.yellow("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(chalk.white("SALVE COMO SESSION_DATA NO RAILWAY:"));
        console.log(chalk.cyan(encoded));
        console.log(chalk.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
    } catch (e) {}
}

// ─── AUTO-KEEP-ALIVE (Impede Hibernação) ──────────────────────────────────────
function keepAlive() {
    const url = process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
        try {
            await axios.get(`https://${url}`).catch(() => axios.get(`http://${url}`));
            console.log(chalk.dim("[SYSTEM] Auto-Ping realizado com sucesso."));
        } catch (e) {}
    }, 5 * 60 * 1000); // A cada 5 minutos
}

// ─── SERVIDOR WEB ─────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
    if (botStatus === "conectado") {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Black Lotus</title><style>body{background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}h1{color:#7c3aed;}</style></head><body><h1>🪷 Black Lotus Online</h1><p>O bot está conectado e ativo.</p></body></html>`);
    }
    let qrImage = currentQR ? await QRCode.toDataURL(currentQR, { width: 300, margin: 2 }) : null;
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Conectar Black Lotus</title><meta http-equiv="refresh" content="15"><style>body{background:#0a0a0a;color:#fff;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:20px;}h1{color:#7c3aed;}.container{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;}.box{background:#111;border:2px solid #7c3aed;border-radius:16px;padding:30px;text-align:center;min-width:300px;}.code{background:#1a0a2e;border:2px solid #7c3aed;border-radius:12px;padding:20px;font-size:32px;font-weight:bold;color:#a78bfa;margin:15px 0;letter-spacing:5px;}img{border-radius:8px;background:#fff;padding:10px;}.badge{background:#7c3aed;color:#fff;padding:5px 15px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:15px;display:inline-block;}</style></head><body><h1>🪷 Black Lotus Bot</h1><div class="container"><div class="box"><span class="badge">CÓDIGO</span>${pairingCode ? `<div class="code">${pairingCode}</div>` : `<p>Aguardando número...</p>`}</div><div class="box"><span class="badge">QR CODE</span>${qrImage ? `<img src="${qrImage}"/>` : `<p>Gerando QR...</p>`}</div></div></body></html>`);
});
app.listen(PORT, () => {
    console.log(chalk.green(`[WEB] Servidor na porta ${PORT}`));
    keepAlive();
});

// ─── NÚCLEO ───────────────────────────────────────────────────────────────────
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
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000, // Ping agressivo
        getMessage: async () => ({ conversation: "Olá!" })
    });

    if (!state.creds.registered && process.env.NUMERO) {
        setTimeout(async () => {
            try {
                pairingCode = await systemZR.requestPairingCode(process.env.NUMERO.replace(/[^0-9]/g, ""));
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
                console.log(chalk.yellow("[SYSTEM] Reconectando em 3 segundos..."));
                setTimeout(startSystemZR, 3000);
            }
        } else if (connection === "open") {
            botStatus = "conectado";
            currentQR = null;
            pairingCode = null;
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
process.on("uncaughtException", (e) => console.log(chalk.red("[ERROR] " + e.message)));
process.on("unhandledRejection", (e) => console.log(chalk.red("[REJECTION] " + e.message)));
