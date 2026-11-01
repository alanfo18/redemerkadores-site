/* Rede Merkadores · aviso de cookies e Microsoft Clarity.
   O Clarity só carrega depois que a pessoa aceita. Sem ID configurado, nada aparece. */
(function () {
  "use strict";
  // ID do projeto no Microsoft Clarity (clarity.microsoft.com > Settings > Overview). Não é segredo: aparece no código da página.
  var CLARITY_ID = "";
  var CHAVE = "mk-cookies";
  var VALIDADE_DIAS = 365;

  var prefs = document.querySelectorAll("[data-cookie-pref]");
  if (!CLARITY_ID) {
    for (var k = 0; k < prefs.length; k++) prefs[k].hidden = true;
    return;
  }

  function ler() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (v && (Date.now() - v.em) < VALIDADE_DIAS * 864e5) return v.escolha;
    } catch (e) {}
    return null;
  }
  function gravar(escolha) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ escolha: escolha, em: Date.now() })); } catch (e) {}
  }

  function carregarClarity() {
    if (window.clarity && window.clarity.carregado) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
    window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    window.clarity.carregado = true;
  }

  function apagarCookiesClarity() {
    ["_clck", "_clsk", "CLID", "ANONCHK", "MR", "MUID", "SM"].forEach(function (n) {
      document.cookie = n + "=; Max-Age=0; path=/";
      document.cookie = n + "=; Max-Age=0; path=/; domain=." + location.hostname.replace(/^www\./, "");
    });
  }

  var aviso = null;
  function fecharAviso() { if (aviso) { aviso.remove(); aviso = null; } }

  function abrirAviso() {
    if (aviso) return;
    aviso = document.createElement("div");
    aviso.className = "cookie-aviso";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-labelledby", "cookie-aviso-t");
    aviso.innerHTML =
      '<p id="cookie-aviso-t" class="cookie-t">Podemos medir como o site é usado?</p>' +
      '<p class="cookie-d">Com a sua permissão, usamos o Microsoft Clarity para ver cliques e rolagem, sem formulário e sem publicidade. ' +
      'Detalhes na <a href="privacidade.html">privacidade</a>.</p>' +
      '<div class="cookie-b"><button type="button" class="cookie-sim">Aceitar</button>' +
      '<button type="button" class="cookie-nao">Recusar</button></div>';
    document.body.appendChild(aviso);
    aviso.querySelector(".cookie-sim").addEventListener("click", function () {
      gravar("aceito"); fecharAviso(); carregarClarity();
    });
    aviso.querySelector(".cookie-nao").addEventListener("click", function () {
      var tinha = window.clarity && window.clarity.carregado;
      gravar("recusado"); fecharAviso();
      if (tinha) {
        window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
        apagarCookiesClarity();
        location.reload();
      }
    });
  }

  for (var j = 0; j < prefs.length; j++) {
    prefs[j].hidden = false;
    prefs[j].addEventListener("click", abrirAviso);
  }

  var escolha = ler();
  if (escolha === "aceito") carregarClarity();
  else if (escolha !== "recusado") abrirAviso();
})();
