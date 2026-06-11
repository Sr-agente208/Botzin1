const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
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

// ─── SERVIDOR WEB PARA QR CODE ────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
let currentQR = null;
let botStatus = "aguardando";

app.get("/", async (req, res) => {
    if (botStatus === "conectado") {
        return res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Kay System</title>
<style>body{background:#111;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}
h1{color:#25D366;} p{color:#aaa;}</style></head>
<body><h1>✅ Bot Conectado!</h1><p>Kay System está online e funcionando.</p></body></html>`);
    }

    if (!currentQR) {
        return res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Kay System - QR Code</title>
<meta http-equiv="refresh" content="5">
<style>body{background:#111;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}
h1{color:#25D366;} p{color:#aaa;} .spin{border:4px solid #333;border-top:4px solid #25D366;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:20px auto;}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head>
<body><h1>Kay System</h1><div class="spin"></div><p>Gerando QR Code... aguarde.</p><p style="font-size:12px">A página atualiza automaticamente.</p></body></html>`);
    }

    try {
        const qrImage = await QRCode.toDataURL(currentQR, {
            width: 300,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" }
        });

        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Kay System - QR Code</title>
<meta http-equiv="refresh" content="30">
<style>
body{background:#111;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:16px;}
h1{color:#25D366;margin:0;} 
.box{background:#1a1a1a;border:2px solid #25D366;border-radius:16px;padding:24px;text-align:center;}
img{border-radius:8px;display:block;}
p{color:#aaa;margin:8px 0;font-size:14px;}
.badge{background:#25D366;color:#000;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;}
</style></head>
<body>
  <h1>Kay System 🤖</h1>
  <div class="box">
    <img src="${qrImage}" alt="QR Code WhatsApp" width="280" height="280"/>
    <p>Escaneie com o WhatsApp</p>
    <span class="badge">Abre o WhatsApp → Aparelhos conectados → Conectar aparelho</span>
  </div>
  <p style="font-size:12px;color:#555">QR atualiza a cada 30s automaticamente</p>
</body></html>`);
    } catch (e) {
        res.send("Erro ao gerar QR. Veja os logs.");
    }
});

app.listen(PORT, () => {
    console.log(chalk.green(`[WEB] Servidor rodando na porta ${PORT}`));
    console.log(chalk.cyan(`[WEB] Acesse a URL do seu deploy no Railway para ver o QR Code`));
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── SESSION DATA (Railway) ───────────────────────────────────────────────────
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
            console.log(chalk.green("[RAILWAY] Sessao restaurada do SESSION_DATA!"));
        }
        return true;
    } catch (e) {
        console.log(chalk.yellow("[RAILWAY] Nao foi possivel restaurar sessao: " + e.message));
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
        fs.writeFileSync(path.resolve(__dirname, "session_data.txt"), encoded);
    } catch (e) {}
}
// ─────────────────────────────────────────────────────────────────────────────

const _NOISE = /Closing open session|closing session|closed session|SessionEntry|chainKey|registrationId|currentRatchet|ephemeralKeyPair|lastRemoteEphemeralKey|rootKey|indexInfo|baseKey|remoteIdentityKey|pendingPreKey|Bad MAC|Retry count|retrying/i;
const _w = process.stdout.write.bind(process.stdout);
const _e = process.stderr.write.bind(process.stderr);
process.stdout.write = (c, enc, cb) => { if (_NOISE.test(c)) { if (typeof cb === "function") cb(); return true; } return _w(c, enc, cb); };
process.stderr.write = (c, enc, cb) => { if (_NOISE.test(c)) { if (typeof cb === "function") cb(); return true; } return _e(c, enc, cb); };

let isReconnecting = false;
let currentSocket = null;
let handler = null;

function getHandler() {
    if (!handler) handler = require("./index");
    return handler;
}

const store = {
    contacts: {},
    messages: {},
    chats: { all: () => [], get: () => null },
    bind: (ev) => {
        ev.on("contacts.update", (contacts) => {
            for (const c of contacts)
                store.contacts[c.id] = Object.assign(store.contacts[c.id] || {}, c);
        });
        ev.on("messages.upsert", ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key?.remoteJid) continue;
                if (!store.messages[msg.key.remoteJid]) store.messages[msg.key.remoteJid] = {};
                store.messages[msg.key.remoteJid][msg.key.id] = msg;
            }
        });
    },
    loadMessage: async (jid, id) => store.messages[jid]?.[id] || null
};

async function clearOldSessionFiles(sessionPath) {
    try {
        if (!fs.existsSync(sessionPath)) return;
        const files = await fs.readdir(sessionPath);
        const agora = Date.now();
        const umDia = 24 * 60 * 60 * 1000;
        for (const file of files) {
            if (file === "creds.json") continue;
            if (file.startsWith("pre-key-") || file.startsWith("session-") || file.startsWith("sender-key-")) {
                const fp = path.join(sessionPath, file);
                const stats = await fs.stat(fp);
                if (agora - stats.mtimeMs > umDia) await fs.remove(fp);
            }
        }
    } catch (e) {}
}

async function startSystemZR() {
    if (isReconnecting) {
        console.log(chalk.yellow("Ja tentando reconectar, aguarde..."));
        return;
    }
    isReconnecting = true;
    currentQR = null;
    botStatus = "aguardando";

    restaurarSessao();
    fs.ensureDirSync(SESSION_PATH);

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

    const { version } = await (async () => {
        try {
            const live = await fetchLatestWaWebVersion();
            if (live?.version) { console.log(chalk.cyan(`[WA] versao: ${live.version.join(".")}`)); return live; }
        } catch (_) {}
        try {
            const github = await fetchLatestBaileysVersion();
            if (github?.version) { console.log(chalk.cyan(`[WA] versao GitHub: ${github.version.join(".")}`)); return github; }
        } catch (_) {}
        const fallback = [2, 3000, 1023141645];
        console.log(chalk.yellow(`[WA] versao local: ${fallback.join(".")}`));
        return { version: fallback };
    })();

    console.log(chalk.cyan(figlet.textSync("Kay System", { font: "Small", horizontalLayout: "default" })));
    console.log(chalk.green(`\nIniciando Kay System v1.0.0...\n`));

    const systemZR = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: Browsers.ubuntu("Chrome"),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        shouldSyncHistoryMessage: () => false,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        emitOwnEvents: false,
        getMessage: async (key) => {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: "Ola!" };
        }
    });

    currentSocket = systemZR;
    setInterval(() => clearOldSessionFiles(SESSION_PATH), 3600000);

    store.bind(systemZR.ev);

    systemZR.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || (!mek?.message && !mek?.messageStubType)) return;
            if (mek.key?.remoteJid === "status@broadcast") return;
            await getHandler()(systemZR, chatUpdate);
        } catch (err) {
            console.error(chalk.red("[Erro]:"), err.message);
        }
    });

    systemZR.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Atualiza o QR para a página web
        if (qr) {
            currentQR = qr;
            botStatus = "aguardando_qr";
            console.log(chalk.yellow("[QR] Novo QR gerado — acesse a URL do Railway para escanear"));
        }

        if (connection === "connecting") {
            console.log(chalk.yellow("[WA] Conectando..."));
        }

        if (connection === "close") {
            currentQR = null;
            botStatus = "desconectado";
            const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.red(`\nConexao fechada (codigo: ${statusCode})`));

            if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red("Sessao encerrada. Remova SESSION_DATA do Railway e reinicie.\n"));
                process.exit(1);
            } else {
                isReconnecting = false;
                setTimeout(() => {
                    if (currentSocket) { currentSocket.end(() => {}); currentSocket = null; }
                    startSystemZR();
                }, 5000);
            }
        } else if (connection === "open") {
            currentQR = null;
            botStatus = "conectado";
            console.log(chalk.green("\n✅ Kay System conectado com sucesso!\n"));
            isReconnecting = false;
            gerarSessionData();
        }
    });

    systemZR.ev.on("creds.update", saveCreds);

    systemZR.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
        }
        return jid;
    };

    return systemZR;
}

startSystemZR();