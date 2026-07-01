/* =========================================================================
   Montinho Training Strategy — Módulo 1
   Interações leves, sem dependências. Progressive enhancement.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Objetivo final: valores do PRD ---- */
  var VALUES = [
    "Exclusividade",
    "Profissionalismo",
    "Ciência",
    "Organização",
    "Personalização",
    "Confiança",
  ];

  /* ---- Roadmap de módulos ---- */
  var MODULES = [
    {
      id: "01",
      title: "Fundação & Identidade",
      desc: "Visão, missão, princípios, posicionamento e a filosofia de design premium.",
      status: "now",
    },
    {
      id: "02",
      title: "O cérebro & a entrevista",
      desc: "System prompt do consultor, anamnese, diagnóstico e entrevista guiada que vira relatório em tempo real.",
      status: "now",
    },
    {
      id: "03",
      title: "Entrevista inteligente",
      desc: "Uma pergunta por vez, adaptada à anamnese, com auditoria de inconsistências e checklist final.",
      status: "now",
    },
    {
      id: "04",
      title: "Memória estratégica & dashboard",
      desc: "Memória viva de tudo que foi definido, painel de progresso em tempo real, sugestões e histórico.",
      status: "now",
    },
    {
      id: "05",
      title: "Biblioteca inteligente",
      desc: "Justificativas automáticas com base científica, adaptadas ao perfil, nível de confiança e preferências do treinador.",
      status: "now",
    },
    {
      id: "06",
      title: "DNA do Montinho",
      desc: "A voz do Renato em cada relatório: linguagem simples, tom pessoal, revisão de voz e memória que aprende o seu jeito.",
      status: "now",
    },
    {
      id: "07",
      title: "Geração do relatório",
      desc: "Apresentação profissional em estrutura fixa, do objetivo à mensagem final — respondendo o porquê de cada decisão.",
      status: "now",
    },
  ];

  var CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---- Render: valores ---- */
  function renderValues() {
    var root = document.getElementById("values");
    if (!root) return;
    VALUES.forEach(function (v) {
      var item = el("div", "value");
      item.appendChild(el("span", "tick", CHECK));
      item.appendChild(el("span", null, v));
      root.appendChild(item);
    });
  }

  /* ---- Render: módulos ---- */
  function renderModules() {
    var root = document.getElementById("modules");
    if (!root) return;
    MODULES.forEach(function (m) {
      var row = el("div", "module");
      row.appendChild(el("div", "module__id", m.id));

      var body = el("div", "module__body");
      body.appendChild(el("h3", null, m.title));
      body.appendChild(el("p", null, m.desc));
      row.appendChild(body);

      var isNow = m.status === "now";
      row.appendChild(
        el(
          "span",
          "tag " + (isNow ? "tag--now" : "tag--next"),
          isNow ? "Disponível" : "Em breve"
        )
      );
      root.appendChild(row);
    });
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---- Nav: borda ao rolar ---- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Ano no rodapé ---- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function init() {
    renderValues();
    renderModules();
    initReveal();
    initNav();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
