
const fs = require('fs');

const RPG_PATH = './SRC/rpg';
const CHARS_PATH = `${RPG_PATH}/personagens.json`;

function loadRPG() {
    try { return JSON.parse(fs.readFileSync(CHARS_PATH, 'utf8')); }
    catch { return {}; }
}

function saveRPG(data) {
    fs.writeFileSync(CHARS_PATH, JSON.stringify(data, null, 2));
}

async function handleJogos(sock, from, info, command, args, sender, pushname, isGroup, prefix) {
    const enviar = (texto) => sock.sendMessage(from, { text: texto }, { quoted: info });
    const reagir = (emoji) => sock.sendMessage(from, { react: { text: emoji, key: info.key } });

    switch (command) {
        case 'roletarussa': {
            if (!isGroup) return enviar("❌ Apenas em grupos!");
            await reagir("🔫");
            const chance = Math.floor(Math.random() * 6);
            if (chance === 0) {
                enviar("💥 *POW!* Você perdeu.");
                const rpg = loadRPG();
                if (rpg[sender]) {
                    const perda = Math.floor(rpg[sender].xp * 0.05);
                    rpg[sender].xp -= perda;
                    saveRPG(rpg);
                    enviar(`💀 Você perdeu ${perda} de XP por morrer na roleta!`);
                }
            } else {
                enviar("🍀 *CLIQUE...* A câmara estava vazia. Você sobreviveu!");
            }
            break;
        }

        case 'apostar': {
            const rpg = loadRPG();
            if (!rpg[sender]) return enviar("❌ Você precisa de um personagem no RPG para apostar!");
            const quantia = parseInt(args[0]);
            if (isNaN(quantia) || quantia <= 0) return enviar(`Use: ${prefix}apostar [quantia]`);
            if (rpg[sender].ouro < quantia) return enviar("❌ Você não tem ouro suficiente!");

            await reagir("🎲");
            const win = Math.random() > 0.55; // 45% de chance de ganhar
            if (win) {
                rpg[sender].ouro += quantia;
                enviar(`🎉 *GANHOU!* Você apostou ${quantia} e recebeu ${quantia * 2} moedas!`);
            } else {
                rpg[sender].ouro -= quantia;
                enviar(`💸 *PERDEU!* A casa sempre vence. Você perdeu ${quantia} moedas.`);
            }
            saveRPG(rpg);
            break;
        }

        case 'caraoucoroa': {
            const escolha = args[0]?.toLowerCase();
            if (!['cara', 'coroa'].includes(escolha)) return enviar(`Use: ${prefix}caraoucoroa [cara/coroa]`);
            const resultado = Math.random() > 0.5 ? 'cara' : 'coroa';
            await reagir("🪙");
            if (escolha === resultado) {
                enviar(`🪙 O resultado foi *${resultado.toUpperCase()}*! Você venceu!`);
            } else {
                enviar(`🪙 O resultado foi *${resultado.toUpperCase()}*! Você perdeu.`);
            }
            break;
        }
    }
}

module.exports = { handleJogos };
