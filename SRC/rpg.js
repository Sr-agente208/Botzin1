// ╔══════════════════════════════════════════════╗
// ║   🎲 SISTEMA RPG — BLACK LOTUS SESSÕES       ║
// ║   Mesas de RPG em Grupo & IA Mestre          ║
// ╚══════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');

const RPG_PATH = './SRC/rpg';
const CHARS_PATH = `${RPG_PATH}/personagens.json`;
const SESSIONS_PATH = `${RPG_PATH}/sessoes.json`;

function initRPG() {
  if (!fs.existsSync(RPG_PATH)) fs.mkdirSync(RPG_PATH, { recursive: true });
  if (!fs.existsSync(CHARS_PATH)) fs.writeFileSync(CHARS_PATH, JSON.stringify({}));
  if (!fs.existsSync(SESSIONS_PATH)) fs.writeFileSync(SESSIONS_PATH, JSON.stringify({}));
}

function loadData(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return {}; }
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function rolarDado(lados = 20) {
  return Math.floor(Math.random() * lados) + 1;
}

// 🧙 CLASSES
const CLASSES = {
  combatente: { nome: 'Combatente ⚔️', hp_base: 20, san_base: 12, pe_base: 2, atributos: { forca: 3, agilidade: 2, vigor: 3, intelecto: 1, presenca: 1 } },
  especialista: { nome: 'Especialista 🔍', hp_base: 16, san_base: 16, pe_base: 3, atributos: { forca: 1, agilidade: 3, vigor: 2, intelecto: 3, presenca: 2 } },
  ocultista: { nome: 'Ocultista 🔮', hp_base: 12, san_base: 20, pe_base: 4, atributos: { forca: 1, agilidade: 1, vigor: 2, intelecto: 3, presenca: 3 } },
  mago: { nome: 'Mago Arcano 🧙', hp_base: 10, san_base: 18, pe_base: 5, atributos: { forca: 1, agilidade: 2, vigor: 1, intelecto: 4, presenca: 2 } }
};

async function BlackLotusMestre(prompt) {
    const fullPrompt = `Você é o Mestre de RPG do Black Lotus Bot. Narre uma sessão de RPG. Contexto: ${prompt}`;
    try {
        const fetch = require('node-fetch');
        const res = await fetch(`https://shizuku-apis.shop/api/ias/gpt-2?query=${encodeURIComponent(fullPrompt)}&apitoken=key-free`);
        const api = await res.json();
        return api?.resposta || "As sombras observam em silêncio...";
    } catch { return "O mestre perdeu a conexão com o Outro Lado..."; }
}

async function handleRPG(sock, from, info, command, args, sender, pushname, isGroup, prefix, SHIZUKU_SITE, SHIZUKU_KEY) {
  initRPG();
  const enviar = (texto) => sock.sendMessage(from, { text: texto }, { quoted: info });
  const reagir = (emoji) => sock.sendMessage(from, { react: { text: emoji, key: info.key } });

  const personagens = loadData(CHARS_PATH);
  const sessoes = loadData(SESSIONS_PATH);

  switch (command) {
    case 'rpg':
    case 'rpgajuda': {
      return enviar(`
╔══════════════════════════════╗
║  🌑 BLACK LOTUS: SESSÕES RPG ║
╚══════════════════════════════╝

*👤 PERSONAGEM*
▸ ${prefix}criarchar [classe] [nome]
▸ ${prefix}meuchar | ${prefix}deletarchar

*🌐 SESSÃO DE GRUPO*
▸ ${prefix}criarsessao [tema] (Inicia mesa)
▸ ${prefix}entrar (Entra na mesa atual)
▸ ${prefix}narrar [ação] (IA narra a cena)
▸ ${prefix}fecharsessao (Finaliza a mesa)

*⚔️ COMBATE & IA*
▸ ${prefix}batalha (Inicia combate na mesa)
▸ ${prefix}atacar (Ataca o monstro da mesa)

*Classes:* combatente, especialista, ocultista, mago`);
    }

    case 'criarchar': {
      if (personagens[sender]) return enviar(`❌ Você já possui uma ficha.`);
      const classeKey = args[0]?.toLowerCase();
      const nome = args.slice(1).join(' ') || pushname;
      if (!CLASSES[classeKey]) return enviar(`❌ Escolha: combatente, especialista, ocultista ou mago.`);
      const c = CLASSES[classeKey];
      personagens[sender] = {
        nome, classe: classeKey, nex: 5, xp: 0, hp: c.hp_base, hp_max: c.hp_base,
        san: c.san_base, san_max: c.san_base, pe: c.pe_base, pe_max: c.pe_base,
        atributos: { ...c.atributos }, vitorias: 0, derrotas: 0
      };
      saveData(CHARS_PATH, personagens);
      await reagir("📜");
      return enviar(`📜 *Ficha de ${nome} criada!* NEX: 5%`);
    }

    case 'meuchar': {
      const p = personagens[sender];
      if (!p) return enviar(`❌ Crie sua ficha com ${prefix}criarchar`);
      return enviar(`👤 *${p.nome.toUpperCase()}* (${CLASSES[p.classe].nome})\n⭐ NEX: ${p.nex}% | PV: ${p.hp}/${p.hp_max}\n🧠 SAN: ${p.san}/${p.san_max}\n⚡ PE: ${p.pe}/${p.pe_max}`);
    }

    case 'criarsessao': {
      if (!isGroup) return enviar("❌ Apenas em grupos!");
      if (sessoes[from]) return enviar("❌ Já existe uma sessão ativa neste grupo!");
      const tema = args.join(' ') || "Investigação Paranormal";
      sessoes[from] = {
        mestre: sender, tema, jogadores: [sender], status: 'ativa',
        historia: [`Sessão iniciada com o tema: ${tema}`], monstro: null
      };
      saveData(SESSIONS_PATH, sessoes);
      await reagir("🌑");
	      const intro = await BlackLotusMestre(`Inicie uma sessão de RPG para um grupo de jogadores. O tema é: ${tema}. Descreva o cenário inicial onde os jogadores se encontram.`);
      return enviar(`🌑 *SESSÃO INICIADA: ${tema.toUpperCase()}*\n\n🔮 *MESTRE:* ${intro}\n\n_Jogadores podem entrar com ${prefix}entrar_`);
    }

    case 'entrar': {
      if (!sessoes[from]) return enviar("❌ Nenhuma sessão ativa.");
      if (!personagens[sender]) return enviar(`❌ Crie sua ficha primeiro com ${prefix}criarchar`);
      if (sessoes[from].jogadores.includes(sender)) return enviar("❌ Você já está na sessão.");
      sessoes[from].jogadores.push(sender);
      saveData(SESSIONS_PATH, sessoes);
      await reagir("✅");
      return enviar(`✅ *${personagens[sender].nome}* entrou na sessão!`);
    }

    case 'narrar': {
      if (!sessoes[from]) return enviar("❌ Nenhuma sessão ativa.");
      const acao = args.join(' ');
      if (!acao) return enviar(`Ex: ${prefix}narrar Eu entro na casa abandonada.`);
      await reagir("✍️");
      const p = personagens[sender] || { nome: pushname };
	      const contexto = `O jogador ${p.nome} realizou a seguinte ação: "${acao}". Continue a história considerando os outros jogadores na mesa.`;
	      const resposta = await BlackLotusMestre(contexto);
      sessoes[from].historia.push(`Ação: ${acao} | Mestre: ${resposta}`);
      saveData(SESSIONS_PATH, sessoes);
      return enviar(`📖 *HISTÓRIA:*\n\n${resposta}`);
    }

    case 'batalha': {
      if (!sessoes[from]) return enviar("❌ Nenhuma sessão ativa.");
      const monstros = [
        { nome: 'Zumbi de Sangue 🩸', hp: 100, atk: 10 },
        { nome: 'Vulto do Medo 🌑', hp: 150, atk: 15 },
        { nome: 'Dragão Abissal 🐉', hp: 300, atk: 25 }
      ];
      const m = monstros[Math.floor(Math.random() * monstros.length)];
      sessoes[from].monstro = { ...m, hp_atual: m.hp };
      saveData(SESSIONS_PATH, sessoes);
      await reagir("⚔️");
	      const desc = await BlackLotusMestre(`Um ${m.nome} aparece para atacar o grupo! Descreva a ameaça.`);
      return enviar(`⚔️ *COMBATE DE GRUPO*\n\n${desc}\n\n❤️ HP Inimigo: ${m.hp}\n\n_Todos os jogadores na sessão podem ${prefix}atacar!_`);
    }

    case 'atacar': {
      if (!sessoes[from] || !sessoes[from].monstro) return enviar("❌ Nenhum combate ativo.");
      if (!sessoes[from].jogadores.includes(sender)) return enviar("❌ Você não está nesta sessão.");
      
      const p = personagens[sender];
      const m = sessoes[from].monstro;
      const dano = rolarDado(10) + (p?.atributos?.forca || 2);
      m.hp_atual -= dano;
      
      let msg = `⚔️ *${p?.nome || pushname}* atacou o ${m.nome} e causou *${dano}* de dano!`;
      
      if (m.hp_atual <= 0) {
        msg += `\n\n🏆 *VITÓRIA!* O grupo derrotou o inimigo!`;
        sessoes[from].monstro = null;
      } else {
        msg += `\n❤️ HP restante: ${m.hp_atual}`;
      }
      
      saveData(SESSIONS_PATH, sessoes);
      return enviar(msg);
    }

    case 'fecharsessao': {
      if (!sessoes[from]) return enviar("❌ Nenhuma sessão ativa.");
      if (sessoes[from].mestre !== sender) return enviar("❌ Apenas o mestre pode fechar a sessão.");
      delete sessoes[from];
      saveData(SESSIONS_PATH, sessoes);
      return enviar("🏁 *Sessão finalizada.* Até a próxima aventura!");
    }
    
    case 'deletarchar': {
        delete personagens[sender];
        saveData(CHARS_PATH, personagens);
        return enviar(`🗑️ Ficha apagada.`);
    }
  }
}

module.exports = { handleRPG, CLASSES };
