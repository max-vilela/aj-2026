/* Primeira escolha automática de ícones para as habilidades, a partir do catálogo do Dota 2.
   Casa palavras do nome e do texto da habilidade com o nome e a descrição do ícone.
   Uso:  node weebly/deuses/sugerir-icones.js [deus ...]      (sem argumentos, faz todos)
   Ícones já escolhidos à mão são mantidos. Reveja em escolher-icones.html. */

const fs = require("fs");
const path = require("path");

const AQUI = __dirname;
const CATALOGO = path.join(AQUI, "catalogo");
const ICONES = path.join(AQUI, "icones");
const nomes = JSON.parse(fs.readFileSync(path.join(CATALOGO, "nomes.json"), "utf8"));

/* palavras das habilidades (português) -> palavras dos ícones (inglês) */
const TRADUZ = {
  agua: "water aqua wave tide", onda: "wave tide water", mare: "tide water wave", mar: "sea water wave",
  oceano: "sea water", chuva: "rain water", gelo: "ice frost freeze", neve: "snow frost ice",
  fogo: "fire flame burn", chama: "flame fire burn", brasa: "ember fire", forja: "forge fire smith anvil",
  metal: "metal iron steel", ferro: "iron metal", martelo: "hammer smash", lamina: "blade sword",
  espada: "sword blade", lanca: "spear lance", escudo: "shield guard block", arco: "bow arrow",
  flecha: "arrow bow shot", tiro: "shot arrow", raio: "lightning bolt thunder", trovao: "thunder lightning",
  eletric: "lightning electric shock", tempestade: "storm thunder", vento: "wind gust gale",
  voo: "fly wing leap", ar: "wind air", terra: "earth ground stone", pedra: "stone rock earth",
  planta: "nature plant grow", trigo: "nature grow plant", floresta: "forest nature tree",
  semente: "seed nature grow", veneno: "poison venom toxic", praga: "plague poison curse",
  cura: "heal restore mend", vida: "life heal vitality", sangue: "blood", morte: "death reaper",
  alma: "soul spirit ghost", espirito: "spirit soul ghost", fantasma: "ghost spirit phantom",
  sombra: "shadow dark", trevas: "dark shadow night", noite: "night dark moon", lua: "moon lunar",
  sol: "sun solar light", luz: "light radiance glow", brilho: "glow light shine",
  estrela: "star astral", amor: "love charm heart", charme: "charm enchant", beleza: "charm grace",
  sorte: "luck fortune chance", azar: "curse misfortune", roubo: "steal theft rob",
  furto: "steal theft", invisi: "invisible stealth", sonho: "dream sleep slumber",
  sono: "sleep slumber dream", tempo: "time clock", portal: "portal gate teleport",
  porta: "gate door portal", vinganca: "vengeance revenge", guerra: "war battle",
  batalha: "battle war combat", furia: "rage fury berserk", grito: "scream shout cry roar",
  canto: "song music sonic", musica: "music song", som: "sound sonic wave",
  velocidade: "speed haste swift", salto: "leap jump", corrida: "run speed",
  mente: "mind psychic", medo: "fear terror", ilusao: "illusion mirror image",
  vinho: "wine drink potion", festa: "feast revel", loucura: "madness insanity",
  caos: "chaos", ordem: "order", riqueza: "gold treasure wealth", ouro: "gold treasure",
  mina: "mine dig earth", animal: "beast animal", lobo: "wolf beast", cavalo: "horse mount",
  aguia: "hawk eagle bird", serpente: "snake serpent", visao: "vision sight reveal",
  aura: "aura presence", escudo_magico: "spell shield magic", magia: "magic arcane",
  maldicao: "curse hex", bencao: "bless blessing", juramento: "oath bond",
  corrente: "chain bind", prisao: "prison trap cage", armadilha: "trap snare",
  explosao: "explosion blast nova", nevoa: "mist fog", fumaca: "smoke",
};

/* tema de reserva por deus, quando o nome da habilidade não casa com nada */
const TEMA = {
  jupiter: "lightning storm wind", netuno: "water wave tide sea", plutao: "death soul dark gold",
  hecate: "magic arcane dark moon", ceres: "nature plant grow heal", marte: "war blade battle rage",
  apolo: "light sun arrow music heal", vulcano: "fire forge metal hammer", venus: "charm love light",
  mercurio: "speed wind steal message", victoria: "war aura blessing wing", fortuna: "luck gold chance",
  esculapio: "heal life restore snake", baco: "wine madness revel poison", somnus: "sleep dream mist",
  nemesis: "vengeance curse balance", jano: "portal gate time", cupido: "charm love arrow",
  discordia: "chaos curse madness", salacia: "water sea wave calm", laverna: "steal stealth shadow",
};

const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const catalogo = Object.keys(nomes);
/* O verbete do Dota traz nome + descrição longa; o do WoW traz só o nome. Sem separar os dois,
   a descrição do Dota ganha sempre. Então o nome vale cheio e a descrição vale pouco. */
const VERBETE = {};
for (const arq of catalogo) {
  const texto = (nomes[arq] || "").replace(/\s*\(WoW\)\s*$/, "");
  const palavras = texto.split(" ");
  VERBETE[arq] = {
    nome: (arq.replace(/^wow-/, "").replace(/\.[a-z]+$/, "").replace(/_/g, " ") + " " + palavras.slice(0, 4).join(" ")).toLowerCase(),
    desc: palavras.slice(4).join(" ").toLowerCase(),
  };
}

function candidatos(palavras, usados) {
  const termos = palavras.split(" ").filter(Boolean);
  const pontos = [];
  for (const arq of catalogo) {
    if (usados.has(arq)) continue;
    const v = VERBETE[arq];
    let p = 0;
    termos.forEach(function (t, i) {
      const peso = termos.length - i;
      if (v.nome.indexOf(t) >= 0) p += peso;
      else if (v.desc.indexOf(t) >= 0) p += peso * 0.25;
    });
    if (p > 0) pontos.push([p, arq]);
  }
  /* em empate, fica com a arte do Dota: é maior (128px) que a do WoW (56px) */
  const doDota = (f) => (f.indexOf("wow-") === 0 ? 1 : 0);
  pontos.sort((a, b) => b[0] - a[0] || doDota(a[1]) - doDota(b[1]) || a[1].localeCompare(b[1]));
  return pontos.map((x) => x[1]);
}

const pedidos = process.argv.slice(2);
const lista = JSON.parse(fs.readFileSync(path.join(AQUI, "lista.json"), "utf8"));
fs.mkdirSync(ICONES, { recursive: true });

for (const id of lista) {
  if (pedidos.length && pedidos.indexOf(id) < 0) continue;
  const alvo = path.join(AQUI, id + ".json");
  const d = JSON.parse(fs.readFileSync(alvo, "utf8"));
  const usados = new Set();
  ["passivas", "ativas"].forEach((m) => d[m].forEach((t) => t.forEach((h) => { if (h.icone) usados.add(h.icone.replace(id + "-" + h.id + ".png", "")); })));
  let postos = 0, mantidos = 0;
  ["passivas", "ativas"].forEach((m) => d[m].forEach((tier) => tier.forEach((h) => {
    if (h.icone) { mantidos++; return; }
    const base = semAcento(h.nome + " " + (h.texto || "").slice(0, 400));
    let termos = [];
    for (const pt in TRADUZ) if (base.indexOf(pt) >= 0) termos.push(TRADUZ[pt]);
    termos.push(TEMA[id] || "");
    const op = candidatos(termos.join(" "), usados);
    if (!op.length) return;
    const escolhido = op[0];
    usados.add(escolhido);
    const nomeArq = id + "-" + h.id + path.extname(escolhido);
    fs.copyFileSync(path.join(CATALOGO, escolhido), path.join(ICONES, nomeArq));
    h.icone = nomeArq;
    postos++;
  })));
  fs.writeFileSync(alvo, JSON.stringify(d, null, 2) + "\n", "utf8");
  console.log(id.padEnd(12) + " novos " + String(postos).padEnd(3) + " mantidos " + mantidos);
}
