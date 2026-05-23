/**
 * GERADOR DE SESSION_DATA PARA O RAILWAY
 * 
 * Execute localmente DEPOIS de parear o bot:
 *   node gerar-sessao.js
 *
 * Depois copie o valor gerado e coloque como variável
 * SESSION_DATA no painel do Railway.
 */

const fs = require('fs');
const path = require('path');

const credsPath = path.join(__dirname, 'session', 'creds.json');

if (!fs.existsSync(credsPath)) {
    console.error('❌ Arquivo session/creds.json não encontrado!');
    console.error('   Execute o bot localmente e faça o pareamento primeiro.');
    process.exit(1);
}

const creds = fs.readFileSync(credsPath, 'utf-8');
const encoded = Buffer.from(creds).toString('base64');

console.log('\n✅ SESSION_DATA gerado com sucesso!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Cole este valor como variável SESSION_DATA no Railway:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(encoded);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Valor também salvo em: session_data.txt');

fs.writeFileSync(path.join(__dirname, 'session_data.txt'), encoded);
