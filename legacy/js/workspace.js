/* =========================================================================
   Montinho Training Strategy — Workspace (orquestração da UI)
   Fluxo: Anamnese -> Diagnóstico -> Entrevista -> Revisão -> Relatório.
   Entrevista inteligente (Módulo 3): uma pergunta por vez, adaptativa,
   com auditoria de inconsistências e checklist final.
   ========================================================================= */
(function () {
  "use strict";

  var Store = MTS.Store, Report = MTS.Report, AI = MTS.AI, IV = MTS.Interview, Memory = MTS.Memory, KB = MTS.Knowledge, Voice = MTS.Voice;
  var sideView = 'estrategia'; // painel lateral da entrevista: estrategia | relatorio
  var panel = document.getElementById('panel');
  var stepperEl = document.getElementById('stepper');
  var modalRoot = document.getElementById('modalRoot');
  var toastEl = document.getElementById('toast');

  var STEPS = [
    { id: 'anamnese', label: 'Anamnese' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'entrevista', label: 'Entrevista' },
    { id: 'revisao', label: 'Revisão' },
    { id: 'relatorio', label: 'Relatório' }
  ];
  var STEP_TOTAL = STEPS.length;

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function has(v) { return Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== ''); }
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }
  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  var ICON_GOOD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function state() { return Store.get(); }
  function go(step) { Store.patch({ step: step }); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function isAdaptive(id) { return (MTS.ADAPTIVE || []).some(function (a) { return a.id === id; }); }

  /* ---------- stepper ---------- */
  function renderStepper() {
    stepperEl.innerHTML = '';
    var cur = state().step;
    var curIdx = STEPS.map(function (s) { return s.id; }).indexOf(cur);
    STEPS.forEach(function (s, i) {
      if (i > 0) stepperEl.appendChild(el('span', 'step__sep', '›'));
      var cls = 'step' + (s.id === cur ? ' is-active' : (i < curIdx ? ' is-done' : ''));
      var btn = el('button', cls);
      btn.innerHTML = '<span class="step__n">' + (i < curIdx ? '✓' : (i + 1)) +
        '</span><span class="step__lbl">' + s.label + '</span>';
      btn.addEventListener('click', function () { go(s.id); });
      stepperEl.appendChild(btn);
    });
  }

  function renderAIPill() {
    var pill = document.getElementById('aiPill');
    var lbl = document.getElementById('aiPillLabel');
    var on = AI.isConfigured();
    pill.classList.toggle('is-on', on);
    lbl.textContent = on ? 'IA ligada' : 'IA desligada';
  }

  function head(step, title, desc) {
    var idx = STEPS.map(function (s) { return s.id; }).indexOf(step) + 1;
    var h = el('div', 'panel__head');
    h.innerHTML = '<span class="eyebrow">Passo ' + idx + ' de ' + STEP_TOTAL + '</span><h2>' +
      esc(title) + '</h2>' + (desc ? '<p>' + esc(desc) + '</p>' : '');
    return h;
  }

  /* =======================================================================
     PASSO 1 — ANAMNESE
     ======================================================================= */
  function renderAnamnese() {
    var wrap = el('div');
    wrap.appendChild(head('anamnese', 'Anamnese do aluno',
      'Preencha o que você já sabe sobre o aluno. Tudo é salvo automaticamente neste navegador. ' +
      'A partir daqui, a entrevista se adapta a este perfil.'));

    var a = state().anamnese;
    (MTS.ANAMNESE).forEach(function (sec) {
      var card = el('div', 'formcard');
      card.appendChild(el('h3', null, esc(sec.title)));
      sec.fields.forEach(function (f) { card.appendChild(buildField(f, a[f.id])); });
      wrap.appendChild(card);
    });

    var actions = el('div', 'actions');
    actions.appendChild(el('span', 'hint', 'Você pode voltar e ajustar a qualquer momento.'));
    actions.appendChild(el('span', 'spacer'));
    var next = el('button', 'btn btn--primary btn--lg', 'Analisar anamnese →');
    next.addEventListener('click', function () { go('diagnostico'); });
    actions.appendChild(next);
    wrap.appendChild(actions);

    panel.innerHTML = ''; panel.appendChild(wrap);
  }

  function buildField(f, value) {
    var field = el('div', 'field');
    var id = 'f_' + f.id;
    var lab = el('label', null, esc(f.label)); lab.setAttribute('for', id);
    field.appendChild(lab);
    var input = inputForType(f, value, id);
    input.addEventListener(f.type === 'select' ? 'change' : 'input', function () {
      Store.setAnamnese(f.id, input.value);
    });
    field.appendChild(input);
    return field;
  }

  function inputForType(f, value, id) {
    var input;
    if (f.type === 'textarea') { input = el('textarea'); }
    else if (f.type === 'select') {
      input = el('select');
      var o0 = el('option', null, '—'); o0.value = ''; input.appendChild(o0);
      f.options.forEach(function (opt) { var o = el('option', null, esc(opt)); o.value = opt; input.appendChild(o); });
    } else { input = el('input'); input.type = f.type === 'number' ? 'number' : 'text'; }
    if (id) input.id = id;
    if (f.placeholder) input.placeholder = f.placeholder;
    if (value != null) input.value = value;
    return input;
  }

  /* =======================================================================
     PASSO 2 — DIAGNÓSTICO
     ======================================================================= */
  function renderDiagnostico() {
    var s = state();
    var d = Report.diagnosis(s);
    var wrap = el('div');
    wrap.appendChild(head('diagnostico', 'Diagnóstico',
      'Um retrato organizado do aluno, a partir da anamnese. Ainda não há estratégia — ' +
      'este resumo guia a entrevista, que se adapta ao que aparece aqui.'));

    var diag = el('div', 'diag');
    if (s.diagnosisNote) {
      diag.appendChild(el('h4', null, 'Resumo executivo (IA)'));
      diag.appendChild(el('p', 'diag__note', esc(s.diagnosisNote)));
    }

    diag.appendChild(el('h4', null, 'Perfil'));
    if (d.perfil.length) {
      var dl = el('dl', 'kv');
      d.perfil.forEach(function (row) { dl.appendChild(el('dt', null, esc(row[0]))); dl.appendChild(el('dd', null, esc(row[1]))); });
      diag.appendChild(dl);
    } else { diag.appendChild(el('p', 'hint', 'Preencha a anamnese para ver o perfil.')); }

    diag.appendChild(el('h4', null, 'Pontos de atenção & riscos'));
    diag.appendChild(noteList(d.atencao, 'warn', 'Nenhum ponto crítico identificado automaticamente.'));

    diag.appendChild(el('h4', null, 'Oportunidades'));
    diag.appendChild(noteList(d.oportunidades, 'good', 'Sem oportunidades destacadas ainda — depende de mais dados da anamnese.'));

    // prévia das adaptações da entrevista
    var adapts = (MTS.ADAPTIVE || []).filter(function (aq) { return aq.when(s.anamnese || {}); });
    if (adapts.length) {
      diag.appendChild(el('h4', null, 'A entrevista foi adaptada'));
      var ul = el('ul', 'notelist');
      adapts.forEach(function (aq) {
        var li = el('li', 'note');
        li.appendChild(el('span', 'note__ico', ICON_GOOD));
        li.appendChild(el('span', null, 'Perguntas extras sobre <b>' + esc(aq.label.toLowerCase()) + '</b> foram incluídas.'));
        ul.appendChild(li);
      });
      diag.appendChild(ul);
    }

    // DNA do Montinho (preferências aprendidas do treinador)
    if (Voice) {
      var d = Voice.dna(s);
      if (d.prefs.length || d.cycles > 0) {
        diag.appendChild(el('h4', null, 'DNA do Montinho'));
        var dl2 = el('ul', 'notelist');
        d.insights.slice(0, 4).forEach(function (t) {
          var li = el('li', 'note');
          li.appendChild(el('span', 'note__ico', ICON_GOOD));
          li.appendChild(el('span', null, esc(t)));
          dl2.appendChild(li);
        });
        diag.appendChild(dl2);
      }
    }

    wrap.appendChild(diag);

    var actions = el('div', 'actions');
    var back = el('button', 'btn btn--ghost', '← Anamnese');
    back.addEventListener('click', function () { go('anamnese'); });
    actions.appendChild(back);
    if (AI.isConfigured()) {
      var aiBtn = el('button', 'btn btn--ghost', 'Gerar resumo com IA');
      aiBtn.addEventListener('click', function () { runDiagnose(aiBtn); });
      actions.appendChild(aiBtn);
    }
    actions.appendChild(el('span', 'spacer'));
    var next = el('button', 'btn btn--primary btn--lg', 'Iniciar entrevista →');
    next.addEventListener('click', function () { go('entrevista'); });
    actions.appendChild(next);
    wrap.appendChild(actions);

    panel.innerHTML = ''; panel.appendChild(wrap);
  }

  function noteList(items, kind, emptyMsg) {
    var ul = el('ul', 'notelist');
    if (!items || !items.length) { if (emptyMsg) ul.appendChild(el('li', 'hint', esc(emptyMsg))); return ul; }
    var ico = kind === 'warn' ? ICON_WARN : ICON_GOOD;
    items.forEach(function (msg) {
      var li = el('li', 'note note--' + kind);
      li.appendChild(el('span', 'note__ico', ico));
      li.appendChild(el('span', null, esc(msg)));
      ul.appendChild(li);
    });
    return ul;
  }

  function runDiagnose(btn) {
    var original = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="loading"></span> Analisando...';
    AI.diagnose(state()).then(function (text) {
      Store.patch({ diagnosisNote: text }); renderDiagnostico(); toast('Resumo executivo gerado.');
    }).catch(function (e) { btn.disabled = false; btn.innerHTML = original; toast('Falha na IA: ' + e.message); });
  }

  /* =======================================================================
     PASSO 3 — ENTREVISTA (uma pergunta por vez, conversacional)
     ======================================================================= */
  function renderEntrevista() {
    var s = state();
    var curId = IV.currentId(s);
    var wrap = el('div');
    wrap.appendChild(head('entrevista', 'Entrevista',
      'Uma conversa, uma pergunta por vez. Cada resposta vira uma seção do relatório — e o ' +
      'sistema pergunta o porquê para explicar ao aluno.'));

    if (!curId) {
      wrap.appendChild(el('p', 'hint', 'Preencha a anamnese para começar a entrevista.'));
      panel.innerHTML = ''; panel.appendChild(wrap); return;
    }

    var item = IV.itemById(s, curId);
    var topic = item.topic, q = item.q;
    var prog = IV.progress(s);

    var split = el('div', 'split');

    /* ---- esquerda: a pergunta ---- */
    var qcard = el('div', 'qcard');

    var meta = el('div', 'qcard__meta');
    meta.innerHTML = '<span class="qcard__badge">Tópico ' + topic.n + ' de ' + MTS.TOPICS.length + '</span>' +
      '<span>' + esc(topic.name) + '</span>' +
      (isAdaptive(q.id) ? '<span class="qcard__badge" style="background:var(--line-soft);color:var(--ink-mute)">✦ pergunta adaptada</span>' : '');
    qcard.appendChild(meta);

    var pb = el('div', 'progressbar');
    pb.innerHTML = '<span style="width:' + prog.pct + '%"></span>';
    qcard.appendChild(pb);
    qcard.appendChild(el('p', 'hint', prog.answered + ' de ' + prog.total + ' perguntas respondidas'))
      .style.margin = '6px 0 18px';

    var isWhy = !!q.why;
    if (isWhy) qcard.appendChild(el('div', 'qcard__why', '<span class="dotline">↳</span> ' + esc(q.prompt)));
    else qcard.appendChild(el('h3', 'qcard__ask', esc(q.prompt)));

    if (q.hint) qcard.appendChild(el('p', 'hint', esc(q.hint))).style.marginTop = '-4px';

    // input da resposta
    var field = el('div', 'field'); field.style.marginTop = '18px';
    field.appendChild(el('label', null, isWhy ? 'O porquê (será explicado ao aluno em linguagem simples)' : 'Sua resposta'));
    var control = buildAnswerControl(q, s.answers[q.id]);
    field.appendChild(control.node);
    qcard.appendChild(field);

    // auditoria de inconsistências
    var auditBox = el('div');
    // biblioteca: justificativas automáticas
    var kbBox = el('div');
    function refreshAudit() { renderConsistency(auditBox, IV.consistency(state())); renderKB(kbBox, topic.id); }
    control.onChange = function () { refreshAudit(); };
    refreshAudit();
    qcard.appendChild(auditBox);
    qcard.appendChild(kbBox);

    // navegação
    var nav = el('div', 'actions');
    var prevId = IV.neighbor(s, curId, -1);
    var prev = el('button', 'btn btn--ghost', '← Anterior');
    prev.disabled = !prevId;
    prev.addEventListener('click', function () { Store.patch({ currentQ: prevId }); renderEntrevista(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    nav.appendChild(prev);
    nav.appendChild(el('span', 'spacer'));

    var nextId = IV.neighbor(s, curId, +1);
    if (nextId) {
      var nextBtn = el('button', 'btn btn--primary', 'Registrar e continuar →');
      nextBtn.addEventListener('click', function () { learnFromTopic(topic.id); Store.patch({ currentQ: nextId }); renderEntrevista(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      nav.appendChild(nextBtn);
    } else {
      var doneBtn = el('button', 'btn btn--primary', 'Concluir e revisar →');
      doneBtn.addEventListener('click', function () { learnFromTopic(topic.id); go('revisao'); });
      nav.appendChild(doneBtn);
    }
    qcard.appendChild(nav);

    // atalhos entre tópicos
    var tnav = el('div', 'topicnav');
    MTS.TOPICS.forEach(function (t) {
      var firstId = IV.firstIdOfTopic(s, t.id);
      var filled = IV.questionsForTopic(t, s).some(function (qq) { return has(s.answers[qq.id]); });
      var b = el('button', (t.id === topic.id ? 'is-current' : '') + (filled ? ' is-filled' : ''), t.n + '. ' + esc(t.name));
      b.addEventListener('click', function () { if (firstId) { Store.patch({ currentQ: firstId }); renderEntrevista(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
      tnav.appendChild(b);
    });
    qcard.appendChild(tnav);

    split.appendChild(qcard);
    split.appendChild(sidePanel(s, topic.id));
    wrap.appendChild(split);

    panel.innerHTML = ''; panel.appendChild(wrap);
  }

  /* ---------- painel lateral: Estratégia em construção / Relatório ---------- */
  function sidePanel(s, currentTopicId) {
    var dash = el('div', 'dash');
    var card = el('div', 'dash__card');
    var inner = el('div', 'dash__inner');

    var seg = el('div', 'seg');
    [['estrategia', 'Estratégia'], ['relatorio', 'Relatório']].forEach(function (pair) {
      var b = el('button', sideView === pair[0] ? 'is-on' : '', pair[1]);
      b.addEventListener('click', function () { sideView = pair[0]; renderEntrevista(); });
      seg.appendChild(b);
    });
    inner.appendChild(seg);

    if (sideView === 'relatorio') inner.appendChild(livePreview(s));
    else inner.appendChild(dashboard(s, currentTopicId));

    card.appendChild(inner);
    dash.appendChild(card);
    return dash;
  }

  function blockBar(pct) {
    var total = 12, filled = Math.max(0, Math.min(total, Math.round(pct / 100 * total)));
    var wrap = el('span', 'blockbar');
    var full = ''; for (var i = 0; i < filled; i++) full += '█';
    var empty = ''; for (var j = 0; j < total - filled; j++) empty += '░';
    wrap.appendChild(document.createTextNode(full));
    wrap.appendChild(el('span', 'empty', empty));
    return wrap;
  }

  function dashboard(s, currentTopicId) {
    var box = el('div');
    box.appendChild(el('div', 'dash__title', 'Estratégia em construção'));

    var comp = Report.completion(s);
    var pctRow = el('div', 'dash__pct');
    pctRow.appendChild(el('b', null, comp.pct + '%'));
    pctRow.appendChild(el('span', null, comp.complete ? 'estratégia concluída' : 'em construção'));
    box.appendChild(pctRow);
    box.appendChild(blockBar(comp.pct));

    var ul = el('ul', 'arealist');
    Memory.areaStatus(s, currentTopicId).forEach(function (area) {
      var li = el('li', area.status === 'done' ? 'is-done' : (area.status === 'pending' ? 'is-pending' : ''));
      var mark = area.status === 'done' ? '✓' : (area.status === 'progress' ? '●' : '○');
      var mcls = area.status === 'done' ? 'adone' : (area.status === 'progress' ? 'aprog' : 'apend');
      li.appendChild(el('span', 'amark ' + mcls, mark));
      li.appendChild(el('span', 'aname', area.n + '. ' + esc(area.name)));
      var edit = el('button', 'aedit', 'editar');
      edit.addEventListener('click', function () { jumpToTopic(area.id); });
      li.appendChild(edit);
      li.addEventListener('click', function (e) { if (e.target !== edit) jumpToTopic(area.id); });
      ul.appendChild(li);
    });
    box.appendChild(ul);

    var sugg = Memory.suggestions(s);
    if (sugg.length) {
      var sbox = el('div', 'suggest');
      sbox.appendChild(el('h5', null, 'Sugestões'));
      sugg.forEach(function (t) {
        var row = el('div', 'stip');
        row.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.2 1 2V17h6v-1.5c0-.8.4-1.4 1-2A6 6 0 0 0 12 3zM9 21h6"/></svg><span>' + esc(t) + '</span>';
        sbox.appendChild(row);
      });
      box.appendChild(sbox);
    }

    var full = el('button', 'btn btn--ghost dash__full', 'Ver estratégia completa');
    full.addEventListener('click', openMemoryModal);
    box.appendChild(full);
    return box;
  }

  function jumpToTopic(topicId) {
    var fid = IV.firstIdOfTopic(state(), topicId);
    if (fid) { Store.patch({ step: 'entrevista', currentQ: fid }); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else { go('anamnese'); }
  }

  /* Controle de resposta conforme o tipo da pergunta. */
  function buildAnswerControl(q, value) {
    var api = { node: null, onChange: function () {} };
    if (q.type === 'choice') {
      var sel = el('select');
      var o0 = el('option', null, '—'); o0.value = ''; sel.appendChild(o0);
      q.options.forEach(function (opt) { var o = el('option', null, esc(opt)); o.value = opt; sel.appendChild(o); });
      if (value != null) sel.value = value;
      sel.addEventListener('change', function () { Store.setAnswer(q.id, sel.value); api.onChange(); });
      api.node = sel;
    } else if (q.type === 'multi') {
      var chosen = Array.isArray(value) ? value.slice() : [];
      var box = el('div', 'topicnav'); box.style.marginTop = '2px';
      q.options.forEach(function (opt) {
        var on = chosen.indexOf(opt) !== -1;
        var b = el('button', on ? 'is-current' : '', esc(opt)); b.type = 'button';
        b.addEventListener('click', function () {
          var i = chosen.indexOf(opt);
          if (i === -1) { chosen.push(opt); b.className = 'is-current'; }
          else { chosen.splice(i, 1); b.className = ''; }
          Store.setAnswer(q.id, chosen.slice()); api.onChange();
        });
        box.appendChild(b);
      });
      api.node = box;
    } else {
      var input = q.type === 'text' ? el('input') : el('textarea');
      if (q.type === 'text') input.type = 'text';
      if (q.placeholder) input.placeholder = q.placeholder;
      if (value != null) input.value = value;
      input.addEventListener('input', function () { Store.setAnswer(q.id, input.value); api.onChange(); });
      api.node = input;
    }
    return api;
  }

  function renderConsistency(box, notes) {
    box.innerHTML = '';
    if (!notes.length) return;
    var h = el('h4', null, 'Análise crítica');
    h.style.cssText = 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin:22px 0 10px';
    box.appendChild(h);
    var ul = el('ul', 'notelist');
    notes.forEach(function (note) {
      var li = el('li', 'note note--warn');
      li.appendChild(el('span', 'note__ico', ICON_WARN));
      var body = el('span');
      body.appendChild(el('div', null, esc(note.text)));
      var acts = el('div', 'section-tools'); acts.style.marginTop = '8px'; acts.style.marginLeft = '0';
      var review = el('button', null, 'Rever');
      review.addEventListener('click', function () {
        var fid = IV.firstIdOfTopic(state(), note.topic);
        if (fid) { Store.patch({ step: 'entrevista', currentQ: fid }); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      });
      var keep = el('button', null, 'Manter decisão');
      keep.addEventListener('click', function () { Store.acknowledge(note.id); toast('Decisão mantida, registrada.'); if (state().step === 'entrevista') renderEntrevista(); else renderRevisao(); });
      acts.appendChild(review); acts.appendChild(keep);
      body.appendChild(acts);
      li.appendChild(body);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  /* Cartão da biblioteca: justificativas automáticas das estratégias escolhidas. */
  function renderKB(box, topicId) {
    box.innerHTML = '';
    if (!KB) return;
    var s = state();
    var entries = KB.forTopic(s, topicId);
    if (!entries.length) return;
    var h = el('h4', null, '📚 Biblioteca');
    h.style.cssText = 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin:22px 0 10px';
    box.appendChild(h);
    entries.slice(0, 3).forEach(function (e) { box.appendChild(kbEntryCard(e, s)); });
  }

  function kbEntryCard(e, s) {
    var card = el('div', 'kb');
    var exp = KB.explain(e, s);
    var head = el('div', 'kb__head');
    head.appendChild(el('span', 'kb__title', esc(e.title)));
    head.appendChild(el('span', 'kb__conf kb__conf--' + KB.confidenceClass(e), 'Confiança: ' + e.conf));
    if (exp.profile) head.appendChild(el('span', 'kb__profile', 'adaptado · ' + esc(exp.profile)));
    card.appendChild(head);
    card.appendChild(el('p', 'kb__student', esc(exp.text)));
    if ((Store.preferences() || {})[e.id])
      card.appendChild(el('div', 'kb__pref', '✓ Faz parte do seu DNA — você costuma usar isto.'));

    var more = el('div', 'kb__more'); more.style.display = 'none';
    more.appendChild(kbRow('O que é', e.what));
    more.appendChild(kbRow('Por que usar', e.why));
    more.appendChild(kbRow('Benefícios', e.benefits.join(' · ')));
    more.appendChild(kbRow('Riscos / atenção', e.risks.join(' · ')));
    more.appendChild(kbRow('Quando usar', e.whenUse));
    more.appendChild(kbRow('Quando evitar', e.whenAvoid));
    more.appendChild(kbRow('Evidência', KB.confidenceNote(e)));
    card.appendChild(more);

    var toggle = el('button', 'kb__toggle', 'Ver fundamentação técnica');
    toggle.addEventListener('click', function () {
      var open = more.style.display === 'none';
      more.style.display = open ? 'block' : 'none';
      toggle.textContent = open ? 'Ocultar fundamentação' : 'Ver fundamentação técnica';
    });
    card.appendChild(toggle);
    return card;
  }
  function kbRow(label, val) {
    var row = el('div', 'kb__row');
    row.appendChild(el('span', 'kb__lbl', esc(label)));
    row.appendChild(el('span', null, esc(val)));
    return row;
  }

  /* Aprende as preferências do treinador a partir das escolhas de um tópico. */
  function learnFromTopic(topicId) {
    if (!KB) return;
    var s = state();
    var label = (s.anamnese && s.anamnese.experiencia) ? String(s.anamnese.experiencia).toLowerCase() : '';
    KB.forTopic(s, topicId).forEach(function (e) { Store.learnPreference(e.id, e.title, label); });
  }

  function livePreview(s) {
    var box = el('div', 'report');
    var inner = el('div', 'report__inner');
    inner.appendChild(el('div', 'qcard__meta', '<span class="qcard__badge">Relatório em tempo real</span>'));
    var secs = Report.sections(s);
    if (!secs.length && !has((s.answers || {}).filosofia_frase)) {
      inner.appendChild(el('p', 'report__empty', 'À medida que você registra decisões, o relatório do aluno aparece aqui.'));
    } else {
      inner.appendChild(el('div', 'report__intro', esc(Report.intro(s))));
      secs.forEach(function (sec) {
        var block = el('div', 'report__section');
        block.appendChild(el('h3', null, esc(sec.title)));
        block.appendChild(el('p', null, esc(sec.body)));
        inner.appendChild(block);
      });
    }
    box.appendChild(inner);
    return box;
  }

  /* =======================================================================
     PASSO 4 — REVISÃO (checklist final)
     ======================================================================= */
  function renderRevisao() {
    var s = state();
    var missing = IV.requiredMissing(s);
    var notes = IV.consistency(s);
    var wrap = el('div');
    wrap.appendChild(head('revisao', 'Revisão final',
      'Antes de gerar as versões finais, confirmamos que todas as áreas foram respondidas. ' +
      'Nunca geramos um relatório incompleto.'));

    // inconsistências pendentes
    if (notes.length) {
      var cbox = el('div'); cbox.style.marginBottom = 'var(--s4)';
      renderConsistency(cbox, notes);
      wrap.appendChild(cbox);
    }

    // checklist por tópico
    var card = el('div', 'formcard');
    card.appendChild(el('h3', null, 'Checklist por área'));
    var ul = el('ul', 'notelist');
    MTS.TOPICS.forEach(function (t) {
      var topicMissing = missing.filter(function (m) { return m.topic.id === t.id; });
      var ok = topicMissing.length === 0;
      var li = el('li', 'note note--' + (ok ? 'good' : 'warn'));
      li.appendChild(el('span', 'note__ico', ok ? ICON_GOOD : ICON_WARN));
      var body = el('span');
      body.appendChild(el('div', null, '<b>' + t.n + '. ' + esc(t.name) + '</b>' + (ok ? ' — completo' : '')));
      if (!ok) {
        topicMissing.forEach(function (m) {
          var row = el('div'); row.style.cssText = 'margin-top:6px;font-size:13.5px;color:var(--ink-mute)';
          row.textContent = 'Falta: ' + (m.q ? m.q.prompt : m.id);
          body.appendChild(row);
        });
        var tools = el('div', 'section-tools'); tools.style.cssText = 'margin:8px 0 0';
        var b = el('button', null, 'Responder agora');
        b.addEventListener('click', function () {
          var fid = topicMissing[0].id;
          Store.patch({ step: 'entrevista', currentQ: fid }); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        tools.appendChild(b); body.appendChild(tools);
      }
      li.appendChild(body);
      ul.appendChild(li);
    });
    card.appendChild(ul);
    wrap.appendChild(card);

    if (!missing.length)
      wrap.appendChild(el('div', 'confirm-q', 'Deseja alterar alguma informação antes de gerar o relatório? ' +
        'Você pode editar qualquer área — nada é gerado automaticamente.'));

    var actions = el('div', 'actions');
    var back = el('button', 'btn btn--ghost', '← Voltar à entrevista');
    back.addEventListener('click', function () { go('entrevista'); });
    actions.appendChild(back);
    var memBtn = el('button', 'btn btn--ghost', 'Ver estratégia completa');
    memBtn.addEventListener('click', openMemoryModal);
    actions.appendChild(memBtn);
    actions.appendChild(el('span', 'spacer'));

    if (missing.length) {
      actions.appendChild(el('span', 'hint', 'Faltam ' + missing.length + ' resposta(s) obrigatória(s).'));
      var disabled = el('button', 'btn btn--primary btn--lg', 'Gerar relatório →');
      disabled.disabled = true; disabled.style.opacity = '.5'; disabled.style.pointerEvents = 'none';
      actions.appendChild(disabled);
    } else {
      var next = el('button', 'btn btn--primary btn--lg', 'Gerar relatório →');
      next.addEventListener('click', function () { go('relatorio'); });
      actions.appendChild(next);
    }
    wrap.appendChild(actions);

    panel.innerHTML = ''; panel.appendChild(wrap);
  }

  /* =======================================================================
     PASSO 5 — RELATÓRIO (revisão + versões finais)
     ======================================================================= */
  function renderRelatorio() {
    var s = state();
    var comp = Report.completion(s);
    var wrap = el('div');
    wrap.appendChild(head('relatorio', 'Relatório',
      'Uma apresentação profissional que responde ao aluno: qual é o objetivo, por que o treino ' +
      'foi montado assim e como vamos chegar lá. Revise, ajuste e gere as versões finais.'));

    var split = el('div', 'split');

    // documento
    var doc = el('div', 'report');
    var inner = el('div', 'report__inner');
    var brand = el('div', 'report__brand');
    brand.innerHTML = '<span class="brand__mark">M</span><span class="brand__name">Montinho <small>Training Strategy</small></span>';
    inner.appendChild(brand);

    var secs = Report.sections(s);
    if (!secs.length) {
      inner.appendChild(el('p', 'report__empty', 'Ainda não há decisões registradas. Volte à entrevista para construir o relatório.'));
    } else {
      var nome = (s.anamnese.nome || '').trim();
      inner.appendChild(el('div', 'report__title', 'Estratégia de treino' + (nome ? ' · ' + esc(nome) : '')));
      inner.appendChild(el('div', 'report__intro', esc(Report.intro(s))));
      secs.forEach(function (sec) {
        var block = el('div', 'report__section'); block.dataset.id = sec.id;
        var h = el('h3', null, esc(sec.title));
        var tools = el('span', 'section-tools');
        var editBtn = el('button', null, 'Editar'); editBtn.dataset.edit = sec.id; tools.appendChild(editBtn);
        if (s.overrides && s.overrides[sec.id] != null) { var rev = el('button', null, 'Reverter'); rev.dataset.revert = sec.id; tools.appendChild(rev); }
        if (AI.isConfigured()) { var aiB = el('button', null, 'Reescrever com IA'); aiB.dataset.airewrite = sec.id; tools.appendChild(aiB); }
        h.appendChild(tools);
        block.appendChild(h);
        block.appendChild(el('p', null, esc(sec.body)));
        inner.appendChild(block);
      });
      inner.appendChild(el('div', 'report__closing', esc(Report.closing(s))));
    }
    doc.appendChild(inner);
    split.appendChild(doc);

    // ferramentas
    var tools = el('div');
    var toolsCard = el('div', 'formcard');
    toolsCard.appendChild(el('h3', null, 'Progresso'));
    var pb = el('div', 'progressbar'); pb.innerHTML = '<span style="width:' + comp.pct + '%"></span>';
    toolsCard.appendChild(pb);
    toolsCard.appendChild(el('p', 'hint', comp.done + ' de ' + comp.total + ' respostas obrigatórias · ' + comp.topics + ' áreas')).style.marginTop = '10px';
    var backBtn = el('button', 'btn btn--ghost', '← Voltar à revisão');
    backBtn.style.cssText = 'margin-top:var(--s3);width:100%';
    backBtn.addEventListener('click', function () { go('revisao'); });
    toolsCard.appendChild(backBtn);
    tools.appendChild(toolsCard);

    var expCard = el('div', 'formcard');
    expCard.appendChild(el('h3', null, 'Qual versão deseja gerar?'));
    var waPrev = el('div', 'wa'); waPrev.style.display = 'none'; waPrev.style.marginTop = '12px';
    var vers = el('div', 'vers');
    var v1 = el('button', 'btn btn--primary', '1 · WhatsApp');
    v1.addEventListener('click', function () { copyText(Report.whatsapp(state()), 'Texto do WhatsApp copiado.'); showWA(); });
    var v2 = el('button', 'btn btn--ghost', '2 · PDF Premium');
    v2.addEventListener('click', function () { MTS.Premium.open(state()); });
    var v3 = el('button', 'btn btn--ghost', '3 · Ambos');
    v3.addEventListener('click', function () { copyText(Report.whatsapp(state()), 'WhatsApp copiado.'); showWA(); MTS.Premium.open(state()); });
    vers.appendChild(v1); vers.appendChild(v2); vers.appendChild(v3);
    expCard.appendChild(vers);
    function showWA() { waPrev.style.display = 'block'; waPrev.textContent = Report.whatsapp(state()); }
    expCard.appendChild(waPrev);
    tools.appendChild(expCard);

    // Revisão de voz (DNA do Montinho)
    if (Voice && secs.length) {
      var voiceCard = el('div', 'formcard');
      voiceCard.appendChild(el('h3', null, 'Revisão de voz'));
      voiceCard.appendChild(el('div', 'confirm-q', Voice.qualityQuestion)).style.marginBottom = '12px';
      var fullText = Report.intro(s) + '\n\n' + secs.map(function (x) { return x.body; }).join('\n\n') + '\n\n' + Report.closing(s);
      var issues = Voice.check(fullText);
      if (!issues.length) {
        voiceCard.appendChild(el('p', 'hint', '✓ O texto está no tom do Montinho: pessoal, simples e organizado.'));
      } else {
        voiceCard.appendChild(noteList(issues.map(function (i) { return i.text; }), 'warn', ''));
        var simp = el('button', 'btn btn--ghost', 'Aplicar linguagem simples'); simp.style.cssText = 'width:100%;margin-top:12px';
        simp.addEventListener('click', function () { applySimpleLanguage(); });
        voiceCard.appendChild(simp);
      }
      tools.appendChild(voiceCard);
    }

    var saveCard = el('div', 'formcard');
    saveCard.appendChild(el('h3', null, 'Estratégia'));
    var memBtn = el('button', 'btn btn--ghost', 'Ver estratégia completa'); memBtn.style.width = '100%';
    memBtn.addEventListener('click', openMemoryModal);
    saveCard.appendChild(memBtn);
    var saveBtn = el('button', 'btn btn--ghost', 'Salvar no histórico'); saveBtn.style.cssText = 'width:100%;margin-top:10px';
    saveBtn.addEventListener('click', function () { var snap = Store.saveSnapshot(); toast('Estratégia de ' + snap.nome + ' salva no histórico.'); });
    saveCard.appendChild(saveBtn);
    tools.appendChild(saveCard);
    split.appendChild(tools);

    wrap.appendChild(split);
    panel.innerHTML = ''; panel.appendChild(wrap);
    doc.addEventListener('click', onSectionAction);
  }

  function onSectionAction(e) {
    var t = e.target;
    if (t.dataset.edit) return startEdit(t.dataset.edit);
    if (t.dataset.revert) { Store.setOverride(t.dataset.revert, ''); renderRelatorio(); toast('Seção revertida ao texto automático.'); }
    if (t.dataset.airewrite) return aiRewrite(t.dataset.airewrite, t);
  }

  function startEdit(id) {
    var block = panel.querySelector('.report__section[data-id="' + id + '"]');
    if (!block || block.classList.contains('editing')) return;
    block.classList.add('editing');
    var p = block.querySelector('p');
    var ta = el('textarea', 'report__edit'); ta.value = p.textContent;
    var bar = el('div', 'actions'); bar.style.marginTop = '10px';
    var saveB = el('button', 'btn btn--primary', 'Salvar');
    var cancelB = el('button', 'btn btn--ghost', 'Cancelar');
    saveB.addEventListener('click', function () { Store.setOverride(id, ta.value); Store.learnStyle(ta.value); renderRelatorio(); toast('Seção atualizada.'); });
    cancelB.addEventListener('click', function () { renderRelatorio(); });
    bar.appendChild(cancelB); bar.appendChild(saveB);
    block.appendChild(ta); block.appendChild(bar); ta.focus();
  }

  function applySimpleLanguage() {
    var s = state();
    var n = 0;
    Report.sections(s).forEach(function (sec) {
      var simplified = Voice.simplify(sec.body);
      if (simplified !== sec.body) { Store.setOverride(sec.id, simplified); n++; }
    });
    renderRelatorio();
    toast(n ? ('Linguagem simplificada em ' + n + ' seção(ões).') : 'Nada a simplificar — texto já está simples.');
  }

  function aiRewrite(id, btn) {
    var sec = Report.sections(state()).filter(function (s) { return s.id === id; })[0];
    if (!sec) return;
    var original = btn.textContent; btn.textContent = '...'; btn.disabled = true;
    AI.rewriteText(sec.title, sec.body, state()).then(function (text) {
      Store.setOverride(id, text); renderRelatorio(); toast('Seção reescrita pela IA.');
    }).catch(function (err) { btn.textContent = original; btn.disabled = false; toast('Falha na IA: ' + err.message); });
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, function () { fallbackCopy(text, okMsg); });
    else fallbackCopy(text, okMsg);
  }
  function fallbackCopy(text, okMsg) {
    var ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); } catch (e) { toast('Não foi possível copiar.'); }
    document.body.removeChild(ta);
  }

  /* =======================================================================
     Memória estratégica completa (comando "Mostrar estratégia")
     ======================================================================= */
  function openMemoryModal() {
    var s = state();
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal modal--wide');
    m.appendChild(el('h3', null, 'Estratégia em construção'));
    m.appendChild(el('p', null, 'Tudo o que já foi definido para este aluno, organizado. Atualiza em tempo real.'));

    var mem = el('div', 'mem'); mem.style.marginTop = 'var(--s3)';
    Memory.build(s).forEach(function (sec) {
      var block = el('div', 'mem__sec');
      var h = el('div', 'mem__h');
      h.appendChild(el('span', 'emo', sec.emoji));
      h.appendChild(el('h4', null, esc(sec.title)));
      var edit = el('button', null, 'Editar');
      edit.addEventListener('click', function () {
        close();
        if (sec.editStep) go(sec.editStep);
        else jumpToTopic(sec.editTopic);
      });
      h.appendChild(edit);
      block.appendChild(h);
      var dl = el('dl', 'mem__rows');
      sec.rows.forEach(function (row) {
        dl.appendChild(el('dt', null, esc(row[0])));
        var filled = row[1] != null && String(row[1]).trim() !== '';
        dl.appendChild(el('dd', filled ? null : 'empty', filled ? esc(row[1]) : '—'));
      });
      block.appendChild(dl);
      mem.appendChild(block);
    });
    m.appendChild(mem);

    var actions = el('div', 'modal__actions');
    var closeB = el('button', 'btn btn--primary', 'Fechar');
    closeB.addEventListener('click', function () { close(); });
    actions.appendChild(closeB);
    m.appendChild(actions);

    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  /* =======================================================================
     Histórico de estratégias (base para evoluções futuras)
     ======================================================================= */
  function openHistoryModal() {
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal modal--wide');
    m.appendChild(el('h3', null, 'Histórico de estratégias'));
    m.appendChild(el('p', null, 'Estratégias salvas neste navegador. Base para comparar ciclos e reutilizar planejamentos.'));

    var list = Store.history();
    if (!list.length) {
      m.appendChild(el('p', 'hint', 'Nenhuma estratégia salva ainda. Salve a partir da etapa de Relatório.')).style.marginTop = 'var(--s3)';
    } else {
      var ul = el('ul', 'hist'); ul.style.marginTop = 'var(--s3)';
      list.forEach(function (snap) {
        var li = el('li', 'histitem');
        var meta = el('div');
        meta.appendChild(el('b', null, esc(snap.nome)));
        meta.appendChild(el('div', null, '<small>' + esc(formatDate(snap.savedAt)) + '</small>'));
        li.appendChild(meta);
        li.appendChild(el('span', 'spacer'));
        var open = el('button', null, 'Abrir');
        open.addEventListener('click', function () {
          if (confirm('Abrir esta estratégia? A estratégia atual em edição será substituída.')) {
            Store.loadSnapshot(snap.id); close(); render(); toast('Estratégia carregada.');
          }
        });
        var del = el('button', 'danger', 'Excluir');
        del.addEventListener('click', function () {
          if (confirm('Excluir esta estratégia do histórico?')) { Store.deleteSnapshot(snap.id); close(); openHistoryModal(); }
        });
        li.appendChild(open); li.appendChild(del);
        ul.appendChild(li);
      });
      m.appendChild(ul);
    }

    var actions = el('div', 'modal__actions');
    var closeB = el('button', 'btn btn--ghost', 'Fechar');
    closeB.addEventListener('click', function () { close(); });
    actions.appendChild(closeB);
    m.appendChild(actions);

    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  /* =======================================================================
     Biblioteca (Knowledge Base) — navegável + preferências aprendidas
     ======================================================================= */
  function openLibraryModal() {
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal modal--wide');
    m.appendChild(el('h3', null, '📚 Biblioteca'));
    m.appendChild(el('p', null, 'Conhecimento organizado que fundamenta cada decisão — sempre em linguagem simples para o aluno. Nunca substitui o treinador.'));

    // preferências aprendidas
    var prefs = Store.prefList();
    if (prefs.length) {
      var pbox = el('div'); pbox.style.marginTop = 'var(--s3)';
      pbox.appendChild(el('h4', 'kb__sec', 'Preferências do treinador')).style.cssText = 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:10px';
      var chips = el('div', 'topicnav');
      prefs.slice(0, 12).forEach(function (p) {
        chips.appendChild(el('button', 'is-filled', esc(p.title) + ' · ' + p.count + 'x'));
      });
      pbox.appendChild(chips);
      var clear = el('button', 'kb__toggle', 'Limpar preferências');
      clear.addEventListener('click', function () { if (confirm('Limpar as preferências aprendidas?')) { Store.clearPreferences(); close(); openLibraryModal(); } });
      pbox.appendChild(clear);
      m.appendChild(pbox);
    }

    // busca
    var search = el('input'); search.type = 'search'; search.placeholder = 'Buscar na biblioteca (ex.: drop-set, upper lower, falha...)';
    search.style.cssText = 'width:100%;margin:var(--s3) 0 var(--s2);font:inherit;font-size:15px;padding:11px 13px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--bg)';
    m.appendChild(search);

    var listWrap = el('div'); m.appendChild(listWrap);
    var s = state();
    function draw(filter) {
      listWrap.innerHTML = '';
      var f = (filter || '').toLowerCase().trim();
      var items = KB.all().filter(function (e) {
        if (!f) return true;
        return (e.title + ' ' + e.cat + ' ' + e.what).toLowerCase().indexOf(f) !== -1;
      }).sort(function (a, b) { return KB.CONF_ORDER[b.conf] - KB.CONF_ORDER[a.conf]; });
      if (!items.length) { listWrap.appendChild(el('p', 'hint', 'Nada encontrado para essa busca.')); return; }
      items.forEach(function (e) { listWrap.appendChild(kbEntryCard(e, s)); });
    }
    draw('');
    search.addEventListener('input', function () { draw(search.value); });

    var actions = el('div', 'modal__actions');
    var closeB = el('button', 'btn btn--primary', 'Fechar'); closeB.addEventListener('click', function () { close(); });
    actions.appendChild(closeB); m.appendChild(actions);

    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  /* =======================================================================
     Marca — identidade e contatos usados no PDF premium
     ======================================================================= */
  function openBrandModal() {
    var brand = Store.getBrand();
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal');
    m.appendChild(el('h3', null, 'Sua marca'));
    m.appendChild(el('p', null, 'Estes dados aparecem na capa e no encerramento do PDF premium, incluindo os QR Codes. Ficam salvos apenas neste navegador.'));
    var fields = [
      ['nome', 'Nome / marca', 'Montinho Personal Trainer'],
      ['whatsapp', 'WhatsApp (com DDI/DDD)', 'Ex.: +55 11 99999-9999'],
      ['site', 'Site', 'Ex.: montinho.com.br'],
      ['instagram', 'Instagram', 'Ex.: @montinhopersonal']
    ];
    var inputs = {};
    fields.forEach(function (f) {
      var fl = el('div', 'field'); fl.innerHTML = '<label for="br_' + f[0] + '">' + f[1] + '</label>';
      var inp = el('input'); inp.id = 'br_' + f[0]; inp.placeholder = f[2]; inp.value = brand[f[0]] || '';
      fl.appendChild(inp); m.appendChild(fl); inputs[f[0]] = inp;
    });
    var actions = el('div', 'modal__actions');
    var cancel = el('button', 'btn btn--ghost', 'Cancelar'); cancel.addEventListener('click', close);
    var save = el('button', 'btn btn--primary', 'Salvar');
    save.addEventListener('click', function () {
      Store.setBrand({ nome: inputs.nome.value.trim() || 'Montinho Personal Trainer', whatsapp: inputs.whatsapp.value.trim(), site: inputs.site.value.trim(), instagram: inputs.instagram.value.trim() });
      close(); toast('Marca atualizada.');
    });
    actions.appendChild(cancel); actions.appendChild(save); m.appendChild(actions);
    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  /* =======================================================================
     DNA do Montinho — memória viva do jeito de pensar e escrever
     ======================================================================= */
  function openDNAModal() {
    var d = Voice.dna(state());
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal modal--wide');
    m.appendChild(el('h3', null, '🧬 DNA do Montinho'));
    m.appendChild(el('p', null, 'Uma memória viva que aprende como o Renato pensa e escreve, para que todo relatório soe como ele. Personaliza a comunicação — nunca substitui a ciência.'));

    var box = el('div'); box.style.marginTop = 'var(--s3)';
    box.appendChild(el('h4', 'kb__sec', 'O jeito do Montinho')).style.cssText = 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:10px';
    var ul = el('ul', 'notelist');
    d.insights.forEach(function (t) {
      var li = el('li', 'note');
      li.appendChild(el('span', 'note__ico', ICON_GOOD));
      li.appendChild(el('span', null, esc(t)));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    m.appendChild(box);

    if (d.prefs.length) {
      var pb = el('div'); pb.style.marginTop = 'var(--s4)';
      pb.appendChild(el('h4', null, 'Métodos preferidos')).style.cssText = 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:10px';
      var chips = el('div', 'topicnav');
      d.prefs.slice(0, 12).forEach(function (p) { chips.appendChild(el('button', 'is-filled', esc(p.title) + ' · ' + p.count + 'x')); });
      pb.appendChild(chips);
      m.appendChild(pb);
    }

    var foot = el('p', 'hint');
    foot.style.marginTop = 'var(--s4)';
    foot.textContent = 'Aprendizado até aqui: ' + d.cycles + ' estratégia(s) no histórico · ' + d.styleSamples + ' edição(ões) de texto observada(s).';
    m.appendChild(foot);

    var actions = el('div', 'modal__actions');
    if (d.styleSamples || d.prefs.length) {
      var clr = el('button', 'btn btn--ghost', 'Limpar aprendizado');
      clr.addEventListener('click', function () { if (confirm('Apagar as preferências e o aprendizado de escrita do DNA?')) { Store.clearPreferences(); Store.clearStyle(); close(); openDNAModal(); } });
      actions.appendChild(clr);
    }
    var sp = el('span', 'spacer'); sp.style.flex = '1'; actions.appendChild(sp);
    var closeB = el('button', 'btn btn--primary', 'Fechar'); closeB.addEventListener('click', function () { close(); });
    actions.appendChild(closeB); m.appendChild(actions);

    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  /* =======================================================================
     Modal de IA
     ======================================================================= */
  function openAIModal() {
    var cfg = Store.getAI();
    var back = el('div', 'modal-backdrop');
    var m = el('div', 'modal');
    m.innerHTML =
      '<h3>Assistente de IA <span style="font-weight:480;color:var(--ink-mute);font-size:15px">(opcional)</span></h3>' +
      '<p>Ligue o assistente com a sua própria chave da API da Anthropic para gerar o resumo executivo e ' +
      'reescrever as seções em linguagem premium. A chave fica salva apenas neste navegador e é usada direto ' +
      'do seu dispositivo. Sem chave, tudo funciona normalmente — a IA só potencializa.</p>';
    var f1 = el('div', 'field'); f1.innerHTML = '<label for="aiKey">Chave da API</label>';
    var key = el('input'); key.id = 'aiKey'; key.type = 'password'; key.placeholder = 'sk-ant-...'; key.value = cfg.key || '';
    f1.appendChild(key); m.appendChild(f1);
    var f2 = el('div', 'field'); f2.innerHTML = '<label for="aiModel">Modelo</label>';
    var model = el('input'); model.id = 'aiModel'; model.placeholder = AI.defaultModel; model.value = cfg.model || '';
    f2.appendChild(model);
    f2.appendChild(el('p', 'hint', 'Deixe em branco para usar o padrão (' + AI.defaultModel + ').')).style.marginTop = '6px';
    m.appendChild(f2);

    var actions = el('div', 'modal__actions');
    if (cfg.key) {
      var rm = el('button', 'btn btn--ghost', 'Desligar IA');
      rm.addEventListener('click', function () { Store.clearAI(); close(); renderAIPill(); render(); toast('IA desligada.'); });
      actions.appendChild(rm);
    }
    var sp = el('span', 'spacer'); sp.style.flex = '1'; actions.appendChild(sp);
    var cancel = el('button', 'btn btn--ghost', 'Cancelar'); cancel.addEventListener('click', close);
    var save = el('button', 'btn btn--primary', 'Salvar');
    save.addEventListener('click', function () {
      if (!key.value.trim()) { toast('Informe a chave ou clique em Desligar IA.'); return; }
      Store.setAI({ key: key.value.trim(), model: model.value.trim() });
      close(); renderAIPill(); render(); toast('IA ligada.');
    });
    actions.appendChild(cancel); actions.appendChild(save);
    m.appendChild(actions);

    back.appendChild(m);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    modalRoot.appendChild(back);
    function close() { modalRoot.innerHTML = ''; }
  }

  /* ---------- dispatcher ---------- */
  function render() {
    renderStepper(); renderAIPill();
    var step = state().step;
    if (step === 'diagnostico') renderDiagnostico();
    else if (step === 'entrevista') renderEntrevista();
    else if (step === 'revisao') renderRevisao();
    else if (step === 'relatorio') renderRelatorio();
    else renderAnamnese();
  }

  document.getElementById('aiPill').addEventListener('click', openAIModal);
  document.getElementById('btnLibrary').addEventListener('click', openLibraryModal);
  document.getElementById('btnDNA').addEventListener('click', openDNAModal);
  document.getElementById('btnBrand').addEventListener('click', openBrandModal);
  document.getElementById('btnMemory').addEventListener('click', openMemoryModal);
  document.getElementById('btnHistory').addEventListener('click', openHistoryModal);
  document.getElementById('btnReset').addEventListener('click', function () {
    if (confirm('Começar uma nova estratégia? Os dados atuais deste navegador serão apagados.')) {
      Store.reset(); go('anamnese'); toast('Nova estratégia iniciada.');
    }
  });

  render();
})();
