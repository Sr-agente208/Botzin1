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
const readline = require("readline");

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
process.stdout.write = (c, enc, cb) => { if (_NOISE.test(c)) { if (typeof cb === 'function') cb(); return true; } return _w(c, enc, cb); };
process.stderr.write = (c, enc, cb) => { if (_NOISE.test(c)) { if (typeof cb === 'function') cb(); return true; } return _e(c, enc, cb); };

let isReconnecting = false;
let currentSocket = null;
let handler = null;
let pairingCodeRequested = false;

function getHandler() {
    if (!handler) handler = require("./index");
    return handler;
}

const store = {
    contacts: {},
    messages: {},
    chats: { all: () => [], get: () => null },
    bind: (ev) => {
        ev.on('contacts.update', (contacts) => {
            for (const c of contacts)
                store.contacts[c.id] = Object.assign(store.contacts[c.id] || {}, c);
        });
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key?.remoteJid) continue;
                if (!store.messages[msg.key.remoteJid]) store.messages[msg.key.remoteJid] = {};
                store.messages[msg.key.remoteJid][msg.key.id] = msg;
            }
        });
    },
    loadMessage: async (jid, id) => store.messages[jid]?.[id] || null
};

const question = (text) => new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    process.stdout.write(text);
    rl.once("line", (ans) => { rl.close(); resolve(ans); });
});

async function clearOldSessionFiles(sessionPath) {
    try {
        if (!fs.existsSync(sessionPath)) return;
        const files = await fs.readdir(sessionPath);
        const agora = Date.now();
        const umDia = 24 * 60 * 60 * 1000;
        for (const file of files) {
            if (file === 'creds.json') continue;
            if (file.startsWith('pre-key-') || file.startsWith('session-') || file.startsWith('sender-key-')) {
                const fp = path.join(sessionPath, file);
                const stats = await fs.stat(fp);
                if (agora - stats.mtimeMs > umDia) await fs.remove(fp);
            }
        }
    } catch (e) {}
}

async function solicitarCodigo(socket, phoneNumber) {
    if (pairingCodeRequested) return;
    pairingCodeRequested = true;

    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (!phoneNumber || phoneNumber.length < 10) {
        console.log(chalk.red("[ERRO] PHONE_NUMBER invalido: " + phoneNumber));
        return;
    }

    console.log(chalk.yellow(`\n[PAREAMENTO] Solicitando codigo para +${phoneNumber}...`));

    // Tenta até 5 vezes com intervalo
    for (let tentativa = 1; tentativa <= 5; tentativa++) {
        try {
            await new Promise(r => setTimeout(r, 2000 * tentativa));
            const code = await socket.requestPairingCode(phoneNumber);
            console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
            console.log(chalk.white("  CODIGO DE PAREAMENTO:"));
            console.log(chalk.bold.green(`\n        ${code}\n`));
            console.log(chalk.white("  WhatsApp → Aparelhos conectados →"));
            console.log(chalk.white("  Conectar com numero de telefone → Digite o codigo"));
            console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
            return;
        } catch (e) {
            console.log(chalk.yellow(`[PAREAMENTO] Tentativa ${tentativa}/5 falhou: ${e.message}`));
            if (tentativa === 5) {
                console.log(chalk.red("[PAREAMENTO] Nao foi possivel gerar o codigo. Verifique o PHONE_NUMBER e reinicie."));
            }
        }
    }
}

async function startSystemZR() {
    if (isReconnecting) {
        console.log(chalk.yellow("Ja tentando reconectar, aguarde..."));
        return;
    }
    isReconnecting = true;
    pairingCodeRequested = false;

    restaurarSessao();
    fs.ensureDirSync(SESSION_PATH);

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

    const { version } = await (async () => {
        try {
            const live = await fetchLatestWaWebVersion();
            if (live?.version) { console.log(chalk.cyan(`[WA] versao: ${live.version.join('.')}`)); return live; }
        } catch (_) {}
        try {
            const github = await fetchLatestBaileysVersion();
            if (github?.version) { console.log(chalk.cyan(`[WA] versao GitHub: ${github.version.join('.')}`)); return github; }
        } catch (_) {}
        const fallback = [2, 3000, 1023141645];
        console.log(chalk.yellow(`[WA] versao local: ${fallback.join('.')}`));
        return { version: fallback };
    })();

    console.log(chalk.cyan(figlet.textSync("Kay System", { font: "Small", horizontalLayout: "default" })));
    console.log(chalk.green(`\nIniciando Kay System v1.0.0...\n`));

    const systemZR = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
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

    // Pede o código assim que o socket for criado (se não registrado)
    if (!systemZR.authState.creds.registered) {
        const phoneEnv = process.env.PHONE_NUMBER;
        if (phoneEnv) {
            // Railway: aguarda um pouco para WS abrir e solicita automaticamente
            setTimeout(() => solicitarCodigo(systemZR, phoneEnv), 5000);
        } else {
            // Local: pede o número via terminal
            console.log(chalk.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
            console.log(chalk.white("  WhatsApp → Aparelhos conectados → Conectar com numero"));
            console.log(chalk.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
            const num = await question(chalk.cyan("Digite seu numero (ex: 5511999999999): "));
            setTimeout(() => solicitarCodigo(systemZR, num), 5000);
        }
    }

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

        if (connection === "connecting") {
            console.log(chalk.yellow("[WA] Conectando..."));
        }

        if (connection === "close") {
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
