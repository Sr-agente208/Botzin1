const baileys = require("@systemzero/baileys");
const { NumberDono, prefix, NickDono, NomeBot, SHIZUKU_KEY, SHIZUKU_SITE, sysite, syskey } = require("./dono/dono");

// Sessões para criação de packs personalizados
if (global.pack_sessions === undefined) {
    global.pack_sessions = {};
}
const ytSearch = require('yt-search');
const chalk = require('chalk');
const { version } = require("./package");

const { 
fetchJson, 
colors, 
hora, 
data, 
getBuffer,
 fs, 
SimilarComandos, 
ListaComandos, 
getGroupAdmins, 
getMembros, 
moment, 
msg,
axios,
kyun,
infoSystem,
os,
menu,
menus, 
FotoMenu,
Config,
Config2,
linkfy,
util,
exec,
jpzinhhomi,
Shizukuu,
sleep,
ShizukuStile,
Cmd,
BuscarNogpt,
BaixarNoYt,
ttkdl,
instadl,
METADINHAS,
ANT_LTR_MD_EMJ,
dono1,
dono2,
dono3,
dono4,
dono5,
dono6,
sendImageAsSticker2,
 sendVideoAsSticker2,
 getFileBuffer,
 downloadContentFromMessage,
 prepareWAMessageMedia,
 jidNormalizedUser,
 BlackLotusAI
} = require("./consts");

const { handleRPG } = require("./SRC/rpg");
const { handleJogos } = require("./SRC/jogos");

module.exports = async function (conn, upsert) {
  try {
const info = upsert?.messages && upsert?.messages[0];
if (!info) return;
const from = info?.key?.remoteJid;
const isGroup = from.endsWith('@g.us');
const pushname = info?.pushName || await conn?.user?.name || "Usuário";
const content = JSON.stringify(info.message);
const quoted = info.quoted ? info.quoted : info
const sender = jidNormalizedUser(isGroup ? info?.key?.participantPn || 
info?.key?.senderPn || 
await conn?.user?.id || 
info?.key?.participant : info?.key?.senderPn || 
info?.key?.participant ||
info?.key?.remoteJid 
);


const botNumber = jidNormalizedUser(await conn.user.id || await conn.user.lid);
const Numero1 = jidNormalizedUser(`${dono1}@s.whatsapp.net`);
const Numero2 = jidNormalizedUser(`${dono2}@s.whatsapp.net`);
const Numero3 = jidNormalizedUser(`${dono3}@s.whatsapp.net`);
const Numero4 = jidNormalizedUser(`${dono4}@s.whatsapp.net`);
const Numero5 = jidNormalizedUser(`${dono5}@s.whatsapp.net`);
const Numero6 = jidNormalizedUser(`${dono6}@s.whatsapp.net`);
const MeuNumero = jidNormalizedUser(`${NumberDono}@s.whatsapp.net`);
const IsCreator = jpzinhhomi?.includes(sender);
const SoCriador = Shizukuu?.includes(sender);
const SoBot = botNumber?.includes(sender)
const So_Dono = MeuNumero?.includes(sender) || 
Numero1?.includes(sender) ||
Numero2?.includes(sender) || 
Numero3?.includes(sender) ||
Numero4?.includes(sender) ||
Numero5?.includes(sender) ||
Numero6?.includes(sender) ||
SoBot || 
SoCriador ||
IsCreator;

const moment = require("moment-timezone");

const date = moment().tz("America/Sao_Paulo").format("DD/MM/YYYY");
// hora já importado do consts.js - usando hora2 para evitar conflito
const _hora = moment().tz("America/Sao_Paulo").format("HH:mm:ss");

const type = baileys.getContentType(info?.message);
let body =
  info?.message?.conversation ||
  info?.message?.extendedTextMessage?.text ||
  info?.message?.imageMessage?.caption ||
  info?.message?.videoMessage?.caption ||
  info?.message?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
  info?.message?.buttonsResponseMessage?.selectedButtonId ||
  info?.message?.templateButtonReplyMessage?.selectedId ||
  info?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  info?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
  info?.text ||
  "";
  
if (info?.message?.listResponseMessage) {
body = info?.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
}
if (info?.message?.interactiveResponseMessage) {
try {const botn = JSON.parse(info?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
if (botn?.id) body = botn?.id;
} catch {}
}

//CONSTS IMPORTANTES
const isImage = type == 'imageMessage'
const isVideo = type == 'videoMessage'
const isVisuU2 = type == 'viewOnceMessageV2'
const isAudio = type == 'audioMessage'
const isSticker = type == 'stickerMessage'
const isContact = type == 'contactMessage'
const isLocation = type == 'locationMessage'
const isProduct = type == 'productMessage'
	const isMedia = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage' || type == "viewOnceMessage" || type == "viewOnceMessageV2")
	
	// Lógica para adicionar figurinhas automaticamente se o pack estiver ativo
	if (isImage && global.pack_sessions[sender]) {
	    try {
	        const buffer = await downloadContentFromMessage(info.message.imageMessage, 'image');
	        let chunks = [];
	        for await (const chunk of buffer) {
	            chunks.push(chunk);
	        }
	        const finalBuffer = Buffer.concat(chunks);
	        global.pack_sessions[sender].stickers.push(finalBuffer);
	        await reagir(from, "📥");
	    } catch (e) {
	        console.error("Erro ao capturar imagem para o pack:", e);
	    }
	}

	typeMessage = body.substr(0, 50).replace(/\n/g, '')
if(isImage) typeMessage = "Image"
else if(isVideo) typeMessage = "Video"
else if(isAudio) typeMessage = "Audio"
else if(isSticker) typeMessage = "Sticker"
else if(isContact) typeMessage = "Contact"
else if(isLocation) typeMessage = "Location"
else if(isProduct) typeMessage = "Product"

const isQuotedMsg = type === 'extendedTextMessage' && content.includes('conversation')
const isQuotedMsg2 = type === 'extendedTextMessage' && content.includes('text')
const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
const isQuotedVisuU2 = type === 'extendedTextMessage' && content.includes('viewOnceMessageV2')
const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')
const isQuotedDocW = type === 'extendedTextMessage' && content.includes('documentWithCaptionMessage')
const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
const isQuotedContact = type === 'extendedTextMessage' && content.includes('contactMessage')
const isQuotedLocation = type === 'extendedTextMessage' && content.includes('locationMessage')
const isQuotedProduct = type === 'extendedTextMessage' && content.includes('productMessage')

///{ constantes muito importantes}\\
const budy = (type === 'conversation') ? info.message?.conversation : (type === 'extendedTextMessage') ? info.message?.extendedTextMessage?.text : '';
const Procurar_String = info.message?.conversation || info.message?.viewOnceMessageV2?.message?.imageMessage?.caption || info.message?.viewOnceMessageV2?.message?.videoMessage?.caption || info.message?.imageMessage?.caption || info.message?.videoMessage?.caption || info.message?.extendedTextMessage?.text || info.message?.viewOnceMessage?.message?.videoMessage?.caption || info.message?.viewOnceMessage?.message?.imageMessage?.caption || info.message?.documentWithCaptionMessage?.message?.documentMessage?.caption || info.message?.buttonsMessage?.imageMessage?.caption || ""
const PR_String = Procurar_String.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
const budy2 = body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
const args = body.trim().split(/ +/).slice(1);
const arg = body.trim().split(/ +/).slice(1);
const q = args.join(' ');
const isCmd = body.trim().startsWith(prefix);
	const command = isCmd ? budy2.trim().slice(1).split(/ +/).shift().toLocaleLowerCase(): null;

	// LOG DE DEPURAÇÃO
		console.log(chalk.cyan(`[MSG] De: ${pushname} | Cmd: ${command} | isCmd: ${isCmd} | Body: ${body.slice(0, 30)}`));

		// SISTEMAS DE SEGURANÇA AUTOMÁTICOS
		if (isGroup && isAntiBluxzinho && !isGroupAdmins && isBotGroupAdmins) {
			const nomeUsuario = pushname?.toLowerCase() || '';
			const numerosSuspeitos = ['5531999999999', '5531888888888']; // Adicione mais se necessário
			if (nomeUsuario.includes('bluxzinho') || numerosSuspeitos.includes(sender.split('@')[0])) {
				await reply(`🚨 *Usuário suspeito detectado (Bluxzinho).* \n\n❌ Removendo @${sender.split('@')[0]}`, {mentions: [sender]});
				await conn.groupParticipantsUpdate(from, [sender], 'remove');
			}
		}

		if (isGroup && isAntiNextshost && !isGroupAdmins && isBotGroupAdmins) {
			const nomeUsuario = pushname?.toLowerCase() || '';
			const mensagem = body?.toLowerCase() || '';
			if (nomeUsuario.includes('nextshost') || mensagem.includes('nextshost.com')) {
				await reply(`🌐 *Link da Nextshost.com detectado ou usuário suspeito.* \n\n❌ Removendo @${sender.split('@')[0]}`, {mentions: [sender]});
				await conn.groupParticipantsUpdate(from, [sender], 'remove');
			}
		}

	// === SISTEMA DE RPG ===
	const rpgCommands = ['rpg', 'rpgajuda', 'criarchar', 'meuchar', 'trabalhar', 'loja', 'comprar', 'inventario', 'usar', 'batalha', 'atacar', 'fugir', 'rpgrank', 'deletarchar', 'aventura', 'ritual', 'criarsessao', 'entrar', 'narrar', 'fecharsessao'];
	if (isCmd && rpgCommands.includes(command)) {
	    return await handleRPG(conn, from, info, command, args, sender, pushname, isGroup, prefix, SHIZUKU_SITE, SHIZUKU_KEY);
	}

	// === JOGOS DE GRUPO ===
	const jogoCommands = ['roletarussa', 'apostar', 'caraoucoroa'];
	if (isCmd && jogoCommands.includes(command)) {
	    return await handleJogos(conn, from, info, command, args, sender, pushname, isGroup, prefix);
	}

	// === BLACK LOTUS AI ===
	if (command === 'lotus' || command === 'ia') {
	    if (!q) return reply(`🌑 *Diga algo para as sombras...*\nEx: ${prefix}lotus Quem é você?`);
	    const aiRes = await BlackLotusAI(q, SHIZUKU_SITE, SHIZUKU_KEY);
	    return reply(aiRes);
	}

//INFO DE GRUPOS!!
const Infos_Do_Grupo = isGroup ? await conn.groupMetadata(from) : {} || '';
const NomeGrupo = Infos_Do_Grupo?.subject || '';
const DescGp = Infos_Do_Grupo?.desc || '';
const MembrosGP = Infos_Do_Grupo?.participants || [];
const TotalAdmins = MembrosGP[0]?.admin || '';
const TotalMembros = MembrosGP.length || 0;
const Dono_Do_Grupo = Infos_Do_Grupo?.subjectOwnerJid || '';

const So_Admins = isGroup ? getGroupAdmins(MembrosGP) : ''
const somembros = isGroup ? getMembros(MembrosGP) : ''

const dirGroup = `./DATABASE2/GRUPOS/ATIVACOES/${from}.json`

	if(isGroup && !fs.existsSync(dirGroup)){
	var dataGp2 = [{
	name: NomeGrupo,
	groupId: from, 
	antilinkhard: false, 
	So_Admins: false,
	bangp: false,
	antibluxzinho: false,
	antinexthost: false,
	wellcome: [{
	bemvindo1: false,
	legendabv: "Olá #numerodele#, seja bem vindo(a) ao Grupo: *#nomedogp#*, Kay lhe deseja as boas vindas 🕸️",
	legendasaiu: "Adeus, #numerodele#, espero que não se arrependa pela sua decisão. "
	},
	{
	bemvindo2: false,
	legendabv: "Olá #numerodele#, seja bem vindo(a) ao Grupo: *#nomedogp#*, kay lhe deseja as boas vindas 🕸️",
	legendasaiu: "Adeus, #numerodele#, espero que não se arrependa pela sua decisão. "
	}],
	}]
	fs.writeFileSync(dirGroup, JSON.stringify(dataGp2, null, 2) + '\n')
	}

const dataGp = isGroup ? JSON.parse(fs.readFileSync(dirGroup)) : undefined 

function setGp(index){
fs.writeFileSync(dirGroup, JSON.stringify(index, null, 2) + '\n')}

const isBemvindo = isGroup ? dataGp[0]?.wellcome[0]?.bemvindo1 : undefined 
const isBemvindo2 = isGroup ? dataGp[0]?.wellcome[1]?.bemvindo2 : undefined
const isAntiLinkHard = isGroup ? dataGp[0]?.antilinkhard : undefined
const SoAdmins = isGroup ? dataGp[0]?.So_Admins : undefined 
	const isBanGrupo = isGroup ? dataGp[0]?.bangp : undefined 
	const isAntiBluxzinho = isGroup ? dataGp[0]?.antibluxzinho : undefined
	const isAntiNextshost = isGroup ? dataGp[0]?.antinexthost : undefined
	
	const BotOff = Config2.botoff 
	const isVerificado = Config2.verificado

//DEFINIÇÕES UTEIS
const selo = Config2.verificado ? {key: {fromMe: false, remoteJid: from, id: "META",
participant: "13135550002@s.whatsapp.net"
}, message: { contactMessage: { displayName: pushname,
 vcard: `BEGIN:VCARD
VERSION:3.0
N:Meta AI;;;;
FN:Meta AI
TEL;waid=13135550002:+1 313 555 0002
END:VCARD`
}
}
} : info


async function reply(texto){
try {
return conn.sendMessage(from, {text: texto, contextInfo: ShizukuStile}, {quoted: selo})
} catch (E) {
return reply("Erro ao enviar msg");
};
};

const reagir = async (idgp, emj) => {
var reactionMessage = {
react: {
text: emj, 
key: info.key
}
} 
conn.sendMessage(idgp, reactionMessage)
}

var isUrl = (url) => {
if(linkfy.find(url)[0]) return true
return false
}

const mentions = (teks, memberr, id) => {
(id == null || id == undefined || id == false) ? conn.sendMessage(from, {text: teks.trim(), mentions: memberr}) : conn.sendMessage(from, {text: teks.trim(), mentions: memberr})
}
	
const mention = (teks= '', ms = info) => {
memberr = []
vy = teks.includes('\n') ? teks.split('\n') : [teks]
for(vz of vy){ for(zn of vz.split(' ')){
if(zn.includes('@'))memberr.push(parseInt(zn.split('@')[1])+'@s.whatsapp.net')
}}
conn.sendMessage(from, {text: teks.trim(), mentions: memberr}, {quoted: ms}) 
}

const hora2 = moment().tz('America/Sao_Paulo').format('HH:mm:ss')
if(hora2 > "00:00:00" && hora2 < "05:00:00"){
var tempo = 'Boa noite'
} if(hora2 > "05:00:00" && hora2 < "12:00:00"){
var tempo = 'Bom dia'
} if(hora2 > "12:00:00" && hora2 < "18:00:00"){
var tempo = 'Boa tarde'
} if(hora2 > "18:00:00"){
var tempo = 'Boa noite'
}


const isBotGroupAdmins = So_Admins?.includes(botNumber) || false;
const isGroupAdmins = So_Admins.includes(sender) || false || So_Dono ||SoBot || IsCreator || SoCriador

// FUNÇÕES DE MARCAÇÕES ESSENCIAL \\
//FUNÇÃO BY: NKZIN-DEV, NÃO TIRA OS CRÉDITOS DESGRAÇA!!
let menc_prt = info.message?.extendedTextMessage?.contextInfo?.participant || '';
if (menc_prt.includes('@lid') && Infos_Do_Grupo?.participants) {
menc_prt = Infos_Do_Grupo.participants.find(v => v.lid === menc_prt)?.jid || '';
}
const menc_jid2 = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
if (menc_jid2?.[0]?.includes('@lid') && Infos_Do_Grupo?.participants) {
menc_jid2[0] = Infos_Do_Grupo.participants.find(v => v.lid === menc_jid2[0])?.jid || '';
}
const menc_os2 = q.includes("@") ? (Array.isArray(menc_jid2) && menc_jid2.length > 0 ? menc_jid2[0] : null) : menc_prt;
const menc_jid = jidNormalizedUser(menc_os2 || sender);
const sender_ou_n = q.includes("@") ? menc_jid2?.[0] : (menc_prt || sender);
const normalizar = alvo => {
if (alvo?.includes('@lid') && Infos_Do_Grupo?.participants) {
return Infos_Do_Grupo.participants.find(v => v.lid === alvo)?.jid || alvo;
}
return alvo;
};//FUNÇÃO BY: NKZIN-DEV, NÃO TIRA OS CRÉDITOS DESGRAÇA!!
const numClean = txt => txt.replace(/[()+\-\/\s]/g, '') + '@s.whatsapp.net';
const mrc_ou_numero  = q.length > 6  && !q.includes('@') ? numClean(q)  : normalizar(menc_prt);
const marc_tds       = q.includes('@')                 ? normalizar(menc_jid) : q.length > 6  && !q.includes('@') ? numClean(q)  : normalizar(menc_prt);
const menc_prt_nmr   = q.length > 12 && !q.includes('@') ? numClean(q)  : normalizar(menc_prt);
const menc_prt3 = info.message?.extendedTextMessage?.contextInfo?.participant
const menc_jid3 = args?.join(" ").replace("@", "") + "@s.whatsapp.net"
const menc_jid23 = info.message?.extendedTextMessage?.contextInfo?.mentionedJid
const sender_ou_n3 = q.includes("@") ? menc_jid : sender
const mrc_ou_numero3 = q.length > 6 && !q.includes("@") ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net` : menc_prt 
const menc_os23 = q.includes("@") ? menc_jid : menc_prt 
const marc_tds3 = q.includes("@") ? menc_jid : q.length > 6 && !q.includes("@") ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net` : menc_prt 
const menc_prt_nmr3 = q.length > 12 ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net` : menc_prt
//============================//
if(BotOff && !So_Dono) return;

if(isGroup && isCmd && SoAdmins && !So_Dono && !isGroupAdmins) return;

if(isGroup && isCmd && isBanGrupo && !So_Dono) return


let tipoMsg = "Texto";

if (info?.message?.imageMessage) tipoMsg = "📸 Imagem";
else if (info?.message?.videoMessage) tipoMsg = "🎥 Vídeo";
else if (info?.message?.audioMessage) tipoMsg = "🎧 Áudio";
else if (info?.message?.stickerMessage) tipoMsg = "🔖 Figurinha";
else if (info?.message?.contactMessage) tipoMsg = "👤 Contato";
else if (info?.message?.locationMessage) tipoMsg = "📍 Localização";

const logMsg = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🤖 [LOG] Nova Mensagem!
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 Nome: ${pushname}
┃ 📱 Número: ${sender.split('@')[0]}
┃ 📂 Tipo: ${tipoMsg}
┃ 💬 Mensagem: ${body || "Sem conteúdo"}
┃ 🏙️ Grupo: ${isGroup ? NomeGrupo : "Privado"}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

console.log(chalk.magenta(logMsg));

switch (command) {
	
		case 'ladrao':
		case 'roubo': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			let alvo = menc_jid;
			if (!q.includes('@') && !info.message?.extendedTextMessage?.contextInfo?.quotedMessage) return reply(`Marque alguém.\nExemplo: ${prefix}ladrao @usuario`);
			
			let foto;
			try {
				foto = await conn.profilePictureUrl(alvo, 'image');
			} catch {
				foto = 'https://i.imgur.com/0Z8FQwN.jpeg';
			}
			
			const buffer = await getBuffer(foto);
			await conn.sendMessage(from, {
				image: buffer,
				caption: `🚨⚠️ *𝗟𝗔𝗗𝗥𝗔𝗢 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗗𝗢* ⚠️🚨\n\n💀 *𝗣𝗥𝗢𝗖𝗨𝗥𝗔𝗗𝗢* 💀\n📛 Usuário: @${alvo.split('@')[0]}\n\n❌ Acusado de roubo\n❌ Em fuga constante\n❌ Especialista em sumir\n\n🚔 STATUS: *ALERTA MÁXIMO*\n\n⚠️ Cuidado com esse usuário no grupo`,
				mentions: [alvo]
			}, { quoted: selo });
		}
		break;

		case 'antibluxzinho': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (q === '1' || q === 'on') {
				dataGp[0].antibluxzinho = true;
				setGp(dataGp);
				reply(`🛡️ *Anti Bluxzinho ativado com sucesso.* \n\n✅ Qualquer usuário com "bluxzinho" no nome ou número suspeito será removido automaticamente.`);
			} else if (q === '0' || q === 'off') {
				dataGp[0].antibluxzinho = false;
				setGp(dataGp);
				reply(`❌ *Anti Bluxzinho desativado com sucesso.*`);
			} else {
				reply(`⚙️ *CONFIGURAÇÃO ANTI BLUXZINHO*\n\n${prefix}antibluxzinho 1 → Ativar\n${prefix}antibluxzinho 0 → Desativar`);
			}
		}
		break;

		case 'antinexthost': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (q === '1' || q === 'on') {
				dataGp[0].antinexthost = true;
				setGp(dataGp);
				reply(`🛡️ *Anti Nextshost.com ativado com sucesso.* \n\n✅ Qualquer usuário com "nextshost" no nome ou enviando link será removido automaticamente.`);
			} else if (q === '0' || q === 'off') {
				dataGp[0].antinexthost = false;
				setGp(dataGp);
				reply(`❌ *Anti Nextshost.com desativado com sucesso.*`);
			} else {
				reply(`⚙️ *CONFIGURAÇÃO ANTI NEXTHOST*\n\n${prefix}antinexthost 1 → Ativar\n${prefix}antinexthost 0 → Desativar`);
			}
		}
		break;

		case 'getsession':
		case 'session':
		case 'token':
		    if (!So_Dono) return reply(msg.SoDono);
	    try {
	        const path = require('path');
	        const credsPath = path.resolve(__dirname, 'session', 'creds.json');
	        if (!fs.existsSync(credsPath)) return reply("❌ Arquivo de sessão não encontrado.");
	        const creds = fs.readFileSync(credsPath, 'utf-8');
	        const sessionString = Buffer.from(creds).toString('base64');
	        await reply(`🪷 *BLACK LOTUS: SESSION DATA*\n\nCopie o código abaixo e cole na variável *SESSION_DATA* do Railway:\n\n${sessionString}`);
	        console.log(chalk.green("[SESSION] Token enviado para o dono."));
	    } catch (e) {
	        reply("❌ Erro ao gerar token: " + e.message);
	    }
	    break;

	case 'menu':
	case 'help':
	case 'ajuda':
	case '™menu':
		return reply(menu(prefix, sender, NickDono, NomeBot, date, _hora, NumberDono, version));
		break;

	case 'deepsearch':
	case 'ia':
	case 'pesquisar':
	    if (!q) return reply(`🌑 *O que deseja buscar nas profundezas?*\nEx: ${prefix}deepsearch Como funciona o motor quântico?`);
	    await reagir(from, "🔍");
	    try {
	        const fetch = require('node-fetch');
	        const res = await fetch(`${SHIZUKU_SITE}/api/ias/gpt-2?query=${encodeURIComponent(q)}&apitoken=${SHIZUKU_KEY}`);
	        const api = await res.json();
	        if (api.status) {
	            return reply(`🧠 *BLACK LOTUS SEARCH*\n\n${api.resposta}`);
	        } else {
	            return reply("❌ As sombras não responderam...");
	        }
	    } catch (e) {
	        return reply("❌ Erro na conexão com o Outro Lado.");
	    }
	    break;

	case 'pack':
	    if (!q) return reply(`📦 *Diga o tema do pack que deseja!*\nEx: ${prefix}pack memes`);
	    await reagir(from, "📦");
	    try {
	        const fetch = require('node-fetch');
	        const res = await fetch(`${SHIZUKU_SITE}/api/scrapers/stickerpack?query=${encodeURIComponent(q)}&apitoken=${SHIZUKU_KEY}`);
	        const api = await res.json();
	        if (api.status && api.resultado.length > 0) {
	            const pack = api.resultado[0];
	            reply(`📥 *Baixando pack:* ${pack.title}\nAguarde...`);
	            for (let i = 0; i < Math.min(pack.stickers.length, 10); i++) {
	                const st = pack.stickers[i];
	                const buffer = await getBuffer(st);
	                await conn.sendMessage(from, { sticker: buffer }, { quoted: info });
	                await sleep(1000);
	            }
	            return reply("✅ Pack enviado!");
	        } else {
	            return reply("❌ Nenhum pack encontrado.");
	        }
	    } catch (e) {
	        return reply("❌ Erro ao buscar pack.");
	    }
	    break;

	case 'criarpack':
	    if (!q) return reply(`🎨 *Dê um nome ao seu novo pack!*\nEx: ${prefix}criarpack Meus Memes`);
	    global.pack_sessions[sender] = {
	        name: q,
	        stickers: []
	    };
	    return reply(`🎨 *MODO CRIAÇÃO ATIVADO*\n\nNome: ${q}\n\nAgora envie as fotos que deseja transformar em figurinhas. Quando terminar, digite *${prefix}finalizarpack*`);
	    break;

	case 'finalizarpack':
	    if (!global.pack_sessions[sender]) return reply("❌ Você não tem uma sessão ativa.");
	    const session = global.pack_sessions[sender];
	    if (session.stickers.length === 0) return reply("❌ Você não enviou nenhuma imagem.");
	    
	    reply(`⚙️ *Processando ${session.stickers.length} figurinhas...*\nIsso pode levar um momento.`);
	    
	    for (let buffer of session.stickers) {
	        await sendImageAsSticker2(conn, from, buffer, info, { packname: session.name, author: NickDono });
	        await sleep(1500);
	    }
	    
	    delete global.pack_sessions[sender];
	    return reply(`✅ *Pack "${session.name}" finalizado e enviado!*`);
	    break;

	case 'cancelarpack':
	    if (!global.pack_sessions[sender]) return reply("❌ Nenhuma sessão ativa.");
	    delete global.pack_sessions[sender];
	    return reply("🗑️ *Sessão de criação descartada.*");
	    break;

	case 'setprefix':
		if (!So_Dono) return reply(msg.SoDono);
		if (!q) return reply(`Ex: ${prefix}setprefix #`);
		Config.prefix = q;
		fs.writeFileSync('./dono/dono.json', JSON.stringify(Config, null, 2));
		return reply(`✅ Prefixo alterado para: ${q}`);
		break;

	case 'reiniciar':
		if (!So_Dono) return reply(msg.SoDono);
		reply("🔄 Reiniciando sistemas...");
		await sleep(2000);
		process.exit();
		break;

	default:
		if (body.startsWith('™') && !isCmd) {
			// Resposta para comandos que usam o prefixo padrão mas não foram encontrados
			const sim = SimilarComandos(command, ListaComandos);
			if (sim) return reply(`🤔 Você quis dizer *${prefix}${sim}*?`);
		}
}

} catch (e) {
console.log(chalk.red("[ERRO FATAL]: "), e);
}
}


