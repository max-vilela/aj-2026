/* Procura ícones no catálogo pelo nome do arquivo.
   Uso:  node weebly/deuses/buscar.js <termo> [termo...]   (cada termo vira uma busca separada) */
const fs = require("fs");
const path = require("path");
const lista = JSON.parse(fs.readFileSync(path.join(__dirname, "catalogo", "lista.json"), "utf8"));
const limite = Number(process.env.LIMITE || 14);
for (const termo of process.argv.slice(2)) {
  const achados = lista.filter((f) => f.replace(/^wow-/, "").indexOf(termo.toLowerCase()) >= 0);
  console.log("\n== " + termo + " (" + achados.length + ")");
  console.log(achados.slice(0, limite).map((f) => f.replace(/\.(png|jpg)$/, "")).join("  "));
}
