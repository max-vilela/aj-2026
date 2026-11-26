/* Publica o site no Weebly sem clicar à mão.
   Uso:
     node weebly/publicar/publicar.js --conferir   só abre e diz o que encontrou
     node weebly/publicar/publicar.js              faz tema + header code + página do Panteão e publica
     node weebly/publicar/publicar.js --sem-publicar   faz tudo menos apertar Publish

   Usa o Chrome já instalado, com um perfil próprio em weebly/publicar/perfil (fora do git).
   Na primeira vez a janela abre no login do Weebly: entre uma vez e o perfil guarda a sessão,
   então o seu Chrome do dia a dia pode continuar aberto. */

const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const AQUI = __dirname;
const RAIZ = path.resolve(AQUI, "..", "..");
const PERFIL = path.join(AQUI, "perfil");
const EDITOR = "https://www.weebly.com/editor/main.php";

const ler = (p) => fs.readFileSync(path.join(RAIZ, p), "utf8");
const conferir = process.argv.includes("--conferir");
const semPublicar = process.argv.includes("--sem-publicar");
const passo = (t) => console.log("\n• " + t);
const ok = (t) => console.log("  ✓ " + t);

async function esperarEditor(page) {
  passo("Abrindo o editor do Weebly");
  await page.goto(EDITOR, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 60; i++) {
    const temMenu = await page.getByRole("link", { name: "Theme", exact: true }).count()
      .catch(() => 0);
    const temTexto = await page.locator("text=Theme").count().catch(() => 0);
    if (temMenu || temTexto) { ok("editor carregado"); return true; }
    if (i === 0) console.log("  … se aparecer a tela de login, entre na janela que abriu; eu espero.");
    await page.waitForTimeout(5000);
  }
  throw new Error("o editor não carregou em cinco minutos");
}

/* O editor de código do tema guarda o valor num CodeMirror; mexer por JS não salva,
   então o texto entra como digitação de verdade. */
async function escreverNoCodeMirror(page, texto) {
  const cm = page.locator(".CodeMirror").first();
  await cm.waitFor({ state: "visible", timeout: 30000 });
  await cm.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(texto);
  await page.waitForTimeout(800);
  const agora = await page.evaluate(() => {
    const e = document.querySelector(".CodeMirror");
    return e && e.CodeMirror ? e.CodeMirror.getValue() : "";
  });
  if (agora.length !== texto.length) throw new Error("o texto não entrou inteiro (" + agora.length + " de " + texto.length + ")");
}

async function abrirEditorDeCodigo(page) {
  await page.locator("text=Theme").first().click();
  await page.waitForTimeout(2500);
  await page.locator("text=Edit HTML / CSS").first().click();
  await page.locator(".CodeMirror").first().waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(1500);
}

async function salvarCodigo(page) {
  await page.locator("text=SAVE").first().click();
  await page.waitForTimeout(6000);
}

async function porTema(page, tema) {
  for (const arquivo of ["header.html", "no-header.html"]) {
    passo("Tema: " + arquivo);
    await abrirEditorDeCodigo(page);
    await page.locator("text=" + arquivo).first().click();
    await page.waitForTimeout(2500);
    await escreverNoCodeMirror(page, tema);
    await salvarCodigo(page);
    ok(arquivo + " salvo");
  }
}

async function porHeaderCode(page, sha) {
  passo("Header Code (endereço do CSS)");
  await page.locator("text=Settings").first().click();
  await page.waitForTimeout(3000);
  await page.locator("text=SEO").first().click();
  await page.waitForTimeout(3000);
  const campo = page.locator("textarea#header_code, textarea[name=header_code]").first();
  await campo.waitFor({ state: "visible", timeout: 20000 });
  const antes = await campo.inputValue();
  const depois = antes.replace(/(aj-2026@)([0-9a-f]{7,40}|v\d+)/g, "$1" + sha);
  if (antes === depois) { ok("já estava no commit certo"); return; }
  await campo.fill(depois);
  await page.locator("text=Save").last().click();
  await page.waitForTimeout(5000);
  ok("endereço atualizado");
}

async function porPaginaDoPanteao(page, embed) {
  passo("Página do Panteão (dados dos deuses)");
  await page.locator("text=Pages").first().click();
  await page.waitForTimeout(3000);
  await page.locator("text=Panteão").first().click();
  await page.waitForTimeout(8000);
  await page.locator("text=Build").first().click();
  await page.waitForTimeout(4000);

  const quadro = page.frameLocator("iframe").first();
  const alvo = quadro.locator(".wsite-multicol, .wsite-com-product, #wsite-content").first();
  await alvo.click({ position: { x: 300, y: 60 } }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.locator("text=Edit Custom HTML").first().click();
  await page.waitForTimeout(2500);

  const caixa = quadro.locator("textarea").first();
  await caixa.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(embed);
  await page.waitForTimeout(1000);
  await quadro.locator("body").click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(5000);
  ok("código da página trocado");
}

async function publicar(page) {
  passo("Publicando");
  await page.locator("text=Publish").first().click();
  await page.waitForTimeout(15000);
  const pronto = await page.locator("text=Website Published").count();
  if (!pronto) throw new Error("não vi a confirmação de publicação");
  ok("site publicado");
}

(async () => {
  const tema = ler("weebly/tema/no-header.html");
  const embed = ler("weebly/paginas/panteao.html");
  const sha = (tema.match(/aj-2026@([0-9a-f]{40})/) || [])[1];
  if (!sha) throw new Error("não achei o commit dentro do tema; rode node weebly/montar.js");
  console.log("commit do site: " + sha.slice(0, 8));

  fs.mkdirSync(PERFIL, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PERFIL, {
    channel: "chrome",
    headless: false,
    viewport: null,
    args: ["--start-maximized"],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  try {
    await esperarEditor(page);
    if (conferir) {
      passo("Conferência (nada foi alterado)");
      for (const alvo of ["Build", "Pages", "Theme", "Settings", "Publish"]) {
        const n = await page.locator("text=" + alvo).count();
        console.log("  " + (n ? "✓" : "✗") + " " + alvo + " (" + n + ")");
      }
      console.log("\n  tema: " + tema.length + " caracteres | embed: " + embed.length);
      await page.waitForTimeout(4000);
    } else {
      await porTema(page, tema);
      await porHeaderCode(page, sha);
      await porPaginaDoPanteao(page, embed);
      if (semPublicar) console.log("\n(--sem-publicar: parei antes do Publish)");
      else await publicar(page);
    }
    console.log("\npronto.");
  } finally {
    await page.waitForTimeout(2000);
    await ctx.close();
  }
})().catch((e) => { console.error("\nerro: " + e.message); process.exit(1); });
