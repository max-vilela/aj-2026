/* Gera os arquivos do site para o Weebly a partir do que já existe em tumblr/.
   Uso (na raiz do repositório):  node weebly/montar.js
   Saídas, todas dentro de weebly/:
     style.css            CSS único (tumblr/style.css + ajustes do Panteão e da gaveta)
     site.js              scripts compartilhados (menu, Panteão, gaveta, voltar ao topo)
     carregamento.js      tela de carregamento da página inicial, com redirect
     tema/no-header.html  template do tema (cabeçalho, menu, Panteão, gaveta e rodapé, uma vez só)
     paginas/*.html       conteúdo de cada página, para colar num elemento "Embed Code"
     preview/*.html       páginas montadas, para conferir localmente */

const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const TAG = "v3";
const CDN = "https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@" + TAG + "/weebly";

const ler = (p) => fs.readFileSync(path.join(RAIZ, p), "utf8").replace(/\r\n/g, "\n");
const gravar = (p, texto) => {
  const alvo = path.join(RAIZ, p);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.writeFileSync(alvo, texto, "utf8");
};
const entre = (texto, ini, fim, de = 0) => {
  const a = texto.indexOf(ini, de);
  if (a < 0) throw new Error("não achei: " + ini);
  const b = texto.indexOf(fim, a + ini.length);
  if (b < 0) throw new Error("não achei: " + fim);
  return { a, b, miolo: texto.slice(a + ini.length, b), fimTotal: b + fim.length };
};

const PAGINAS = [
  ["inicio", "Início", "Boas-vindas ao Acampamento Júpiter: o que é o RPG, como começar e onde encontrar cada informação."],
  ["trama", "Trama", "A história central do Acampamento Júpiter e o ponto de partida da campanha."],
  ["ambientacao", "Ambientação", "O mundo do RPG: Nova Roma, o acampamento e as terras ao redor."],
  ["cronologia", "Cronologia", ""],
  ["sistemas", "Sistemas", "As regras de combate, progressão e economia do RPG."],
  ["guias", "Guias", "Passo a passo para criar o personagem e começar a jogar."],
  ["olimpiadas", "Olimpíadas", "Os jogos e as competições entre as coortes."],
  ["legados", "Legados", "Quem são os legados e como suas linhagens funcionam no acampamento."],
  ["coortes", "Coortes", "As cinco coortes da Duodécima Legião e o que cada uma representa."],
  ["senado", "Senado", "O Senado de Nova Roma, os pretores e as decisões que moldam o acampamento."],
  ["bestiario", "Bestiário", "Monstros e criaturas que ameaçam semideuses e legionários."],
  ["arsenal", "Arsenal", "Armas, armaduras e equipamentos da Legião."],
  ["conquistas", "Conquistas", "Marcos, honrarias e feitos dos jogadores."],
  ["formularios", "Formulários", "Fichas e formulários para participar do RPG."],
  ["nucleos", "Núcleos", "Os núcleos e grupos de jogadores dentro do acampamento."],
  ["agradecimentos", "Agradecimentos", "Créditos e agradecimentos a quem ajudou a construir o acampamento."],
];

/* ---------- entradas ---------- */
const base = ler("tumblr/prototipos/inicio-gaveta.html");
const original = ler("tumblr/tema-original.html");
const cssTumblr = ler("tumblr/style.css");
const temaRaiz = ler("tumblr/tema.html");

/* ---------- CSS ---------- */
const cssExtra = entre(base, "<style>\n", "\n  </style>").miolo
  .split("\n").map((l) => (l.startsWith("    ") ? l.slice(4) : l)).join("\n");
const cssWeebly = `
/* ---------- Ajustes do Weebly ---------- */
.conteudo { display: block; }

/* ---------- Tipografia combinada em 12/10 ----------
   Cinzel Decorative só no título principal, Cinzel nos títulos e menus, Libre Caslon Text no texto. */
:root { --fonte-texto: "Libre Caslon Text", Georgia, "Times New Roman", serif; }
body { font-size: 1rem; font-weight: 400; }
.ano__titulo { font-family: var(--fonte-titulo); font-weight: 600; }
.topo__titulo {
  padding-left: 0.06em;
  font-family: "Cinzel Decorative", var(--fonte-titulo);
  font-weight: 700;
  font-size: clamp(1.4rem, 2.8vw, 2.5rem);
  letter-spacing: 0.06em;
}

/* O Weebly aplica a fonte do tema (Quicksand) com !important em tudo dentro de #wsite-content,
   onde entra o conteúdo das páginas. Estas regras (mais específicas) devolvem a fonte do site. */
#wsite-content .ano__titulo { font-family: var(--fonte-titulo) !important; font-weight: 600 !important; font-size: clamp(2.3rem, 4vw, 3rem) !important; }
#wsite-content .ano__texto p { font-family: inherit !important; font-size: inherit !important; }
.weebly-rodape { padding: 1rem 1rem 2rem; text-align: center; font-size: 0.8rem; color: var(--tinta-suave); }
.weebly-rodape a { color: inherit; }
`;
gravar("weebly/style.css", cssTumblr.trimEnd() + "\n\n/* ---------- Ajustes das páginas (Panteão em imagem, gaveta do menu) ---------- */\n" + cssExtra.trim() + "\n" + cssWeebly + "\n" + ler("weebly/deuses.css"));

/* ---------- scripts ---------- */
const siteJs = `/* Scripts compartilhados do site: marca a página atual no menu, fecha janelas com Esc,
   mostra o botão de voltar ao topo e o medalhão do menu depois de rolar um pouco. */
(function () {
  function marcarPaginaAtual() {
    var atual = window.location.pathname;
    var links = document.querySelectorAll(".menu a, .gaveta__lista a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("href") === atual) links[i].setAttribute("aria-current", "page");
    }
  }

  function iniciar() {
    marcarPaginaAtual();

    var panteao = document.getElementById("panteao");
    var gaveta = document.getElementById("gaveta");
    var medalhao = document.querySelector(".gaveta__botao");
    var voltar = document.getElementById("voltar-topo");

    function atualizar() {
      var rolou = window.pageYOffset >= 400;
      if (voltar) voltar.classList.toggle("oculto", !rolou);
      if (medalhao) medalhao.classList.toggle("oculto", !rolou && !(gaveta && gaveta.checked));
    }
    window.addEventListener("scroll", atualizar, { passive: true });
    if (gaveta) gaveta.addEventListener("change", atualizar);
    atualizar();

    var irPanteao = document.querySelector(".gaveta__panteao");
    if (irPanteao) {
      irPanteao.addEventListener("click", function () {
        if (gaveta) { gaveta.checked = false; atualizar(); }
      });
      /* o Panteão é um <label>, então o teclado precisa de ajuda para abri-lo */
      irPanteao.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (panteao) panteao.checked = true;
        if (gaveta) { gaveta.checked = false; atualizar(); }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (panteao && panteao.checked) panteao.checked = false;
      if (gaveta && gaveta.checked) { gaveta.checked = false; atualizar(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
`;
gravar("weebly/site.js", siteJs);

/* tela de carregamento: pega o script já pronto da raiz do Tumblr e troca o destino */
let scriptCarregamento = entre(temaRaiz, "<script>\n", "\n  </script>").miolo;
scriptCarregamento = scriptCarregamento
  .split("\n").map((l) => (l.startsWith("    ") ? l.slice(4) : l)).join("\n");
if (!scriptCarregamento.includes('window.location.replace("/inicio")')) throw new Error("redirect não encontrado");
scriptCarregamento = scriptCarregamento.replace(
  /var fontes = \[[^\]]*\];/,
  'var fontes = ["600 1em Cinzel", "700 1em \'Cinzel Decorative\'", "400 1em \'Libre Caslon Text\'", "italic 400 1em \'Libre Caslon Text\'"];'
);
scriptCarregamento = scriptCarregamento.replace(
  'window.location.replace("/inicio");',
  'window.location.replace(window.AJ_DESTINO || "/inicio.html");'
);
const carregamentoJs = `/* Tela de carregamento da página inicial. Termina levando para a página Início.
   No editor do Weebly (a página roda dentro de um iframe) ela não faz nada, para não tirar o editor do lugar. */
if (window.top === window.self) {
${scriptCarregamento.split("\n").map((l) => (l ? "  " + l : l)).join("\n")}
}
`;
gravar("weebly/carregamento.js", carregamentoJs);

const achouCarregamento = temaRaiz.match(/<div class="carregamento"[\s\S]*?carregamento__texto">Carregando<\/p>\s*<\/div>/);
if (!achouCarregamento) throw new Error("html da tela de carregamento não encontrado");
const htmlCarregamento = achouCarregamento[0].replace(/\n\s*<!--[\s\S]*?-->/g, "");

/* ---------- template do tema ---------- */
const corpoBase = entre(base, '<body id="topo">\n', "</body>").miolo;
let corpo = corpoBase.replace(/\s*<script>[\s\S]*?<\/script>/g, "");
const ol = entre(corpo, '<ol class="anais">', "</ol>");
corpo = corpo.slice(0, ol.a) + '{{#sections}}\n        <div class="conteudo">{content}</div>\n      {{/sections}}' + corpo.slice(ol.fimTotal);
const SLUGS = PAGINAS.map((p) => p[0]);
for (const s of SLUGS) corpo = corpo.split('href="/' + s + '"').join('href="/' + s + '.html"');
corpo = corpo.split(' aria-current="page"').join("");
/* Panteão: Júpiter já tem página */
corpo = corpo.replace(/<li><a href="#">(<img src="https:\/\/i\.imgur\.com\/ZLWBOzS\.png"[^>]*><span>Júpiter<\/span>)<\/a><\/li>/, '<li><a href="/jupiter.html">$1</a></li>');
corpo = corpo.replace(/<!--[\s\S]*?-->\n?\s*/g, (m) => (m.includes("Janela do Panteão") || m.includes("gaveta") ? m : ""));
corpo = corpo.replace(/\n{3,}/g, "\n\n");
/* O Weebly usa toda <img src> do HTML como og:image (pré-visualização de links). Para o link mostrar só o
   brasão, as imagens do tema vão em data-src e um script curto liga o src no navegador. */
corpo = corpo.replace(/<img ([^>]*?)src="/g, '<img $1data-src="');
/* Subtítulo do cabeçalho */
if (!corpo.includes("</h1>")) throw new Error("h1 não encontrado");
corpo = corpo.replace("</h1>", '</h1>\n      <p class="topo__subtitulo">A Renascença</p>');

const cabecaFontes = [
  '  <link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&display=swap">',
].join("\n");

const montarTema = (css, js) => `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=1280" />
${cabecaFontes}
  <link rel="stylesheet" href="${css}">
  <script src="${js}" defer></script>
</head>
<body id="topo">
${corpo.trimEnd()}

  <div class="weebly-rodape">{footer}</div>

  <script>for (var i = 0, m = document.images; i < m.length; i++) m[i].dataset.src && (m[i].src = m[i].dataset.src);</script>

  <div id="navMobile" class="nav mobile-nav" style="display: none">{menu}</div>

  <script type="text/javascript" src="/files/theme/plugins.js"></script>
  <script type="text/javascript" src="/files/theme/custom.js"></script>
</body>
</html>
`;
gravar("weebly/tema/no-header.html", montarTema(CDN + "/style.css", CDN + "/site.js"));

/* ---------- conteúdo das páginas ---------- */
const textoProvisorio = "Texto provisório. O conteúdo definitivo desta seção ainda está sendo escrito pela equipe do acampamento e será publicado em breve. Enquanto isso, acompanhe as novidades pela página inicial e pelos avisos do RPG.";
const emBreve = "Este espaço vai reunir as informações principais do tema, organizadas em parágrafos curtos e acompanhadas de uma ilustração na moldura acima. Volte em alguns dias para conferir a versão completa.";
const listaPlaceholder = (titulo, descricao) => `<ol class="anais">
  <li class="ano" id="secao-1">
    <figure class="quadro" aria-hidden="true"></figure>
    <h2 class="ano__titulo">${titulo}</h2>
    <div class="ano__texto">
      <p>${descricao}</p>
      <p>${textoProvisorio}</p>
    </div>
  </li>

  <li class="ano" id="secao-2">
    <figure class="quadro" aria-hidden="true"></figure>
    <h2 class="ano__titulo">Em breve</h2>
    <div class="ano__texto">
      <p>${emBreve}</p>
    </div>
  </li>
</ol>
`;
const olCronologia = entre(original, '<ol class="anais">', "</ol>");
const listaCronologia = '<ol class="anais">' + olCronologia.miolo.split("\n").map((l) => (l.startsWith("      ") ? l.slice(6) : l)).join("\n") + "</ol>\n";

const conteudos = {};
for (const [slug, titulo, descricao] of PAGINAS) {
  conteudos[slug] = slug === "cronologia" ? listaCronologia : listaPlaceholder(titulo, descricao);
  gravar("weebly/paginas/" + slug + ".html", conteudos[slug]);
}
const htmlHome = `${htmlCarregamento}
<script src="${CDN}/carregamento.js"></script>
`;
gravar("weebly/paginas/home.html", htmlHome);

/* páginas dos deuses: um div com o JSON de dados + o script que monta a árvore */
const DEUSES = ["jupiter"];
const embedDeus = (id, base, estilo) => `<div class="deus"${estilo ? ` data-estilo="${estilo}"` : ""} data-fonte="${base}/deuses/${id}.json"></div>\n<script src="${base}/deuses.js"></script>\n`;
for (const id of DEUSES) gravar("weebly/paginas/" + id + ".html", embedDeus(id, CDN, "menu"));

/* ---------- prévia local ---------- */
const temaPrevia = montarTema("../style.css", "../site.js")
  .replace(/\{\{#sections\}\}[\s\S]*?\{\{\/sections\}\}/, "@@CONTEUDO@@")
  .replace("{footer}", "Rodapé do Weebly (exemplo)");
const previaPagina = (conteudo) => {
  let t = temaPrevia.replace("@@CONTEUDO@@", '<div class="conteudo">' + conteudo + "</div>");
  for (const s of SLUGS.concat(DEUSES)) t = t.split('href="/' + s + '.html"').join('href="/weebly/preview/' + s + '.html"');
  return t;
};
for (const slug of SLUGS) gravar("weebly/preview/" + slug + ".html", previaPagina(conteudos[slug]));
for (const id of DEUSES) gravar("weebly/preview/" + id + ".html", previaPagina(embedDeus(id, "..", "menu")));
const previaHome = previaPagina(
  htmlCarregamento + '\n<script>window.AJ_DESTINO = "/weebly/preview/inicio.html";</script>\n<script src="../carregamento.js"></script>'
);
gravar("weebly/preview/home.html", previaHome);

console.log("ok: " + SLUGS.length + " páginas + home; css " + fs.statSync(path.join(RAIZ, "weebly/style.css")).size + " bytes");
