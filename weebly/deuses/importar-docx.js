/* Converte o texto extraído do .docx de poderes de um deus no JSON usado por weebly/deuses.js.
   Uso:  node weebly/deuses/importar-docx.js <poderes.txt> <saida.json> <id> <nome> <estandarte>
   O .txt é o texto do documento, um parágrafo por linha (veja LEIAME.md, seção "Novo deus"). */

const fs = require("fs");

const [, , entrada, saida, id, nome, estandarte] = process.argv;
if (!entrada || !saida || !id || !nome) {
  console.error("uso: node importar-docx.js <poderes.txt> <saida.json> <id> <nome> [estandarte]");
  process.exit(1);
}

const linhas = fs.readFileSync(entrada, "utf8").replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);

const ehMaiuscula = (l) => l === l.toUpperCase() && /[A-ZÀ-Ú]/.test(l);
const MINUSCULAS = new Set(["do", "da", "de", "dos", "das", "e", "o", "a", "os", "as"]);
const titulo = (s) =>
  s.toLowerCase().split(" ").map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))).join(" ");
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ROMANO = ["", "I", "II", "III", "IV", "V", "VI"];

const SERVICOS = ["Probatio", "Primeiro serviço", "Segundo serviço", "Terceiro serviço", "Quarto serviço", "Quinto serviço"];
const indiceServico = (l) => {
  const t = l.replace("★", "").trim().toUpperCase();
  if (t === "PROBATIO") return 0;
  const m = ["PRIMEIRO", "SEGUNDO", "TERCEIRO", "QUARTO", "QUINTO"].findIndex((p) => t.startsWith(p + " SERVIÇO"));
  return m >= 0 ? m + 1 : -1;
};

const dados = { id, nome, estandarte: estandarte || "", titulo: "", introducao: [], destaque: null, servicos: SERVICOS, passivas: SERVICOS.map(() => []), ativas: SERVICOS.map(() => []) };

let i = 0;
/* abertura: tudo até "OS TRÊS GRANDES" (ou outro título em maiúsculas) */
while (i < linhas.length && !ehMaiuscula(linhas[i])) dados.introducao.push(linhas[i++]);
/* bloco de destaque: título em maiúsculas + um parágrafo, antes de "HABILIDADES PASSIVAS" */
if (i < linhas.length && !/^HABILIDADES/.test(linhas[i])) {
  const t = linhas[i++];
  const corpo = [];
  while (i < linhas.length && !/^HABILIDADES/.test(linhas[i])) corpo.push(linhas[i++]);
  dados.destaque = { titulo: titulo(t), texto: corpo.join("\n\n") };
}

let modo = null;
let servico = 0;
const vistas = { passivas: {}, ativas: {} };
let atual = null;

const fechar = () => {
  if (!atual) return;
  const col = dados[modo][servico];
  const n = (vistas[modo][atual.nome] = (vistas[modo][atual.nome] || 0) + 1);
  atual.grau = "";
  atual._ordem = n;
  col.push(atual);
  atual = null;
};

for (; i < linhas.length; i++) {
  const l = linhas[i];
  if (/^HABILIDADES PASSIVAS/.test(l)) { fechar(); modo = "passivas"; continue; }
  if (/^HABILIDADES ATIVAS/.test(l)) { fechar(); modo = "ativas"; continue; }
  if (!modo) continue;
  const s = indiceServico(l);
  if (s >= 0 && l.includes("★")) { fechar(); servico = s; continue; }
  const reposicao = l.match(/^Tempo de Reposição:\s*(.+)$/i);
  if (reposicao) { if (atual) atual.reposicao = reposicao[1].replace(/\.$/, ""); continue; }
  const tipo = l.match(/^Habilidade (Passiva|Ativa)\s*(.*)$/);
  if (tipo) { if (atual && tipo[2]) atual.texto = tipo[2]; continue; }
  if (ehMaiuscula(l) && l.length < 60) { fechar(); atual = { nome: titulo(l), texto: "" }; continue; }
  if (atual) atual.texto = atual.texto ? atual.texto + "\n\n" + l : l;
}
fechar();

/* graus (I, II, III) para habilidades que se repetem ao longo dos serviços */
for (const m of ["passivas", "ativas"]) {
  const total = {};
  dados[m].flat().forEach((h) => { total[h.nome] = (total[h.nome] || 0) + 1; });
  dados[m].forEach((tier, t) => tier.forEach((h) => {
    if (total[h.nome] > 1) h.grau = ROMANO[h._ordem];
    delete h._ordem;
    h.id = slug(h.nome + (h.grau ? " " + h.grau : "") + " " + m.charAt(0));
    if (!h.reposicao) delete h.reposicao;
    h.servico = t;
  }));
}

const brasao = dados.introducao.find((p) => /Juppiter|Optimus/i.test(p));
dados.titulo = brasao ? (brasao.match(/Juppiter Optimus Maximus/) || [""])[0] : "";

fs.writeFileSync(saida, JSON.stringify(dados, null, 2) + "\n", "utf8");
const cont = (m) => dados[m].map((t) => t.length).join("+");
console.log("ok: " + nome + " — passivas " + cont("passivas") + ", ativas " + cont("ativas") + "; intro " + dados.introducao.length + " parágrafos; destaque: " + (dados.destaque ? dados.destaque.titulo : "nenhum"));
