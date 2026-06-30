/**
 * document.js — Documento Premium com identidade visual (tela + PDF + impressão).
 *
 * Renderiza a estratégia já aprovada como um relatório de consultoria de alto
 * padrão: capa, resumo executivo, diagnóstico (anamnese categorizada), a
 * narrativa escrita para o aluno (relatório), timeline da periodização, quadro
 * de treinos, contato com QR Codes, assinatura e rodapé numerado.
 */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtDate(iso) {
    var d = iso ? new Date(iso + 'T00:00:00') : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function hexToRgba(hex, a) {
    var h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function logoHtml(brand) {
    if (brand.logoDataUrl) return '<img class="doc-logo__img" src="' + brand.logoDataUrl + '" alt="' + esc(brand.empresa) + '" />';
    var initials = (brand.empresa || 'MP').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    return '<span class="doc-logo__initials">' + esc(initials) + '</span>';
  }

  var ICONS = {
    summary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
    intake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 11h6M9 15h4"/></svg>',
    assess: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="13" y="7" width="3" height="11"/></svg>',
    plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    timeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="17" r="2"/></svg>',
    workout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6v12M18 6v12M3 9h3M3 15h3M18 9h3M18 15h3M6 12h12"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 0 2 2h13"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/></svg>'
  };

  function sectionHead(icon, title) {
    return '<div class="doc-sec__head">' +
      '<span class="doc-sec__icon">' + (ICONS[icon] || '') + '</span>' +
      '<h2 class="doc-sec__title">' + esc(title) + '</h2></div>';
  }

  // converte o corpo de uma seção (com quebras de linha e bullets •) em HTML
  function prose(body) {
    var lines = String(body || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var html = '', buffer = [];
    function flush() { if (buffer.length) { html += '<ul class="doc-prose__list">' + buffer.join('') + '</ul>'; buffer = []; } }
    lines.forEach(function (l) {
      if (l.charAt(0) === '•') buffer.push('<li>' + esc(l.replace(/^•\s*/, '')) + '</li>');
      else { flush(); html += '<p>' + esc(l) + '</p>'; }
    });
    flush();
    return html;
  }

  function build(strategy, brand) {
    var b = brand;
    var qrTasks = [];
    var waUrl = QR.whatsappUrl(b.whatsapp);
    var igUrl = QR.instagramUrl(b.instagram);
    qrTasks.push((b.mostrarQrWhatsapp && waUrl) ? QR.toDataUrl(waUrl, 150, b.corFundo).then(function (u) { return ['wa', u]; }) : Promise.resolve(['wa', '']));
    qrTasks.push((b.mostrarQrInstagram && igUrl) ? QR.toDataUrl(igUrl, 150, b.corFundo).then(function (u) { return ['ig', u]; }) : Promise.resolve(['ig', '']));
    return Promise.all(qrTasks).then(function (results) {
      var qr = {};
      results.forEach(function (r) { qr[r[0]] = r[1]; });
      return assemble(strategy, b, qr);
    });
  }

  function assemble(s, b, qr) {
    var rel = s.relatorio || {};
    var styleVars =
      '--doc-primary:' + b.corPrimaria + ';--doc-secondary:' + b.corSecundaria + ';' +
      '--doc-bg:' + b.corFundo + ';--doc-text:' + b.corTexto + ';' +
      '--doc-primary-soft:' + hexToRgba(b.corPrimaria, 0.10) + ';' +
      '--doc-secondary-soft:' + hexToRgba(b.corSecundaria, 0.14) + ';' +
      '--doc-font-title:"' + b.fonteTitulo + '";--doc-font-body:"' + b.fonteTexto + '";';

    var html = '<div class="doc" style="' + styleVars + '">';
    var pg = 1;

    /* ---------- CAPA ---------- */
    html += '<section class="doc-page doc-page--cover"><div class="doc-cover">' +
      '<div class="doc-cover__top"><div class="doc-logo">' + logoHtml(b) + '</div>' +
        '<div class="doc-cover__brand"><strong>' + esc(b.empresa) + '</strong>' +
          (b.slogan ? '<span>' + esc(b.slogan) + '</span>' : '') + '</div></div>' +
      '<div class="doc-cover__center">' +
        '<span class="doc-cover__eyebrow">Estratégia Personalizada de Treinamento</span>' +
        '<h1 class="doc-cover__title">Sua Estratégia de Treino</h1>' +
        (s.objetivo ? '<p class="doc-cover__subtitle">' + esc(s.objetivo) + '</p>' : '') +
        '<div class="doc-cover__student"><span class="doc-cover__label">Preparado para</span>' +
          '<strong>' + esc(s.aluno || '—') + '</strong></div>' +
      '</div>' +
      '<div class="doc-cover__foot"><span>' + esc(b.personal || '') + (b.cref ? ' · ' + esc(b.cref) : '') + '</span>' +
        '<span>' + fmtDate(s.dataElaboracao) + '</span></div>' +
      '</div></section>';

    /* ---------- RESUMO EXECUTIVO + AVALIAÇÃO ---------- */
    var cards = ReportGenerator.avaliacaoCards(s);
    html += '<section class="doc-page">';
    html += sectionHead('summary', 'Resumo Executivo');
    html += '<div class="doc-highlight"><p>' + esc(rel.resumoExecutivo || '') + '</p></div>';
    if (cards.length) {
      html += sectionHead('assess', 'Panorama Inicial');
      html += '<div class="doc-cards">';
      cards.forEach(function (a) {
        html += '<div class="doc-card"><span class="doc-card__value">' + esc(a.valor) + '</span>' +
          '<span class="doc-card__label">' + esc(a.rotulo) + '</span></div>';
      });
      html += '</div>';
    }
    html += pageFooter(b, ++pg) + '</section>';

    /* ---------- DIAGNÓSTICO (anamnese categorizada) ---------- */
    var cats = (Store.ANAMNESE_CATEGORIES || []).filter(function (c) {
      return s.categorias && String(s.categorias[c.key] || '').trim();
    });
    if (cats.length) {
      html += '<section class="doc-page">';
      html += sectionHead('intake', 'Diagnóstico — Sua Anamnese');
      html += '<div class="doc-anamnese">';
      cats.forEach(function (c) {
        html += '<div class="doc-anam"><span class="doc-anam__q">' + c.icon + ' ' + esc(c.label) + '</span>' +
          '<span class="doc-anam__a">' + esc(s.categorias[c.key]).replace(/\n/g, '<br>') + '</span></div>';
      });
      html += '</div>' + pageFooter(b, ++pg) + '</section>';
    }

    /* ---------- NARRATIVA (relatório), agrupada em capítulos ---------- */
    var sections = (rel.sections || []).filter(function (x) { return x.key !== 'saudacao'; });
    // grupos de ~2 seções por página A4
    var groups = [];
    for (var i = 0; i < sections.length; i += 2) groups.push(sections.slice(i, i + 2));

    var saud = (rel.sections || []).filter(function (x) { return x.key === 'saudacao'; })[0];

    groups.forEach(function (group, gi) {
      html += '<section class="doc-page">';
      if (gi === 0 && saud) {
        html += '<div class="doc-greeting">' + prose(saud.body) + '</div>';
      }
      group.forEach(function (sec) {
        // a periodização ganha timeline visual quando há fases
        if (sec.key === 'evolucao' && s.entrevista && s.entrevista.fases && s.entrevista.fases.length) {
          html += sectionHead('timeline', sec.title);
          html += '<div class="doc-timeline">';
          s.entrevista.fases.forEach(function (f) {
            html += '<div class="doc-tl"><div class="doc-tl__dot"></div><div class="doc-tl__body">' +
              '<div class="doc-tl__top"><strong>' + esc(f.fase || 'Fase') + '</strong>' +
              (f.duracao ? '<span class="doc-chip">' + esc(f.duracao) + '</span>' : '') + '</div>' +
              (f.foco ? '<span class="doc-tl__focus">🎯 ' + esc(f.foco) + '</span>' : '') +
              (f.descricao ? '<p>' + esc(f.descricao) + '</p>' : '') +
              '</div></div>';
          });
          html += '</div>';
        } else {
          html += sectionHead(iconFor(sec.key), sec.title);
          html += '<div class="doc-prose">' + prose(sec.body) + '</div>';
        }
      });
      html += pageFooter(b, ++pg) + '</section>';
    });

    /* ---------- QUADRO DE TREINOS (opcional) ---------- */
    if (s.treinos && s.treinos.length) {
      html += '<section class="doc-page">' + sectionHead('workout', 'Divisão de Treinos');
      html += '<div class="doc-splits">';
      s.treinos.forEach(function (t) {
        html += '<div class="doc-split"><div class="doc-split__day">' + esc(t.dia) + '</div>' +
          '<div class="doc-split__body"><strong>' + esc(t.grupo) + '</strong>' +
          (t.detalhe ? '<p>' + esc(t.detalhe) + '</p>' : '') + '</div></div>';
      });
      html += '</div>' + pageFooter(b, ++pg) + '</section>';
    }

    /* ---------- CONTATO + QR + ASSINATURA ---------- */
    html += '<section class="doc-page doc-page--contact">' + sectionHead('contact', 'Vamos Juntos Nessa');
    html += '<div class="doc-contact"><div class="doc-contact__info">' +
      '<div class="doc-contact__logo">' + logoHtml(b) + '</div>' +
      '<strong>' + esc(b.empresa) + '</strong><ul class="doc-contact__list">';
    if (b.personal) html += '<li><span>👤</span>' + esc(b.personal) + (b.cref ? ' · ' + esc(b.cref) : '') + '</li>';
    if (b.telefone) html += '<li><span>📞</span>' + esc(b.telefone) + '</li>';
    if (b.email) html += '<li><span>✉️</span>' + esc(b.email) + '</li>';
    if (b.site) html += '<li><span>🌐</span>' + esc(b.site) + '</li>';
    if (b.instagram) html += '<li><span>📷</span>@' + esc(String(b.instagram).replace(/^@/, '')) + '</li>';
    if (b.endereco) html += '<li><span>📍</span>' + esc(b.endereco) + '</li>';
    html += '</ul>';
    if (b.mostrarAssinatura) {
      html += '<div class="doc-sign">';
      if (b.assinatura) html += '<img src="' + b.assinatura + '" alt="Assinatura" />';
      else html += '<span class="doc-sign__line"></span>';
      html += '<span class="doc-sign__name">' + esc(b.personal || b.empresa) + '</span></div>';
    }
    html += '</div><div class="doc-contact__qr">';
    if (qr.wa) html += '<figure class="doc-qr"><img src="' + qr.wa + '" alt="QR WhatsApp" /><figcaption>WhatsApp</figcaption></figure>';
    if (qr.ig) html += '<figure class="doc-qr"><img src="' + qr.ig + '" alt="QR Instagram" /><figcaption>Instagram</figcaption></figure>';
    html += '</div></div>' + pageFooter(b, ++pg) + '</section>';

    html += '</div>';
    return html;
  }

  function iconFor(key) {
    var map = {
      objetivo: 'goal', diagnostico: 'assess', estrategia: 'plan', divisao: 'workout',
      repeticoes: 'book', exercicios: 'workout', aquecimento: 'book', progressao: 'plan',
      papel: 'book', avaliacao: 'assess', final: 'summary'
    };
    return ICONS[map[key]] ? map[key] : 'book';
  }

  function pageFooter(b, page) {
    return '<footer class="doc-foot"><span class="doc-foot__brand">' + esc(b.empresa) + '</span>' +
      '<span class="doc-foot__text">' + esc(b.rodape || '') + '</span>' +
      '<span class="doc-foot__page">' + page + '</span></footer>';
  }

  global.PremiumDocument = { build: build };
})(window);
