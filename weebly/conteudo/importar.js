/* Converte o texto dos documentos do Google (veja weebly/LEIAME.md) no HTML das páginas.
   Uso:  node weebly/conteudo/importar.js <docs.txt>
   O arquivo tem "@@@DOC <primeira linha>" antes do texto de cada documento. */

const fs = require("fs");
const path = require("path");

const entrada = process.argv[2];
if (!entrada) { console.error("uso: node importar.js <docs.txt>"); process.exit(1); }

const AQUI = __dirname;
const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ehTitulo = (l) => l === l.toUpperCase() && /[A-ZÀ-Ú]/.test(l) && l.length < 75;
const MINUSCULAS = new Set(["do", "da", "de", "dos", "das", "e", "o", "a", "os", "as", "em", "no", "na"]);
const comoNome = (s) => s.toLowerCase().split(" ")
  .map((w, i) => (i > 0 && MINUSCULAS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");

const bruto = fs.readFileSync(entrada, "utf8").replace(/^\uFEFF/, "").replace(/\r/g, "");
const docs = {};
for (const bloco of bruto.split("@@@DOC ").slice(1)) {
  const quebra = bloco.indexOf("\n");
  docs[bloco.slice(0, quebra).trim()] = bloco.slice(quebra + 1).split("\n").map((l) => l.trim()).filter(Boolean);
}
const achar = (trecho) => {
  const k = Object.keys(docs).find((x) => x.indexOf(trecho) >= 0);
  if (!k) throw new Error("não achei o documento que começa com: " + trecho);
  return docs[k];
};

/* ---------- blocos de HTML ---------- */
const p = (t) => "    <p>" + escapar(t) + "</p>";
const secao = (titulo, miolo) =>
  '  <section class="pagina__secao">\n    <h2 class="pagina__titulo">' + escapar(titulo) + "</h2>\n" +
  miolo.join("\n") + "\n  </section>";
const item = (nome, preco, corpo) =>
  '    <div class="item">\n      <h3 class="item__nome">' + escapar(nome) +
  (preco ? ' <span class="item__preco">' + escapar(preco) + "</span>" : "") + "</h3>\n" +
  corpo.map((t) => "      <p>" + escapar(t) + "</p>").join("\n") + "\n    </div>";

/* ---------- Mercado (com o Relicário dentro) ---------- */
function mercado() {
  const linhas = achar("PERÍCIA COM ARMA EXÓTICA");
  /* a partir dos exclusivos por deus é a parte de extras, que não entra */
  const corte = linhas.findIndex((l) => /^ÁGUAS DO ESQUECIMENTO/.test(l));
  const uteis = corte > 0 ? linhas.slice(0, corte) : linhas;

  const precoNo = /^(.+?)\s+—\s+(\$[0-9]+(?:\s+ou\s+\S+)?|PREÇO VARIÁVEL|MERECIMENTO.*)$/;
  const itens = [];
  let atual = null;
  for (const l of uteis) {
    const m = l.match(precoNo);
    if (m && ehTitulo(m[1])) { if (atual) itens.push(atual); atual = { nome: m[1].trim(), preco: m[2].trim(), corpo: [], graus: [] }; continue; }
    if (!atual) continue;
    if (ehTitulo(l) && /SERVIÇO|PROBATIO/.test(l)) { atual.graus.push({ nome: l, corpo: [] }); continue; }
    if (atual.graus.length) atual.graus[atual.graus.length - 1].corpo.push(l);
    else atual.corpo.push(l);
  }
  if (atual) itens.push(atual);

  const blocos = itens.map((it) => {
    const corpo = it.corpo.map((t) => "      <p>" + escapar(t) + "</p>");
    for (const g of it.graus) {
      corpo.push('      <p class="item__grau">' + escapar(comoNome(g.nome)) + "</p>");
      corpo.push(...g.corpo.map((t) => "      <p>" + escapar(t) + "</p>"));
    }
    return '    <div class="item">\n      <h3 class="item__nome">' + escapar(it.nome) +
      ' <span class="item__preco">' + escapar(it.preco) + "</span></h3>\n" + corpo.join("\n") + "\n    </div>";
  });

  /* Relicário: intro e depois "NOME 25 denários" */
  const rel = achar("Sob a Principia");
  const intro = [];
  let i = 0;
  while (i < rel.length && !/\d+\s+den[áa]rios/i.test(rel[i])) intro.push(rel[i++]);
  const relicas = [];
  let r = null;
  for (; i < rel.length; i++) {
    const m = rel[i].match(/^(.+?)\s+(\d+\s+den[áa]rios)$/i);
    if (m) { if (r) relicas.push(r); r = { nome: m[1].trim(), preco: m[2], corpo: [] }; continue; }
    if (r) r.corpo.push(rel[i]);
  }
  if (r) relicas.push(r);

  return [
    secao("Mercado", blocos),
    secao("Relicário", intro.map(p).concat(relicas.map((x) => item(x.nome, x.preco, x.corpo)))),
  ].join("\n\n") + "\n";
}

/* ---------- Legados ---------- */
function legados() {
  const linhas = achar("No contexto mitológico");
  const intro = [];
  let i = 0;
  while (i < linhas.length && !ehTitulo(linhas[i])) intro.push(linhas[i++]);

  const tipos = [];
  while (i < linhas.length && /^LEGADO /.test(linhas[i])) {
    const t = { nome: linhas[i++], corpo: [] };
    while (i < linhas.length && !ehTitulo(linhas[i])) t.corpo.push(linhas[i++]);
    tipos.push(t);
  }

  const gentes = [];
  while (i < linhas.length) {
    if (!/^GENS /.test(linhas[i])) { i++; continue; }
    const g = { nome: linhas[i++], de: "", deus: "", corpo: [], dons: [] };
    /* as duas linhas seguintes são a ascendência e o deus, em maiúsculas ou não */
    for (let k = 0; k < 2 && i < linhas.length; k++) {
      if (/^DESCENDENTES DE |^Descendentes de /.test(linhas[i])) g.de = linhas[i++];
      else if (/^LEGADOS DE |^Legados de /.test(linhas[i])) g.deus = linhas[i++];
    }
    while (i < linhas.length && !/^GENS /.test(linhas[i])) {
      const l = linhas[i];
      if (/^(Relíquia|Dom Familiar|Maldição)$/.test(l)) {
        const dom = { nome: g.corpo.pop() || "", tipo: l, corpo: [] };
        i++;
        while (i < linhas.length && !/^GENS /.test(linhas[i]) && !/^(Relíquia|Dom Familiar|Maldição)$/.test(linhas[i])) {
          if (linhas[i].length < 60 && i + 1 < linhas.length && /^(Relíquia|Dom Familiar|Maldição)$/.test(linhas[i + 1])) break;
          dom.corpo.push(linhas[i++]);
        }
        g.dons.push(dom);
        continue;
      }
      g.corpo.push(linhas[i++]);
    }
    gentes.push(g);
  }

  const blocos = [secao("Legados", intro.map(p))];
  blocos.push(secao("Tipos de legado", tipos.map((t) =>
    item(comoNome(t.nome), "", t.corpo))));
  for (const g of gentes) {
    const miolo = [];
    const linha = [g.de, g.deus].filter(Boolean).join(" · ");
    if (linha) miolo.push('    <p class="pagina__linhagem">' + escapar(linha.replace(/·/g, "—")) + "</p>");
    miolo.push(...g.corpo.map(p));
    for (const d of g.dons) miolo.push(item(d.nome, d.tipo, d.corpo));
    blocos.push(secao(comoNome(g.nome), miolo));
  }
  return blocos.join("\n\n") + "\n";
}

fs.writeFileSync(path.join(AQUI, "mercado.html"), mercado(), "utf8");
fs.writeFileSync(path.join(AQUI, "legados.html"), legados(), "utf8");
for (const f of ["mercado.html", "legados.html"]) {
  const t = fs.readFileSync(path.join(AQUI, f), "utf8");
  console.log(f + ": " + t.length + " caracteres, " + (t.match(/<section/g) || []).length + " seções, " +
    (t.match(/class="item"/g) || []).length + " itens");
}
