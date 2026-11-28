(function () {
  "use strict";

  function criar(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function paragrafos(pai, texto, classe) {
    String(texto || "")
      .split(/\n\n+/)
      .forEach(function (p) {
        pai.appendChild(criar("p", classe, p));
      });
  }

  function guardar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {}
  }
  function ler(chave) {
    try {
      return JSON.parse(localStorage.getItem(chave));
    } catch (e) {
      return null;
    }
  }

  function montar(raiz, d) {
    var baseIcones = (raiz.getAttribute("data-fonte") || "").replace(/[^/]*$/, "") + "icones/";
    var CHAVE = "aj-deus-" + d.id;
    var salvo = ler(CHAVE) || {};
    var ultimo = d.servicos.length - 1;
    var estado = {
      nivel: typeof salvo.nivel === "number" ? Math.min(salvo.nivel, ultimo) : ultimo,
      marcadas: new Set(salvo.marcadas || []),
      selecionada: null,
      vista: "passivas",
    };
    var nos = {};

    raiz.textContent = "";
    raiz.classList.add("deus--pronto");

    var cabeca = criar("header", "deus__cabeca");
    if (d.estandarte) {
      var img = criar("img", "deus__estandarte");
      img.alt = "Estandarte de " + d.nome;
      img.src = d.estandarte;
      cabeca.appendChild(img);
    }
    var ident = criar("div", "deus__ident");
    ident.appendChild(criar("h2", "deus__nome", d.nome));
    if (d.titulo) ident.appendChild(criar("p", "deus__titulo", d.titulo));
    if (d.dominios && d.dominios.length) {
      var dom = criar("ul", "deus__dominios");
      d.dominios.forEach(function (x) {
        dom.appendChild(criar("li", null, x));
      });
      ident.appendChild(dom);
    }
    cabeca.appendChild(ident);
    raiz.appendChild(cabeca);

    var quadro = criar("figure", "quadro quadro--deus");
    quadro.setAttribute("aria-hidden", d.imagem ? "false" : "true");
    if (d.imagem) quadro.style.setProperty("--ilustracao", 'url("' + d.imagem + '")');
    raiz.appendChild(quadro);

    var texto = criar("div", "deus__texto");
    (d.introducao || []).forEach(function (p) {
      texto.appendChild(criar("p", null, p));
    });
    raiz.appendChild(texto);

    if (d.destaque) {
      var dest = criar("aside", "deus__destaque");
      dest.appendChild(criar("h3", null, d.destaque.titulo));
      paragrafos(dest, d.destaque.texto);
      raiz.appendChild(dest);
    }

    var arvore = criar("section", "arvore");
    arvore.setAttribute("aria-label", "Árvore de habilidades de " + d.nome);
    var controle = criar("div", "arvore__controle");
    controle.appendChild(criar("span", "arvore__rotulo", "Anos de serviço"));
    var grupo = criar("div", "arvore__niveis");
    grupo.setAttribute("role", "radiogroup");
    grupo.setAttribute("aria-label", "Anos de serviço");
    var curtos = ["Probatio", "1º", "2º", "3º", "4º", "5º"];
    d.servicos.forEach(function (nome, i) {
      var b = criar("button", "arvore__nivel", curtos[i] || nome);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.title = nome;
      b.addEventListener("click", function () {
        estado.nivel = i;
        atualizar();
        var linha = linhas[i];
        if (linha) linha.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      grupo.appendChild(b);
    });
    controle.appendChild(grupo);
    arvore.appendChild(controle);

    var abas = criar("div", "arvore__abas");
    ["passivas", "ativas"].forEach(function (v) {
      var b = criar("button", "arvore__aba", v === "passivas" ? "Passivas" : "Ativas");
      b.type = "button";
      b.dataset.vista = v;
      b.addEventListener("click", function () {
        estado.vista = v;
        atualizar();
      });
      abas.appendChild(b);
    });
    arvore.appendChild(abas);

    var grade = criar("div", "arvore__grade");
    var linhas = [];
    var topo = [
      criar("h4", "arvore__coluna arvore__coluna--passivas", "Habilidades passivas"),
      criar("span", "arvore__vazio"),
      criar("h4", "arvore__coluna arvore__coluna--ativas", "Habilidades ativas"),
    ];
    topo.forEach(function (e) {
      grade.appendChild(e);
    });

    d.servicos.forEach(function (serv, t) {
      var cp = criar("div", "arvore__celula arvore__celula--passivas");
      var rot = criar("div", "arvore__servico");
      rot.appendChild(criar("span", null, serv));
      var ca = criar("div", "arvore__celula arvore__celula--ativas");
      [
        ["passivas", cp],
        ["ativas", ca],
      ].forEach(function (par) {
        var lista = d[par[0]][t] || [];
        if (!lista.length) {
          par[1].classList.add("arvore__celula--vazia");
          par[1].appendChild(
            criar(
              "p",
              "arvore__nada",
              par[0] === "ativas"
                ? "Nenhuma habilidade ativa neste serviço."
                : "Nenhuma habilidade passiva neste serviço.",
            ),
          );
        }
        lista.forEach(function (h) {
          var b = criar("button", "no");
          b.type = "button";
          b.dataset.id = h.id;
          if (h.icone) {
            var moldura = criar("span", "no__icone");
            var fig = new Image();
            fig.src = baseIcones + h.icone;
            fig.alt = "";
            fig.loading = "lazy";
            moldura.appendChild(fig);
            b.appendChild(moldura);
          }
          b.appendChild(criar("span", "no__nome", h.nome));
          if (h.grau) b.appendChild(criar("span", "no__grau", h.grau));
          b.appendChild(criar("span", "no__marca", "★"));
          b.addEventListener("click", function () {
            selecionar(h.id);
          });
          par[1].appendChild(b);
          nos[h.id] = { dado: h, botao: b, tipo: par[0], servico: t };
        });
      });
      grade.appendChild(cp);
      grade.appendChild(rot);
      grade.appendChild(ca);
      linhas[t] = rot;
    });

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "arvore__ligacoes");
    svg.setAttribute("aria-hidden", "true");
    grade.insertBefore(svg, grade.firstChild);
    arvore.appendChild(grade);

    var detalhe = criar("div", "arvore__detalhe");
    detalhe.setAttribute("aria-live", "polite");

    var SUAVE = "cubic-bezier(0.165, 0.84, 0.44, 1)";
    var ANIMA =
      !!detalhe.animate &&
      !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var origem = null;
    var animFundo = null;
    var animCaixa = null;

    function pararAnimacoes() {
      if (animFundo) animFundo.cancel();
      if (animCaixa) animCaixa.cancel();
      animFundo = animCaixa = null;
    }

    function sobreOrigem() {
      if (!origem) return null;
      var a = origem.getBoundingClientRect();
      var b = detalhe.getBoundingClientRect();
      if (!a.width || !b.width) return null;
      return (
        "translate(" +
        (a.left + a.width / 2 - (b.left + b.width / 2)) +
        "px, " +
        (a.top + a.height / 2 - (b.top + b.height / 2)) +
        "px) scale(" +
        Math.max(a.width / b.width, 0.08) +
        ")"
      );
    }

    function abrirAnimado() {
      if (!ANIMA) return;
      pararAnimacoes();
      var de = sobreOrigem();
      if (!de) return;
      animFundo = janela.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: SUAVE });
      animCaixa = detalhe.animate(
        [
          { transform: de, opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 280, easing: SUAVE },
      );
    }

    var janela = criar("div", "arvore__janela");
    janela.hidden = true;
    detalhe.setAttribute("role", "dialog");
    janela.appendChild(detalhe);
    arvore.appendChild(janela);
    function fechar() {
      var acabar = function () {
        estado.selecionada = null;
        origem = null;
        atualizar();
      };
      var para = ANIMA && !janela.hidden ? sobreOrigem() : null;
      if (!para) return acabar();
      pararAnimacoes();

      animFundo = janela.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 220,
        easing: SUAVE,
        fill: "forwards",
      });
      animCaixa = detalhe.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: para, opacity: 0 },
        ],
        { duration: 220, easing: SUAVE, fill: "forwards" },
      );
      animFundo.onfinish = acabar;
    }
    janela.addEventListener("click", function (e) {
      if (e.target === janela) fechar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !janela.hidden) fechar();
    });

    raiz.appendChild(arvore);

    function pais(tipo, t, h, i) {
      if (t === 0) return [];
      var anteriores = d[tipo][t - 1] || [];
      if (!anteriores.length) {
        for (var k = t - 2; k >= 0; k--)
          if ((d[tipo][k] || []).length) {
            anteriores = d[tipo][k];
            break;
          }
      }
      var mesmo = anteriores.filter(function (x) {
        return x.nome === h.nome;
      });
      if (mesmo.length) return mesmo;
      if (tipo === "ativas" && anteriores.length === (d[tipo][t] || []).length) return [anteriores[i]];
      return anteriores;
    }

    function linhaSvg(d2, classe) {
      var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
      l.setAttribute("d", d2);
      l.setAttribute("class", classe);
      return l;
    }

    function desenhar() {
      var caixa = grade.getBoundingClientRect();
      svg.setAttribute("width", caixa.width);
      svg.setAttribute("height", caixa.height);
      svg.setAttribute("viewBox", "0 0 " + caixa.width + " " + caixa.height);
      svg.textContent = "";
      ["passivas", "ativas"].forEach(function (tipo) {
        d[tipo].forEach(function (tier, t) {
          var apagada = t > estado.nivel ? " arvore__linha--apagada" : "";

          if (tipo === "passivas" && tier.length > 1) {
            for (var i = 0; i < tier.length - 1; i++) {
              var ea = nos[tier[i].id].botao,
                eb = nos[tier[i + 1].id].botao;
              if (!ea.offsetParent || !eb.offsetParent) continue;
              var ra = ea.getBoundingClientRect(),
                rb = eb.getBoundingClientRect();
              var ic = ea.querySelector(".no__icone");
              var meioY = ra.top - caixa.top + (ic ? ic.getBoundingClientRect().height / 2 : 28);
              svg.appendChild(
                linhaSvg(
                  "M" + (ra.right - caixa.left) + " " + meioY + " H" + (rb.left - caixa.left),
                  "arvore__linha arvore__linha--irmas" + apagada,
                ),
              );
            }
          }

          tier.forEach(function (h, i) {
            var filho = nos[h.id].botao;
            if (!filho.offsetParent) return;
            var f = filho.getBoundingClientRect();
            var rota = tipo === "ativas" ? " arvore__linha--rota" : "";
            pais(tipo, t, h, i).forEach(function (p) {
              var pai = nos[p.id].botao;
              if (!pai.offsetParent) return;
              var a = pai.getBoundingClientRect();
              var x1 = a.left + a.width / 2 - caixa.left;
              var y1 = a.bottom - caixa.top;
              var x2 = f.left + f.width / 2 - caixa.left;
              var y2 = f.top - caixa.top;
              var caminho =
                Math.abs(x1 - x2) < 2
                  ? "M" + x1 + " " + y1 + " V" + y2
                  : "M" + x1 + " " + y1 + " V" + (y1 + y2) / 2 + " H" + x2 + " V" + y2;
              svg.appendChild(linhaSvg(caminho, "arvore__linha" + rota + apagada));
            });
          });
        });
      });
    }

    function selecionar(id) {
      var alvo = nos[id] && nos[id].botao;
      origem = (alvo && alvo.querySelector(".no__icone")) || alvo;
      estado.selecionada = id;
      atualizar();
    }

    function desenharDetalhe() {
      detalhe.textContent = "";
      var n = nos[estado.selecionada];
      var estavaFechada = janela.hidden;
      janela.hidden = !n;
      if (!n) return;
      detalhe.className = "arvore__detalhe";
      var x = criar("button", "detalhe__fechar", "×");
      x.type = "button";
      x.setAttribute("aria-label", "Fechar");
      x.addEventListener("click", fechar);
      detalhe.appendChild(x);
      var h = n.dado;
      var liberada = n.servico <= estado.nivel;
      var cab = criar("div", "detalhe__cabeca");
      if (h.icone) {
        var mold = criar("span", "detalhe__icone");
        var fi = new Image();
        fi.src = baseIcones + h.icone;
        fi.alt = "";
        mold.appendChild(fi);
        cab.appendChild(mold);
      }
      cab.appendChild(criar("h4", "detalhe__nome", h.nome + (h.grau ? " " + h.grau : "")));
      var chips = criar("div", "detalhe__chips");
      chips.appendChild(criar("span", "chip chip--" + n.tipo, n.tipo === "passivas" ? "Passiva" : "Ativa"));
      chips.appendChild(criar("span", "chip", d.servicos[n.servico]));
      if (h.reposicao) chips.appendChild(criar("span", "chip chip--tempo", "Reposição: " + h.reposicao));
      cab.appendChild(chips);
      detalhe.appendChild(cab);
      var corpo = criar("div", "detalhe__texto");
      paragrafos(corpo, h.texto);
      detalhe.appendChild(corpo);
      var rodape = criar("div", "detalhe__rodape");
      if (n.tipo === "ativas") {
        var marcada = estado.marcadas.has(h.id);
        var b = criar(
          "button",
          "botao" + (marcada ? " botao--ativo" : ""),
          marcada ? "★ Marcada na sua árvore" : "☆ Marcar na minha árvore",
        );
        b.type = "button";
        b.setAttribute("aria-pressed", marcada ? "true" : "false");
        if (!liberada) {
          b.disabled = true;
          b.title = "Disponível a partir de: " + d.servicos[n.servico];
        }
        b.addEventListener("click", function () {
          if (estado.marcadas.has(h.id)) estado.marcadas["delete"](h.id);
          else estado.marcadas.add(h.id);
          atualizar();
        });
        rodape.appendChild(b);
        if (!liberada)
          rodape.appendChild(criar("span", "detalhe__aviso", "Libera em: " + d.servicos[n.servico]));
      } else {
        rodape.appendChild(
          criar(
            "span",
            "detalhe__aviso",
            liberada ? "Já liberada com esses anos de serviço." : "Libera em: " + d.servicos[n.servico],
          ),
        );
      }
      detalhe.appendChild(rodape);
      if (estavaFechada) abrirAnimado();
    }

    function atualizar() {
      grade.dataset.vista = estado.vista;
      Array.prototype.forEach.call(grupo.children, function (b, i) {
        b.setAttribute("aria-checked", i === estado.nivel ? "true" : "false");
        b.classList.toggle("arvore__nivel--ativo", i === estado.nivel);
        if (linhas[i]) linhas[i].classList.toggle("arvore__servico--atual", i === estado.nivel);
      });
      Array.prototype.forEach.call(abas.children, function (b) {
        b.classList.toggle("arvore__aba--ativa", b.dataset.vista === estado.vista);
        b.setAttribute("aria-pressed", b.dataset.vista === estado.vista ? "true" : "false");
      });
      Object.keys(nos).forEach(function (id) {
        var n = nos[id];
        var liberada = n.servico <= estado.nivel;
        n.botao.classList.toggle("no--bloqueado", !liberada);
        n.botao.classList.toggle("no--liberado", liberada && n.tipo === "passivas");
        n.botao.classList.toggle("no--marcado", estado.marcadas.has(id));
        n.botao.classList.toggle("no--selecionado", id === estado.selecionada);
        n.botao.setAttribute("aria-pressed", id === estado.selecionada ? "true" : "false");
        n.botao.title = n.dado.nome + (n.dado.grau ? " " + n.dado.grau : "") + " — " + d.servicos[n.servico];
      });
      desenharDetalhe();
      guardar(CHAVE, { nivel: estado.nivel, marcadas: Array.from(estado.marcadas) });
      desenhar();
    }

    atualizar();
    window.addEventListener("resize", desenhar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhar);
    if (window.ResizeObserver) new ResizeObserver(desenhar).observe(grade);
  }

  function iniciar() {
    var itens = document.querySelectorAll(".deus[data-fonte], .deus[data-base]");
    Array.prototype.forEach.call(itens, function (raiz) {
      if (!raiz.getAttribute("data-fonte")) {
        var qual =
          (location.search.match(/[?&]deus=([a-z0-9-]+)/i) || [])[1] ||
          raiz.getAttribute("data-padrao") ||
          "jupiter";
        raiz.setAttribute("data-fonte", raiz.getAttribute("data-base") + qual + ".json");
      }
      fetch(raiz.getAttribute("data-fonte"))
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          montar(raiz, d);
        })
        .catch(function () {
          raiz.textContent = "Não foi possível carregar esta página agora.";
        });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
