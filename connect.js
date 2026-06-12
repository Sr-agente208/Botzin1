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
const qrcodeTerminal = require("qrcode-terminal");

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
<style>
body{background:#0a0a0a;color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}
h1{color:#7c3aed;} p{color:#aaa;}
.badge{background:#7c3aed;color:#fff;padding:8px 20px;border-radius:20px;font-weight:bold;}
</style></head>
<body>
<h1>🪷 Black Lotus Bot</h1>
<div class="badge">✅ Bot Conectado e Online!</div>
<p style="margin-top:20px">O bot está funcionando normalmente.</p>
</body></html>`);
    }

    // Página com QR e Código de Vinculação
    let qrImage = null;
    if (currentQR) {
        try {
            qrImage = await QRCode.toDataURL(currentQR, {
                width: 280, margin: 2,
                color: { dark: "#000000", light: "#ffffff" }
            });
        } catch (e) {}
    }

    return res.send(`<!DOCTYPE html>
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

  <!-- CÓDIGO DE VINCULAÇÃO -->
  <div class="box">
    <span class="badge">⚡ RECOMENDADO</span>
    <h2>📱 Código de Vinculação</h2>
    ${pairingCode ? `
    <div class="code">${pairingCode}</div>
    <div class="step"><span>1.</span> Abra o WhatsApp no celular</div>
    <div class="step"><span>2.</span> Toque nos 3 pontinhos → Aparelhos conectados</div>
    <div class="step"><span>3.</span> Toque em "Conectar aparelho"</div>
    <div class="step"><span>4.</span> Escolha "Usar código de telefone"</div>
    <div class="step"><span>5.</span> Digite o código acima</div>
    ` : `
    <div class="spin"></div>
    <p>Gerando código... aguarde.</p>
    <p style="font-size:11px;margin-top:8px">Configure a variável <b>NUMERO</b> no Railway com seu número (ex: 5511999999999)</p>
    `}
  </div>

  <!-- QR CODE -->
  <div class="box">
    <h2>📷 QR Code</h2>
    ${qrImage ? `
    <img src="${qrImage}" alt="QR Code" width="240" height="240" style="border-radius:8px;"/>
    <div class="step"><span>1.</span> Abra o WhatsApp no celular</div>
    <div class="step"><span>2.</span> Aparelhos conectados → Conectar aparelho</div>
    <div class="step"><span>3.</span> Escaneie o QR Code acima</div>
    ` : `
    <div class="spin"></div>
    <p>Gerando QR Code... aguarde.</p>
    `}
  </div>

</div>
</body></html>`);
});

app.listen(PORT, () => {
    console.log(chalk.green(`[WEB] Servidor rodando na porta ${PORT}`));
    console.log(chalk.cyan(`[WEB] Acesse a URL do Railway para conectar o bot`));
});
// ─────────────────────────────────────────────────────────────────────────────

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
    pairingCode = null;
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

    console.log(chalk.hex("#7c3aed")(figlet.textSync("Black Lotus", { font: "Small" })));
    console.log(chalk.green(`\nIniciando Black Lotus Bot v2.0.0...\n`));

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
        printQRInTerminal: true,
        getMessage: async (key) => {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: "Ola!" };
        }
    });

    currentSocket = systemZR;
    setInterval(() => clearOldSessionFiles(SESSION_PATH), 3600000);
    store.bind(systemZR.ev);

    // ─── GERAR CÓDIGO DE VINCULAÇÃO ───────────────────────────────────────────
    if (!state.creds.registered) {
        const numero = process.env.NUMERO;
        if (numero) {
            try {
                const numeroLimpo = numero.replace(/\D/g, "");
                console.log(chalk.yellow(`[PAIRING] Gerando código para o número: ${numeroLimpo}...`));
                await new Promise(r => setTimeout(r, 3000));
                const code = await systemZR.requestPairingCode(numeroLimpo);
                pairingCode = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.bgMagenta.white(`\n🔑 CÓDIGO DE VINCULAÇÃO: ${pairingCode}\n`));
                console.log(chalk.cyan(`[WEB] Acesse a URL do Railway para ver o código na página web`));
            } catch (e) {
                console.log(chalk.red("[PAIRING] Erro ao gerar código: " + e.message));
                console.log(chalk.yellow("[PAIRING] Usando QR Code como alternativa..."));
            }
        } else {
            console.log(chalk.yellow("[PAIRING] Variável NUMERO não definida — usando QR Code"));
            console.log(chalk.cyan("[PAIRING] Para usar código, adicione NUMERO=5511999999999 nas variáveis do Railway"));
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

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

        if (qr) {
            currentQR = qr;
            botStatus = "aguardando_qr";
            console.log(chalk.yellow("[QR] Novo QR gerado"));
            try { qrcodeTerminal.generate(qr, { small: true }); } catch(e) {}
            console.log(chalk.cyan("[QR] Abra a URL do Railway ou use o QR acima"));
        }

        if (connection === "connecting") {
            console.log(chalk.yellow("[WA] Conectando..."));
        }

        if (connection === "close") {
            currentQR = null;
            pairingCode = null;
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
            pairingCode = null;
            botStatus = "conectado";
            console.log(chalk.green("\n✅ Black Lotus Bot conectado com sucesso!\n"));
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