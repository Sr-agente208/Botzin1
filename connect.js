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

// ─── SERVIDOR WEB (INTERFACE) ─────────────────────────────────────────────────
app.get("/", async (req, res) => {
    if (botStatus === "conectado") {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Black Lotus</title><style>body{background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}h1{color:#7c3aed;}</style></head><body><h1>🪷 Black Lotus Online</h1><p>O bot está conectado com sucesso.</p></body></html>`);
    }

    let qrImage = null;
    if (currentQR) {
        try {
            qrImage = await QRCode.toDataURL(currentQR, { width: 300, margin: 2 });
        } catch (e) {}
    }

    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Conectar Black Lotus</title>
<meta http-equiv="refresh" content="15">
<style>
  body{background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:20px;}
  h1{color:#7c3aed;margin:0;}
  .container{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:20px;}
  .box{background:#111;border:2px solid #7c3aed;border-radius:16px;padding:30px;text-align:center;min-width:300px;box-shadow:0 0 20px rgba(124,58,237,0.2);}
  .code{background:#1a0a2e;border:2px solid #7c3aed;border-radius:12px;padding:20px;font-size:32px;font-weight:bold;color:#a78bfa;margin:15px 0;letter-spacing:5px;}
  img{border-radius:8px;background:#fff;padding:10px;}
  .badge{background:#7c3aed;color:#fff;padding:5px 15px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:15px;display:inline-block;}
  p{color:#888;font-size:14px;}
</style></head>
<body>
  <h1>🪷 Black Lotus Bot</h1>
  <div class="container">
    <div class="box">
      <span class="badge">MÉTODO 1: CÓDIGO</span>
      ${pairingCode ? `<div class="code">${pairingCode}</div><p>Digite este código no seu WhatsApp</p>` : `<p>Aguardando número...</p><p style="font-size:11px">Defina a variável <b>NUMERO</b> no Railway</p>`}
    </div>
    <div class="box">
      <span class="badge">MÉTODO 2: QR CODE</span>
      ${qrImage ? `<img src="${qrImage}"/><p style="margin-top:15px">Escaneie com a câmera do WhatsApp</p>` : `<p>Gerando QR Code...</p>`}
    </div>
  </div>
  <p>Página atualiza automaticamente a cada 15 segundos.</p>
</body></html>`);
});
app.listen(PORT, () => console.log(chalk.green(`[WEB] Servidor na porta ${PORT}`)));

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
        getMessage: async () => ({ conversation: "Olá!" })
    });

    // Gerar Código de Pareamento
    if (!state.creds.registered && process.env.NUMERO) {
        setTimeout(async () => {
            try {
                pairingCode = await systemZR.requestPairingCode(process.env.NUMERO.replace(/[^0-9]/g, ""));
                console.log(chalk.green(`[WA] Código de Pareamento: ${pairingCode}`));
            } catch (e) { console.log(chalk.red("[WA] Erro ao gerar código")); }
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
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
