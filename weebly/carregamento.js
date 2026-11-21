/* Tela de carregamento da página inicial. Termina levando para a página Início.
   No editor do Weebly (a página roda dentro de um iframe) ela não faz nada, para não tirar o editor do lugar. */
if (window.top === window.self) {
  /* Tela de carregamento: o site só abre depois que fontes e imagens principais chegarem.
     Se o script não rodar, a classe "carregando" nunca é ligada e o site abre direto. */
  (function () {
    var raiz = document.documentElement;
    raiz.classList.add("carregando");

    var ANOS_NA_ESPERA = 2;    /* ilustrações de ano esperadas antes de abrir (2016, 2017...); as outras carregam depois */
    var TEMPO_MINIMO = 5500;   /* ms: a tela fica pelo menos este tempo, para dar para ler as frases */
    var TROCA_FRASE = 2800;    /* ms entre uma frase e outra */
    var TEMPO_MAXIMO = 15000;  /* ms: abre mesmo se alguma imagem travar */

    var estilo = getComputedStyle(raiz);
    function endereco(nome) {
      var m = estilo.getPropertyValue(nome).match(/url\(["']?([^"')]+)/);
      return m ? m[1] : null;
    }

    var principais = ["pergaminho", "topo", "brasao", "divisor", "moldura", "estandarte",
      "colunata-esq", "colunas-dir", "louro-esq", "louro-dir"].map(function (n) { return "--img-" + n; });
    var anos = [];
    for (var a = 2016; a <= 2026; a++) anos.push("--img-" + a);

    var enderecos = principais.concat(anos.slice(0, ANOS_NA_ESPERA)).map(endereco)
      .filter(function (url, i, lista) { return url && lista.indexOf(url) === i; });

    var fontes = ["600 1em Cinzel", "700 1em 'Cinzel Decorative'", "400 1em 'Libre Caslon Text'", "italic 400 1em 'Libre Caslon Text'"];

    var total = enderecos.length + fontes.length;
    var feitos = 0;
    var aberto = false;
    var inicio = Date.now();

    /* Frases curtas sobre o Acampamento Júpiter nos livros de Rick Riordan (resumos, não trechos copiados) */
    var FRASES = [
      ["Dois pretores guiam as cinco coortes da Duodécima Legião.", "O Filho de Netuno"],
      ["Escondida pela Névoa nas colinas de Oakland, uma cidade romana prospera.", "Heróis do Olimpo"],
      ["Lupa, a loba de Roma, treina os jovens semideuses antes de eles chegarem ao acampamento.", "O Filho de Netuno"],
      ["O Pequeno Tibre marca a fronteira entre o acampamento e o mundo lá fora.", "O Filho de Netuno"],
      ["Terminus, o deus das fronteiras, vigia o limite sagrado de Nova Roma.", "A Marca de Atena"],
      ["No Campo de Marte, os legionários se preparam nos Jogos de Guerra.", "O Filho de Netuno"],
      ["Na Festa de Fortuna, em 24 de junho, o acampamento pede um ano de boa sorte.", "O Filho de Netuno"],
      ["Por séculos, gregos e romanos foram mantidos longe uns dos outros.", "Heróis do Olimpo"],
      ["Cada coorte guarda a própria história de honra, disciplina e sacrifício.", "Heróis do Olimpo"],
      ["Senatus Populusque Romanus: o Senado e o Povo de Roma.", "O lema da Legião"]
    ];
    var fraseAtual = Math.floor(Math.random() * FRASES.length);

    function escreverFrase() {
      var caixa = document.getElementById("carregamento-frase");
      if (!caixa) return;
      var f = FRASES[fraseAtual % FRASES.length];
      caixa.innerHTML = "";
      var q = document.createElement("q"); q.textContent = f[0];
      var c = document.createElement("cite"); c.textContent = f[1];
      caixa.appendChild(q); caixa.appendChild(c);
    }

    function trocarFrase() {
      var caixa = document.getElementById("carregamento-frase");
      if (!caixa || aberto) return;
      caixa.classList.add("trocando");
      setTimeout(function () {
        fraseAtual++;
        escreverFrase();
        caixa.classList.remove("trocando");
      }, 500);
    }

    /* A barra acompanha o menor entre o progresso real e o tempo mínimo, então anda de forma contínua */
    function mostrarProgresso() {
      var tela = document.getElementById("carregamento");
      if (!tela) return;
      var real = feitos / total;
      var tempo = Math.min(1, (Date.now() - inicio) / TEMPO_MINIMO);
      tela.style.setProperty("--progresso", Math.max(0.04, Math.min(real, tempo)));
    }
    document.addEventListener("DOMContentLoaded", function () {
      escreverFrase();
      mostrarProgresso();
      setInterval(function () { mostrarProgresso(); }, 120);
      setInterval(trocarFrase, TROCA_FRASE);
    });

    function concluido() {
      feitos++;
      mostrarProgresso();
    }

    function carregarImagem(url) {
      return new Promise(function (ok) {
        var img = new Image();
        img.onload = img.onerror = function () { concluido(); ok(); };
        img.src = url;
      });
    }

    function carregarFonte(descricao) {
      var p = document.fonts && document.fonts.load ? document.fonts.load(descricao) : Promise.resolve();
      return p.catch(function () {}).then(concluido);
    }

    function abrir() {
      if (aberto) return;
      aberto = true;
      window.location.replace(window.AJ_DESTINO || "/inicio.html");  /* termina o carregamento e leva para a página inicial */
    }

    Promise.all(enderecos.map(carregarImagem).concat(fontes.map(carregarFonte))).then(function () {
      setTimeout(abrir, Math.max(0, TEMPO_MINIMO - (Date.now() - inicio)));
    });
    setTimeout(abrir, TEMPO_MAXIMO);
  })();
}
