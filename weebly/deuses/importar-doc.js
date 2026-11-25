/* Converte o texto exportado do Google Docs (uma aba por deus) nos JSON de weebly/deuses/.
   Uso:  node weebly/deuses/importar-doc.js <todos.txt>
   O arquivo tem "@@@DEUS <nome>" antes do texto de cada aba. */

const fs = require("fs");
const path = require("path");

const entrada = process.argv[2];
if (!entrada) { console.error("uso: node importar-doc.js <todos.txt>"); process.exit(1); }

const ESTANDARTES = require("./estandartes.json");

const ehMaiuscula = (l) => l === l.toUpperCase() && /[A-ZÀ-Ú]/.test(l);
const MINUSCULAS = new Set(["do", "da", "de", "dos", "das", "e", "o", "a", "os", "as", "em", "no", "na"]);
const titulo = (s) => s.toLowerCase().split(" ")
  .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))).join(" ");
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ROMANO = ["", "I", "II", "III", "IV", "V", "VI"];
const SERVICOS = ["Probatio", "Primeiro serviço", "Segundo serviço", "Terceiro serviço", "Quarto serviço", "Quinto serviço"];

const indiceServico = (l) => {
  const t = l.replace(/★/g, "").trim().toUpperCase();
  if (t === "PROBATIO") return 0;
  const m = ["PRIMEIRO", "SEGUNDO", "TERCEIRO", "QUARTO", "QUINTO"].findIndex((p) => t.startsWith(p + " SERVIÇO"));
  return m >= 0 ? m + 1 : -1;
};

function converter(nome, texto) {
  const linhas = texto.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const d = {
    id: slug(nome), nome: nome, estandarte: ESTANDARTES[nome] || "", titulo: "",
    introducao: [], destaque: null, servicos: SERVICOS,
    passivas: SERVICOS.map(() => []), ativas: SERVICOS.map(() => []),
  };

  let i = 0;
  while (i < linhas.length && !ehMaiuscula(linhas[i])) d.introducao.push(linhas[i++]);
  const abreArvore = (l) => /^HABILIDADES/.test(l) || (l.indexOf("★") >= 0 && indiceServico(l) >= 0);
  if (i < linhas.length && !abreArvore(linhas[i])) {
    const t = linhas[i++];
    const corpo = [];
    while (i < linhas.length && !abreArvore(linhas[i])) corpo.push(linhas[i++]);
    if (corpo.length) d.destaque = { titulo: titulo(t), texto: corpo.join("\n\n") };
  }

  let modo = null, servico = 0, atual = null;
  const vistas = { passivas: {}, ativas: {} };
  const fechar = () => {
    if (!atual || !modo) { atual = null; return; }
    const n = (vistas[modo][atual.nome] = (vistas[modo][atual.nome] || 0) + 1);
    atual.grau = "";
    atual._ordem = n;
    d[modo][servico].push(atual);
    atual = null;
  };

  for (; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^HABILIDADES PASSIVAS/.test(l)) { fechar(); modo = "passivas"; servico = 0; continue; }
    if (/^HABILIDADES ATIVAS/.test(l)) { fechar(); modo = "ativas"; servico = 0; continue; }
    const s = indiceServico(l);
    if (!modo) { if (s >= 0 && l.includes("★")) modo = "passivas"; else continue; }
    if (s >= 0 && l.includes("★")) { fechar(); servico = s; continue; }
    const rep = l.match(/^Tempo de Reposição:\s*(.+)$/i);
    if (rep) { if (atual) atual.reposicao = rep[1].replace(/\.$/, ""); continue; }
    const tipo = l.match(/^Habilidade (Passiva|Ativa)\s*(.*)$/);
    if (tipo) { if (atual && tipo[2]) atual.texto = tipo[2]; continue; }
    if (ehMaiuscula(l) && l.length < 60) { fechar(); atual = { nome: titulo(l), texto: "" }; continue; }
    if (atual) atual.texto = atual.texto ? atual.texto + "\n\n" + l : l;
  }
  fechar();

  for (const m of ["passivas", "ativas"]) {
    const total = {};
    d[m].flat().forEach((h) => { total[h.nome] = (total[h.nome] || 0) + 1; });
    d[m].forEach((tier, t) => tier.forEach((h) => {
      if (total[h.nome] > 1) h.grau = ROMANO[h._ordem];
      delete h._ordem;
      h.id = slug(h.nome + (h.grau ? " " + h.grau : "") + " " + m.charAt(0));
      if (!h.reposicao) delete h.reposicao;
      h.servico = t;
    }));
  }
  return d;
}

const bruto = fs.readFileSync(entrada, "utf8").replace(/^\uFEFF/, "");
const blocos = bruto.split("@@@DEUS ").slice(1);
const ids = [];
for (const b of blocos) {
  const quebra = b.indexOf("\n");
  const nome = b.slice(0, quebra).trim();
  const d = converter(nome, b.slice(quebra + 1));
  const alvo = path.join(__dirname, d.id + ".json");
  /* mantém o que já foi revisado à mão (ícones, imagem) */
  if (fs.existsSync(alvo)) {
    const antigo = JSON.parse(fs.readFileSync(alvo, "utf8"));
    if (antigo.imagem) d.imagem = antigo.imagem;
    if (antigo.titulo) d.titulo = antigo.titulo;
    const icones = {};
    ["passivas", "ativas"].forEach((m) => (antigo[m] || []).forEach((t) => t.forEach((h) => { if (h.icone) icones[h.id] = h.icone; })));
    ["passivas", "ativas"].forEach((m) => d[m].forEach((t) => t.forEach((h) => { if (icones[h.id]) h.icone = icones[h.id]; })));
  }
  fs.writeFileSync(alvo, JSON.stringify(d, null, 2) + "\n", "utf8");
  ids.push(d.id);
  const c = (m) => d[m].map((t) => t.length).join("+");
  console.log(d.id.padEnd(12) + " passivas " + c("passivas").padEnd(14) + " ativas " + c("ativas") +
    (d.estandarte ? "" : "   SEM ESTANDARTE") + (d.destaque ? "" : "   sem destaque"));
}
fs.writeFileSync(path.join(__dirname, "lista.json"), JSON.stringify(ids, null, 2) + "\n", "utf8");
console.log("\n" + ids.length + " deuses: " + ids.join(", "));
