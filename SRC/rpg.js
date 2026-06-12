// ╔══════════════════════════════════════════════╗
// ║   🎲 SISTEMA RPG — BLACK LOTUS ORDEM/D&D     ║
// ║   Inspirado em Ordem Paranormal & D&D 5e     ║
// ╚══════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');

const RPG_PATH = './SRC/rpg';
const CHARS_PATH = `${RPG_PATH}/personagens.json`;

function initRPG() {
  if (!fs.existsSync(RPG_PATH)) fs.mkdirSync(RPG_PATH, { recursive: true });
  if (!fs.existsSync(CHARS_PATH)) fs.writeFileSync(CHARS_PATH, JSON.stringify({}));
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

function modificador(valor) {
  return Math.floor((valor - 10) / 2);
}

// 🧙 CLASSES / TRILHAS
const CLASSES = {
  combatente: {
    nome: 'Combatente ⚔️',
    emoji: '⚔️',
    hp_base: 20,
    san_base: 12,
    pe_base: 2,
    atributos: { forca: 3, agilidade: 2, vigor: 3, intelecto: 1, presenca: 1 },
    habilidades: ['Ataque Especial', 'Durão'],
    origem: 'D&D / Ordem'
  },
  especialista: {
    nome: 'Especialista 🔍',
    emoji: '🔍',
    hp_base: 16,
    san_base: 16,
    pe_base: 3,
    atributos: { forca: 1, agilidade: 3, vigor: 2, intelecto: 3, presenca: 2 },
    habilidades: ['Perito', 'Eclético'],
    origem: 'Ordem'
  },
  ocultista: {
    nome: 'Ocultista 🔮',
    emoji: '🔮',
    hp_base: 12,
    san_base: 20,
    pe_base: 4,
    atributos: { forca: 1, agilidade: 1, vigor: 2, intelecto: 3, presenca: 3 },
    habilidades: ['Ritual Arcano', 'Escolhido pelo Outro Lado'],
    origem: 'Ordem'
  },
  mago: {
    nome: 'Mago Arcano 🧙',
    emoji: '🧙',
    hp_base: 10,
    san_base: 18,
    pe_base: 5,
    atributos: { forca: 1, agilidade: 2, vigor: 1, intelecto: 4, presenca: 2 },
    habilidades: ['Bola de Fogo', 'Míssil Mágico'],
    origem: 'D&D'
  }
};

// 👹 MONSTROS PARANORMAIS / D&D
const MONSTROS = [
  { nome: 'Zumbi de Sangue 🩸', hp: 30, atk: 5, san_loss: 2, xp: 50, nex: 5 },
  { nome: 'Esqueleto Guerreiro 💀', hp: 25, atk: 6, san_loss: 1, xp: 40, nex: 5 },
  { nome: 'Vulto Sombrio 🌑', hp: 45, atk: 8, san_loss: 5, xp: 120, nex: 15 },
  { nome: 'Dragão Jovem 🐉', hp: 120, atk: 15, san_loss: 10, xp: 500, nex: 50 },
  { nome: 'Existido 🌀', hp: 60, atk: 10, san_loss: 8, xp: 200, nex: 30 }
];

async function BlackLotusMestre(prompt, SHIZUKU_SITE, SHIZUKU_KEY) {
    const fullPrompt = `Você é o Mestre de RPG do Black Lotus Bot. Sua narração é sombria, imersiva e detalhada, no estilo Ordem Paranormal e D&D. Narre de forma curta e épica. Contexto: ${prompt}`;
    try {
        const fetch = require('node-fetch');
        const res = await fetch(`${SHIZUKU_SITE}/api/ias/gpt-2?query=${encodeURIComponent(fullPrompt)}&apitoken=${SHIZUKU_KEY}`);
        const api = await res.json();
        return api?.resposta || "O destino é incerto nas sombras...";
    } catch { return "O mestre está em silêncio..."; }
}

async function handleRPG(sock, from, info, command, args, sender, pushname, isGroup, prefix, SHIZUKU_SITE, SHIZUKU_KEY) {
  initRPG();
  const enviar = (texto) => sock.sendMessage(from, { text: texto }, { quoted: info });
  const reagir = (emoji) => sock.sendMessage(from, { react: { text: emoji, key: info.key } });

  switch (command) {
    case 'rpg':
    case 'rpgajuda': {
      return enviar(`
╔══════════════════════════════╗
║  🌑 BLACK LOTUS: ORDEM & D&D ║
╚══════════════════════════════╝

*🧙 PERSONAGEM*
▸ ${prefix}criarchar [classe] [nome]
▸ ${prefix}meuchar (Status, NEX, Sanidade)
▸ ${prefix}deletarchar

*⚔️ MISSÕES & IA*
▸ ${prefix}aventura (Inicia narração com IA)
▸ ${prefix}batalha (Combate Paranormal)
▸ ${prefix}atacar / ${prefix}ritual / ${prefix}fugir

*📊 STATUS*
❤️ PV (Vida) | 🧠 SAN (Sanidade)
⚡ PE (Esforço) | ⭐ NEX (Nível)

*Classes:* combatente, especialista, ocultista, mago`);
    }

    case 'criarchar': {
      const personagens = loadData(CHARS_PATH);
      if (personagens[sender]) return enviar(`❌ Você já possui uma ficha ativa.`);
      const classeKey = args[0]?.toLowerCase();
      const nome = args.slice(1).join(' ') || pushname;
      if (!CLASSES[classeKey]) return enviar(`❌ Escolha: combatente, especialista, ocultista ou mago.`);

      const c = CLASSES[classeKey];
      personagens[sender] = {
        nome, classe: classeKey, nex: 5, xp: 0,
        hp: c.hp_base, hp_max: c.hp_base,
        san: c.san_base, san_max: c.san_base,
        pe: c.pe_base, pe_max: c.pe_base,
        atributos: { ...c.atributos },
        vitorias: 0, derrotas: 0, em_batalha: false
      };
      saveData(CHARS_PATH, personagens);
      await reagir("📜");
      return enviar(`📜 *Ficha de ${nome} criada com sucesso!*
Classe: ${c.nome}
NEX: 5% (Iniciante)
PV: ${c.hp_base} | SAN: ${c.san_base} | PE: ${c.pe_base}`);
    }

    case 'meuchar': {
      const personagens = loadData(CHARS_PATH);
      const p = personagens[sender];
      if (!p) return enviar(`❌ Crie sua ficha com ${prefix}criarchar`);
      
      const barraVida = '❤️' + '█'.repeat(Math.floor((p.hp/p.hp_max)*5)) + '░'.repeat(5-Math.floor((p.hp/p.hp_max)*5));
      const barraSan = '🧠' + '█'.repeat(Math.floor((p.san/p.san_max)*5)) + '░'.repeat(5-Math.floor((p.san/p.san_max)*5));

      return enviar(`
👤 *${p.nome.toUpperCase()}* — ${CLASSES[p.classe].nome}
⭐ *NEX:* ${p.nex}% | XP: ${p.xp}

${barraVida} ${p.hp}/${p.hp_max}
${barraSan} ${p.san}/${p.san_max}
⚡ PE: ${p.pe}/${p.pe_max}

📊 *ATRIBUTOS:*
FOR: ${p.atributos.forca} | AGI: ${p.atributos.agilidade} | VIG: ${p.atributos.vigor}
INT: ${p.atributos.intelecto} | PRE: ${p.atributos.presenca}

🏆 Vitórias: ${p.vitorias} | 💀 Derrotas: ${p.derrotas}`);
    }

    case 'aventura': {
        const personagens = loadData(CHARS_PATH);
        const p = personagens[sender];
        if (!p) return enviar(`❌ Crie sua ficha primeiro.`);
        
        await reagir("🔮");
        const narra = await BlackLotusMestre(`O agente/herói ${p.nome} (${CLASSES[p.classe].nome}) está explorando um local amaldiçoado. O que ele encontra?`, SHIZUKU_SITE, SHIZUKU_KEY);
        return enviar(`🔮 *NARRAÇÃO DO MESTRE:*\n\n${narra}\n\n_Use ${prefix}batalha para enfrentar o perigo._`);
    }

    case 'batalha': {
      const personagens = loadData(CHARS_PATH);
      const p = personagens[sender];
      if (!p) return enviar(`❌ Crie sua ficha primeiro.`);
      if (p.hp <= 0) return enviar(`💀 Você está inconsciente.`);

      const m = MONSTROS[Math.floor(Math.random() * MONSTROS.length)];
      p.em_batalha = true;
      p.batalha_atual = { ...m, hp_atual: m.hp };
      saveData(CHARS_PATH, personagens);

      await reagir("⚔️");
      const intro = await BlackLotusMestre(`Um ${m.nome} surge das sombras para atacar ${p.nome}! Descreva a aparição da criatura.`, SHIZUKU_SITE, SHIZUKU_KEY);
      return enviar(`⚔️ *ENCONTRO PARANORMAL*\n\n${intro}\n\n❤️ HP Inimigo: ${m.hp}\n\n_Comandos: ${prefix}atacar, ${prefix}ritual, ${prefix}fugir_`);
    }

    case 'atacar': {
      const personagens = loadData(CHARS_PATH);
      const p = personagens[sender];
      if (!p || !p.em_batalha) return enviar(`❌ Você não está em combate.`);

      const b = p.batalha_atual;
      const d20 = rolarDado(20);
      const danoJ = rolarDado(8) + p.atributos.forca;
      const danoM = Math.max(0, rolarDado(b.atk) - p.atributos.vigor);

      b.hp_atual -= danoJ;
      p.hp -= danoM;
      p.san -= b.san_loss;

      let res = `🎲 *D20:* ${d20}\n⚔️ Você causou *${danoJ}* de dano!\n👹 O inimigo revidou com *${danoM}* de dano!\n🧠 Perda de Sanidade: -${b.san_loss}`;

      if (b.hp_atual <= 0) {
        p.em_batalha = false;
        p.xp += b.xp;
        p.nex += Math.floor(b.nex / 5);
        p.vitorias++;
        res += `\n\n🏆 *VITÓRIA!* Você derrotou o ${b.nome}!\n📈 +${b.xp} XP | ⭐ NEX: ${p.nex}%`;
      } else if (p.hp <= 0 || p.san <= 0) {
        p.em_batalha = false;
        p.derrotas++;
        res += `\n\n💀 *DERROTA!* Você sucumbiu ao medo ou aos ferimentos.`;
      }

      saveData(CHARS_PATH, personagens);
      return enviar(res);
    }
    
    case 'deletarchar': {
        const personagens = loadData(CHARS_PATH);
        delete personagens[sender];
        saveData(CHARS_PATH, personagens);
        return enviar(`🗑️ Ficha apagada.`);
    }
  }
}

module.exports = { handleRPG, CLASSES };
