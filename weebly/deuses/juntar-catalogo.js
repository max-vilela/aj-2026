/* Junta os ícones baixados do WoW ao catálogo do Dota 2, em weebly/deuses/catalogo/.
   Uso:  node weebly/deuses/juntar-catalogo.js <pasta com os .jpg do WoW>
   O catálogo fica fora do git; só os ícones escolhidos entram no repositório.
   Os arquivos do WoW ganham o prefixo "wow-" para não colidir com os do Dota. */

const fs = require("fs");
const path = require("path");

const origem = process.argv[2];
if (!origem) { console.error("uso: node juntar-catalogo.js <pasta>"); process.exit(1); }

const CATALOGO = path.join(__dirname, "catalogo");
fs.mkdirSync(CATALOGO, { recursive: true });

/* "spell_nature_lightning" -> "Nature Lightning" (fica em inglês, que é como a busca casa) */
const PREFIXOS = { spell: "", ability: "", inv: "", trade: "profession", achievement: "" };
const legivel = (arq) => {
  const partes = arq.replace(/\.[a-z]+$/i, "").split("_");
  if (PREFIXOS[partes[0]] !== undefined) {
    const troca = PREFIXOS[partes[0]];
    partes.shift();
    if (troca) partes.unshift(troca);
  }
  return partes
    .filter(function (p) { return p && !/^\d+$/.test(p); })
    .map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); })
    .join(" ");
};

const lista = JSON.parse(fs.readFileSync(path.join(CATALOGO, "lista.json"), "utf8"));
const nomes = JSON.parse(fs.readFileSync(path.join(CATALOGO, "nomes.json"), "utf8"));
const tinha = new Set(lista);

let postos = 0, pulados = 0;
for (const arq of fs.readdirSync(origem)) {
  if (!/\.(jpg|jpeg|png)$/i.test(arq)) continue;
  const destino = "wow-" + arq.toLowerCase();
  if (tinha.has(destino)) { pulados++; continue; }
  const dados = fs.statSync(path.join(origem, arq));
  if (dados.size < 600) { pulados++; continue; }   /* respostas vazias ou placeholder */
  fs.copyFileSync(path.join(origem, arq), path.join(CATALOGO, destino));
  lista.push(destino);
  nomes[destino] = legivel(arq) + " (WoW)";
  tinha.add(destino);
  postos++;
}

lista.sort();
fs.writeFileSync(path.join(CATALOGO, "lista.json"), JSON.stringify(lista), "utf8");
fs.writeFileSync(path.join(CATALOGO, "nomes.json"), JSON.stringify(nomes), "utf8");
console.log("somados " + postos + " ícones do WoW (pulados " + pulados + "); catálogo agora com " + lista.length);
