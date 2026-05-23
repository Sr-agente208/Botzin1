const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'dados-donos.json'), 'utf8'));

const dono1 = data.dono1 || '';
const dono2 = data.dono2 || '';
const dono3 = data.dono3 || '';
const dono4 = data.dono4 || '';
const dono5 = data.dono5 || '';
const dono6 = data.dono6 || '';
const botoff = data.botoff || false;
const verificado = data.verificado || false;

module.exports = { dono1, dono2, dono3, dono4, dono5, dono6, botoff, verificado };
