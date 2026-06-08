// ╔══════════════════════════════════════════════╗
// ║   🎲 SISTEMA RPG — BLACK LOTUS BOT 🎲        ║
// ║   Estilo Ordem Paranormal / D&D              ║
// ╚══════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');

const RPG_PATH = './SRC/rpg';
const CHARS_PATH = `${RPG_PATH}/personagens.json`;
const SALAS_PATH = `${RPG_PATH}/salas.json`;
const CAMPANHAS_PATH = `${RPG_PATH}/campanhas.json`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗂️ INICIALIZAÇÃO DOS ARQUIVOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initRPG() {
  if (!fs.existsSync(RPG_PATH)) fs.mkdirSync(RPG_PATH, { recursive: true });
  if (!fs.existsSync(CHARS_PATH)) fs.writeFileSync(CHARS_PATH, JSON.stringify({}));
  if (!fs.existsSync(SALAS_PATH)) fs.writeFileSync(SALAS_PATH, JSON.stringify({}));
  if (!fs.existsSync(CAMPANHAS_PATH)) fs.writeFileSync(CAMPANHAS_PATH, JSON.stringify({}));
}

function loadData(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return {}; }
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎲 FUNÇÕES DE DADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function rolarDado(lados = 20) {
  return Math.floor(Math.random() * lados) + 1;
}

function rolarMultiplos(qtd, lados) {
  let resultados = [];
  for (let i = 0; i < qtd; i++) resultados.push(rolarDado(lados));
  return resultados;
}

function modificador(valor) {
  return Math.floor((valor - 10) / 2);
}

function formatarMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧙 CLASSES DISPONÍVEIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CLASSES = {
  guerreiro: {
    nome: 'Guerreiro ⚔️',
    emoji: '⚔️',
    hp_base: 30,
    dado_vida: 10,
    atributos: { forca: 16, destreza: 12, constituicao: 14, inteligencia: 10, sabedoria: 10, carisma: 10 },
    habilidades: ['Ataque Poderoso', 'Defesa Férrea', 'Investida'],
    descricao: 'Mestre do combate corpo-a-corpo'
  },
  mago: {
    nome: 'Mago 🧙',
    emoji: '🧙',
    hp_base: 18,
    dado_vida: 6,
    atributos: { forca: 8, destreza: 12, constituicao: 12, inteligencia: 18, sabedoria: 14, carisma: 12 },
    habilidades: ['Bola de Fogo', 'Raio Arcano', 'Escudo Mágico'],
    descricao: 'Wielder de magias poderosas'
  },
  ladino: {
    nome: 'Ladino 🗡️',
    emoji: '🗡️',
    hp_base: 22,
    dado_vida: 8,
    atributos: { forca: 10, destreza: 18, constituicao: 12, inteligencia: 14, sabedoria: 12, carisma: 14 },
    habilidades: ['Ataque Furtivo', 'Evasão', 'Golpe Baixo'],
    descricao: 'Especialista em furtividade e golpes precisos'
  },
  clerigo: {
    nome: 'Clérigo ✨',
    emoji: '✨',
    hp_base: 24,
    dado_vida: 8,
    atributos: { forca: 12, destreza: 10, constituicao: 14, inteligencia: 12, sabedoria: 18, carisma: 14 },
    habilidades: ['Curar Ferimentos', 'Luz Divina', 'Benção'],
    descricao: 'Canal da vontade divina'
  },
  cacador: {
    nome: 'Caçador 🏹',
    emoji: '🏹',
    hp_base: 24,
    dado_vida: 8,
    atributos: { forca: 12, destreza: 16, constituicao: 14, inteligencia: 12, sabedoria: 16, carisma: 10 },
    habilidades: ['Tiro Certeiro', 'Rastreamento', 'Armadilha'],
    descricao: 'Mestre do rastreamento e da sobrevivência'
  },
  paranormal: {
    nome: 'Agente Paranormal 👁️',
    emoji: '👁️',
    hp_base: 20,
    dado_vida: 8,
    atributos: { forca: 10, destreza: 14, constituicao: 12, inteligencia: 16, sabedoria: 18, carisma: 14 },
    habilidades: ['Visão Além', 'Proteção Psíquica', 'Ritual de Contenção'],
    descricao: 'Investigador do sobrenatural — estilo Ordem Paranormal'
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👹 MONSTROS / INIMIGOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MONSTROS = {
  goblin: { nome: 'Goblin 👺', hp: 12, ataque: 4, defesa: 12, xp: 50, ouro: 10 },
  zumbi: { nome: 'Zumbi 🧟', hp: 22, ataque: 5, defesa: 10, xp: 80, ouro: 5 },
  esqueleto: { nome: 'Esqueleto 💀', hp: 18, ataque: 6, defesa: 13, xp: 100, ouro: 15 },
  vampiro: { nome: 'Vampiro 🧛', hp: 45, ataque: 8, defesa: 15, xp: 250, ouro: 80 },
  demonio: { nome: 'Demônio 😈', hp: 60, ataque: 10, defesa: 16, xp: 400, ouro: 120 },
  dragao: { nome: 'Dragão 🐉', hp: 150, ataque: 15, defesa: 18, xp: 1000, ouro: 500 },
  sombra: { nome: 'Sombra Paranormal 🌑', hp: 35, ataque: 9, defesa: 14, xp: 300, ouro: 60 },
  cultista: { nome: 'Cultista das Trevas 🕯️', hp: 28, ataque: 7, defesa: 12, xp: 180, ouro: 40 }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏰 LOCAIS / CENÁRIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LOCAIS = [
  '🏚️ Mansão Abandonada',
  '⛪ Igreja Maldita',
  '🌲 Floresta Sombria',
  '🕳️ Caverna dos Perdidos',
  '🏭 Fábrica Amaldiçoada',
  '🌊 Porto das Almas',
  '🔮 Torre do Mago Louco',
  '🪦 Cemitério Eterno'
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 XP E NÍVEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NIVEIS_XP = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000];

function calcularNivel(xp) {
  for (let i = NIVEIS_XP.length - 1; i >= 0; i--) {
    if (xp >= NIVEIS_XP[i]) return i + 1;
  }
  return 1;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 COMANDOS RPG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function handleRPG(sock, from, info, command, args, sender, pushname, isGroup, prefix) {
  initRPG();
  const enviar = (texto) => sock.sendMessage(from, { text: texto }, { quoted: info });
  const q = args.join(' ');

  switch (command) {

    // ════════════════════════════════════════
    // 📖 CRIAR PERSONAGEM
    // ════════════════════════════════════════
    case 'rpg':
    case 'rpgajuda': {
      const texto = `
╔══════════════════════════════╗
║  🎲 BLACK LOTUS RPG SYSTEM  ║
╚══════════════════════════════╝

*📖 COMANDOS DISPONÍVEIS:*

*🧙 PERSONAGEM*
▸ ${prefix}criarchar [classe] [nome]
▸ ${prefix}meuchar
▸ ${prefix}deletarchar

*⚔️ COMBATE*
▸ ${prefix}batalha [monstro]
▸ ${prefix}atacar
▸ ${prefix}curar
▸ ${prefix}fugir

*🎲 DADOS*
▸ ${prefix}rolar [NdN] — ex: rolar 2d6
▸ ${prefix}dado [lados] — ex: dado 20

*🏆 RANKING*
▸ ${prefix}rpgrank

*📋 CLASSES DISPONÍVEIS:*
⚔️ guerreiro | 🧙 mago | 🗡️ ladino
✨ clerigo | 🏹 cacador | 👁️ paranormal

*Exemplo: ${prefix}criarchar mago Merlin*`;
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // 🧙 CRIAR PERSONAGEM
    // ════════════════════════════════════════
    case 'criarchar': {
      const personagens = loadData(CHARS_PATH);
      if (personagens[sender]) {
        return enviar(`❌ Você já tem um personagem!\nUse *${prefix}meuchar* para ver ou *${prefix}deletarchar* para deletar.`);
      }
      const classeKey = args[0]?.toLowerCase();
      const nomeChar = args.slice(1).join(' ') || pushname;
      if (!classeKey || !CLASSES[classeKey]) {
        return enviar(`❌ Classe inválida!\n\nClasses: *guerreiro, mago, ladino, clerigo, cacador, paranormal*\n\nEx: *${prefix}criarchar mago Merlin*`);
      }
      const classe = CLASSES[classeKey];
      const atb = classe.atributos;
      const char = {
        nome: nomeChar,
        classe: classeKey,
        nivel: 1,
        xp: 0,
        hp: classe.hp_base,
        hp_max: classe.hp_base,
        ouro: 50,
        atributos: { ...atb },
        habilidades: [...classe.habilidades],
        vitorias: 0,
        derrotas: 0,
        em_batalha: false,
        batalha_atual: null
      };
      personagens[sender] = char;
      saveData(CHARS_PATH, personagens);

      const texto = `
╔══════════════════════════════╗
║    ✨ PERSONAGEM CRIADO!     ║
╚══════════════════════════════╝

🎭 *Nome:* ${nomeChar}
${classe.emoji} *Classe:* ${classe.nome}
❤️ *HP:* ${char.hp_max}
⭐ *Nível:* 1
💰 *Ouro:* 50

📊 *ATRIBUTOS:*
💪 Força: ${atb.forca} (${formatarMod(modificador(atb.forca))})
🏃 Destreza: ${atb.destreza} (${formatarMod(modificador(atb.destreza))})
🛡️ Constituição: ${atb.constituicao} (${formatarMod(modificador(atb.constituicao))})
🧠 Inteligência: ${atb.inteligencia} (${formatarMod(modificador(atb.inteligencia))})
👁️ Sabedoria: ${atb.sabedoria} (${formatarMod(modificador(atb.sabedoria))})
✨ Carisma: ${atb.carisma} (${formatarMod(modificador(atb.carisma))})

🗡️ *Habilidades:* ${char.habilidades.join(' • ')}

_Use ${prefix}batalha para começar a aventura!_`;
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // 📋 VER PERSONAGEM
    // ════════════════════════════════════════
    case 'meuchar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Você não tem personagem!\nUse *${prefix}criarchar [classe] [nome]*`);

      const classe = CLASSES[char.classe];
      const nivel = calcularNivel(char.xp);
      const xpProximo = NIVEIS_XP[nivel] || '∞';
      const barraHP = '█'.repeat(Math.floor((char.hp / char.hp_max) * 10)) + '░'.repeat(10 - Math.floor((char.hp / char.hp_max) * 10));

      const texto = `
╔══════════════════════════════╗
║      📋 SEU PERSONAGEM      ║
╚══════════════════════════════╝

🎭 *${char.nome}* — ${classe.emoji} ${classe.nome}
⭐ *Nível ${nivel}* | 📈 XP: ${char.xp}/${xpProximo}
❤️ HP: [${barraHP}] ${char.hp}/${char.hp_max}
💰 *Ouro:* ${char.ouro}

📊 *ATRIBUTOS:*
💪 FOR: ${char.atributos.forca} | 🏃 DES: ${char.atributos.destreza}
🛡️ CON: ${char.atributos.constituicao} | 🧠 INT: ${char.atributos.inteligencia}
👁️ SAB: ${char.atributos.sabedoria} | ✨ CAR: ${char.atributos.carisma}

🗡️ *Habilidades:* ${char.habilidades.join(' • ')}
🏆 *Vitórias:* ${char.vitorias} | 💀 *Derrotas:* ${char.derrotas}`;
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // ⚔️ INICIAR BATALHA
    // ════════════════════════════════════════
    case 'batalha': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!\nUse *${prefix}criarchar [classe] [nome]*`);
      if (char.em_batalha) return enviar(`⚔️ Você já está em batalha!\nUse *${prefix}atacar*, *${prefix}curar* ou *${prefix}fugir*`);
      if (char.hp <= 0) return enviar(`💀 Seu personagem está morto!\nDescanse e use *${prefix}curar* para recuperar HP.`);

      const monstrKey = args[0]?.toLowerCase();
      const monstro = monstrKey && MONSTROS[monstrKey] ? { ...MONSTROS[monstrKey] } : { ...MONSTROS[Object.keys(MONSTROS)[Math.floor(Math.random() * Object.keys(MONSTROS).length)]] };
      const local = LOCAIS[Math.floor(Math.random() * LOCAIS.length)];

      char.em_batalha = true;
      char.batalha_atual = { monstro, hp_monstro: monstro.hp, local };
      personagens[sender] = char;
      saveData(CHARS_PATH, personagens);

      const texto = `
╔══════════════════════════════╗
║      ⚔️ BATALHA INICIADA!   ║
╚══════════════════════════════╝

📍 *Local:* ${local}

👤 *${char.nome}* (Nível ${calcularNivel(char.xp)})
❤️ HP: ${char.hp}/${char.hp_max}

VS

👹 *${monstro.nome}*
❤️ HP: ${monstro.hp}
⚔️ Ataque: ${monstro.ataque} | 🛡️ Defesa: ${monstro.defesa}

_O inimigo aparece diante de você..._

*AÇÕES:*
▸ *${prefix}atacar* — Atacar o inimigo
▸ *${prefix}curar* — Usar poção de cura
▸ *${prefix}fugir* — Tentar fugir`;
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // 🗡️ ATACAR
    // ════════════════════════════════════════
    case 'atacar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      if (!char.em_batalha) return enviar(`❌ Você não está em batalha!\nUse *${prefix}batalha* para encontrar inimigos.`);

      const batalha = char.batalha_atual;
      const classe = CLASSES[char.classe];
      const atb = char.atributos;

      // Rolagem de ataque do jogador
      const d20Ataque = rolarDado(20);
      const modAtaque = modificador(atb.forca > atb.destreza ? atb.forca : atb.destreza);
      const totalAtaque = d20Ataque + modAtaque;
      let textoAcao = '';
      let danoJogador = 0;
      let danoMonstro = 0;

      // Verifica acerto
      if (d20Ataque === 20) {
        // Acerto crítico!
        const dados = rolarMultiplos(2, classe.dado_vida);
        danoJogador = dados.reduce((a, b) => a + b, 0) + Math.max(0, modAtaque);
        textoAcao += `🎯 *ACERTO CRÍTICO!*\nDado: [${dados.join(', ')}] = ${danoJogador} de dano!\n`;
      } else if (totalAtaque >= batalha.monstro.defesa) {
        // Acerto normal
        const dado = rolarDado(classe.dado_vida);
        danoJogador = Math.max(1, dado + modAtaque);
        textoAcao += `✅ *Acertou!* (${d20Ataque}+${formatarMod(modAtaque)}=${totalAtaque} vs CA ${batalha.monstro.defesa})\nDano: ${danoJogador}\n`;
      } else {
        textoAcao += `❌ *Errou!* (${d20Ataque}+${formatarMod(modAtaque)}=${totalAtaque} vs CA ${batalha.monstro.defesa})\n`;
      }

      batalha.hp_monstro -= danoJogador;

      // Contra-ataque do monstro (se ainda vivo)
      if (batalha.hp_monstro > 0) {
        const d20Monstro = rolarDado(20);
        const defesaJogador = 10 + modificador(atb.destreza);
        if (d20Monstro >= defesaJogador) {
          danoMonstro = Math.max(1, batalha.monstro.ataque + rolarDado(4) - 2);
          char.hp -= danoMonstro;
          textoAcao += `\n👹 *${batalha.monstro.nome} contra-ataca!*\nDano recebido: ${danoMonstro} ❤️\n`;
        } else {
          textoAcao += `\n👹 *${batalha.monstro.nome} errou o ataque!*\n`;
        }
      }

      let resultado = '';
      // Monstro morreu
      if (batalha.hp_monstro <= 0) {
        char.em_batalha = false;
        char.batalha_atual = null;
        char.vitorias++;
        char.xp += batalha.monstro.xp;
        char.ouro += batalha.monstro.ouro;
        // Recupera um pouco de HP
        char.hp = Math.min(char.hp_max, char.hp + 5);
        const nivelAntes = calcularNivel(char.xp - batalha.monstro.xp);
        const nivelDepois = calcularNivel(char.xp);
        resultado = `\n╔══════════════════════════════╗\n║    🏆 VITÓRIA! INIMIGO DERROTADO!   ║\n╚══════════════════════════════╝\n\n💰 Ouro ganho: +${batalha.monstro.ouro}\n📈 XP ganho: +${batalha.monstro.xp}`;
        if (nivelDepois > nivelAntes) {
          resultado += `\n\n🌟 *LEVEL UP! Nível ${nivelDepois}!* 🌟`;
          char.hp_max += 2;
          char.hp = char.hp_max;
        }
      }
      // Jogador morreu
      else if (char.hp <= 0) {
        char.hp = 0;
        char.em_batalha = false;
        char.batalha_atual = null;
        char.derrotas++;
        resultado = `\n╔══════════════════════════════╗\n║       💀 VOCÊ FOI DERROTADO!       ║\n╚══════════════════════════════╝\n\nUse *${prefix}curar* para recuperar HP e tente novamente.`;
      }

      personagens[sender] = char;
      saveData(CHARS_PATH, personagens);

      const barraHP = char.hp > 0 ? '█'.repeat(Math.floor((char.hp / char.hp_max) * 10)) + '░'.repeat(10 - Math.floor((char.hp / char.hp_max) * 10)) : '░░░░░░░░░░';
      const baraMonstro = batalha.hp_monstro > 0 ? '█'.repeat(Math.floor((batalha.hp_monstro / batalha.monstro.hp) * 10)) + '░'.repeat(10 - Math.floor((batalha.hp_monstro / batalha.monstro.hp) * 10)) : '░░░░░░░░░░';

      const texto = `
⚔️ *TURNO DE BATALHA*\n
${textoAcao}
👤 ${char.nome}: [${barraHP}] ${Math.max(0, char.hp)}/${char.hp_max} HP
👹 ${batalha.monstro.nome}: [${baraMonstro}] ${Math.max(0, batalha.hp_monstro)}/${batalha.monstro.hp} HP
${resultado}`;
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // 💊 CURAR
    // ════════════════════════════════════════
    case 'curar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);

      if (char.ouro < 15) return enviar(`❌ Ouro insuficiente!\nUma poção custa *15 ouros*.\nSeu ouro: ${char.ouro} 💰`);

      const cura = rolarDado(8) + modificador(char.atributos.constituicao);
      const curaReal = Math.min(cura, char.hp_max - char.hp);
      char.hp = Math.min(char.hp_max, char.hp + Math.max(1, cura));
      char.ouro -= 15;

      personagens[sender] = char;
      saveData(CHARS_PATH, personagens);

      return enviar(`
💊 *POÇÃO USADA!*

❤️ HP recuperado: +${Math.max(1, curaReal)}
❤️ HP atual: ${char.hp}/${char.hp_max}
💰 Ouro restante: ${char.ouro}

_"Você sente o líquido mágico percorrer seu corpo..."_`);
    }

    // ════════════════════════════════════════
    // 🏃 FUGIR
    // ════════════════════════════════════════
    case 'fugir': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char || !char.em_batalha) return enviar(`❌ Você não está em batalha!`);

      const d20 = rolarDado(20);
      const modFuga = modificador(char.atributos.destreza);

      if (d20 + modFuga >= 12) {
        char.em_batalha = false;
        char.batalha_atual = null;
        char.hp = Math.max(1, char.hp - rolarDado(4));
        personagens[sender] = char;
        saveData(CHARS_PATH, personagens);
        return enviar(`🏃 *FUGIU COM SUCESSO!*\n\nRolagem: ${d20}+${formatarMod(modFuga)} = ${d20 + modFuga}\nHP perdido na fuga: -${char.hp_max - char.hp > 0 ? rolarDado(4) : 0}\n\n_"Você corre sem olhar para trás..."_`);
      } else {
        const dano = rolarDado(6);
        char.hp = Math.max(0, char.hp - dano);
        if (char.hp <= 0) {
          char.em_batalha = false;
          char.batalha_atual = null;
          char.derrotas++;
        }
        personagens[sender] = char;
        saveData(CHARS_PATH, personagens);
        return enviar(`❌ *FALHOU EM FUGIR!*\n\nRolagem: ${d20}+${formatarMod(modFuga)} = ${d20 + modFuga}\nDano recebido ao tentar fugir: -${dano}\nHP: ${char.hp}/${char.hp_max}\n\n_"O inimigo te alcança!"_`);
      }
    }

    // ════════════════════════════════════════
    // 🎲 ROLAR DADO
    // ════════════════════════════════════════
    case 'rolar': {
      if (!q) return enviar(`Use: *${prefix}rolar 2d6* ou *${prefix}rolar 1d20*`);
      const match = q.toLowerCase().match(/^(\d+)d(\d+)$/);
      if (!match) return enviar(`❌ Formato inválido!\nUse: *${prefix}rolar 2d6*`);
      const qtd = Math.min(parseInt(match[1]), 20);
      const lados = Math.min(parseInt(match[2]), 100);
      const resultados = rolarMultiplos(qtd, lados);
      const total = resultados.reduce((a, b) => a + b, 0);
      return enviar(`🎲 *ROLAGEM: ${qtd}d${lados}*\n\nResultados: [${resultados.join(', ')}]\nTotal: *${total}*`);
    }

    case 'dado': {
      const lados = parseInt(q) || 20;
      const resultado = rolarDado(Math.min(lados, 100));
      const emojis = { 1: '💀', 20: '⭐', [lados]: lados === 20 ? '⭐' : '✅' };
      const emoji = resultado === 1 ? '💀' : resultado === lados ? '⭐' : '🎲';
      return enviar(`${emoji} *D${lados}: ${resultado}*${resultado === 1 ? '\n_Falha crítica!_' : resultado === lados ? '\n_Sucesso crítico!_' : ''}`);
    }

    // ════════════════════════════════════════
    // 🏆 RANKING
    // ════════════════════════════════════════
    case 'rpgrank': {
      if (!isGroup) return enviar('❌ Apenas em grupos!');
      const personagens = loadData(CHARS_PATH);
      const lista = Object.entries(personagens)
        .map(([id, char]) => ({ id, ...char, nivel: calcularNivel(char.xp) }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
      if (lista.length === 0) return enviar('❌ Nenhum personagem criado ainda!');
      const emojisRank = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      let texto = `╔══════════════════════════════╗\n║    🏆 RANKING RPG BLACK LOTUS  ║\n╚══════════════════════════════╝\n\n`;
      lista.forEach((char, i) => {
        const classe = CLASSES[char.classe];
        texto += `${emojisRank[i]} *${char.nome}* ${classe.emoji}\n   Nível ${char.nivel} | XP: ${char.xp} | 🏆 ${char.vitorias}V\n\n`;
      });
      return enviar(texto);
    }

    // ════════════════════════════════════════
    // 🗑️ DELETAR PERSONAGEM
    // ════════════════════════════════════════
    case 'deletarchar': {
      const personagens = loadData(CHARS_PATH);
      if (!personagens[sender]) return enviar(`❌ Você não tem personagem!`);
      delete personagens[sender];
      saveData(CHARS_PATH, personagens);
      return enviar(`🗑️ Personagem deletado com sucesso!\nUse *${prefix}criarchar* para criar um novo.`);
    }
  }
}

module.exports = { handleRPG, CLASSES, MONSTROS };
