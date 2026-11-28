/* Tira os comentários do código que vai para o site e deixa só marcações curtas.
   Uso como módulo:  const { limparCss, limparJs, limparHtml, marcarHtml } = require("./limpar");
   Uso na linha de comando (reescreve os arquivos):  node weebly/limpar.js arquivo.js arquivo.css arquivo.html */

const fs = require("fs");
const path = require("path");

const arrumarLinhas = (texto) => texto.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";

/* CSS: some tudo, menos os títulos de seção (barras e asteriscos com traços), que viram um título curto em minúsculas */
const limparCss = (css) =>
  arrumarLinhas(
    css.replace(/\/\*[\s\S]*?\*\//g, (comentario) => {
      const titulo = comentario.match(/^\/\*\s*-{3,}\s*([\s\S]+?)\s*-{3,}\s*\*\/$/);
      if (!titulo) return "";
      const nome = titulo[1].replace(/\s+/g, " ").split(" (")[0].trim();
      return "/* " + nome.charAt(0).toLowerCase() + nome.slice(1) + " */";
    }),
  );

/* JS: percorre o texto sabendo o que é string, template e regex, e remove só os comentários de verdade */
const limparJs = (js) => {
  const n = js.length;
  let i = 0;
  let saida = "";
  let ultimo = ""; /* último caractere útil fora de comentário: decide entre divisão e regex */

  const copiarString = (aspa) => {
    saida += js[i++];
    while (i < n && js[i] !== aspa) {
      if (js[i] === "\\") saida += js[i++];
      saida += js[i++];
    }
    saida += js[i++] || "";
    ultimo = aspa;
  };

  const copiarRegex = () => {
    saida += js[i++];
    let classe = false;
    while (i < n) {
      const c = js[i];
      if (c === "\\") {
        saida += c + js[i + 1];
        i += 2;
        continue;
      }
      if (c === "[") classe = true;
      else if (c === "]") classe = false;
      saida += c;
      i++;
      if (c === "/" && !classe) break;
    }
    while (/[a-z]/i.test(js[i] || "")) saida += js[i++];
    ultimo = ")";
  };

  const copiarTemplate = () => {
    saida += js[i++];
    while (i < n && js[i] !== "`") {
      if (js[i] === "\\") {
        saida += js[i++] + (js[i++] || "");
      } else if (js[i] === "$" && js[i + 1] === "{") {
        saida += "${";
        i += 2;
        varrer(true);
      } else {
        saida += js[i++];
      }
    }
    saida += js[i++] || "";
    ultimo = "`";
  };

  /* dentroDeTemplate: estamos num ${ } e paramos no } que o fecha */
  const varrer = (dentroDeTemplate) => {
    let chaves = 0;
    while (i < n) {
      const c = js[i];
      const d = js[i + 1];
      if (c === "/" && d === "/") {
        while (i < n && js[i] !== "\n") i++;
      } else if (c === "/" && d === "*") {
        const fim = js.indexOf("*/", i + 2);
        i = fim < 0 ? n : fim + 2;
      } else if (c === '"' || c === "'") {
        copiarString(c);
      } else if (c === "`") {
        copiarTemplate();
      } else if (c === "/") {
        if (/[\w)\]}$]/.test(ultimo)) {
          saida += js[i++];
          ultimo = "/";
        } else {
          copiarRegex();
        }
      } else if (c === "{") {
        chaves++;
        saida += js[i++];
        ultimo = "{";
      } else if (c === "}") {
        if (dentroDeTemplate && chaves === 0) {
          saida += js[i++];
          return;
        }
        chaves = Math.max(0, chaves - 1);
        saida += js[i++];
        ultimo = "}";
      } else {
        saida += js[i++];
        if (!/\s/.test(c)) ultimo = c;
      }
    }
  };

  varrer(false);
  return arrumarLinhas(saida);
};

/* HTML: tira todos os comentários (as marcações de seção entram depois, por marcarHtml) */
const limparHtml = (html) => arrumarLinhas(html.replace(/<!--[\s\S]*?-->[ \t]*\n?/g, ""));

/* Coloca uma marcação curta antes de cada bloco principal, com a mesma indentação do bloco */
const marcarHtml = (html, marcas) => {
  let saida = html;
  for (const [padrao, nome] of marcas) {
    saida = saida.replace(new RegExp("^([ \\t]*)(" + padrao + ")", "m"), (todo, recuo, bloco) => recuo + "<!-- " + nome + " -->\n" + recuo + bloco);
  }
  return saida;
};

module.exports = { limparCss, limparJs, limparHtml, marcarHtml };

if (require.main === module) {
  for (const arquivo of process.argv.slice(2)) {
    const ext = path.extname(arquivo);
    const texto = fs.readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
    const novo = ext === ".css" ? limparCss(texto) : ext === ".js" ? limparJs(texto) : limparHtml(texto);
    fs.writeFileSync(arquivo, novo, "utf8");
    console.log("limpo:", arquivo);
  }
}
