/**
 * document.js — Renderiza o Documento Premium com identidade visual.
 *
 * O mesmo HTML é usado para:
 *   • o Documento Premium (opção 3) exibido na tela;
 *   • o Relatório Premium em PDF (opção 2).
 *
 * Estrutura: capa → resumo executivo → avaliação (cartões) → metas (blocos
 * coloridos) → periodização (timeline) → treinos → recomendações → contato
 * com QR Codes e rodapé profissional.
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
    if (brand.logoDataUrl) {
      return '<img class="doc-logo__img" src="' + brand.logoDataUrl + '" alt="' + esc(brand.empresa) + '" />';
    }
    var initials = (brand.empresa || 'MP').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    return '<span class="doc-logo__initials">' + esc(initials) + '</span>';
  }

  // Ícones SVG simples (herdam currentColor)
  var ICONS = {
    summary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
    intake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 11h6M9 15h4"/></svg>',
    assess: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="13" y="7" width="3" height="11"/></svg>',
    goal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.5" fill="currentColor"/></svg>',
    timeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="17" r="2"/></svg>',
    workout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6v12M18 6v12M3 9h3M3 15h3M18 9h3M18 15h3M6 12h12"/></svg>',
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/></svg>'
  };

  function sectionHead(icon, title, n) {
    return (
      '<div class="doc-sec__head">' +
        '<span class="doc-sec__icon">' + ICONS[icon] + '</span>' +
        (n ? '<span class="doc-sec__num">' + n + '</span>' : '') +
        '<h2 class="doc-sec__title">' + esc(title) + '</h2>' +
      '</div>'
    );
  }

  /**
   * Monta o documento completo. Assíncrono por causa dos QR Codes.
   * @returns {Promise<string>} HTML do documento (dentro de .doc-page wrappers)
   */
  function build(strategy, brand) {
    var s = strategy, b = brand;

    var qrTasks = [];
    var waUrl = QR.whatsappUrl(b.whatsapp);
    var igUrl = QR.instagramUrl(b.instagram);
    if (b.mostrarQrWhatsapp && waUrl) qrTasks.push(QR.toDataUrl(waUrl, 150, b.corFundo).then(function (u) { return ['wa', u]; }));
    else qrTasks.push(Promise.resolve(['wa', '']));
    if (b.mostrarQrInstagram && igUrl) qrTasks.push(QR.toDataUrl(igUrl, 150, b.corFundo).then(function (u) { return ['ig', u]; }));
    else qrTasks.push(Promise.resolve(['ig', '']));

    return Promise.all(qrTasks).then(function (results) {
      var qr = {};
      results.forEach(function (r) { qr[r[0]] = r[1]; });
      return assemble(s, b, qr, waUrl, igUrl);
    });
  }

  function assemble(s, b, qr, waUrl, igUrl) {
    var styleVars =
      '--doc-primary:' + b.corPrimaria + ';' +
      '--doc-secondary:' + b.corSecundaria + ';' +
      '--doc-bg:' + b.corFundo + ';' +
      '--doc-text:' + b.corTexto + ';' +
      '--doc-primary-soft:' + hexToRgba(b.corPrimaria, 0.10) + ';' +
      '--doc-secondary-soft:' + hexToRgba(b.corSecundaria, 0.14) + ';' +
      '--doc-font-title:"' + b.fonteTitulo + '";' +
      '--doc-font-body:"' + b.fonteTexto + '";';

    var html = '<div class="doc" style="' + styleVars + '">';

    /* ---------- PÁGINA 1 — CAPA + RESUMO EXECUTIVO ---------- */
    html += '<section class="doc-page doc-page--cover">';
    html +=   '<div class="doc-cover">';
    html +=     '<div class="doc-cover__top">';
    html +=       '<div class="doc-logo">' + logoHtml(b) + '</div>';
    html +=       '<div class="doc-cover__brand">' +
                    '<strong>' + esc(b.empresa) + '</strong>' +
                    (b.slogan ? '<span>' + esc(b.slogan) + '</span>' : '') +
                  '</div>';
    html +=     '</div>';
    html +=     '<div class="doc-cover__center">';
    html +=       '<span class="doc-cover__eyebrow">Estratégia Personalizada</span>';
    html +=       '<h1 class="doc-cover__title">Estratégia Personalizada de Treinamento</h1>';
    html +=       (s.objetivo ? '<p class="doc-cover__subtitle">' + esc(s.objetivo) + '</p>' : '');
    html +=       '<div class="doc-cover__student">' +
                    '<span class="doc-cover__label">Preparado para</span>' +
                    '<strong>' + esc(s.aluno || '—') + '</strong>' +
                  '</div>';
    html +=     '</div>';
    html +=     '<div class="doc-cover__foot">';
    html +=       '<span>' + esc(b.personal || '') + (b.cref ? ' · ' + esc(b.cref) : '') + '</span>';
    html +=       '<span>' + fmtDate(s.dataElaboracao) + '</span>';
    html +=     '</div>';
    html +=   '</div>';
    html += '</section>';

    // Numeração automática das páginas (capa = 1).
    var pg = 1;

    /* ---------- RESUMO EXECUTIVO ---------- */
    if (s.resumoExecutivo) {
      html += '<section class="doc-page">';
      html +=   sectionHead('summary', 'Resumo Executivo');
      html +=   '<div class="doc-highlight">';
      html +=     '<p>' + esc(s.resumoExecutivo) + '</p>';
      html +=   '</div>';

      // Avaliação como cartões informativos (na mesma página)
      if (s.avaliacao && s.avaliacao.length) {
        html += sectionHead('assess', 'Avaliação Física');
        html += '<div class="doc-cards">';
        s.avaliacao.forEach(function (a) {
          html += '<div class="doc-card">' +
                    '<span class="doc-card__value">' + esc(a.valor) + '</span>' +
                    '<span class="doc-card__label">' + esc(a.rotulo) + '</span>' +
                  '</div>';
        });
        html += '</div>';
      }
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- ANAMNESE (somente perguntas respondidas) ---------- */
    var anamneseResp = (s.anamnese || []).filter(function (a) {
      return a && a.resposta && String(a.resposta).trim();
    });
    if (anamneseResp.length) {
      html += '<section class="doc-page">';
      html += sectionHead('intake', 'Anamnese');
      html += '<div class="doc-anamnese">';
      anamneseResp.forEach(function (a) {
        html += '<div class="doc-anam">' +
                  '<span class="doc-anam__q">' + esc(a.pergunta) + '</span>' +
                  '<span class="doc-anam__a">' + esc(a.resposta) + '</span>' +
                '</div>';
      });
      html += '</div>';
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- METAS (blocos coloridos) ---------- */
    if (s.metas && s.metas.length) {
      html += '<section class="doc-page">';
      html += sectionHead('goal', 'Metas e Objetivos');
      html += '<div class="doc-goals">';
      s.metas.forEach(function (m, i) {
        html += '<div class="doc-goal doc-goal--' + (i % 4) + '">' +
                  '<span class="doc-goal__index">' + (i + 1) + '</span>' +
                  '<div><strong>' + esc(m.titulo) + '</strong>' +
                  '<p>' + esc(m.descricao) + '</p></div>' +
                '</div>';
      });
      html += '</div>';
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- PERIODIZAÇÃO (timeline) ---------- */
    if (s.periodizacao && s.periodizacao.length) {
      html += '<section class="doc-page">';
      html += sectionHead('timeline', 'Periodização');
      html += '<div class="doc-timeline">';
      s.periodizacao.forEach(function (p) {
        html += '<div class="doc-tl">' +
                  '<div class="doc-tl__dot"></div>' +
                  '<div class="doc-tl__body">' +
                    '<div class="doc-tl__top">' +
                      '<strong>' + esc(p.fase) + '</strong>' +
                      (p.duracao ? '<span class="doc-chip">' + esc(p.duracao) + '</span>' : '') +
                    '</div>' +
                    (p.foco ? '<span class="doc-tl__focus">🎯 ' + esc(p.foco) + '</span>' : '') +
                    (p.descricao ? '<p>' + esc(p.descricao) + '</p>' : '') +
                  '</div>' +
                '</div>';
      });
      html += '</div>';
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- TREINOS ---------- */
    if (s.treinos && s.treinos.length) {
      html += '<section class="doc-page">';
      html += sectionHead('workout', 'Divisão de Treinos');
      html += '<div class="doc-splits">';
      s.treinos.forEach(function (t) {
        html += '<div class="doc-split">' +
                  '<div class="doc-split__day">' + esc(t.dia) + '</div>' +
                  '<div class="doc-split__body">' +
                    '<strong>' + esc(t.grupo) + '</strong>' +
                    (t.detalhe ? '<p>' + esc(t.detalhe) + '</p>' : '') +
                  '</div>' +
                '</div>';
      });
      html += '</div>';
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- RECOMENDAÇÕES + OBSERVAÇÕES ---------- */
    if ((s.recomendacoes && s.recomendacoes.length) || s.observacoes) {
      html += '<section class="doc-page">';
      if (s.recomendacoes && s.recomendacoes.length) {
        html += sectionHead('tip', 'Recomendações');
        html += '<ul class="doc-checklist">';
        s.recomendacoes.forEach(function (r) {
          html += '<li>' + esc(r) + '</li>';
        });
        html += '</ul>';
      }
      if (s.observacoes) {
        html += '<div class="doc-note">' +
                  '<span class="doc-note__tag">Importante</span>' +
                  '<p>' + esc(s.observacoes) + '</p>' +
                '</div>';
      }
      html += pageFooter(b, ++pg);
      html += '</section>';
    }

    /* ---------- CONTATO + QR CODES + ASSINATURA ---------- */
    html += '<section class="doc-page doc-page--contact">';
    html +=   sectionHead('contact', 'Vamos Juntos Nessa');
    html +=   '<div class="doc-contact">';
    html +=     '<div class="doc-contact__info">';
    html +=       '<div class="doc-contact__logo">' + logoHtml(b) + '</div>';
    html +=       '<strong>' + esc(b.empresa) + '</strong>';
    html +=       '<ul class="doc-contact__list">';
    if (b.personal) html += '<li><span>👤</span>' + esc(b.personal) + (b.cref ? ' · ' + esc(b.cref) : '') + '</li>';
    if (b.telefone) html += '<li><span>📞</span>' + esc(b.telefone) + '</li>';
    if (b.email) html += '<li><span>✉️</span>' + esc(b.email) + '</li>';
    if (b.site) html += '<li><span>🌐</span>' + esc(b.site) + '</li>';
    if (b.instagram) html += '<li><span>📷</span>@' + esc(String(b.instagram).replace(/^@/, '')) + '</li>';
    if (b.endereco) html += '<li><span>📍</span>' + esc(b.endereco) + '</li>';
    html +=       '</ul>';
    if (b.mostrarAssinatura) {
      html += '<div class="doc-sign">';
      if (b.assinatura) html += '<img src="' + b.assinatura + '" alt="Assinatura" />';
      else html += '<span class="doc-sign__line"></span>';
      html += '<span class="doc-sign__name">' + esc(b.personal || b.empresa) + '</span>';
      html += '</div>';
    }
    html +=     '</div>';
    html +=     '<div class="doc-contact__qr">';
    if (qr.wa) html += '<figure class="doc-qr"><img src="' + qr.wa + '" alt="QR WhatsApp" /><figcaption>WhatsApp</figcaption></figure>';
    if (qr.ig) html += '<figure class="doc-qr"><img src="' + qr.ig + '" alt="QR Instagram" /><figcaption>Instagram</figcaption></figure>';
    html +=     '</div>';
    html +=   '</div>';
    html += pageFooter(b, ++pg);
    html += '</section>';

    html += '</div>'; // .doc
    return html;
  }

  function pageFooter(b, page) {
    return (
      '<footer class="doc-foot">' +
        '<span class="doc-foot__brand">' + esc(b.empresa) + '</span>' +
        '<span class="doc-foot__text">' + esc(b.rodape || '') + '</span>' +
        '<span class="doc-foot__page">' + page + '</span>' +
      '</footer>'
    );
  }

  global.PremiumDocument = { build: build };
})(window);
