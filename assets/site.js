/* Rede Merkadores · comportamento comum: menu, cabeçalho discreto, entradas suaves */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  var head = document.querySelector(".site-head");
  var btn = head && head.querySelector(".nav-toggle");
  var nav = head && head.querySelector(".site-nav");
  var desk = window.matchMedia("(min-width: 901px)");

  function setOpen(open, returnFocus) {
    if (!head || !btn) return;
    head.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.querySelector(".lbl").textContent = open ? "Fechar" : "Menu";
    if (open) head.classList.remove("hide");
    if (!open && returnFocus) btn.focus();
  }

  if (btn && nav) {
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && head.classList.contains("open")) setOpen(false, true);
    });
    document.addEventListener("click", function (e) {
      if (head.classList.contains("open") && !head.contains(e.target)) setOpen(false);
    });
    var onMq = function () { if (desk.matches) setOpen(false); };
    if (desk.addEventListener) desk.addEventListener("change", onMq);
    else if (desk.addListener) desk.addListener(onMq);
  }

  /* cabeçalho some ao descer e volta ao subir */
  if (head) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY, dy = y - lastY;
        var busy = head.classList.contains("open") || head.contains(document.activeElement);
        if (y < 80 || dy < -4) head.classList.remove("hide");
        else if (dy > 4 && !busy) head.classList.add("hide");
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
    head.addEventListener("focusin", function () { head.classList.remove("hide"); });
  }

  /* entradas suaves */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], .map"));
  if (!items.length) return;
  function show(el) { el.classList.add("in"); }
  /* conferência direta pela posição: garante a entrada mesmo sem IntersectionObserver */
  var pending = items.slice(), checking = false;
  function check() {
    checking = false;
    var h = window.innerHeight || document.documentElement.clientHeight;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) { show(el); return false; }
      return !el.classList.contains("in");
    });
    if (!pending.length) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  }
  function onScroll() { if (!checking) { checking = true; window.requestAnimationFrame(check); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  check();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
