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
        if (gaveta) {
          gaveta.checked = false;
          atualizar();
        }
      });

      irPanteao.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (panteao) panteao.checked = true;
        if (gaveta) {
          gaveta.checked = false;
          atualizar();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (panteao && panteao.checked) panteao.checked = false;
      if (gaveta && gaveta.checked) {
        gaveta.checked = false;
        atualizar();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
