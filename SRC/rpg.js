// ╔══════════════════════════════════════════════╗
// ║   🎲 SISTEMA RPG — BLACK LOTUS BOT 🎲        ║
// ║   Estilo Ordem Paranormal / D&D              ║
// ╚══════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');

const RPG_PATH = './SRC/rpg';
const CHARS_PATH = `${RPG_PATH}/personagens.json`;
const LOJA_PATH = `${RPG_PATH}/loja.json`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗂️ INICIALIZAÇÃO DOS ARQUIVOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
// 🛒 ITENS DA LOJA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ITENS = {
  poçao_pequena: { nome: 'Poção Pequena 🧪', preco: 20, cura: 15, desc: 'Recupera 15 HP' },
  poçao_media: { nome: 'Poção Média ⚗️', preco: 50, cura: 40, desc: 'Recupera 40 HP' },
  espada_aço: { nome: 'Espada de Aço ⚔️', preco: 150, bonus: 2, tipo: 'forca', desc: '+2 Força' },
  arco_longo: { nome: 'Arco Longo 🏹', preco: 150, bonus: 2, tipo: 'destreza', desc: '+2 Destreza' },
  amuleto_arcano: { nome: 'Amuleto Arcano 🔮', preco: 200, bonus: 3, tipo: 'inteligencia', desc: '+3 Inteligência' },
  armadura_leve: { nome: 'Armadura Leve 🛡️', preco: 100, bonus: 5, tipo: 'hp', desc: '+5 HP Max' }
};

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
  const reagir = (emoji) => sock.sendMessage(from, { react: { text: emoji, key: info.key } });
  const q = args.join(' ');

  switch (command) {

    case 'rpg':
    case 'rpgajuda': {
      const texto = `
╔══════════════════════════════╗
║  🌑 BLACK LOTUS RPG SYSTEM  ║
╚══════════════════════════════╝

*🧙 PERSONAGEM*
▸ ${prefix}criarchar [classe] [nome]
▸ ${prefix}meuchar
▸ ${prefix}inventario
▸ ${prefix}deletarchar

*⚔️ AVENTURA*
▸ ${prefix}batalha [monstro]
▸ ${prefix}atacar
▸ ${prefix}fugir
▸ ${prefix}trabalhar (Ganha ouro)

*🛒 ECONOMIA*
▸ ${prefix}loja (Ver itens)
▸ ${prefix}comprar [item]
▸ ${prefix}usar [item]

*🏆 COMPETIÇÃO*
▸ ${prefix}rpgrank

*📋 CLASSES:*
guerreiro, mago, ladino, clerigo, cacador, paranormal`;
      return enviar(texto);
    }

    case 'criarchar': {
      const personagens = loadData(CHARS_PATH);
      if (personagens[sender]) return enviar(`❌ Você já tem um personagem!`);
      const classeKey = args[0]?.toLowerCase();
      const nomeChar = args.slice(1).join(' ') || pushname;
      if (!classeKey || !CLASSES[classeKey]) return enviar(`❌ Classe inválida!`);
      
      const classe = CLASSES[classeKey];
      personagens[sender] = {
        nome: nomeChar,
        classe: classeKey,
        nivel: 1,
        xp: 0,
        hp: classe.hp_base,
        hp_max: classe.hp_base,
        ouro: 100,
        atributos: { ...classe.atributos },
        inventario: [],
        vitorias: 0,
        derrotas: 0,
        ultima_vez: 0
      };
      saveData(CHARS_PATH, personagens);
      await reagir("✨");
      return enviar(`✨ *Personagem ${nomeChar} criado como ${classe.nome}!*`);
    }

    case 'meuchar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      const nivel = calcularNivel(char.xp);
      const barraHP = '█'.repeat(Math.floor((char.hp / char.hp_max) * 10)) + '░'.repeat(10 - Math.floor((char.hp / char.hp_max) * 10));
      
      return enviar(`
🎭 *${char.nome}* — ${CLASSES[char.classe].emoji} ${CLASSES[char.classe].nome}
⭐ *Nível ${nivel}* | XP: ${char.xp}
❤️ HP: [${barraHP}] ${char.hp}/${char.hp_max}
💰 *Ouro:* ${char.ouro}

📊 *ATRIBUTOS:*
💪 FOR: ${char.atributos.forca} | 🏃 DES: ${char.atributos.destreza}
🛡️ CON: ${char.atributos.constituicao} | 🧠 INT: ${char.atributos.inteligencia}
👁️ SAB: ${char.atributos.sabedoria} | ✨ CAR: ${char.atributos.carisma}

🏆 Vitórias: ${char.vitorias} | 💀 Derrotas: ${char.derrotas}`);
    }

    case 'trabalhar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      
      const agora = Date.now();
      const cooldown = 300000; // 5 minutos
      if (agora - char.ultima_vez < cooldown) {
        const resto = Math.ceil((cooldown - (agora - char.ultima_vez)) / 60000);
        return enviar(`⏳ Você está exausto! Volte em ${resto} minutos.`);
      }

      const ganho = rolarDado(50) + (char.atributos.forca / 2);
      char.ouro += Math.floor(ganho);
      char.ultima_vez = agora;
      saveData(CHARS_PATH, personagens);
      await reagir("💰");
      return enviar(`⚒️ *Você trabalhou duro e ganhou ${Math.floor(ganho)} moedas de ouro!*`);
    }

    case 'loja': {
      let texto = `🛒 *LOJA DO BLACK LOTUS*\n\n`;
      for (const [key, item] of Object.entries(ITENS)) {
        texto += `▸ *${item.nome}* — 💰 ${item.preco}\n   _${item.desc}_\n   Comando: ${prefix}comprar ${key}\n\n`;
      }
      return enviar(texto);
    }

    case 'comprar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      const itemKey = args[0]?.toLowerCase();
      const item = ITENS[itemKey];
      if (!item) return enviar(`❌ Item não encontrado na loja!`);
      if (char.ouro < item.preco) return enviar(`❌ Ouro insuficiente!`);

      char.ouro -= item.preco;
      char.inventario.push(itemKey);
      saveData(CHARS_PATH, personagens);
      await reagir("🛍️");
      return enviar(`✅ Você comprou *${item.nome}*!`);
    }

    case 'inventario': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      if (char.inventario.length === 0) return enviar(`🎒 Seu inventário está vazio.`);
      
      let texto = `🎒 *INVENTÁRIO DE ${char.nome}*\n\n`;
      const contagem = {};
      char.inventario.forEach(i => contagem[i] = (contagem[i] || 0) + 1);
      
      for (const [key, qtd] of Object.entries(contagem)) {
        texto += `▸ ${ITENS[key].nome} (x${qtd})\n`;
      }
      texto += `\nUse *${prefix}usar [item]*`;
      return enviar(texto);
    }

    case 'usar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      const itemKey = args[0]?.toLowerCase();
      const index = char.inventario.indexOf(itemKey);
      if (index === -1) return enviar(`❌ Você não tem esse item!`);
      
      const item = ITENS[itemKey];
      if (item.cura) {
        char.hp = Math.min(char.hp_max, char.hp + item.cura);
        enviar(`🧪 Você usou ${item.nome} e recuperou ${item.cura} HP!`);
      } else if (item.bonus) {
        if (item.tipo === 'hp') {
          char.hp_max += item.bonus;
          char.hp += item.bonus;
        } else {
          char.atributos[item.tipo] += item.bonus;
        }
        enviar(`⚔️ Você equipou ${item.nome}! Bonus: ${item.desc}`);
      }
      
      char.inventario.splice(index, 1);
      saveData(CHARS_PATH, personagens);
      return await reagir("✨");
    }

    case 'batalha': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char) return enviar(`❌ Crie um personagem primeiro!`);
      if (char.hp <= 0) return enviar(`💀 Você está morto! Use poções.`);

      const monstros = [
        { nome: 'Goblin 👺', hp: 20, atk: 5, xp: 50, ouro: 30 },
        { nome: 'Zumbi 🧟', hp: 35, atk: 8, xp: 80, ouro: 50 },
        { nome: 'Dragão 🐉', hp: 150, atk: 25, xp: 500, ouro: 300 }
      ];
      
      const monstro = monstros[rolarDado(monstros.length) - 1];
      char.em_batalha = true;
      char.batalha_atual = { ...monstro, hp_atual: monstro.hp };
      saveData(CHARS_PATH, personagens);
      
      return enviar(`⚔️ *BATALHA!* ⚔️\n\nVocê encontrou um *${monstro.nome}*!\n❤️ HP: ${monstro.hp}\n⚔️ ATK: ${monstro.atk}\n\nUse *${prefix}atacar* ou *${prefix}fugir*`);
    }

    case 'atacar': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char || !char.em_batalha) return enviar(`❌ Você não está em batalha!`);
      
      const batalha = char.batalha_atual;
      const danoJ = rolarDado(10) + modificador(char.atributos.forca);
      const danoM = rolarDado(batalha.atk);
      
      batalha.hp_atual -= danoJ;
      char.hp -= danoM;
      
      let res = `⚔️ Você causou *${danoJ}* de dano!\n👹 O inimigo causou *${danoM}* de dano!\n\n❤️ Seu HP: ${char.hp}\n❤️ HP Inimigo: ${batalha.hp_atual}`;
      
      if (batalha.hp_atual <= 0) {
        char.em_batalha = false;
        char.xp += batalha.xp;
        char.ouro += batalha.ouro;
        char.vitorias++;
        res += `\n\n🏆 *VITÓRIA!* Você ganhou ${batalha.xp} XP e ${batalha.ouro} ouro!`;
      } else if (char.hp <= 0) {
        char.em_batalha = false;
        char.derrotas++;
        res += `\n\n💀 *DERROTA!* Você morreu e perdeu a batalha.`;
      }
      
      saveData(CHARS_PATH, personagens);
      return enviar(res);
    }
    
    case 'fugir': {
      const personagens = loadData(CHARS_PATH);
      const char = personagens[sender];
      if (!char || !char.em_batalha) return enviar(`❌ Você não está em batalha!`);
      
      if (rolarDado(20) + modificador(char.atributos.destreza) > 12) {
        char.em_batalha = false;
        char.batalha_atual = null;
        saveData(CHARS_PATH, personagens);
        return enviar(`🏃 Você fugiu com sucesso!`);
      } else {
        const dano = rolarDado(10);
        char.hp -= dano;
        saveData(CHARS_PATH, personagens);
        return enviar(`❌ Falhou em fugir! Recebeu ${dano} de dano.`);
      }
    }
    
    case 'rpgrank': {
        const personagens = loadData(CHARS_PATH);
        const lista = Object.entries(personagens)
          .map(([id, char]) => ({ id, ...char }))
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10);
        
        let txt = `🏆 *TOP 10 RPG BLACK LOTUS*\n\n`;
        lista.forEach((c, i) => {
          txt += `${i+1}. ${c.nome} - Nível ${calcularNivel(c.xp)} (${c.xp} XP)\n`;
        });
        return enviar(txt);
    }
    
    case 'deletarchar': {
        const personagens = loadData(CHARS_PATH);
        delete personagens[sender];
        saveData(CHARS_PATH, personagens);
        return enviar(`🗑️ Personagem deletado.`);
    }
  }
}

module.exports = { handleRPG, CLASSES };
