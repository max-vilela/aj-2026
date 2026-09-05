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
})();
