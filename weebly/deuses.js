/* Página de um deus: abertura, árvore de habilidades (passivas e ativas por serviço) e simulador.
   Uso: <div class="deus" data-fonte="URL do jupiter.json"></div> + este script.
   As ligações da árvore saem dos dados: uma habilidade com o mesmo nome no serviço anterior é a
   "evolução" dela; sem isso, ela liga a todas as habilidades do serviço anterior. */
(function () {
  "use strict";

  function criar(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function paragrafos(pai, texto, classe) {
    String(texto || "").split(/\n\n+/).forEach(function (p) { pai.appendChild(criar("p", classe, p)); });
  }

  function guardar(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {} }
  function ler(chave) { try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; } }

  function montar(raiz, d) {
    var CHAVE = "aj-deus-" + d.id;
    var salvo = ler(CHAVE) || {};
    var ultimo = d.servicos.length - 1;
    var estado = {
      nivel: typeof salvo.nivel === "number" ? Math.min(salvo.nivel, ultimo) : ultimo,
      marcadas: new Set(salvo.marcadas || []),
      selecionada: null,
      vista: "passivas"
    };
    var nos = {}; /* id -> { dado, botao, tipo, servico } */

    raiz.textContent = "";
    raiz.classList.add("deus--pronto");

    /* ---------- abertura ---------- */
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
      d.dominios.forEach(function (x) { dom.appendChild(criar("li", null, x)); });
      ident.appendChild(dom);
    }
    cabeca.appendChild(ident);
    raiz.appendChild(cabeca);

    var texto = criar("div", "deus__texto");
    (d.introducao || []).forEach(function (p) { texto.appendChild(criar("p", null, p)); });
    raiz.appendChild(texto);

    if (d.destaque) {
      var dest = criar("aside", "deus__destaque");
      dest.appendChild(criar("h3", null, d.destaque.titulo));
      paragrafos(dest, d.destaque.texto);
      raiz.appendChild(dest);
    }

    /* ---------- árvore ---------- */
    var arvore = criar("section", "arvore");
    arvore.setAttribute("aria-label", "Árvore de habilidades de " + d.nome);
    arvore.appendChild(criar("h3", "arvore__titulo", "Árvore de habilidades"));
    arvore.appendChild(criar("p", "arvore__ajuda", "Toque numa habilidade para ler os detalhes. Escolha os anos de serviço para ver o que cada fase libera e marque as ativas que quer comprar."));

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
      b.addEventListener("click", function () { estado.nivel = i; atualizar(); });
      grupo.appendChild(b);
    });
    controle.appendChild(grupo);
    arvore.appendChild(controle);

    var abas = criar("div", "arvore__abas");
    ["passivas", "ativas"].forEach(function (v) {
      var b = criar("button", "arvore__aba", v === "passivas" ? "Passivas" : "Ativas");
      b.type = "button";
      b.dataset.vista = v;
      b.addEventListener("click", function () { estado.vista = v; atualizar(); });
      abas.appendChild(b);
    });
    arvore.appendChild(abas);

    var grade = criar("div", "arvore__grade");
    var topo = [criar("h4", "arvore__coluna arvore__coluna--passivas", "Habilidades passivas"), criar("span", "arvore__vazio"), criar("h4", "arvore__coluna arvore__coluna--ativas", "Habilidades ativas")];
    topo.forEach(function (e) { grade.appendChild(e); });

    d.servicos.forEach(function (serv, t) {
      var cp = criar("div", "arvore__celula arvore__celula--passivas");
      var rot = criar("div", "arvore__servico");
      rot.appendChild(criar("span", null, serv));
      var ca = criar("div", "arvore__celula arvore__celula--ativas");
      [["passivas", cp], ["ativas", ca]].forEach(function (par) {
        (d[par[0]][t] || []).forEach(function (h) {
          var b = criar("button", "no");
          b.type = "button";
          b.dataset.id = h.id;
          b.appendChild(criar("span", "no__nome", h.nome));
          if (h.grau) b.appendChild(criar("span", "no__grau", h.grau));
          b.appendChild(criar("span", "no__marca", "★"));
          b.addEventListener("click", function () { selecionar(h.id); });
          par[1].appendChild(b);
          nos[h.id] = { dado: h, botao: b, tipo: par[0], servico: t };
        });
      });
      grade.appendChild(cp);
      grade.appendChild(rot);
      grade.appendChild(ca);
    });

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "arvore__ligacoes");
    svg.setAttribute("aria-hidden", "true");
    grade.insertBefore(svg, grade.firstChild);
    arvore.appendChild(grade);

    var detalhe = criar("div", "arvore__detalhe");
    detalhe.setAttribute("aria-live", "polite");
    /* o detalhe abre como janela por cima da árvore */
    var janela = criar("div", "arvore__janela");
    janela.hidden = true;
    detalhe.setAttribute("role", "dialog");
    janela.appendChild(detalhe);
    arvore.appendChild(janela);
    function fechar() { estado.selecionada = null; atualizar(); }
    janela.addEventListener("click", function (e) { if (e.target === janela) fechar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !janela.hidden) fechar(); });

    var resumo = criar("div", "arvore__resumo");
    arvore.appendChild(resumo);
    raiz.appendChild(arvore);

    /* ---------- ligações ---------- */
    function pais(tipo, t, h) {
      if (t === 0) return [];
      var anteriores = d[tipo][t - 1] || [];
      var mesmo = anteriores.filter(function (x) { return x.nome === h.nome; });
      return mesmo.length ? mesmo : anteriores;
    }

    function desenhar() {
      var caixa = grade.getBoundingClientRect();
      svg.setAttribute("width", caixa.width);
      svg.setAttribute("height", caixa.height);
      svg.setAttribute("viewBox", "0 0 " + caixa.width + " " + caixa.height);
      svg.textContent = "";
      ["passivas", "ativas"].forEach(function (tipo) {
        d[tipo].forEach(function (tier, t) {
          tier.forEach(function (h) {
            var filho = nos[h.id].botao;
            if (!filho.offsetParent) return;
            var f = filho.getBoundingClientRect();
            pais(tipo, t, h).forEach(function (p) {
              var pai = nos[p.id].botao;
              if (!pai.offsetParent) return;
              var a = pai.getBoundingClientRect();
              var x1 = a.left + a.width / 2 - caixa.left;
              var y1 = a.bottom - caixa.top;
              var x2 = f.left + f.width / 2 - caixa.left;
              var y2 = f.top - caixa.top;
              var meio = (y1 + y2) / 2;
              var linha = document.createElementNS("http://www.w3.org/2000/svg", "path");
              linha.setAttribute("d", "M" + x1 + " " + y1 + " V" + meio + " H" + x2 + " V" + y2);
              linha.setAttribute("class", "arvore__linha" + (t > estado.nivel ? " arvore__linha--apagada" : ""));
              svg.appendChild(linha);
            });
          });
        });
      });
    }

    /* ---------- detalhe ---------- */
    function selecionar(id) {
      estado.selecionada = id;
      atualizar();
    }

    function desenharDetalhe() {
      detalhe.textContent = "";
      var n = nos[estado.selecionada];
      var estavaFechada = janela.hidden;
      janela.hidden = !n;
      if (!n) { janela.classList.remove("arvore__janela--abrindo"); return; }
      if (estavaFechada) { janela.classList.remove("arvore__janela--abrindo"); void janela.offsetWidth; janela.classList.add("arvore__janela--abrindo"); }
      detalhe.className = "arvore__detalhe";
      var x = criar("button", "detalhe__fechar", "×");
      x.type = "button";
      x.setAttribute("aria-label", "Fechar");
      x.addEventListener("click", fechar);
      detalhe.appendChild(x);
      var h = n.dado;
      var liberada = n.servico <= estado.nivel;
      var cab = criar("div", "detalhe__cabeca");
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
        var b = criar("button", "botao" + (marcada ? " botao--ativo" : ""), marcada ? "★ Marcada na sua árvore" : "☆ Marcar na minha árvore");
        b.type = "button";
        b.setAttribute("aria-pressed", marcada ? "true" : "false");
        if (!liberada) { b.disabled = true; b.title = "Disponível a partir de: " + d.servicos[n.servico]; }
        b.addEventListener("click", function () {
          if (estado.marcadas.has(h.id)) estado.marcadas["delete"](h.id); else estado.marcadas.add(h.id);
          atualizar();
        });
        rodape.appendChild(b);
        if (!liberada) rodape.appendChild(criar("span", "detalhe__aviso", "Libera em: " + d.servicos[n.servico]));
      } else {
        rodape.appendChild(criar("span", "detalhe__aviso", liberada ? "Já liberada com esses anos de serviço." : "Libera em: " + d.servicos[n.servico]));
      }
      detalhe.appendChild(rodape);
    }

    /* ---------- resumo ---------- */
    function textoResumo() {
      var pas = [], ati = [];
      d.passivas.forEach(function (tier, t) { if (t <= estado.nivel) tier.forEach(function (h) { pas.push(h.nome); }); });
      d.ativas.forEach(function (tier) { tier.forEach(function (h) { if (estado.marcadas.has(h.id)) ati.push(h.nome + (h.grau ? " " + h.grau : "")); }); });
      return d.nome + " — até " + d.servicos[estado.nivel] + "\nPassivas: " + (pas.join(", ") || "nenhuma") + "\nAtivas: " + (ati.join(", ") || "nenhuma marcada");
    }

    function desenharResumo() {
      resumo.textContent = "";
      resumo.appendChild(criar("h4", "resumo__titulo", "Sua árvore"));
      var linhas = textoResumo().split("\n");
      resumo.appendChild(criar("p", "resumo__linha resumo__linha--destaque", linhas[0]));
      resumo.appendChild(criar("p", "resumo__linha", linhas[1]));
      resumo.appendChild(criar("p", "resumo__linha", linhas[2]));
      var acoes = criar("div", "resumo__acoes");
      var copiar = criar("button", "botao", "Copiar lista");
      copiar.type = "button";
      copiar.addEventListener("click", function () {
        var t = textoResumo();
        function ok() { copiar.textContent = "Copiado ✓"; setTimeout(function () { copiar.textContent = "Copiar lista"; }, 1800); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () {});
        else { var a = criar("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); ok(); } catch (e) {} a.remove(); }
      });
      var limpar = criar("button", "botao botao--discreto", "Limpar marcações");
      limpar.type = "button";
      limpar.addEventListener("click", function () { estado.marcadas.clear(); atualizar(); });
      acoes.appendChild(copiar);
      acoes.appendChild(limpar);
      resumo.appendChild(acoes);
    }

    /* ---------- atualizar tudo ---------- */
    function atualizar() {
      grade.dataset.vista = estado.vista;
      Array.prototype.forEach.call(grupo.children, function (b, i) {
        b.setAttribute("aria-checked", i === estado.nivel ? "true" : "false");
        b.classList.toggle("arvore__nivel--ativo", i === estado.nivel);
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
      desenharResumo();
      guardar(CHAVE, { nivel: estado.nivel, marcadas: Array.from(estado.marcadas) });
      desenhar();
    }

    atualizar();
    window.addEventListener("resize", desenhar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhar);
    if (window.ResizeObserver) new ResizeObserver(desenhar).observe(grade);
  }

  function iniciar() {
    var itens = document.querySelectorAll(".deus[data-fonte]");
    Array.prototype.forEach.call(itens, function (raiz) {
      fetch(raiz.getAttribute("data-fonte"))
        .then(function (r) { return r.json(); })
        .then(function (d) { montar(raiz, d); })
        .catch(function () { raiz.textContent = "Não foi possível carregar esta página agora."; });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
