/* Lista as habilidades de um deus com um resumo do texto e candidatos do catálogo,
   para a escolha de ícone ser feita lendo a habilidade.
   Uso:  node weebly/deuses/revisar.js <deus> [quantos candidatos]  */

const fs = require("fs");
const path = require("path");

const AQUI = __dirname;
const CATALOGO = path.join(AQUI, "catalogo");
const nomes = JSON.parse(fs.readFileSync(path.join(CATALOGO, "nomes.json"), "utf8"));
const catalogo = Object.keys(nomes);

const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* o verbete do Dota tem nome + descrição; o do WoW só o nome */
const VERBETE = {};
for (const arq of catalogo) {
  const texto = (nomes[arq] || "").replace(/\s*\(WoW\)\s*$/, "");
  const palavras = texto.split(" ");
  VERBETE[arq] = {
    nome: (arq.replace(/^wow-/, "").replace(/\.[a-z]+$/, "").replace(/_/g, " ") + " " + palavras.slice(0, 4).join(" ")).toLowerCase(),
    desc: palavras.slice(4).join(" ").toLowerCase(),
    curto: palavras.slice(0, 4).join(" "),
  };
}

const TRADUZ = require("./dicionario.json");

function candidatos(frases, quantos) {
  const termos = [];
  for (const f of frases) for (const t of f.split(" ")) if (t.length > 2) termos.push(t);
  const vistos = {};
  for (const arq of catalogo) {
    const v = VERBETE[arq];
    let p = 0;
    for (const t of termos) {
      if (v.nome.indexOf(t) >= 0) p += 2;
      else if (v.desc.indexOf(t) >= 0) p += 0.5;
    }
    if (p > 0) vistos[arq] = p;
  }
  return Object.keys(vistos)
    .sort((a, b) => vistos[b] - vistos[a] || a.localeCompare(b))
    .slice(0, quantos || 30);
}

const id = process.argv[2];
const quantos = Number(process.argv[3]) || 30;
if (!id) { console.error("uso: node revisar.js <deus> [quantos]"); process.exit(1); }

const d = JSON.parse(fs.readFileSync(path.join(AQUI, id + ".json"), "utf8"));
console.log("# " + d.nome + "  (" + id + ")");
for (const tipo of ["passivas", "ativas"]) {
  d[tipo].forEach((tier, t) => tier.forEach((h) => {
    const base = semAcento(h.nome + " " + (h.texto || "").slice(0, 500));
    const chaves = [];
    for (const pt in TRADUZ) if (base.indexOf(pt) >= 0) chaves.push(TRADUZ[pt]);
    const op = candidatos(chaves.length ? chaves : [semAcento(d.nome)], quantos);
    console.log("\n[" + h.id + "] " + h.nome + (h.grau ? " " + h.grau : "") +
      "  (" + tipo + ", " + d.servicos[t] + ")  atual: " + (h.icone || "nenhum"));
    console.log("  " + (h.texto || "").replace(/\s+/g, " ").slice(0, 320));
    console.log("  >> " + op.join("  "));
  }));
}
