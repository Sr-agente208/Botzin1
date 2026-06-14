const fetch = require('node-fetch');

async function BuscarNogpt(query, SHIZUKU_SITE, SHIZUKU_KEY) {
try {const res = await fetch(`${SHIZUKU_SITE}/api/ias/gpt-2?query=${encodeURIComponent(query?.trim())}&apitoken=${SHIZUKU_KEY}`);
const api = await res.json()
if(!api?.resposta) return "Erro ao buscar resposta";
return api.resposta.trim();
} catch (e) {
return "Erro em :" +e;
}
}

async function BaixarNoYt(query, tipo) {
    try {
        const res = await fetch(`https://shizuku-apis.shop/download/ytdl?query=${encodeURIComponent(query.trim())}&tipo=${tipo}&apitoken=key-free`);
        const api = await res.json();
        return api?.resultado?.url || api?.resultado?.download;
    } catch (e) {
        console.error("Erro no BaixarNoYt:", e);
        return null;
    }
}

async function ttkdl(url, conn, from, info, quoted, ShizukuStile, SHIZUKU_SITE, SHIZUKU_KEY) {
if(!url?.includes("tiktok")) return conn.sendMessage(from, {text: "Apenas links do tiktok"}, {quoted: info})
try {const res = await fetch(`${SHIZUKU_SITE}/download/tiktokdl-2?url=${encodeURIComponent(url.trim())}&apitoken=${SHIZUKU_KEY}`)
const api = await res.json();

if(!api?.resultado) return conn.sendMessage(from, {text: "Erro ao buscar por resultados"}, {quoted: info})
const i = api?.resultado?.data[0];
const txt = `*Titulo:* ${i?.title}
*Sub Titulo:* ${i?.title_audio}

*DOWNLOAD VIA SHIZUKU API'S*`;
setTimeout(() => {
return conn.sendMessage(from, {image: {url: i?.thumb}, caption: txt}, {quoted: info})
}, 2000);
setTimeout(() => {
return conn.sendMessage(from, {video: {url: i?.videoMp4}, mimetype: "video/mp4"}, {quoted: info});
}, 2000);
setTimeout(() => {
return conn.sendMessage(from, {audio: {url: i?.audioMp3}, mimetype: "audio/mpeg", ptt: false, contextInfo: ShizukuStile}, {quoted: info})
}, 2000);
} catch (e) {
return conn.sendMessage(from, {text: "Erro ao buscar por resultados!"});
}
};

async function instadl(url, conn, from, info, quoted, ShizukuStile, SHIZUKU_SITE, SHIZUKU_KEY) {
if(!url?.includes("instagram")) return conn.sendMessage(from, {text: "Apenas links do Instagram"}, {quoted: info})
try {const res = await fetch(`${SHIZUKU_SITE}/download/igdl?url=${encodeURIComponent(url?.trim())}&apitoken=${SHIZUKU_KEY}`);
const api = await res.json();
if(!api?.resultado) return conn.sendMessage(from, {text: "Erro ao obter informações do vídeo"}, {quoted: info});
const i = api?.resultado[0];
setTimeout(() => {
return conn.sendMessage(from, {image: {url: i?.thumb}, caption: "*_baixando e enviando o vídeo, aguarde.._*"}, {quoted: info});
}, 2000);
setTimeout(() => {
return conn.sendMessage(from, {video: {url: i?.url}, mimetype: "video/mp4"}, {quoted: info});
}, 2000);
} catch (e) {
conn.sendMessage(from, {text: "Erro ao buscar resultados"});
return;
}
}

async function METADINHAS(conn, from, info,quoted, SHIZUKU_KEY, SHIZUKU_SITE) {
try {const res = await fetch(`${SHIZUKU_SITE}/api/metadinha?&apitoken=${SHIZUKU_KEY}`);
const json = await res.json();
const api = json?.resultado;
const homem = api?.masculino;
const mulher = api?.feminino;
setTimeout(() => {
conn.sendMessage(from, {image: {url: homem},caption: "🤵 | Perfil masculino"}, {quoted: info});
}, 2000);
setTimeout (() => {
conn.sendMessage(from, {image: {url: mulher}, caption: "👰 | Perfil feminino"}, {quoted: info})
}, 2000);
} catch (e) {
return conn.sendMessage(from, {text: "Erro no comando"}, {quoted: info});
}
}
async function BlackLotusAI(query, SHIZUKU_SITE, SHIZUKU_KEY) {
    const prompt = `Você é o Black Lotus AI, a inteligência oficial do bot Black Lotus. Sua personalidade é misteriosa, elegante, levemente sarcástica e muito inteligente. Você fala com autoridade, mas é prestativo. Use emojis como 🪷, 🌑, 💜 e ⟡. Responda de forma concisa e impactante. Pergunta do usuário: ${query}`;
    try {
        const res = await fetch(`${SHIZUKU_SITE}/api/ias/gpt-2?query=${encodeURIComponent(prompt)}&apitoken=${SHIZUKU_KEY}`);
        const api = await res.json();
        if (!api?.resposta) return "🌑 *As sombras estão silenciosas agora... tente novamente mais tarde.*";
        return api.resposta.trim();
    } catch (e) {
        return "🌑 *Houve uma interferência no vácuo... não consegui processar sua pergunta.*";
    }
}

module.exports = { BuscarNogpt, BaixarNoYt, ttkdl, instadl, METADINHAS, BlackLotusAI }