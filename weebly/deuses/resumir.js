/* Resumo curto das habilidades de um deus, para a escolha de ícone.
   Uso:  node weebly/deuses/resumir.js <deus> [quantos caracteres do texto] */
const fs = require("fs");
const path = require("path");
const id = process.argv[2];
const corte = Number(process.argv[3]) || 150;
const d = JSON.parse(fs.readFileSync(path.join(__dirname, id + ".json"), "utf8"));
console.log("### " + d.nome);
for (const tipo of ["passivas", "ativas"]) {
  d[tipo].forEach((tier, t) => tier.forEach((h) => {
    console.log("[" + h.id + "] " + h.nome + (h.grau ? " " + h.grau : "") + " (" + tipo.slice(0, 3) + ", s" + t + "): " +
      (h.texto || "").replace(/\s+/g, " ").slice(0, corte));
  }));
}
