/* =========================================================================
   Montinho Training Strategy — PDF Premium (Módulo 8)
   Documento exclusivo de até 5 páginas. Menos é mais: muito espaço em branco,
   preto/branco/cinza e dourado apenas para destaque. Inspirado em Apple, Linear
   e Stripe. Exporta para PDF (impressão), WhatsApp e HTML.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Premium = (function () {
  var Report = MTS.Report, Store = MTS.Store, QR = MTS.QR;

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function has(v) { return Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== ''); }
  function val(v) { if (Array.isArray(v)) return v.join(', '); return v == null ? '' : String(v).trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var IC = {
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>',
    medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="14" r="6"/><path d="M8.5 8.5 6 3h12l-2.5 5.5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 17l6-6 4 4 7-7M14 8h6v6"/></svg>',
    mobility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="5" r="2"/><path d="M12 8v6M8 21l4-7 4 7M6 11h12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.5 9.5 17 19 7"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/></svg>'
  };

  function card(icon, label, value) {
    var c = el('div', 'pg-card');
    c.appendChild(el('span', 'pg-card__ic', IC[icon] || ''));
    c.appendChild(el('div', 'pg-card__lbl', esc(label)));
    c.appendChild(el('div', 'pg-card__val', esc(value || '—')));
    return c;
  }
  function pageFoot(brand, n) {
    var f = el('div', 'pg-foot');
    f.innerHTML = '<span>' + esc(brand.nome) + '</span><span>Montinho Training Strategy</span><span>' + n + ' / 5</span>';
    return f;
  }
  function h2(title) {
    var h = el('h2', 'pg-h2');
    h.innerHTML = esc(title);
    return h;
  }

  /* ---------------- páginas ---------------- */
  function coverPage(state, brand) {
    var a = state.anamnese || {};
    var nome = val(a.nome) || 'Seu aluno';
    var date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    var p = el('section', 'premium__page pg-cover');
    var top = el('div', 'pg-cover__top');
    top.innerHTML = '<div class="pg-brand"><span class="pg-mark">M</span><span>' + esc(brand.nome) + '</span></div>' +
      '<div class="pg-cover__date">' + esc(date) + '</div>';
    p.appendChild(top);

    var mid = el('div', 'pg-cover__mid');
    mid.appendChild(el('div', 'pg-eyebrow', 'Planejamento exclusivo'));
    mid.appendChild(el('div', 'pg-cover__name', esc(nome)));
    mid.appendChild(el('div', 'pg-rule', ''));
    mid.appendChild(el('h1', 'pg-cover__title', 'Montinho Training Strategy'));
    mid.appendChild(el('div', 'pg-cover__sub', 'Estratégia Personalizada de Treinamento'));
    mid.appendChild(el('p', 'pg-cover__phrase',
      '“Este planejamento foi desenvolvido exclusivamente para os seus objetivos, a sua rotina e as suas necessidades.”'));
    p.appendChild(mid);

    var foot = el('div', 'pg-cover__foot');
    var bits = [brand.nome];
    if (has(brand.whatsapp)) bits.push('WhatsApp ' + brand.whatsapp);
    if (has(brand.site)) bits.push(brand.site);
    foot.textContent = bits.join('   ·   ');
    p.appendChild(foot);
    return p;
  }

  function diagnosticoPage(state, brand) {
    var a = state.anamnese || {}, A = state.answers || {};
    var p = el('section', 'premium__page');
    p.appendChild(h2('Diagnóstico Inicial'));

    var grid = el('div', 'pg-grid4');
    grid.appendChild(card('target', 'Objetivo', val(A.objetivo_principal) || val(a.objetivo)));
    grid.appendChild(card('medal', 'Experiência', val(a.experiencia)));
    var disp = has(a.diasSemana) ? a.diasSemana + ' dias/semana' : '';
    if (has(a.tempoSessao)) disp += (disp ? ' · ' : '') + a.tempoSessao + ' min';
    grid.appendChild(card('calendar', 'Disponibilidade', disp));
    grid.appendChild(card('star', 'Prioridades', val(A.objetivo_prioridade)));
    p.appendChild(grid);

    var d = Report.studentDiagnosisData(state);
    var cols = el('div', 'pg-2col');
    var fortes = el('div', 'pg-box');
    fortes.appendChild(el('div', 'pg-box__t', 'Pontos fortes'));
    var ulF = el('ul', 'pg-check');
    (d.fortes.length ? d.fortes : ['Ótima disposição para começar essa jornada']).forEach(function (f) {
      ulF.appendChild(el('li', null, '<span class="pg-tick">' + IC.check + '</span>' + esc(upper(f))));
    });
    fortes.appendChild(ulF); cols.appendChild(fortes);

    var aten = el('div', 'pg-box');
    aten.appendChild(el('div', 'pg-box__t', 'Pontos de atenção'));
    var ulA = el('ul', 'pg-dot');
    (d.atencao.length ? d.atencao : ['Nada crítico — vamos apenas construir consistência']).forEach(function (t) {
      ulA.appendChild(el('li', null, esc(upper(t))));
    });
    aten.appendChild(ulA); cols.appendChild(aten);
    p.appendChild(cols);

    var fil = el('div', 'pg-highlight');
    fil.appendChild(el('div', 'pg-highlight__t', 'Nossa filosofia'));
    var frase = has(A.filosofia_frase) ? '“' + val(A.filosofia_frase) + '” ' : '';
    fil.appendChild(el('p', null, esc(frase) +
      'Cada escolha do seu treino tem um motivo. Nada aqui é por acaso — este plano foi montado para fazer sentido para você e para a sua realidade.'));
    p.appendChild(fil);

    p.appendChild(pageFoot(brand, 2));
    return p;
  }

  function estrategiaPage(state, brand) {
    var A = state.answers || {};
    var p = el('section', 'premium__page');
    p.appendChild(h2('Estratégia'));

    var blocks = el('div', 'pg-blocks');
    blocks.appendChild(block('Divisão semanal', IC.calendar, val(A.divisao_qual), val(A.divisao_porque)));
    var intensDetail = [];
    if (has(A.intensidade_reps)) intensDetail.push('Repetições: ' + val(A.intensidade_reps));
    var tec = Array.isArray(A.intensidade_tecnicas) ? A.intensidade_tecnicas : [];
    blocks.appendChild(block('Intensidade', IC.dumbbell, val(A.intensidade_estrategia), intensDetail.join(' · '), tec));
    p.appendChild(blocks);

    // timeline da evolução
    var tl = el('div', 'pg-timeline');
    tl.appendChild(el('div', 'pg-timeline__t', 'A evolução do seu plano'));
    var steps = timelineSteps(A.periodizacao_fases);
    var list = el('div', 'pg-timeline__track');
    steps.forEach(function (s, i) {
      var item = el('div', 'pg-tl');
      item.innerHTML = '<span class="pg-tl__dot"></span><span class="pg-tl__lbl"><b>' +
        (i === 0 ? 'Início' : 'Etapa ' + (i + 1)) + '</b>' + esc(s) + '</span>';
      list.appendChild(item);
    });
    tl.appendChild(list);
    p.appendChild(tl);

    p.appendChild(pageFoot(brand, 3));
    return p;
  }

  function block(title, icon, value, detail, badges) {
    var b = el('div', 'pg-block');
    b.appendChild(el('div', 'pg-block__h', '<span class="pg-block__ic">' + (icon || '') + '</span>' + esc(title)));
    if (has(value)) b.appendChild(el('div', 'pg-block__v', esc(value)));
    if (has(detail)) b.appendChild(el('div', 'pg-block__d', esc(detail)));
    if (badges && badges.length) {
      var bg = el('div', 'pg-badges');
      badges.forEach(function (t) { bg.appendChild(el('span', 'pg-badge', esc(t))); });
      b.appendChild(bg);
    }
    return b;
  }

  function timelineSteps(fases) {
    var raw = String(fases || '').split(/;|→|\n|\.(?=\s*Fase)/i).map(function (s) { return s.trim(); }).filter(Boolean);
    if (raw.length >= 2) return raw.slice(0, 5);
    return ['Adaptação e técnica', 'Mais volume de treino', 'Mais intensidade', 'Técnicas avançadas'];
  }

  function evolucaoPage(state, brand) {
    var A = state.answers || {};
    var p = el('section', 'premium__page');
    p.appendChild(h2('Evolução'));

    var grid = el('div', 'pg-2col');
    var mob = el('div', 'pg-box');
    mob.appendChild(el('div', 'pg-box__t', '<span class="pg-ic">' + IC.mobility + '</span> Mobilidade e preparação'));
    var mobItens = Array.isArray(A.mobilidade_o_que) ? A.mobilidade_o_que.join(', ') : '';
    mob.appendChild(el('p', null, esc(mobItens ? 'Antes de cada treino: ' + mobItens + '. ' : '') +
      esc(has(A.mobilidade_porque) ? val(A.mobilidade_porque) : 'Poucos minutos que preparam o corpo e protegem você.')));
    grid.appendChild(mob);

    var prog = el('div', 'pg-box');
    prog.appendChild(el('div', 'pg-box__t', '<span class="pg-ic">' + IC.trend + '</span> Regras de progressão'));
    prog.appendChild(el('p', null, esc(has(A.progressao_como) ? val(A.progressao_como) :
      'Você avança quando domina a etapa atual — evolução segura e constante.')));
    grid.appendChild(prog);
    p.appendChild(grid);

    var chk = el('div', 'pg-highlight');
    chk.appendChild(el('div', 'pg-highlight__t', 'Seu papel no processo'));
    var itens = Array.isArray(A.acompanhamento_info) ? A.acompanhamento_info : [];
    if (itens.length) {
      chk.appendChild(el('div', 'pg-check-inline__lead', 'Toda semana, me envie:'));
      var row = el('div', 'pg-check-inline');
      itens.forEach(function (i) { row.appendChild(el('span', 'pg-chip', '<span class="pg-tick">' + IC.check + '</span>' + esc(i))); });
      chk.appendChild(row);
    }
    if (has(A.acompanhamento_porque)) chk.appendChild(el('p', 'pg-muted', 'Isso me permite ' + esc(lower(val(A.acompanhamento_porque)))));
    p.appendChild(chk);

    p.appendChild(pageFoot(brand, 4));
    return p;
  }

  function encerramentoPage(state, brand) {
    var a = state.anamnese || {};
    var p = el('section', 'premium__page pg-close');
    p.appendChild(el('div', 'pg-eyebrow', 'Encerramento'));
    p.appendChild(el('p', 'pg-close__msg', esc(Report.closing(state))));

    var commit = el('p', 'pg-close__commit',
      '“Estou muito feliz por fazer parte da sua evolução. Agora temos um planejamento sólido, e o meu compromisso é acompanhar cada passo e fazer todos os ajustes necessários para você chegar aonde quer, da melhor forma possível.”');
    p.appendChild(commit);

    var sign = el('div', 'pg-sign');
    sign.innerHTML = '<span class="pg-mark">M</span><div><b>' + esc(brand.nome) + '</b><span>Montinho Training Strategy</span></div>';
    p.appendChild(sign);

    // contatos
    var contacts = el('div', 'pg-contacts');
    if (has(brand.whatsapp)) contacts.appendChild(el('span', null, '<span class="pg-ic">' + IC.chat + '</span>' + esc(brand.whatsapp)));
    if (has(brand.site)) contacts.appendChild(el('span', null, '<span class="pg-ic">' + IC.globe + '</span>' + esc(brand.site)));
    if (has(brand.instagram)) contacts.appendChild(el('span', null, '<span class="pg-ic">' + IC.instagram + '</span>' + esc(brand.instagram.replace(/^@?/, '@'))));
    if (contacts.childNodes.length) p.appendChild(contacts);

    // QR codes
    var waLink = QR.whatsappLink(brand.whatsapp);
    var igLink = QR.instagramLink(brand.instagram);
    if (waLink || igLink) {
      var qrs = el('div', 'pg-qrs');
      if (waLink) qrs.appendChild(QR.block({ data: waLink, label: 'WhatsApp', size: 140 }));
      if (igLink) qrs.appendChild(QR.block({ data: igLink, label: 'Instagram', size: 140 }));
      p.appendChild(qrs);
    }

    p.appendChild(pageFoot(brand, 5));
    return p;
  }

  function upper(s) { s = val(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function lower(s) { s = val(s); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  /* ---------------- montagem ---------------- */
  function buildPages(state) {
    var brand = Store.getBrand();
    var root = el('div', 'premium');
    root.appendChild(coverPage(state, brand));
    root.appendChild(diagnosticoPage(state, brand));
    root.appendChild(estrategiaPage(state, brand));
    root.appendChild(evolucaoPage(state, brand));
    root.appendChild(encerramentoPage(state, brand));
    return root;
  }

  function injectCSS() {
    if (document.getElementById('premium-css')) return;
    var s = document.createElement('style'); s.id = 'premium-css'; s.textContent = PREMIUM_CSS;
    document.head.appendChild(s);
  }

  function open(state) {
    injectCSS();
    var overlay = el('div', 'premium-overlay');
    var bar = el('div', 'premium-toolbar');
    bar.appendChild(el('div', 'premium-toolbar__t', 'PDF Premium · pré-visualização'));
    var spacer = el('span'); spacer.style.flex = '1'; bar.appendChild(spacer);
    var bHTML = el('button', 'btn btn--ghost', 'Exportar HTML');
    bHTML.addEventListener('click', function () { exportHTML(state); });
    var bPDF = el('button', 'btn btn--primary', 'Imprimir / Salvar PDF');
    bPDF.addEventListener('click', function () { window.print(); });
    var bClose = el('button', 'btn btn--ghost', 'Fechar');
    bClose.addEventListener('click', function () { document.body.removeChild(overlay); });
    bar.appendChild(bHTML); bar.appendChild(bPDF); bar.appendChild(bClose);
    overlay.appendChild(bar);
    overlay.appendChild(buildPages(state));
    document.body.appendChild(overlay);
    overlay.scrollTop = 0;
    return overlay;
  }

  function exportHTML(state) {
    var brand = Store.getBrand();
    var pages = buildPages(state);
    var nome = val((state.anamnese || {}).nome) || 'aluno';
    var html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Estratégia de Treino — ' + esc(nome) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">' +
      '<style>' + PREMIUM_CSS + 'body{background:#eef0f3;margin:0}.premium{margin:24px auto}</style></head>' +
      '<body>' + pages.outerHTML + '</body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'Estrategia - ' + nome + '.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------------- CSS (fonte única, também usada na exportação) ---------------- */
  var PREMIUM_CSS = [
    '.premium-overlay{position:fixed;inset:0;z-index:300;background:#eef0f3;overflow:auto;padding-bottom:60px}',
    '.premium-toolbar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:14px 20px;background:rgba(255,255,255,.85);backdrop-filter:saturate(180%) blur(16px);border-bottom:1px solid #e5e7eb}',
    '.premium-toolbar__t{font-size:14px;font-weight:600;color:#111}',
    '.premium{--pg-ink:#101114;--pg-mut:#6b7280;--pg-line:#e6e7ea;--pg-gold:#b78b3a;--pg-gold-bg:#faf5ea;max-width:820px;margin:24px auto;padding:0 16px;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--pg-ink)}',
    '.premium__page{background:#fff;border:1px solid var(--pg-line);border-radius:6px;box-shadow:0 12px 40px rgba(16,17,20,.08);padding:52px 56px;margin-bottom:28px;position:relative;min-height:940px;display:flex;flex-direction:column;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    '.pg-mark{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#101114;color:#fff;font-weight:700;font-size:15px;flex:0 0 auto}',
    '.pg-eyebrow{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--pg-gold)}',
    '.pg-rule{width:44px;height:2px;background:var(--pg-gold);margin:20px 0}',
    '.pg-h2{font-size:30px;font-weight:680;letter-spacing:-.02em;margin:0 0 4px;padding-bottom:14px;position:relative}',
    '.pg-h2::after{content:"";position:absolute;left:0;bottom:0;width:40px;height:3px;background:var(--pg-gold);border-radius:2px}',
    '.pg-foot{margin-top:auto;padding-top:22px;border-top:1px solid var(--pg-line);display:flex;justify-content:space-between;font-size:11px;color:var(--pg-mut);letter-spacing:.02em}',
    /* cover */
    '.pg-cover{justify-content:space-between}',
    '.pg-cover__top{display:flex;justify-content:space-between;align-items:center}',
    '.pg-brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px}',
    '.pg-cover__date{font-size:13px;color:var(--pg-mut)}',
    '.pg-cover__mid{padding:40px 0}',
    '.pg-cover__name{font-size:22px;font-weight:600;color:var(--pg-gold);margin-top:14px}',
    '.pg-cover__title{font-size:52px;line-height:1.02;font-weight:700;letter-spacing:-.04em;margin:0}',
    '.pg-cover__sub{font-size:18px;color:var(--pg-mut);margin-top:12px;font-weight:500}',
    '.pg-cover__phrase{font-size:17px;line-height:1.6;color:#3a3b40;max-width:44ch;margin-top:32px;font-style:italic}',
    '.pg-cover__foot{margin-top:auto;font-size:12px;color:var(--pg-mut);letter-spacing:.03em}',
    /* cards */
    '.pg-grid4{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:26px 0}',
    '.pg-card{border:1px solid var(--pg-line);border-radius:10px;padding:18px}',
    '.pg-card__ic{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:8px;background:var(--pg-gold-bg);color:var(--pg-gold);margin-bottom:12px}',
    '.pg-card__ic svg{width:19px;height:19px}',
    '.pg-card__lbl{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--pg-mut)}',
    '.pg-card__val{font-size:16px;font-weight:560;margin-top:4px;line-height:1.35}',
    '.pg-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0 22px}',
    '.pg-box{border:1px solid var(--pg-line);border-radius:10px;padding:18px 20px}',
    '.pg-box__t{font-size:13px;font-weight:640;margin-bottom:12px;display:flex;align-items:center;gap:8px}',
    '.pg-box p{font-size:14px;line-height:1.6;color:#33343a;margin:0}',
    '.pg-ic{display:inline-flex;color:var(--pg-gold)}.pg-ic svg{width:17px;height:17px}',
    '.pg-check,.pg-dot{list-style:none;margin:0;padding:0;display:grid;gap:9px}',
    '.pg-check li{display:flex;gap:9px;font-size:14px;line-height:1.4;align-items:flex-start}',
    '.pg-tick{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--pg-gold-bg);color:var(--pg-gold);flex:0 0 auto;margin-top:1px}',
    '.pg-tick svg{width:12px;height:12px}',
    '.pg-dot li{position:relative;padding-left:16px;font-size:14px;line-height:1.5}',
    '.pg-dot li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:50%;background:var(--pg-gold)}',
    '.pg-highlight{background:var(--pg-gold-bg);border:1px solid #efe3c8;border-radius:12px;padding:22px 24px;margin-top:6px}',
    '.pg-highlight__t{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--pg-gold);margin-bottom:10px}',
    '.pg-highlight p{font-size:14.5px;line-height:1.65;color:#33343a;margin:0}',
    /* estrategia */
    '.pg-blocks{display:grid;gap:14px;margin:24px 0}',
    '.pg-block{border:1px solid var(--pg-line);border-radius:10px;padding:18px 20px}',
    '.pg-block__h{font-size:13px;font-weight:640;display:flex;align-items:center;gap:9px}',
    '.pg-block__ic{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:7px;background:#101114;color:#fff}',
    '.pg-block__ic svg{width:16px;height:16px}',
    '.pg-block__v{font-size:16px;font-weight:560;margin-top:10px}',
    '.pg-block__d{font-size:13.5px;color:var(--pg-mut);margin-top:6px;line-height:1.5}',
    '.pg-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}',
    '.pg-badge{font-size:11.5px;font-weight:560;padding:4px 10px;border-radius:999px;border:1px solid var(--pg-gold);color:var(--pg-gold)}',
    '.pg-timeline{margin-top:8px;border:1px solid var(--pg-line);border-radius:12px;padding:22px 24px}',
    '.pg-timeline__t{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--pg-mut);margin-bottom:18px}',
    '.pg-timeline__track{display:grid;gap:0}',
    '.pg-tl{display:flex;gap:14px;padding-bottom:20px;position:relative}',
    '.pg-tl:last-child{padding-bottom:0}',
    '.pg-tl::before{content:"";position:absolute;left:6px;top:14px;bottom:-6px;width:2px;background:var(--pg-line)}',
    '.pg-tl:last-child::before{display:none}',
    '.pg-tl__dot{width:14px;height:14px;border-radius:50%;border:3px solid var(--pg-gold);background:#fff;flex:0 0 auto;margin-top:2px;z-index:1}',
    '.pg-tl__lbl{font-size:14.5px;line-height:1.4}.pg-tl__lbl b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--pg-gold);margin-bottom:2px;font-weight:600}',
    /* evolucao */
    '.pg-check-inline__lead{font-size:13.5px;color:#33343a;margin-bottom:12px}',
    '.pg-check-inline{display:flex;flex-wrap:wrap;gap:8px}',
    '.pg-chip{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:500;padding:7px 13px;border-radius:999px;background:#fff;border:1px solid var(--pg-line)}',
    '.pg-muted{font-size:13px;color:var(--pg-mut);margin-top:14px}',
    /* encerramento */
    '.pg-close{justify-content:flex-start}',
    '.pg-close__msg{font-size:18px;line-height:1.7;font-weight:500;margin:18px 0 0;max-width:52ch}',
    '.pg-close__commit{font-size:15px;line-height:1.7;color:#3a3b40;font-style:italic;margin:24px 0;max-width:52ch}',
    '.pg-sign{display:flex;align-items:center;gap:12px;margin-top:10px;padding-top:22px;border-top:1px solid var(--pg-line)}',
    '.pg-sign b{display:block;font-size:15px}.pg-sign span{font-size:12.5px;color:var(--pg-mut)}',
    '.pg-contacts{display:flex;flex-wrap:wrap;gap:18px;margin-top:18px;font-size:13.5px;color:#33343a}',
    '.pg-contacts span{display:inline-flex;align-items:center;gap:7px}',
    '.pg-qrs{display:flex;gap:28px;margin-top:26px}',
    '.pg-qr{text-align:center}',
    '.pg-qr__img{border:1px solid var(--pg-line);border-radius:8px;padding:6px;background:#fff}',
    '.pg-qr__ph{display:grid;place-items:center;border:1px dashed var(--pg-line);border-radius:8px;color:var(--pg-mut);font-size:12px}',
    '.pg-qr__lbl{font-size:12px;color:var(--pg-mut);margin-top:8px;font-weight:500}',
    '@media (max-width:640px){.premium__page{padding:30px 24px;min-height:0}.pg-grid4,.pg-2col{grid-template-columns:1fr}.pg-cover__title{font-size:38px}}',
    '@media print{.premium-overlay{position:static;background:#fff;padding:0;overflow:visible}.premium-toolbar{display:none}.ws,.nav,.stepper,.toast,.modal-backdrop{display:none!important}.premium{max-width:none;margin:0;padding:0}.premium__page{box-shadow:none;border:none;border-radius:0;margin:0;min-height:auto;padding:16mm 16mm;page-break-after:always}.premium__page:last-child{page-break-after:auto}@page{size:A4;margin:0}}'
  ].join('\n');

  return { open: open, exportHTML: exportHTML, buildPages: buildPages, injectCSS: injectCSS };
})();
