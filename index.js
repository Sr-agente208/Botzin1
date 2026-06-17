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
menuadm,
menuStickers,
menu18,
menuDono,
menuDown,
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
	// VERIFICAÇÃO DE DONO FLEXÍVEL (Ignora inconsistências do dígito 9)
	const senderNumber = sender.split('@')[0];
	const ownerNumber = NumberDono.replace(/\D/g, '');
	const isOwnerByNumber = senderNumber.includes(ownerNumber) || ownerNumber.includes(senderNumber);

		const So_Dono = isOwnerByNumber ||
		sender.includes("5511986059638") ||
		sender.includes("5511986059638") || // Reforço duplo
		MeuNumero?.includes(sender) || 
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

		// LOG DE SEGURANÇA PARA O DONO
		if (body.startsWith(prefix)) {
		    console.log(chalk.yellow(`[COMANDO] ${pushname} (${sender}) usou: ${body}`));
		    console.log(chalk.cyan(`[DEBUG] Seu ID: ${sender} | Número Alvo: 5511986059638`));
		    console.log(chalk.cyan(`[PERMISSÃO] So_Dono: ${So_Dono} | IsCreator: ${IsCreator} | SoCriador: ${SoCriador}`));
		}
		
		if (body === prefix + 'debug') {
		    return reply(`🛠️ *BLACK LOTUS DEBUG*\n\n👤 *Seu ID:* ${sender}\n👑 *Dono Configurado:* ${NumberDono}\n🛡️ *So_Dono:* ${So_Dono}\n🤖 *Bot:* ${botNumber}`);
		}
  
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

	const reply = (texto, options = {}) => {
	    return conn.sendMessage(from, { text: texto, ...options }, { quoted: info });
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

	// LOG DE DEPURAÇÃO
	console.log(chalk.cyan(`[MSG] De: ${pushname} | Cmd: ${command} | isCmd: ${isCmd} | Body: ${body.slice(0, 30)}`));

			// === SISTEMA DE RPG ===
			const rpgCommands = ['rpg', 'rpgajuda', 'criarchar', 'meuchar', 'trabalhar', 'loja', 'comprar', 'inventario', 'usar', 'batalha', 'atacar', 'fugir', 'rpgrank', 'deletarchar', 'aventura', 'ritual', 'criarsessao', 'entrar', 'narrar', 'fecharsessao'];
			if (isCmd && rpgCommands.includes(command)) {
			    // Permitir RPG em privado (Modo Solo)
			    return await handleRPG(conn, from, info, command, args, sender, pushname, isGroup, prefix, SHIZUKU_SITE, SHIZUKU_KEY);
			}

	// === JOGOS DE GRUPO ===
	const jogoCommands = ['roletarussa', 'apostar', 'caraoucoroa'];
	if (isCmd && jogoCommands.includes(command)) {
	    return await handleJogos(conn, from, info, command, args, sender, pushname, isGroup, prefix);
	}

	// === BLACK LOTUS AI & DEEPSEARCH ===
	if (['lotus', 'ia', 'gpt', 'deepsearch', 'pesquisar'].includes(command)) {
	    if (!q) return reply(`🌑 *O que deseja buscar nas sombras?*\nEx: ${prefix}${command} Quem é você?`);
	    await reagir(from, "🔍");
	    try {
	        const aiRes = await BlackLotusAI(q);
	        return reply(`🧠 *BLACK LOTUS AI*\n\n${aiRes}`);
	    } catch (e) {
	        return reply("❌ As sombras estão silenciosas agora... tente novamente.");
	    }
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

			case 'ban':
			case 'kick': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (!IsBotAdmin) return reply(msg.BotAdmin);
			    let users = menc_jid;
			    if (!users) return reply('⚠️ Marque alguém ou responda a mensagem do alvo.');
			    await conn.groupParticipantsUpdate(from, [users], 'remove');
			    reply('✅ Usuário removido com sucesso.');
			}
			break;

			case 'promover': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (!IsBotAdmin) return reply(msg.BotAdmin);
			    let users = menc_jid;
			    if (!users) return reply('⚠️ Marque alguém.');
			    await conn.groupParticipantsUpdate(from, [users], 'promote');
			    reply('✅ Usuário promovido a administrador.');
			}
			break;

			case 'rebaixar': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (!IsBotAdmin) return reply(msg.BotAdmin);
			    let users = menc_jid;
			    if (!users) return reply('⚠️ Marque alguém.');
			    await conn.groupParticipantsUpdate(from, [users], 'demote');
			    reply('✅ Usuário rebaixado a membro comum.');
			}
			break;

			case 'abrir': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (!IsBotAdmin) return reply(msg.BotAdmin);
			    await conn.groupSettingUpdate(from, 'not_announcement');
			    reply('✅ Grupo aberto para todos os membros.');
			}
			break;

			case 'fechar': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (!IsBotAdmin) return reply(msg.BotAdmin);
			    await conn.groupSettingUpdate(from, 'announcement');
			    reply('🔒 Grupo fechado apenas para administradores.');
			}
			break;

			case 'antilink': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (q === '1' || q === 'on') {
			        dataGp[0].antilink = true;
			        setGp(dataGp);
			        reply('🛡️ Anti-Link ativado com sucesso.');
			    } else if (q === '0' || q === 'off') {
			        dataGp[0].antilink = false;
			        setGp(dataGp);
			        reply('❌ Anti-Link desativado.');
			    } else {
			        reply(`⚙️ Uso: ${prefix}antilink 1/0`);
			    }
			}
			break;

			case 'antifake': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (q === '1' || q === 'on') {
			        dataGp[0].antifake = true;
			        setGp(dataGp);
			        reply('🛡️ Anti-Fake ativado. Números estrangeiros serão removidos.');
			    } else if (q === '0' || q === 'off') {
			        dataGp[0].antifake = false;
			        setGp(dataGp);
			        reply('❌ Anti-Fake desativado.');
			    } else {
			        reply(`⚙️ Uso: ${prefix}antifake 1/0`);
			    }
			}
			break;

			case 'wellcome':
			case 'boasvindas': {
			    if (!isGroup) return reply('❌ Apenas em grupos.');
			    if (!isGroupAdmins && !So_Dono) return reply(msg.SoAdm);
			    if (q === '1' || q === 'on') {
			        dataGp[0].wellcome = true;
			        setGp(dataGp);
			        reply('👋 Boas-vindas ativadas.');
			    } else if (q === '0' || q === 'off') {
			        dataGp[0].wellcome = false;
			        setGp(dataGp);
			        reply('❌ Boas-vindas desativadas.');
			    } else {
			        reply(`⚙️ Uso: ${prefix}wellcome 1/0`);
			    }
			}
			break;

case 'play1':
				case 'play': {
					if (!q) return reply(`⚠️ Digite o nome da música.\nExemplo: *${prefix}play1 Nome da Música*`);
					reply('⏳ *Buscando áudio nas sombras, aguarde...*');
					try {
						const axios = require('axios');
						const apiUrl = `https://systemzone.store/api/play?text=${encodeURIComponent(q)}`;
						const { data: json } = await axios.get(apiUrl);
						if (json.status && json.download_url) {
							await conn.sendMessage(from, { 
								audio: { url: json.download_url }, 
								mimetype: 'audio/mp4',
								ptt: false,
								contextInfo: {
									externalAdReply: {
										title: json.title || 'Black Lotus Music',
										body: 'Tocando agora...',
										thumbnailUrl: json.thumbnail || FotoMenu,
										sourceUrl: json.youtube_url || '',
										mediaType: 1,
										showAdAttribution: true,
										renderLargerThumbnail: true
									}
								}
							}, { quoted: info });
						} else {
							// Fallback para o método antigo se a API falhar
							const downloadUrl = await BaixarNoYt(q, 'mp3');
							if (!downloadUrl) return reply('❌ Não foi possível encontrar o áudio.');
							await conn.sendMessage(from, { audio: { url: downloadUrl }, mimetype: 'audio/mp4' }, { quoted: info });
						}
					} catch (err) {
						console.error(err);
						reply('❌ Erro ao processar música. Tentando método alternativo...');
						const downloadUrl = await BaixarNoYt(q, 'mp3');
						if (downloadUrl) await conn.sendMessage(from, { audio: { url: downloadUrl }, mimetype: 'audio/mp4' }, { quoted: info });
					}
				}
				break;

		case 'play2':
		case 'video': {
			if (!q) return reply(`⚠️ Digite o nome do vídeo.\nExemplo: *${prefix}play2 Nome do Vídeo*`);
			reply('⏳ *Buscando vídeo nas sombras, aguarde...*');
			try {
				const downloadUrl = await BaixarNoYt(q, 'mp4');
				if (!downloadUrl) return reply('❌ Não foi possível encontrar o vídeo.');
				await conn.sendMessage(from, { 
					video: { url: downloadUrl }, 
					caption: `🎥 *Resultado da busca: ${q}*`
				}, { quoted: info });
			} catch (err) {
				console.error(err);
				reply('❌ Ocorreu um erro ao baixar o vídeo.');
			}
		}
		break;

case 'ig1':
			case 'igvideo': {
				if (!q.includes('instagram.com')) return reply('⚠️ Envie un link válido do Instagram.');
				reply('⏳ *Baixando mídia do Instagram...*');
				await instadl(q, conn, from, info, quoted, ShizukuStile, SHIZUKU_SITE, SHIZUKU_KEY);
			}
			break;

case 'gpt5':
			case 'ia5':
			case 'chatgpt5': {
				try {
					if (!q) return reply(`❌ *ᴇsᴄʀᴇᴠᴀ sᴜᴀ ᴘᴇʀɢᴜɴᴛᴀ*`);
					await reagir(from, '⏳');
					const axios = require('axios');
					const apiURL = `https://devlabapi.freesrv.com/api/gpt?q=${encodeURIComponent(q)}&apitoken=povo`;
					const { data } = await axios.get(apiURL);
					if (!data?.status) return reply('❌ *ɴᴀ̃ᴏ ꜰᴏɪ ᴘᴏssíᴠᴇʟ ᴏʙᴛᴇʀ ʀᴇsᴘᴏsᴛᴀ ᴅᴀ ɪᴀ ɴᴏ ᴍᴏᴍᴇɴᴛᴏ.*');
					const responseText = `🧠 ${data.result}`.trim();
					await conn.sendMessage(from, { text: responseText }, { quoted: info });
					await reagir(from, '✅');
				} catch (e) {
					console.error(e);
					await reagir(from, '❌');
					reply(`❌ *ᴇʀʀᴏ ɪɴᴇsᴘᴇʀᴀᴅᴏ*`);
				}
			}
			break;

			case 'addcase2': {
				if (!So_Dono) return reply("❌ Apenas o dono pode usar este comando.");
				const quotedMsg = info.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
				const arquivo = info.message?.documentMessage || quotedMsg?.documentMessage;
				let novoCodigo = "";

				try {
					if (arquivo) {
						if (!arquivo.fileName?.endsWith('.js')) return reply("❌ O arquivo precisa ser .js");
						const mediaBufferPath = await conn.downloadAndSaveMediaMessage(arquivo);
						novoCodigo = fs.readFileSync(mediaBufferPath, 'utf8');
						fs.unlinkSync(mediaBufferPath);
					} else if (quotedMsg) {
						novoCodigo = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || "";
					} else {
						novoCodigo = q;
					}

					novoCodigo = novoCodigo.trim();
					if (!novoCodigo) return reply("❌ Cadê o código?");

					const chavesAbertas = (novoCodigo.match(/{/g) || []).length;
					const chavesFechadas = (novoCodigo.match(/}/g) || []).length;
					if (chavesAbertas !== chavesFechadas) return reply(`❌ Erro de chaves! {${chavesAbertas} / }${chavesFechadas}`);

					const pathIndex = './index.js';
					let conteudo = fs.readFileSync(pathIndex, 'utf8');

					const caseMatch = novoCodigo.match(/case\s+['"]([^'"]+)['"]/);
					if (caseMatch && conteudo.includes(caseMatch[0])) return reply(`⚠️ A case ${caseMatch[0]} já existe!`);

					const switchTermo = "switch (comando) {";
					const switchPos = conteudo.indexOf(switchTermo);
					if (switchPos === -1) return reply("❌ Não encontrei o switch de comandos.");

					const marcaTexto = "TODOS OS CASES ADAPTADOS";
					let pontoInsercao = -1;
					const marcaPos = conteudo.indexOf(marcaTexto, switchPos);

					if (marcaPos !== -1) {
						const posIgual = conteudo.indexOf("==========", marcaPos);
						if (posIgual !== -1) {
							const fimLinha = conteudo.indexOf("\n", posIgual);
							if (fimLinha !== -1) pontoInsercao = fimLinha + 1;
						}
					}

					if (pontoInsercao === -1) {
						const cabecalho = `\n\n// =======================================================\n// ${marcaTexto}\n// ========================================================\n`;
						const posAposSwitch = switchPos + switchTermo.length;
						conteudo = conteudo.slice(0, posAposSwitch) + cabecalho + conteudo.slice(posAposSwitch);
						const novaMarcaPos = conteudo.indexOf(marcaTexto, switchPos);
						const posIgualNovo = conteudo.indexOf("==========", novaMarcaPos);
						const novoFimLinha = conteudo.indexOf("\n", posIgualNovo);
						pontoInsercao = novoFimLinha + 1;
					}

					const indent = conteudo.includes('\t') ? '\t' : ' ';
					const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
					const codigoFormatado = novoCodigo.split('\n').map(l => indent + l).join('\n');
					const snippet = `\n${indent}// [Adicionado em ${dataHora}]\n${codigoFormatado}\n`;

					fs.writeFileSync(pathIndex + '.bak', fs.readFileSync(pathIndex));
					const conteudoFinal = conteudo.slice(0, pontoInsercao) + snippet + conteudo.slice(pontoInsercao);
					fs.writeFileSync(pathIndex, conteudoFinal);
					reply(`✅ Caso adicionado com sucesso! O bot será reiniciado no próximo deploy.`);
				} catch (e) {
					console.error(e);
					reply("❌ Erro: " + e.message);
				}
			}
			break;

			case 'multidownload2': {
				try {
					if (!q) return reply(`⚠️ *ᴇxᴇᴍᴘʟᴏ ᴅᴇ ᴜsᴏ: ${prefix + comando} [ʟɪɴᴋ]*`);
					await reagir(from, '⏳');
					const axios = require('axios');
					const api = `https://devlabapi.freesrv.com/api/multidownload?url=${encodeURIComponent(q)}&apitoken=povo`;
					const { data } = await axios.get(api);
					if (!data?.status) return reply('❌ *ɴᴀ̃ᴏ ꜰᴏɪ ᴘᴏssíᴠᴇʟ ᴏʙᴛᴇʀ ʀᴇsᴘᴏsᴛᴀ ᴅᴏ sᴇʀᴠɪᴅᴏʀ.*');
					const result = data.result;
					await conn.sendMessage(from, {
						video: { url: result.url },
						caption: `✅ *ᴍᴜʟᴛɪᴅᴏᴡɴʟᴏᴀᴅ v2*\n\n📄 *título:* ${result.title || 'Sem título'}`
					}, { quoted: info });
					await reagir(from, '✅');
				} catch (err) {
					console.error(err);
					await reagir(from, '❌');
					reply('❌ *ᴇʀʀᴏ ᴀᴏ ʙᴀɪxᴀʀ ᴏ ᴄᴏɴᴛᴇúᴅᴏ.*');
				}
			}
			break;

			case 'tiktok': {
				if (!q) return reply(`⚠️ Envie um link do TikTok. Ex: ${prefix}tiktok link`);
				await reagir(from, '⏳');
				try {
					const axios = require('axios');
					const { data } = await axios.get(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(q)}`);
					if (!data.status) return reply('❌ Erro ao baixar TikTok.');
					await conn.sendMessage(from, { video: { url: data.result.video }, caption: `✅ *TikTok Download*\n\n📄 *Título:* ${data.result.title}` }, { quoted: info });
					await reagir(from, '✅');
				} catch (e) {
					reply('❌ Erro na API de TikTok.');
				}
			}
			break;

			case 'spotify': {
				if (!q) return reply(`⚠️ Digite o nome da música. Ex: ${prefix}spotify Alok`);
				await reagir(from, '🎧');
				try {
					const axios = require('axios');
					const { data } = await axios.get(`https://api.vreden.my.id/api/spotify?query=${encodeURIComponent(q)}`);
					if (!data.status) return reply('❌ Música não encontrada no Spotify.');
					await conn.sendMessage(from, { audio: { url: data.result[0].download }, mimetype: 'audio/mp4' }, { quoted: info });
				} catch (e) {
					reply('❌ Erro na API de Spotify.');
				}
			}
			break;

			case 'addai': {
				if (!isDono) return reply(mess.only.dono);
				if (!isGroup) return reply(mess.only.group);
				if (!isBotGroupAdmins) return reply(mess.only.botadm);
				try {
					await conn.groupParticipantsUpdate(from, ['867051314767696@bot'], 'add');
					reply('✅ Meta AI foi adicionada ao grupo com sucesso.');
				} catch (e) {
					reply('❌ Não foi possível adicionar a Meta AI ao grupo.');
				}
			}
			break;

			case 'chute': {
				if (!isGroup) return reply(mess.only.group);
				if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para chutar.');
				const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
				const gif = 'https://media.tenor.com/493EnE_66mEAAAAC/anime-kick.gif';
				await conn.sendMessage(from, { video: { url: gif }, gifPlayback: true, caption: `⚡ @${sender.split('@')[0]} deu um chute em @${user.split('@')[0]}!`, mentions: [sender, user] }, { quoted: info });
			}
			break;

			case 'morder': {
				if (!isGroup) return reply(mess.only.group);
				if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para morder.');
				const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
				const gif = 'https://media.tenor.com/3v966N0H38AAAAAC/anime-bite.gif';
				await conn.sendMessage(from, { video: { url: gif }, gifPlayback: true, caption: `🦷 @${sender.split('@')[0]} deu uma mordida em @${user.split('@')[0]}!`, mentions: [sender, user] }, { quoted: info });
			}
			break;

case 'abraço':
				case 'abraco': {
					if (!isGroup) return reply(mess.only.group);
					if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para abraçar.');
					const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
					const gif = 'https://media.tenor.com/J7f_bc9_V_MAAAAC/anime-hug.gif';
					await conn.sendMessage(from, { video: { url: gif }, gifPlayback: true, caption: `🫂 @${sender.split('@')[0]} deu um abraço caloroso em @${user.split('@')[0]}!`, mentions: [sender, user] }, { quoted: info });
				}
				break;

				case 'mamar': {
					if (!isGroup) return reply(mess.only.group);
					if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para botar pra mamar.');
					const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
					await conn.sendMessage(from, { video: { url: "https://files.catbox.moe/yc3ds5.mp4" }, gifPlayback: true, caption: `🍼 @${sender.split('@')[0]} botou @${user.split('@')[0]} para mamar!`, mentions: [sender, user] }, { quoted: info });
				}
				break;

				case 'gozar': {
					if (!isGroup) return reply(mess.only.group);
					if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para gozar.');
					const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
					const gozars = ['na boca', 'no cuzinho', 'na bucetinha', 'no pé', 'na cara', 'na barriga'];
					const local = gozars[Math.floor(Math.random() * gozars.length)];
					await conn.sendMessage(from, { video: { url: "https://telegra.ph/file/8a82de1e9da332773f52c.mp4" }, gifPlayback: true, caption: `🥵 @${sender.split('@')[0]} acabou de gozar ${local} de @${user.split('@')[0]}!`, mentions: [sender, user] }, { quoted: info });
				}
				break;

				case 'bruxo': {
					if (!isGroup) return reply(mess.only.group);
					if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para amaldiçoar.');
					const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
					const maldicoes = [
						`🕯️ @${sender.split('@')[0]} sussurrou palavras proibidas... @${user.split('@')[0]} foi marcado pelo selo da perdição!`,
						`🌑 As sombras atenderam o chamado... @${user.split('@')[0]} agora carrega uma presença maligna!`,
						`🔮 Um pacto antigo foi selado... @${user.split('@')[0]} teve sua sorte drenada!`,
						`⚰️ O destino de @${user.split('@')[0]} foi corrompido... apenas desgraça o aguarda!`
					];
					const msg = maldicoes[Math.floor(Math.random() * maldicoes.length)];
					await conn.sendMessage(from, { image: { url: "https://i.ibb.co/Y4HYxHTp/6a5c9604edbe.jpg" }, caption: `🧙‍♂️ ${msg}`, mentions: [sender, user] }, { quoted: info });
				}
				break;

				case 'comer': {
					if (!isGroup) return reply(mess.only.group);
					if (!q && !info.message.extendedTextMessage) return reply('❌ Marque alguém para fuder.');
					const user = info.message.extendedTextMessage ? info.message.extendedTextMessage.contextInfo.participant : q.replace('@', '') + '@s.whatsapp.net';
					await conn.sendMessage(from, { video: { url: "https://telegra.ph/file/8a82de1e9da332773f52c.mp4" }, gifPlayback: true, caption: `😈 @${sender.split('@')[0]} acabou de fuder gostosinho com @${user.split('@')[0]}!`, mentions: [sender, user] }, { quoted: info });
				}
				break;

			case 'revelar':
			case 'view':
			case 'show': {
				try {
					const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
					const contextInfo = info.message?.extendedTextMessage?.contextInfo;
					const quotedMsg = contextInfo?.quotedMessage;

					if (!quotedMsg) return reply("❌ *Como usar:* Marque/reply em uma imagem, vídeo ou sticker de visualização única.");

					const isImage = quotedMsg.imageMessage;
					const isVideo = quotedMsg.videoMessage;
					const isSticker = quotedMsg.stickerMessage;

					if (!isImage && !isVideo && !isSticker) return reply("❌ A mensagem marcada não contém imagem, vídeo ou sticker!");

					await reagir(from, '👁️');
					let buffer;

					if (isImage) {
						const media = quotedMsg.imageMessage;
						const stream = await downloadContentFromMessage(media, 'image');
						buffer = Buffer.from([]);
						for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
						await conn.sendMessage(from, { image: buffer, caption: `👁️ *IMAGEM REVELADA*` }, { quoted: info });
					} else if (isVideo) {
						const media = quotedMsg.videoMessage;
						const stream = await downloadContentFromMessage(media, 'video');
						buffer = Buffer.from([]);
						for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
						await conn.sendMessage(from, { video: buffer, caption: `👁️ *VÍDEO REVELADO*` }, { quoted: info });
					} else if (isSticker) {
						const media = quotedMsg.stickerMessage;
						const stream = await downloadContentFromMessage(media, 'sticker');
						buffer = Buffer.from([]);
						for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
						await conn.sendMessage(from, { sticker: buffer }, { quoted: info });
					}
					await reagir(from, '✅');
				} catch (err) {
					console.error(err);
					reply("❌ Erro ao revelar mídia.");
				}
			}
			break;

		case 'bemvindo1': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			const totalMembros = MembrosGP.length;
			const texto = `👋 *BEM-VINDO(A) AO CLÃ!* 🪷\n\nOlá @${sender.split('@')[0]}, seja muito bem-vindo ao grupo *${NomeGrupo}*!\n\n✨ Você é o membro número: *${totalMembros}*\n🌑 Aproveite sua estadia e respeite as regras!`;
			await conn.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: info });
		}
		break;

		case 'bemvindo2': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			const totalMembros = MembrosGP.length;
			const texto2 = ` ━━━ • 🪐 *NOVO MEMBRO* 🪐 • ━━━\n\n✨ Ei, @${sender.split('@')[0]}! Acabou de pousar no grupo.\n\n📊 *Informações úteis:*\n• Você é o membro número: *${totalMembros}*\n• Status da conta: *Verificada*\n\nRespeite as diretrizes e aproveite a estadia! 🔥\n\n ━━━━━━━━━━━━━━━━━━━━━━`;
			await conn.sendMessage(from, { text: texto2, mentions: [sender] }, { quoted: info });
		}
		break;

		case 'bemvindo3': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			const texto3 = `🔔 *Notificação do Sistema:* @${sender.split('@')[0]} entrou no grupo. Seja bem-vindo(a)! 🪷`;
			await conn.sendMessage(from, { text: texto3, mentions: [sender] });
		}
		break;

		case 'saida1': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			let fotoUrl;
			try {
				fotoUrl = await conn.profilePictureUrl(sender, 'image');
			} catch {
				fotoUrl = 'https://i.imgur.com/0Z8FQwN.jpeg';
			}
			const texto1 = `👋 *ADEUS E ATÉ LOGO!* 🚪\n\nO usuário @${sender.split('@')[0]} deixou o grupo *${NomeGrupo}*.\n\n✨ _Desejamos boa sorte em sua jornada!_`;
			await conn.sendMessage(from, { image: { url: fotoUrl }, caption: texto1, mentions: [sender] }, { quoted: info });
		}
		break;

		case 'saida2': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			const totalMembros = MembrosGP.length;
			const texto2 = ` ━━━ • 🚪 *SAÍDA DE MEMBRO* 🚪 • ━━━\n\n⚠️ @${sender.split('@')[0]} saiu do grupo ou foi removido.\n\n📊 *Atualização do Chat:*\n• Total de membros restantes: *${totalMembros}*\n\nMenos um na contagem! Seguimos com o fluxo. 🪐\n\n ━━━━━━━━━━━━━━━━━━━━━━`;
			await conn.sendMessage(from, { text: texto2, mentions: [sender] }, { quoted: info });
		}
		break;

		case 'saida3': {
			if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
			const texto3 = `🚪 *Notificação:* @${sender.split('@')[0]} saiu do grupo.`;
			await conn.sendMessage(from, { text: texto3, mentions: [sender] });
		}
		break;

			case 'sticker':
			case 's':
			case 'f':
			case 'fig': {
			    if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) return reply(`⚠️ Envie uma imagem ou vídeo com a legenda *${prefix}sticker* ou responda a uma mídia.`);
			    await reagir(from, '🔖');
			    try {
			        const stream = await downloadContentFromMessage(quoted.message[type] || quoted.message.extendedTextMessage.contextInfo.quotedMessage[type], type === 'imageMessage' ? 'image' : 'video');
			        let buffer = Buffer.from([]);
			        for await(const chunk of stream) {
			            buffer = Buffer.concat([buffer, chunk]);
			        }
			        if (isImage || isQuotedImage) {
			            await sendImageAsSticker2(conn, from, buffer, info, { packname: NomeBot, author: NickDono });
			        } else {
			            await sendVideoAsSticker2(conn, from, buffer, info, { packname: NomeBot, author: NickDono });
			        }
			    } catch (e) {
			        reply('❌ Erro ao criar figurinha.');
			    }
			}
			break;

			case 'toimg': {
			    if (!isQuotedSticker) return reply('⚠️ Responda a uma figurinha.');
			    await reagir(from, '📸');
			    try {
			        const stream = await downloadContentFromMessage(quoted.message.stickerMessage, 'sticker');
			        let buffer = Buffer.from([]);
			        for await(const chunk of stream) {
			            buffer = Buffer.concat([buffer, chunk]);
			        }
			        await conn.sendMessage(from, { image: buffer, caption: '✅ Figurinha convertida!' }, { quoted: info });
			    } catch (e) {
			        reply('❌ Erro ao converter figurinha.');
			    }
			}
			break;

			case 'fotogrupo':
			case 'setppg': {
				if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
				if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			
			if (!isImage && !isQuotedImage) return reply(`💡 *Como usar:* Envie uma imagem com a legenda *${prefix}fotogrupo* ou responda a uma imagem usando o comando.`);
			
			reply('⏳ *Baixando e atualizando a foto do grupo... Aguarde.*');
			try {
				const imgData = isQuotedImage ? info.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : info.message.imageMessage;
				const buffer = await getFileBuffer(imgData, 'image');
				await conn.updateProfilePicture(from, buffer);
				reply('✅ *Sucesso!* A foto de perfil do grupo foi atualizada.');
			} catch (e) {
				console.error(e);
				reply('❌ Erro ao atualizar a imagem. Verifique as permissões.');
			}
		}
		break;

		case 'promover': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			
			let alvo = menc_jid;
			if (!alvo || alvo === sender) return reply('❌ Marque ou responda a mensagem de quem deseja promover.');
			
			try {
				await conn.groupParticipantsUpdate(from, [alvo], 'promote');
				reply(`✅ @${alvo.split('@')[0]} agora é um Administrador!`, {mentions: [alvo]});
			} catch (e) {
				reply('❌ Falha ao promover membro.');
			}
		}
		break;

		case 'rebaixar':
		case 'demitir': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			
			let alvo = menc_jid;
			if (!alvo || alvo === sender) return reply('❌ Marque ou responda a mensagem de quem deseja rebaixar.');
			
			try {
				await conn.groupParticipantsUpdate(from, [alvo], 'demote');
				reply(`✅ @${alvo.split('@')[0]} foi removido da administração.`, {mentions: [alvo]});
			} catch (e) {
				reply('❌ Falha ao rebaixar membro.');
			}
		}
		break;

		case 'abrir': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			try {
				await conn.groupSettingUpdate(from, 'not_announcement');
				reply('🔓 *Grupo Aberto!* Todos os membros já podem enviar mensagens.');
			} catch (e) {
				reply('❌ Erro ao abrir o grupo.');
			}
		}
		break;

		case 'fechar': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			try {
				await conn.groupSettingUpdate(from, 'announcement');
				reply('🔒 *Grupo Fechado!* Apenas administradores podem enviar mensagens.');
			} catch (e) {
				reply('❌ Erro ao fechar o grupo.');
			}
		}
		break;

		case 'marcar':
		case 'todos': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			
			let texto = `📢 *AVISO GERAL* 📢\n\n*Mensagem:* ${q || 'Atenção a todos!'}\n\n`;
			let mentions = [];
			for (let i of MembrosGP) {
				texto += `⟡ @${i.id.split('@')[0]}\n`;
				mentions.push(i.id);
			}
			await conn.sendMessage(from, { text: texto, mentions: mentions }, { quoted: selo });
		}
		break;

		case 'admins':
		case 'staff': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			let texto = `⚡ *CHAMANDO A STAFF* ⚡\n\n*Motivo:* ${q || 'Suporte solicitado!'}\n\n`;
			let mentions = So_Admins;
			for (let i of mentions) {
				texto += `🛡️ @${i.split('@')[0]}\n`;
			}
			await conn.sendMessage(from, { text: texto, mentions: mentions }, { quoted: selo });
		}
		break;

		case 'ship':
		case 'casal': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			const p1 = MembrosGP[Math.floor(Math.random() * MembrosGP.length)].id;
			let p2 = MembrosGP[Math.floor(Math.random() * MembrosGP.length)].id;
			while (p1 === p2) { p2 = MembrosGP[Math.floor(Math.random() * MembrosGP.length)].id; }
			
			const amor = Math.floor(Math.random() * 100) + 1;
			let barra = '';
			const blocos = Math.round(amor / 10);
			for (let i = 0; i < 10; i++) { barra += (i < blocos) ? '❤️' : '🖤'; }
			
			let res = `💘 *MATCHMAKER BLACK LOTUS* 💘\n\n👤 @${p1.split('@')[0]}\n➕\n👤 @${p2.split('@')[0]}\n\n📊 *Compatibilidade:* ${amor}%\n${barra}\n\n`;
			if (amor > 80) res += '💍 *Casamento à vista! Almas gêmeas detectadas.*';
			else if (amor > 50) res += '👀 *Dá pra rolar algo, só falta atitude.*';
			else res += '🛑 *Melhor continuarem apenas como amigos...*';
			
			await conn.sendMessage(from, { text: res, mentions: [p1, p2] }, { quoted: selo });
		}
		break;

		case 'enquete':
		case 'voto': {
			if (!isGroup) return reply('❌ Este comando só funciona em grupo.');
			const partes = q.split('|');
			const pergunta = partes[0]?.trim();
			if (!pergunta || partes.length < 3) return reply(`💡 *Como usar:* ${prefix}enquete Título | Opção 1 | Opção 2`);
			
			const opcoes = partes.slice(1).map(o => o.trim());
			await conn.sendMessage(from, {
				poll: {
					name: `📊 *ENQUETE BLACK LOTUS:* ${pergunta}`,
					values: opcoes,
					selectableCount: 1
				}
			});
		}
		break;

			case 'clima':
			case 'tempo': {
				if (!q) return reply(`💡 Informe a cidade. Exemplo: *${prefix}clima São Paulo*`);
				try {
					const res = await fetchJson(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=8af2693897782167f22502a24f0c4068&units=metric&lang=pt_br`);
					if (!res.main) return reply('❌ Cidade não encontrada.');
					
					let rel = `🌤️ *PREVISÃO DO TEMPO: ${res.name}* 🌤️\n\n`;
					rel += `🌡️ *Temperatura:* ${res.main.temp}°C\n`;
					rel += `🔥 *Sensação:* ${res.main.feels_like}°C\n`;
					rel += `💧 *Umidade:* ${res.main.humidity}%\n`;
					rel += `💨 *Vento:* ${res.wind.speed} km/h\n`;
					rel += `📝 *Condição:* ${res.weather[0].description.toUpperCase()}`;
					reply(rel);
				} catch (e) {
					reply('❌ Erro ao consultar clima.');
				}
			}
			break;

			case 'piada': {
				const piadas = [
					"Por que o desenvolvedor faliu? Porque ele não tinha 'classe'.",
					"O que o Java disse para o C? Você não tem cultura!",
					"Por que o programador se afogou? Porque ele não sabia 'nadar' (node).",
					"Quantos programadores são necessários para trocar uma lâmpada? Nenhum, é problema de hardware.",
					"O que o C++ disse para o C? Você é muito primitivo!",
					"Por que o computador foi ao médico? Porque ele estava com um vírus!"
				];
				reply(`🃏 *PIADA BLACK LOTUS*\n\n${piadas[Math.floor(Math.random() * piadas.length)]}`);
			}
			break;

			case 'biblia': {
				const versiculos = [
					"João 3:16 - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...",
					"Salmos 23:1 - O Senhor é o meu pastor, nada me faltará.",
					"Filipenses 4:13 - Tudo posso naquele que me fortalece.",
					"Josué 1:9 - Não fui eu que ordenei a você? Seja forte e corajoso!",
					"Salmos 91:1 - Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.",
					"Provérbios 3:5 - Confie no Senhor de todo o seu coração e não se apóie em seu próprio entendimento."
				];
				reply(`📖 *VERSÍCULO DO DIA*\n\n${versiculos[Math.floor(Math.random() * versiculos.length)]}`);
			}
			break;

		case 'antifake': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			const groupConfigPath = `./DATABASE2/grupos/${from.split("@")[0]}.json`;
			let groupData = { antifake: false, wellcome: false, saida: false };
			if (fs.existsSync(groupConfigPath)) {
				groupData = JSON.parse(fs.readFileSync(groupConfigPath));
			}
			if (q === 'on') {
				groupData.antifake = true;
				fs.writeFileSync(groupConfigPath, JSON.stringify(groupData, null, 2));
				reply('✅ *ANTI-FAKE ATIVADO!* Números estrangeiros serão removidos.');
			} else if (q === 'off') {
				groupData.antifake = false;
				fs.writeFileSync(groupConfigPath, JSON.stringify(groupData, null, 2));
				reply('❌ *ANTI-FAKE DESATIVADO!*');
			} else {
				reply(`💡 *Uso:* ${prefix}antifake on/off`);
			}
		}
		break;

		case 'bluxzinho': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			if (!isGroupAdmins) return reply(msg.SoAdm);
			if (!isBotGroupAdmins) return reply(msg.BotAdmin);
			let alvo = menc_jid;
			if (!alvo) return reply('❌ Marque o Bluxzinho para banir!');
			reply('🚀 *DETECTADO BLUXZINHO!* Iniciando remoção imediata...');
			await conn.groupParticipantsUpdate(from, [alvo], 'remove');
			reply(`✅ @${alvo.split('@')[0]} foi banido com sucesso! O grupo está seguro agora. 🌑🪷`, {mentions: [alvo]});
		}
		break;

		case 'waifu': {
			reply('✨ *Buscando waifus aleatórias...*');
			try {
				const res = await axios.get('https://nekos.best/api/v2/waifu?amount=5');
				const results = res.data.results;
				for (let item of results) {
					await conn.sendMessage(from, { image: { url: item.url }, caption: `✨ *Waifu:* ${item.artist_name || 'Desconhecido'}` }, { quoted: selo });
					await sleep(1000);
				}
			} catch (e) {
				reply('❌ Erro ao buscar waifus.');
			}
		}
		break;

		case 'pinterest': {
			if (!q) return reply(`💡 *Exemplo:* ${prefix}pinterest anime`);
			reply('📌 *Buscando no Pinterest...*');
			try {
				const res = await fetchJson(`https://api.shizuku.site/pinterest?query=${encodeURIComponent(q)}&key=${SHIZUKU_KEY}`);
				if (!res.status) return reply('❌ Nenhuma imagem encontrada.');
				const img = res.result[Math.floor(Math.random() * res.result.length)];
				await conn.sendMessage(from, { image: { url: img }, caption: `📌 *Resultado para:* ${q}` }, { quoted: selo });
			} catch (e) {
				reply('❌ Erro ao buscar no Pinterest.');
			}
		}
		break;

		case 'atropelar': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			let alvo = menc_jid;
			if (!alvo || alvo === sender) return reply('🏎️ Marque alguém para atropelar!');
			let frases = [
				`🏎️ @${sender.split('@')[0]} passou por cima de @${alvo.split('@')[0]}! *VRUM VRUM!* 💨`,
				`🏎️ @${sender.split('@')[0]} atropelou @${alvo.split('@')[0]} sem freio! 💥💨`,
				`🏎️ @${sender.split('@')[0]} veio a milhão e derrubou @${alvo.split('@')[0]}! 🏁💥`
			];
			let frase = frases[Math.floor(Math.random() * frases.length)];
			await conn.sendMessage(from, { video: { url: 'https://files.catbox.moe/wljomm.mp4' }, caption: frase, gifPlayback: true, mentions: [sender, alvo] }, { quoted: selo });
		}
		break;

		case 'afogar': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			let alvo = menc_jid;
			if (!alvo || alvo === sender) return reply('🫧 Marque alguém para afogar!');
			let frases = [
				`🫧 @${sender.split('@')[0]} está afogando @${alvo.split('@')[0]}! *GLUB GLUB!* 🫧`,
				`🌊 @${sender.split('@')[0]} empurrou @${alvo.split('@')[0]} no mar 😈`,
				`💦 @${alvo.split('@')[0]} foi puxado pro fundo por @${sender.split('@')[0]} 🫧`
			];
			let frase = frases[Math.floor(Math.random() * frases.length)];
			await conn.sendMessage(from, { video: { url: 'https://files.catbox.moe/t8ziql.mp4' }, caption: frase, gifPlayback: true, mentions: [sender, alvo] }, { quoted: selo });
		}
		break;

			case 'beijar':
			case 'kiss': {
				if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
				let alvo = menc_jid;
				if (!alvo || alvo === sender) return reply('💜 Marque alguém para dar um beijo!');
				let frases = [
					`💜 @${sender.split('@')[0]} deu um beijo apaixonado em @${alvo.split('@')[0]}! ✨`,
					`💜 @${sender.split('@')[0]} beijou @${alvo.split('@')[0]}! Que fofos! 🥰`,
					`💜 @${sender.split('@')[0]} roubou um beijo de @${alvo.split('@')[0]}! 😈✨`
				];
				let frase = frases[Math.floor(Math.random() * frases.length)];
				await conn.sendMessage(from, { video: { url: 'https://files.catbox.moe/p9p48i.mp4' }, caption: frase, gifPlayback: true, mentions: [sender, alvo] }, { quoted: selo });
			}
			break;

			case 's':
			case 'sticker':
			case 'figurinha': {
				if (!isImage && !isQuotedImage && !isVideo && !isQuotedVideo) return reply(`💡 Envie uma imagem ou vídeo com a legenda *${prefix}sticker*`);
				reply('⏳ *Criando sua figurinha...*');
				try {
					const mediaData = isQuotedImage ? info.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : 
									isQuotedVideo ? info.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage :
									isImage ? info.message.imageMessage : info.message.videoMessage;
					const buffer = await getFileBuffer(mediaData, isImage || isQuotedImage ? 'image' : 'video');
					if (isImage || isQuotedImage) {
						await sendImageAsSticker2(conn, from, buffer, info, { packname: NomeBot, author: NickDono });
					} else {
						await sendVideoAsSticker2(conn, from, buffer, info, { packname: NomeBot, author: NickDono });
					}
				} catch (e) {
					reply('❌ Erro ao criar figurinha.');
				}
			}
			break;

			case 'toimg': {
				if (!isQuotedSticker) return reply('❌ Responda a uma figurinha (não animada).');
				reply('⏳ *Convertendo para imagem...*');
				try {
					const buffer = await getFileBuffer(info.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage, 'sticker');
					await conn.sendMessage(from, { image: buffer, caption: '✅ *Convertido com sucesso!*' }, { quoted: info });
				} catch (e) {
					reply('❌ Erro na conversão.');
				}
			}
			break;

			case 'kick':
			case 'ban': {
				if (!isGroup) return reply('❌ Comando para grupos.');
				if (!isGroupAdmins) return reply(msg.SoAdm);
				if (!isBotGroupAdmins) return reply(msg.BotAdmin);
				let alvo = menc_jid;
				if (!alvo) return reply('❌ Marque quem deseja remover.');
				await conn.groupParticipantsUpdate(from, [alvo], 'remove');
				reply(`✅ @${alvo.split('@')[0]} foi removido com sucesso.`, {mentions: [alvo]});
			}
			break;

			case 'antilink': {
				if (!isGroup) return reply('❌ Comando para grupos.');
				if (!isGroupAdmins) return reply(msg.SoAdm);
				if (q === '1' || q === 'on') {
					dataGp[0].antilinkhard = true;
					setGp(dataGp);
					reply('🛡️ *Anti-Link ativado!*');
				} else if (q === '0' || q === 'off') {
					dataGp[0].antilinkhard = false;
					setGp(dataGp);
					reply('❌ *Anti-Link desativado!*');
				} else {
					reply(`💡 *Uso:* ${prefix}antilink on/off`);
				}
			}
			break;



				case 'reiniciar': {
					if (!So_Dono) return reply(msg.SoDono);
					await reply('🔄 *Reiniciando o sistema Black Lotus... Aguarde.*');
					process.exit();
				}
				break;

				case 'rankjob': {
					if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
					let sort = MembrosGP.map(v => v.id);
					let p1 = sort[Math.floor(Math.random() * sort.length)];
					let p2 = sort[Math.floor(Math.random() * sort.length)];
					let p3 = sort[Math.floor(Math.random() * sort.length)];
					let txt = `🏆 *RANKING DOS TRABALHADORES* 🏆\n\n🥇 1º: @${p1.split('@')[0]}\n🥈 2º: @${p2.split('@')[0]}\n🥉 3º: @${p3.split('@')[0]}\n\n🌑 *Black Lotus System*`;
					await conn.sendMessage(from, { text: txt, mentions: [p1, p2, p3] }, { quoted: selo });
				}
				break;

		case 'rankjob': {
			if (!isGroup) return reply('❌ Esse comando só funciona em grupo.');
			let membros = MembrosGP.sort(() => Math.random() - 0.5).slice(0, 5);
			let emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
			let texto = `*💸 RANK JOB BLACK LOTUS 💸*\n\n`;
			membros.forEach((m, i) => {
				let porc = Math.floor(Math.random() * 25) + (70 - i * 3);
				texto += `${emojis[i]} @${m.id.split('@')[0]} — *${porc}%*\n`;
			});
			texto += `\n_O faturamento desses 5 tá alto hoje!_ 🌑`;
			await conn.sendMessage(from, { image: { url: 'https://files.catbox.moe/cs8kgs.jpg' }, caption: texto, mentions: membros.map(v => v.id) }, { quoted: selo });
		}
		break;

		case 'piada': {
			const piadas = [
				"Por que o desenvolvedor faliu? Porque ele não tinha 'classe'.",
				"O que o Java disse para o C? Você não tem cultura!",
				"Por que o programador se afogou? Porque ele não sabia 'nadar' (node).",
				"Quantos programadores são necessários para trocar uma lâmpada? Nenhum, é problema de hardware."
			];
			reply(`🃏 *PIADA BLACK LOTUS*\n\n${piadas[Math.floor(Math.random() * piadas.length)]}`);
		}
		break;

		case 'biblia': {
			const versiculos = [
				"João 3:16 - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...",
				"Salmos 23:1 - O Senhor é o meu pastor, nada me faltará.",
				"Filipenses 4:13 - Tudo posso naquele que me fortalece.",
				"Josué 1:9 - Não fui eu que ordenei a você? Seja forte e corajoso!"
			];
			reply(`📖 *VERSÍCULO DO DIA*\n\n${versiculos[Math.floor(Math.random() * versiculos.length)]}`);
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
				await conn.sendMessage(from, { image: FotoMenu, caption: menu(prefix, sender, NickDono, NomeBot, date, _hora, NumberDono, version), mentions: [sender] }, { quoted: selo });
				break;

			case 'menuadm':
			case 'menugrupo':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuadm(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menudown':
			case 'menudownload':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuDown(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menufig':
			case 'menusticker':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuStickers(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menudono':
			case 'menuowner':
				if (!So_Dono) return reply(msg.SoDono);
				await conn.sendMessage(from, { image: FotoMenu, caption: menuDono(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menu18':
			case 'menusecret':
				await conn.sendMessage(from, { image: FotoMenu, caption: menu18(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menudiversao':
			case 'menubrincadeira':
				await conn.sendMessage(from, { image: FotoMenu, caption: menudiversao(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menuia':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuia(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menudiversao':
			case 'menubrincadeira':
				await conn.sendMessage(from, { image: FotoMenu, caption: menudiversao(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menudown':
			case 'menudownload':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuDown(prefix, sender), mentions: [sender] }, { quoted: selo });
				break;

			case 'menufig':
			case 'menusticker':
				await conn.sendMessage(from, { image: FotoMenu, caption: menuStickers(prefix, sender), mentions: [sender] }, { quoted: selo });
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
				reply("🔄 *Reiniciando sistemas Black Lotus...*");
				await sleep(2000);
				process.exit();
				break;

			case 'multidownload':
			case 'download':
			case 'dl': {
			    try {
			        if (!q) return reply(`⚠️ *EXEMPLO DE USO: ${prefix + command} [link]*`);
			        await reagir(from, '✅');
			        const axios = require('axios');
			        const { data } = await axios.get(`https://backend1.tioo.eu.org/api/downloader/aio?url=${encodeURIComponent(q)}`);
			        
			        if (!data || data.status !== 'ok') {
			            return reply(`❌ *Não foi possível obter o conteúdo.*`);
			        }
			        
			        const result = data.data;
			        const title = result?.title || 'Sem título';
			        const thumb = result?.thumbnail;
			        
			        if (result?.links?.video) {
			            const videoData = Object.values(result.links.video)[0];
			            if (videoData?.url) {
			                await conn.sendMessage(from, {
			                    video: { url: videoData.url },
			                    jpegThumbnail: thumb ? await getBuffer(thumb) : null,
			                    caption: `✅ *MULTIDOWNLOAD*\n\n📄 *Título:* ${title}\n🎬 *Tipo:* Vídeo`
			                }, { quoted: info });
			                return;
			            }
			        }
			        return reply(`❌ *Nenhuma mídia de vídeo encontrada.*`);
			    } catch (err) {
			        console.log(err.response?.data || err);
			        reply(`❌ *Erro ao baixar o conteúdo.*`);
			    }
			}
			break;

			case 'multidownload2': {
			    try {
			        if (!q) return reply(`⚠️ *EXEMPLO DE USO: ${prefix + command} [link]*`);
			        await reagir(from, '⏳');
			        const axios = require('axios');
			        const { data } = await axios.get(`https://devlabapi.freesrv.com/api/multidownload?url=${encodeURIComponent(q)}&apitoken=povo`);
			        if (!data || data.Status !== true || !data.Link) {
			            await reagir(from, '❌');
			            return reply('❌ Nenhuma mídia de vídeo encontrada.');
			        }
			        const legenda = `👤 *Autor:* ${data.Autor || 'Desconhecido'}\n✅ *Download via DevLab*`;
			        await conn.sendMessage(from, { video: { url: data.Link }, caption: legenda }, { quoted: info });
			        await reagir(from, '👍');
			    } catch (err) {
			        await reagir(from, '❌');
			        reply('❌ *Erro ao baixar o conteúdo.*');
			    }
			}
			break;

			case 'gpt5':
			case 'ia5':
			case 'chatgpt5': {
			    try {
			        if (!q) return reply(`❌ *Escreva sua pergunta*`);
			        await reagir(from, '⏳');
			        const axios = require('axios');
			        const { data } = await axios.get(`https://devlabapi.freesrv.com/api/gpt?q=${encodeURIComponent(q)}&apitoken=povo`);
			        if (!data?.status) return reply('❌ *Não foi possível obter resposta da IA no momento.*');
			        await reply(`🧠 *GPT-5 (DevLab)*\n\n${data.result}`);
			        await reagir(from, '✅');
			    } catch (e) {
			        await reagir(from, '❌');
			        reply(`❌ *Erro inesperado na IA.*`);
			    }
			}
			break;

			case 'addai': {
			    try {
			        if (!So_Dono) return reply(msg.SoDono);
			        if (!isGroup) return reply('❌ Apenas em grupos.');
			        if (!IsBotAdmin) return reply('❌ O bot precisa ser admin.');
			        await conn.groupParticipantsUpdate(from, ['867051314767696@bot'], 'add');
			        reply('✅ Meta AI foi adicionada ao grupo com sucesso.');
			    } catch (e) {
			        reply('❌ Não foi possível adicionar a Meta AI.');
			    }
			}
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


