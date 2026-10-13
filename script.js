/* =========================================================================
   Acampamento Júpiter — Guia Oficial do RPG
   script.js — interações compartilhadas por todas as páginas do site
   (menu móvel, marcação da página atual, modais, acordeões, filtro,
   barra de progresso e revelação suave ao rolar)
   ========================================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------------
     1. MENU MÓVEL (usado quando os menus laterais fixos estão escondidos)
     ----------------------------------------------------------------------- */
  var menuBtn = document.getElementById('menu-btn');
  var navMovel = document.getElementById('nav-movel');

  function fecharMenuMovel() {
    if (!navMovel) return;
    navMovel.hidden = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn && navMovel) {
    menuBtn.addEventListener('click', function () {
      var estaAberto = !navMovel.hidden;
      navMovel.hidden = estaAberto;
      menuBtn.setAttribute('aria-expanded', String(!estaAberto));
    });

    navMovel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fecharMenuMovel);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') fecharMenuMovel();
    });
  }

  /* -----------------------------------------------------------------------
     1.5 CABEÇALHO COMPACTO AO ROLAR
     Em telas largas (onde o menu hambúrguer já está escondido), o
     cabeçalho encolhe e migra para o canto ao passar de um certo ponto de
     rolagem, parando de cobrir o topo da caixa de conteúdo.
     ----------------------------------------------------------------------- */
  var topo = document.getElementById('topo');

  if (topo) {
    var LIMITE_ROLAGEM_TOPO = 60;
    var pedidoQuadro = null;

    function atualizarTopoCompacto() {
      pedidoQuadro = null;
      topo.classList.toggle('topo--compacto', window.scrollY > LIMITE_ROLAGEM_TOPO);
    }

    atualizarTopoCompacto();

    window.addEventListener('scroll', function () {
      if (pedidoQuadro === null) {
        pedidoQuadro = requestAnimationFrame(atualizarTopoCompacto);
      }
    }, { passive: true });
  }

  /* -----------------------------------------------------------------------
     2. MARCA A PÁGINA ATUAL NOS MENUS (laterais + móvel)
     ----------------------------------------------------------------------- */
  var caminhoAtual = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.lateral a, .nav-movel a').forEach(function (link) {
    var destino = link.getAttribute('href');
    if (destino === caminhoAtual) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* -----------------------------------------------------------------------
     3. DADOS DAS COORTES + RENDERIZAÇÃO (página coortes.html)
     ----------------------------------------------------------------------- */
  var coortes = [
    {
      chave: 'imperia',
      numero: 'I',
      epiteto: 'Primeira Coorte',
      nome: 'Imperia',
      cor: '#c9a227',
      lema: 'Prima imperat.',
      lemaTraducao: 'A Primeira comanda.',
      paragrafos: [
        'A Primeira Coorte reúne os legionários que demonstraram liderança, disciplina e excelência ainda durante o período de probatio. Para ingressar em suas fileiras, não basta possuir uma linhagem respeitada: é preciso apresentar grandes feitos, recomendações excepcionais e a capacidade de assumir o comando quando todos os outros hesitam. Seus membros são preparados para liderar formações, conduzir missões e representar o mais alto padrão militar da Legião.',
        'Em 2019, a Imperia liderou, ao lado da Segunda Coorte, a incursão aos Montes Apalaches. Seus legionários desceram às cavernas infestadas de Empousai, combateram durante meses na escuridão e ajudaram a libertar a rota utilizada pelos novos recrutas. A operação terminou com a destruição das principais saídas dos túneis e o aprisionamento dos monstros sobreviventes.',
        'Seu símbolo representa autoridade, conquista e responsabilidade. Seu lar protetor é Cipião Africano, general que derrotou Aníbal e personifica a excelência estratégica esperada de todo legionário da Primeira.'
      ]
    },
    {
      chave: 'vetustia',
      numero: 'II',
      epiteto: 'Segunda Coorte',
      nome: 'Vetustia',
      cor: '#9a8fae',
      lema: 'Mos maiorum.',
      lemaTraducao: 'O costume dos antepassados.',
      paragrafos: [
        'A Segunda Coorte é o reduto das antigas linhagens patrícias de Nova Roma. Todos os seus membros são legados, descendentes de semideuses e legionários que serviram à cidade ao longo das gerações. Para a Vetustia, cada integrante carrega não apenas um nome, mas também a responsabilidade de preservar a honra, os costumes e a memória de seus antepassados.',
        'Seus legionários dominam os protocolos políticos, as tradições religiosas e as leis da cidade. São frequentemente encontrados próximos ao Senado, aos templos e às instituições responsáveis pela continuidade de Nova Roma. Entretanto, sua atuação não se limita à política: em 2019, a Segunda Coorte acompanhou a Primeira nas cavernas dos Montes Apalaches, enfrentando as Empousai e ajudando a proteger os semideuses que viajavam para a Casa do Lobo.',
        'Sua lar protetora é Agripina, representação da influência familiar, da continuidade dinástica e da determinação necessária para sobreviver aos conflitos internos de Roma.'
      ]
    },
    {
      chave: 'consilia',
      numero: 'III',
      epiteto: 'Terceira Coorte',
      nome: 'Consilia',
      cor: '#3f7a8c',
      lema: 'Sapientia ducit.',
      lemaTraducao: 'A sabedoria conduz.',
      paragrafos: [
        'A Terceira Coorte abriga os sábios, estrategistas, estudiosos, engenheiros e inventores da Legião. Seus membros compreendem que uma guerra pode ser vencida antes mesmo do primeiro golpe, desde que o inimigo seja estudado e cada movimento seja cuidadosamente planejado. A prudência, a inteligência e a criatividade são suas armas mais importantes.',
        'Em 2017, a Consilia foi enviada ao Alasca para reforçar a Quinta Coorte na Operação Gelo Eterno. Diante de monstros marinhos e águas congeladas, seus legionários precisaram desenvolver estratégias capazes de enfrentar inimigos desconhecidos sob nevascas místicas. Em 2025, a coorte voltou a se destacar na campanha do Golfo do México, operando navios de guerra, balistas e armamentos incendiários contra Harpias e Sereias. Sua inteligência tática foi fundamental para romper as defesas inimigas e alcançar a Matriarca das feras.',
        'Seu símbolo representa observação, conhecimento e precisão. Seu lar guardião é Sêneca, filósofo associado à sabedoria, ao autocontrole e à capacidade de conservar a razão mesmo diante das maiores adversidades.'
      ]
    },
    {
      chave: 'invictia',
      numero: 'IV',
      epiteto: 'Quarta Coorte',
      nome: 'Invictia',
      cor: '#8b1a1a',
      lema: 'Mors ante dedecus.',
      lemaTraducao: 'Morte antes da desonra.',
      paragrafos: [
        'A Quarta Coorte é formada pelos guerreiros mais ferozes e resistentes da Duodécima Legião. Seus membros são escolhidos pela coragem demonstrada em combate, pela força para permanecer na linha de frente e pela disposição de enfrentar qualquer inimigo sem abandonar seus companheiros. Para a Invictia, recuar somente é aceitável quando faz parte de uma estratégia; render-se jamais.',
        'Em 2017, seus legionários foram enviados ao Alasca para auxiliar a Quinta Coorte contra os Hiperbóreos. Lutaram sob nevascas sobrenaturais e enfrentaram serpentes ancestrais e escorpiões marinhos gigantes. Em 2025, embarcaram com a Terceira Coorte na campanha do Golfo do México. Enquanto os estrategistas coordenavam a ofensiva, os guerreiros da Invictia sustentavam as linhas de combate, resistiam ao canto das Sereias e avançavam contra as feras até a destruição de sua Matriarca.',
        'O javali é seu animal-símbolo, representando força, resistência e coragem indomável. Seu lar protetor é Horácio Cócles, guerreiro que permaneceu sozinho diante do inimigo para proteger Roma.'
      ]
    },
    {
      chave: 'auxilia',
      numero: 'V',
      epiteto: 'Quinta Coorte',
      nome: 'Auxilia',
      cor: '#8c6239',
      lema: 'Omnes pro Roma.',
      lemaTraducao: 'Todos por Roma.',
      paragrafos: [
        'A Quinta Coorte é a mais diversa da Legião e a única que recebe estrangeiros, exilados, descendentes de povos aliados e semideuses que não pertencem às linhagens tradicionais de Nova Roma. Inspirada nas antigas tropas auxiliares, a Auxilia transforma diferentes origens, culturas e habilidades em força coletiva. Entre seus membros, o valor de um legionário é determinado por sua lealdade e por seus atos, não pela pureza de sua ascendência.',
        'Em 2016, foi a primeira coorte enviada ao Alasca durante a Operação Gelo Eterno. Seus legionários enfrentaram os Hiperbóreos praticamente sozinhos, impediram que os gigantes avançassem para o sul e sustentaram a campanha até a chegada dos reforços. A Quinta permaneceu na linha de frente durante os ataques das criaturas marinhas e participou do cerco final nas florestas congeladas do Yukon. Sua resistência permitiu a derrota do líder dos Hiperbóreos e a pacificação da fronteira norte, embora a vitória tenha custado a vida de muitos de seus integrantes.',
        'Seu animal-símbolo representa versatilidade, companheirismo e lealdade. Seu lar protetor é Estilicão, comandante de origem estrangeira que dedicou sua vida à defesa de Roma, personificando a ideia de que alguém não precisa nascer romano para lutar e morrer como um.'
      ]
    }
  ];

  var gradeCoortes = document.getElementById('grade-coortes');

  function renderizarCoortes(lista) {
    if (!gradeCoortes) return;
    gradeCoortes.innerHTML = '';

    lista.forEach(function (coorte) {
      var artigo = document.createElement('article');
      artigo.className = 'cartao-coorte reveal em-vista';

      artigo.innerHTML =
        '<span class="cartao-coorte__numero">Coorte ' + coorte.numero + ' · ' + coorte.epiteto + '</span>' +
        '<h3 class="cartao-coorte__nome">' + coorte.nome + '</h3>' +
        '<p class="cartao-coorte__descricao">' + coorte.paragrafos[0] + '</p>' +
        '<p class="cartao-coorte__lema"><em>&ldquo;' + coorte.lema + '&rdquo;</em> — ' + coorte.lemaTraducao + '</p>' +
        '<button type="button" class="cartao-coorte__mais" data-modal="' + coorte.chave + '">Ver mais</button>';

      gradeCoortes.appendChild(artigo);
    });
  }

  if (gradeCoortes) renderizarCoortes(coortes);

  /* -----------------------------------------------------------------------
     4. MODAL (locais do acampamento + lore das coortes)
     Conteúdo indexado por chave; cada entrada vira o título e o corpo em
     HTML do modal. Os gatilhos usam delegação de evento (document), então
     funcionam mesmo em cartões de coorte recriados pelo filtro.
     ----------------------------------------------------------------------- */
  var conteudosModal = {
    'principia': {
      titulo: 'Principia',
      html: '<p>Sede de comando da Legião. Ali ficam os estandartes sagrados (signa) e é onde o pretor e os oficiais reúnem-se para planejar estratégias, distribuir tarefas e receber relatórios de exploração vindos das fronteiras do vale.</p>'
    },
    'campo-marte': {
      titulo: 'Campo de Marte',
      html: '<p>O grande campo de treinamento e batalhas simuladas do acampamento. É lá que a Guerra de Bandeira mensal acontece e onde novos recrutas provam seu valor perante as coortes.</p>'
    },
    'templo-jupiter': {
      titulo: 'Templo de Júpiter',
      html: '<p>Santuário maior dedicado a Júpiter Óptimo Máximo. Juramentos de lealdade, iniciações de recrutas e cerimônias religiosas importantes acontecem sob suas colunas.</p>'
    },
    'barracas': {
      titulo: 'Barracas das Coortes',
      html: '<p>Alojamentos onde cada uma das cinco coortes vive, treina e mantém suas próprias tradições, brasões e cores — o verdadeiro lar de todo legionário em serviço ativo.</p>'
    },
    'senado': {
      titulo: 'Senado',
      html: '<p>Câmara de decisões políticas de Nova Roma. Veteranos aposentados e cidadãos se reúnem ali para debater leis, alianças e o destino de longo prazo da cidade.</p>'
    },
    'nova-roma-local': {
      titulo: 'Nova Roma',
      html: '<p>Cidade-santuário protegida pela Névoa, nos arredores do acampamento. É o único lugar do mundo onde um semideus pode envelhecer em paz, longe da fúria constante dos monstros.</p>'
    }
  };

  // acrescenta o lore de cada coorte ao mesmo dicionário do modal — o cartão
  // já mostra o primeiro parágrafo, então a janela completa o restante da
  // história (campanhas, símbolo e lar protetor) em vez de repeti-lo.
  coortes.forEach(function (coorte) {
    var corpo = coorte.paragrafos.slice(1).map(function (paragrafo) {
      return '<p>' + paragrafo + '</p>';
    }).join('');
    corpo += '<p class="modal__lema"><em>&ldquo;' + coorte.lema + '&rdquo;</em> — ' + coorte.lemaTraducao + '</p>';

    conteudosModal[coorte.chave] = {
      titulo: coorte.nome + ' — ' + coorte.epiteto,
      html: corpo,
      cor: coorte.cor
    };
  });

  var modalFundo = document.getElementById('modal-fundo');
  var modal = document.getElementById('modal');
  var modalTitulo = document.getElementById('modal-titulo');
  var modalTexto = document.getElementById('modal-texto');
  var modalFechar = document.getElementById('modal-fechar');
  var elementoAnteriorAoModal = null;

  function abrirModal(chave) {
    var dados = conteudosModal[chave];
    if (!dados || !modalFundo) return;

    elementoAnteriorAoModal = document.activeElement;
    modalTitulo.textContent = dados.titulo;
    modalTexto.innerHTML = dados.html;
    if (dados.cor) {
      modal.style.setProperty('--cor-modal', dados.cor);
    } else {
      modal.style.removeProperty('--cor-modal');
    }
    modalFundo.hidden = false;
    document.body.classList.add('bloquear-rolagem');
    modalFechar.focus();
  }

  function fecharModal() {
    if (!modalFundo) return;
    modalFundo.hidden = true;
    document.body.classList.remove('bloquear-rolagem');
    if (elementoAnteriorAoModal) elementoAnteriorAoModal.focus();
  }

  // delegação de evento: cobre também os botões "Ver mais" recriados pelo filtro de coortes
  document.addEventListener('click', function (evento) {
    var botao = evento.target.closest('[data-modal]');
    if (botao) abrirModal(botao.getAttribute('data-modal'));
  });

  if (modalFechar) modalFechar.addEventListener('click', fecharModal);

  if (modalFundo) {
    modalFundo.addEventListener('click', function (evento) {
      if (evento.target === modalFundo) fecharModal();
    });
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && modalFundo && !modalFundo.hidden) fecharModal();

    if (evento.key === 'Tab' && modalFundo && !modalFundo.hidden) {
      var focaveis = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (focaveis.length === 0) return;
      var primeiro = focaveis[0];
      var ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  });

  /* -----------------------------------------------------------------------
     5. ACORDEÕES (páginas regras.html e sistemas.html)
     ----------------------------------------------------------------------- */
  document.querySelectorAll('.acordeao__gatilho').forEach(function (gatilho) {
    gatilho.addEventListener('click', function () {
      var painel = document.getElementById(gatilho.getAttribute('aria-controls'));
      var estaAberto = gatilho.getAttribute('aria-expanded') === 'true';

      gatilho.setAttribute('aria-expanded', String(!estaAberto));
      if (painel) painel.hidden = estaAberto;
    });
  });

  /* -----------------------------------------------------------------------
     6. BARRA DE PROGRESSO (evolução de personagem, página sistemas.html)
     ----------------------------------------------------------------------- */
  var barrasProgresso = document.querySelectorAll('.barra-progresso__preenchimento');

  function animarBarra(elemento) {
    var alvo = elemento.getAttribute('data-porcentagem') || '0';
    if (prefersReducedMotion) {
      elemento.style.width = alvo + '%';
    } else {
      requestAnimationFrame(function () {
        elemento.style.width = alvo + '%';
      });
    }
  }

  /* -----------------------------------------------------------------------
     7. REVELAÇÃO SUAVE AO ROLAR A PÁGINA
     Usa IntersectionObserver; é totalmente ignorada se o usuário preferir
     menos movimento, ou se o navegador não suportar a API.
     ----------------------------------------------------------------------- */
  var elementosReveal = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    elementosReveal.forEach(function (el) { el.classList.add('em-vista'); });
    barrasProgresso.forEach(animarBarra);
  } else {
    var observador = new IntersectionObserver(
      function (entradas, obs) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('em-vista');
            if (entrada.target.classList.contains('barra-progresso__preenchimento')) {
              animarBarra(entrada.target);
            }
            obs.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elementosReveal.forEach(function (el) { observador.observe(el); });
    barrasProgresso.forEach(function (el) { observador.observe(el); });
  }

  /* -----------------------------------------------------------------------
     8. TRADUÇÃO ANIMADA (latim → português)
     Os textos em latim ficam em latim.js (window.AJ_LATIM). O HTML continua
     todo em português: leitores de tela, buscadores e quem está sem JavaScript
     veem sempre o português. Aqui o script só "encena": troca o começo de cada
     trecho pelo latim e o traduz letra a letra; ao terminar, devolve o DOM
     exatamente como estava.
       - Cabeçalho e menus animam uma vez por sessão (não a cada página).
       - O conteúdo do capítulo anima quando entra na tela. Nos parágrafos, só
         a abertura vem em latim; o restante surge palavra por palavra.
       - Clique ou tecla encerra as animações em andamento.
       - Respeita prefers-reduced-motion e o botão "Tradução animada" do rodapé.
     ----------------------------------------------------------------------- */
  var LATIM = window.AJ_LATIM || [];
  var LETRAS_LATIM = 'abcdefghilmnopqrstuvx';
  var latimAtivo = true;
  var itensLatim = [];       // todos os trechos preparados
  var ativosLatim = [];      // trechos em animação agora
  var quadroLatim = null;
  var observadorLatim = null;
  var ultimoInicioLatim = 0;
  var filaLatim = 0;

  try { latimAtivo = localStorage.getItem('aj-latim') !== 'off'; } catch (erro) { /* sem armazenamento: fica ligado */ }

  function jaVistoNaSessao(chave) {
    try { return sessionStorage.getItem(chave) === '1'; } catch (erro) { return false; }
  }
  function marcarVistoNaSessao(chave) {
    try { sessionStorage.setItem(chave, '1'); } catch (erro) { /* tudo bem */ }
  }

  var mapaExato = {};
  var listaPrefixos = [];
  LATIM.forEach(function (entrada) {
    if (entrada[2]) {
      listaPrefixos.push({ chave: entrada[0], latim: entrada[1], palavras: entrada[0].split(' ').length });
    } else {
      mapaExato[entrada[0]] = entrada[1];
    }
  });
  // chaves mais longas primeiro, para a abertura mais específica vencer
  listaPrefixos.sort(function (a, b) { return b.chave.length - a.chave.length; });

  function normalizarTexto(texto) {
    return texto.replace(/\s+/g, ' ').trim();
  }

  // devolve { latim, palavras } se este texto tem tradução (inteira ou só da abertura)
  function procurarLatim(texto) {
    var t = normalizarTexto(texto);
    if (!t) return null;
    if (Object.prototype.hasOwnProperty.call(mapaExato, t)) {
      return { latim: mapaExato[t], palavras: t.split(' ').length };
    }
    for (var i = 0; i < listaPrefixos.length; i++) {
      var p = listaPrefixos[i];
      if (t.length > p.chave.length && t.indexOf(p.chave) === 0 &&
          !/[A-Za-zÀ-ÿ0-9]/.test(t.charAt(p.chave.length))) {
        return { latim: p.latim, palavras: p.palavras };
      }
    }
    return null;
  }

  function coletarNosDeTexto(raiz) {
    var lista = [];
    if (!raiz) return lista;
    var andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null, false);
    var no;
    while ((no = andador.nextNode())) {
      if (!/\S/.test(no.nodeValue)) continue;
      var pai = no.parentNode;
      if (!pai || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(pai.nodeName)) continue;
      if (pai.closest && pai.closest('.latim-wrap, .modal-fundo')) continue;
      lista.push(no);
    }
    return lista;
  }

  // índice logo depois da n-ésima palavra de s
  function fimDaPalavra(s, n) {
    var re = /\S+/g, m, i = 0;
    while ((m = re.exec(s))) {
      i++;
      if (i === n) return m.index + m[0].length;
    }
    return s.length;
  }

  function letraAleatoria(c) {
    if (!/[A-Za-zÀ-ÿ]/.test(c)) return c;
    var l = LETRAS_LATIM.charAt(Math.floor(Math.random() * LETRAS_LATIM.length));
    return (c === c.toUpperCase() && c !== c.toLowerCase()) ? l.toUpperCase() : l;
  }

  // troca o nó de texto por: [espaço inicial] [abertura em latim] [resto]
  function montarItemLatim(plano) {
    var bruto = plano.no.nodeValue;
    var inicio = bruto.search(/\S/);
    var fim = fimDaPalavra(bruto, plano.achado.palavras);
    var item = {
      pt: bruto.slice(inicio, fim),
      la: plano.achado.latim,
      original: bruto,
      pai: plano.pai,
      bloco: plano.bloco,
      estado: 'espera'
    };
    var envoltorio = document.createElement('span');
    envoltorio.className = 'latim-wrap';
    var leitor = document.createElement('span');          // o português, só para leitores de tela
    leitor.className = 'visually-hidden';
    leitor.textContent = item.pt;
    var visual = document.createElement('span');          // o que a pessoa vê animando
    visual.className = 'latim-vis';
    visual.setAttribute('aria-hidden', 'true');
    visual.lang = 'la';
    item.spanPt = document.createElement('span');
    item.spanCursor = document.createElement('span');
    item.spanCursor.className = 'latim-cursor';
    item.spanLa = document.createElement('span');
    item.spanLa.className = 'latim-la';
    item.spanLa.textContent = item.la;                    // começa 100% em latim
    visual.appendChild(item.spanPt);
    visual.appendChild(item.spanCursor);
    visual.appendChild(item.spanLa);
    envoltorio.appendChild(leitor);
    envoltorio.appendChild(visual);

    item.noInicio = document.createTextNode(bruto.slice(0, inicio));
    item.envoltorio = envoltorio;
    item.noResto = document.createTextNode(bruto.slice(fim));
    plano.pai.insertBefore(item.noInicio, plano.no);
    plano.pai.insertBefore(envoltorio, plano.no);
    plano.pai.insertBefore(item.noResto, plano.no);
    plano.pai.removeChild(plano.no);

    // segura a altura do bloco para o conteúdo abaixo não "pular" durante a troca
    if (plano.altura > 0) {
      if (!plano.bloco.ajLatimN) plano.bloco.style.minHeight = plano.altura + 'px';
      plano.bloco.ajLatimN = (plano.bloco.ajLatimN || 0) + 1;
    }
    itensLatim.push(item);
    return item;
  }

  function prepararNosLatim(nos) {
    var planos = [];
    nos.forEach(function (no) {   // 1ª passada: só leituras (evita recalcular o layout a cada troca)
      var achado = procurarLatim(no.nodeValue);
      if (!achado) return;
      var pai = no.parentNode;
      var bloco = pai.closest('p, li, dd, dt, h1, h2, h3, h4, button, a') || pai;
      planos.push({ no: no, achado: achado, pai: pai, bloco: bloco, altura: bloco.offsetHeight });
    });
    return planos.map(montarItemLatim);   // 2ª passada: as trocas
  }

  function restaurarItemLatim(item) {
    if (item.estado === 'fim') return;
    item.estado = 'fim';
    var pai = item.pai;
    if (pai && item.noInicio.parentNode === pai) {
      pai.insertBefore(document.createTextNode(item.original), item.noInicio);
      [item.noInicio, item.envoltorio, item.elResto || item.noResto].forEach(function (n) {
        if (n && n.parentNode === pai) pai.removeChild(n);
      });
    }
    var bloco = item.bloco;
    if (bloco && bloco.ajLatimN) {
      bloco.ajLatimN--;
      if (bloco.ajLatimN <= 0) { bloco.ajLatimN = 0; bloco.style.minHeight = ''; }
    }
    var i = ativosLatim.indexOf(item);
    if (i >= 0) ativosLatim.splice(i, 1);
  }

  function finalizarTudoLatim() {
    if (observadorLatim) { observadorLatim.disconnect(); observadorLatim = null; }
    itensLatim.forEach(restaurarItemLatim);
  }

  function iniciarItemLatim(item, atraso) {
    if (item.estado !== 'espera') return;
    item.estado = 'anim';
    item.t0 = performance.now() + atraso;
    item.espera = 350;                                                // latim parado antes de traduzir
    item.dur = Math.max(450, Math.min(1100, item.pt.length * 22));    // tempo da tradução
    item.restoIniciado = false;
    item.fim = item.t0 + item.espera + item.dur;
    ativosLatim.push(item);
    if (quadroLatim === null) quadroLatim = requestAnimationFrame(quadroDeLatim);
  }

  function revelarRestoLatim(item, agora) {
    if (!/\S/.test(item.noResto.nodeValue)) return;
    var el = document.createElement('span');
    el.className = 'latim-resto';
    var partes = item.noResto.nodeValue.split(/(\s+)/);
    var palavras = 0;
    partes.forEach(function (p) { if (p && !/^\s+$/.test(p)) palavras++; });
    var passo = Math.min(26, 1300 / Math.max(1, palavras));
    var i = 0;
    partes.forEach(function (parte) {
      if (!parte) return;
      if (/^\s+$/.test(parte)) { el.appendChild(document.createTextNode(parte)); return; }
      var w = document.createElement('span');
      w.textContent = parte;
      w.style.animationDelay = Math.round(i * passo) + 'ms';
      i++;
      el.appendChild(w);
    });
    item.pai.insertBefore(el, item.noResto);
    item.pai.removeChild(item.noResto);
    item.elResto = el;
    item.fim = Math.max(item.fim, agora + i * passo + 520);
  }

  function desenharItemLatim(item, p) {
    var k = Math.floor(p * item.pt.length);
    var cursor = '';
    var kLa = item.la.length;
    if (p < 1) {
      for (var j = 0; j < 3 && k + j < item.pt.length; j++) cursor += letraAleatoria(item.pt.charAt(k + j));
      kLa = Math.min(item.la.length, Math.floor(p * item.la.length) + 3);
    }
    item.spanPt.textContent = item.pt.slice(0, k);
    item.spanCursor.textContent = cursor;
    item.spanLa.textContent = p < 1 ? item.la.slice(kLa) : '';
  }

  function quadroDeLatim(agora) {
    quadroLatim = null;
    for (var i = ativosLatim.length - 1; i >= 0; i--) {
      var item = ativosLatim[i];
      var dt = agora - item.t0;
      if (dt < item.espera) continue;
      if (!item.restoIniciado) { item.restoIniciado = true; revelarRestoLatim(item, agora); }
      var p = (dt - item.espera) / item.dur;
      if (p >= 1 && agora >= item.fim) { restaurarItemLatim(item); continue; }
      desenharItemLatim(item, Math.min(p, 1));
    }
    if (ativosLatim.length) quadroLatim = requestAnimationFrame(quadroDeLatim);
  }

  // escalona itens que entram na tela quase juntos, para não traduzir tudo no mesmo instante
  function proximoAtrasoLatim() {
    var agora = performance.now();
    if (agora - ultimoInicioLatim > 600) filaLatim = 0;
    ultimoInicioLatim = agora;
    return Math.min(filaLatim++ * 90, 700);
  }

  function observarConteudoLatim(itens) {
    var pais = [];
    itens.forEach(function (item) {
      if (!item.pai.ajLatimItens) { item.pai.ajLatimItens = []; pais.push(item.pai); }
      item.pai.ajLatimItens.push(item);
    });
    if (typeof IntersectionObserver === 'undefined') {
      itens.forEach(function (item, i) { iniciarItemLatim(item, Math.min(i * 60, 900)); });
      return;
    }
    observadorLatim = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        observadorLatim.unobserve(entrada.target);
        var atraso = proximoAtrasoLatim();
        (entrada.target.ajLatimItens || []).forEach(function (item) {
          iniciarItemLatim(item, atraso);
          atraso += 50;
        });
      });
    }, { threshold: 0.1 });
    pais.forEach(function (pai) { observadorLatim.observe(pai); });
  }

  function iniciarTraducaoLatim() {
    // cabeçalho e menus: só na primeira página da sessão
    if (!jaVistoNaSessao('aj-latim-chrome')) {
      var nosChrome = coletarNosDeTexto(document.querySelector('.topo'));
      document.querySelectorAll('.lateral, .nav-movel').forEach(function (nav) {
        nosChrome = nosChrome.concat(coletarNosDeTexto(nav));
      });
      var itensChrome = prepararNosLatim(nosChrome);
      itensChrome.forEach(function (item, i) { iniciarItemLatim(item, Math.min(i * 40, 900)); });
      if (itensChrome.length) marcarVistoNaSessao('aj-latim-chrome');
    }
    // conteúdo do capítulo: anima quando aparece na tela
    observarConteudoLatim(prepararNosLatim(coletarNosDeTexto(document.querySelector('main'))));
  }

  function criarAlternadorLatim() {
    var onde = document.querySelector('.rodape__links');
    if (!onde) return;
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'rodape__animacao';
    function atualizarRotulo() {
      botao.textContent = latimAtivo ? 'Tradução animada: ligada' : 'Tradução animada: desligada';
    }
    atualizarRotulo();
    botao.addEventListener('click', function () {
      latimAtivo = !latimAtivo;
      try { localStorage.setItem('aj-latim', latimAtivo ? 'on' : 'off'); } catch (erro) { /* vale só nesta página */ }
      atualizarRotulo();
      if (!latimAtivo) finalizarTudoLatim();
    });
    onde.appendChild(botao);
  }

  if (LATIM.length && !prefersReducedMotion) {
    criarAlternadorLatim();
    if (latimAtivo) {
      try {
        iniciarTraducaoLatim();
      } catch (erro) {
        finalizarTudoLatim();   // qualquer falha: devolve o português e segue sem animação
      }
      // clique ou tecla encerra as animações em andamento
      var pularLatim = function () { ativosLatim.slice().forEach(restaurarItemLatim); };
      document.addEventListener('pointerdown', pularLatim);
      document.addEventListener('keydown', pularLatim);
      window.addEventListener('beforeprint', finalizarTudoLatim);
    }
  }
  document.documentElement.classList.remove('latim-preparando');

})();
