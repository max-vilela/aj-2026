/* Aplica os ícones escolhidos em escolher-icones.html ao JSON de um deus.
   Uso:  node weebly/deuses/aplicar-icones.js <deus.json> <escolhas.json>
   O escolhas.json é o que o botão "Copiar JSON" da página gera: { "<id da habilidade>": "<arquivo>.png" }.
   Os arquivos saem do catálogo (fora do git) para weebly/deuses/icones/, que vai para o repositório. */

const fs = require("fs");
const path = require("path");

const [, , alvo, escolhasArq] = process.argv;
if (!alvo || !escolhasArq) {
  console.error("uso: node aplicar-icones.js <deus.json> <escolhas.json>");
  process.exit(1);
}

const AQUI = __dirname;
const CATALOGO = path.join(AQUI, "catalogo");
const ICONES = path.join(AQUI, "icones");

const deus = JSON.parse(fs.readFileSync(alvo, "utf8"));
const escolhas = JSON.parse(fs.readFileSync(escolhasArq, "utf8"));
fs.mkdirSync(ICONES, { recursive: true });

let postos = 0;
const faltando = [];
for (const tipo of ["passivas", "ativas"]) {
  for (const tier of deus[tipo]) {
    for (const h of tier) {
      const arquivo = escolhas[h.id];
      if (!arquivo) { faltando.push(h.nome + (h.grau ? " " + h.grau : "")); continue; }
      const origem = path.join(CATALOGO, arquivo);
      if (!fs.existsSync(origem)) { console.error("não achei no catálogo: " + arquivo); continue; }
      /* o arquivo guardado leva o id da habilidade, para o deus ser legível na pasta */
      const nome = deus.id + "-" + h.id + path.extname(arquivo);
      fs.copyFileSync(origem, path.join(ICONES, nome));
      h.icone = nome;
      postos++;
    }
  }
}

fs.writeFileSync(alvo, JSON.stringify(deus, null, 2) + "\n", "utf8");
console.log("ok: " + postos + " ícones aplicados em " + path.basename(alvo));
if (faltando.length) console.log("sem ícone ainda: " + faltando.join(", "));
