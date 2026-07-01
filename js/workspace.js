/* =========================================================================
   Montinho Training Strategy — Workspace (orquestração da UI · Módulo 2)
   Fluxo: Anamnese -> Diagnóstico -> Entrevista -> Relatório.
   Determinístico por padrão; a IA (opcional) apenas potencializa.
   ========================================================================= */
(function () {
  "use strict";

  var Store = MTS.Store, Report = MTS.Report, AI = MTS.AI;
  var panel = document.getElementById('panel');
  var stepperEl = document.getElementById('stepper');
  var modalRoot = document.getElementById('modalRoot');
  var toastEl = document.getElementById('toast');

  var STEPS = [
    { id: 'anamnese', label: 'Anamnese' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'entrevista', label: 'Entrevista' },
    { id: 'relatorio', label: 'Relatório' }
  ];

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }
  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  var ICON_GOOD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function state() { return Store.get(); }
  function go(step) { Store.patch({ step: step }); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

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

  /* ---------- AI pill ---------- */
  function renderAIPill() {
    var pill = document.getElementById('aiPill');
    var lbl = document.getElementById('aiPillLabel');
    var on = AI.isConfigured();
    pill.classList.toggle('is-on', on);
    lbl.textContent = on ? 'IA ligada' : 'IA desligada';
  }

  /* =======================================================================
     PASSO 1 — ANAMNESE
     ======================================================================= */
  function renderAnamnese() {
    var wrap = el('div');
    wrap.appendChild(head('Passo 1 de 4', 'Anamnese do aluno',
      'Preencha o que você já sabe sobre o aluno. Tudo é salvo automaticamente neste navegador. ' +
      'Nenhuma estratégia é montada aqui — primeiro entendemos o cenário.'));

    var a = state().anamnese;
    (MTS.ANAMNESE).forEach(function (sec) {
      var card = el('div', 'formcard');
      card.appendChild(el('h3', null, esc(sec.title)));
      var rowFields = [];
      sec.fields.forEach(function (f) { rowFields.push(buildField(f, a[f.id])); });
      // agrupa campos curtos (number/select) em linha quando fizer sentido
      rowFields.forEach(function (fEl) { card.appendChild(fEl); });
      wrap.appendChild(card);
    });

    var actions = el('div', 'actions');
    var next = el('button', 'btn btn--primary btn--lg', 'Analisar anamnese →');
    next.addEventListener('click', function () { go('diagnostico'); });
    actions.appendChild(el('span', 'hint', 'Você pode voltar e ajustar a qualquer momento.'));
    actions.appendChild(el('span', 'spacer'));
    actions.appendChild(next);
    wrap.appendChild(actions);

    panel.innerHTML = '';
    panel.appendChild(wrap);
  }

  function buildField(f, value) {
    var field = el('div', 'field');
    var id = 'f_' + f.id;
    field.appendChild(el('label', null, esc(f.label))).setAttribute('for', id);
    var input;
    if (f.type === 'textarea') {
      input = el('textarea');
    } else if (f.type === 'select') {
      input = el('select');
      input.appendChild(el('option', null, '—')).value = '';
      f.options.forEach(function (opt) {
        var o = el('option', null, esc(opt)); o.value = opt; input.appendChild(o);
      });
    } else {
      input = el('input');
      input.type = f.type === 'number' ? 'number' : 'text';
    }
    input.id = id;
    if (f.placeholder) input.placeholder = f.placeholder;
    if (value != null) input.value = value;
    var evt = (f.type === 'select') ? 'change' : 'input';
    input.addEventListener(evt, function () { Store.setAnamnese(f.id, input.value); });
    field.querySelector('label').setAttribute('for', id);
    field.appendChild(input);
    return field;
  }

  /* =======================================================================
     PASSO 2/3 — DIAGNÓSTICO (resumo executivo)
     ======================================================================= */
  function renderDiagnostico() {
    var s = state();
    var d = Report.diagnosis(s);
    var wrap = el('div');
    wrap.appendChild(head('Passo 2 de 4', 'Diagnóstico',
      'Um retrato organizado do aluno, a partir da anamnese. Ainda não há estratégia — ' +
      'este resumo serve para guiar a entrevista com clareza.'));

    var diag = el('div', 'diag');

    if (s.diagnosisNote) {
      diag.appendChild(el('h4', null, 'Resumo executivo (IA)'));
      diag.appendChild(el('p', 'diag__note', esc(s.diagnosisNote)));
    }

    // Perfil
    diag.appendChild(el('h4', null, 'Perfil'));
    if (d.perfil.length) {
      var dl = el('dl', 'kv');
      d.perfil.forEach(function (row) {
        dl.appendChild(el('dt', null, esc(row[0])));
        dl.appendChild(el('dd', null, esc(row[1])));
      });
      diag.appendChild(dl);
    } else {
      diag.appendChild(el('p', 'hint', 'Preencha a anamnese para ver o perfil.'));
    }

    // Pontos de atenção
    diag.appendChild(el('h4', null, 'Pontos de atenção & riscos'));
    diag.appendChild(noteList(d.atencao, 'warn',
      'Nenhum ponto crítico identificado automaticamente.'));

    // Oportunidades
    diag.appendChild(el('h4', null, 'Oportunidades'));
    diag.appendChild(noteList(d.oportunidades, 'good',
      'Sem oportunidades destacadas ainda — depende de mais dados da anamnese.'));

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

    panel.innerHTML = '';
    panel.appendChild(wrap);
  }

  function noteList(items, kind, emptyMsg) {
    var ul = el('ul', 'notelist');
    if (!items || !items.length) {
      ul.appendChild(el('li', 'hint', esc(emptyMsg)));
      return ul;
    }
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
      Store.patch({ diagnosisNote: text });
      renderDiagnostico();
      toast('Resumo executivo gerado.');
    }).catch(function (e) {
      btn.disabled = false; btn.innerHTML = original;
      toast('Falha na IA: ' + e.message);
    });
  }

  /* =======================================================================
     PASSO 4/5 — ENTREVISTA (uma pergunta por vez + relatório em tempo real)
     ======================================================================= */
  function renderEntrevista() {
    var s = state();
    var topics = MTS.TOPICS;
    var idx = Math.max(0, Math.min(s.topicIndex || 0, topics.length - 1));
    var topic = topics[idx];
    var dec = (s.decisions[topic.id]) || { decision: '', why: '' };

    var wrap = el('div');
    wrap.appendChild(head('Passo 3 de 4', 'Entrevista',
      'Uma pergunta por vez, na ordem que estrutura o raciocínio. Cada decisão vira uma ' +
      'seção do relatório — e o sistema pergunta o porquê para explicar ao aluno.'));

    var split = el('div', 'split');

    /* ---- coluna esquerda: a pergunta ---- */
    var qcard = el('div', 'qcard');

    var meta = el('div', 'qcard__meta');
    meta.innerHTML = '<span class="qcard__badge">Tópico ' + topic.n + ' de ' + topics.length +
      '</span><span>' + esc(topic.name) + '</span>';
    qcard.appendChild(meta);

    var pb = el('div', 'progressbar');
    pb.innerHTML = '<span style="width:' + Math.round(((idx) / topics.length) * 100) + '%"></span>';
    qcard.appendChild(pb);

    qcard.appendChild(el('h3', 'qcard__ask', esc(topic.ask)));

    // decisão
    var decField = el('div', 'field');
    decField.appendChild(el('label', null, 'A decisão do treinador'));
    var decInput = el('textarea');
    decInput.placeholder = topic.placeholder || '';
    decInput.value = dec.decision || '';
    decField.appendChild(decInput);
    qcard.appendChild(decField);

    // motivo (regra das decisões)
    var whyInput = null;
    if (topic.why) {
      qcard.appendChild(el('div', 'qcard__why',
        '<span class="dotline">↳</span> ' + esc(topic.why)));
      var whyField = el('div', 'field');
      whyField.appendChild(el('label', null, 'O porquê (será explicado ao aluno em linguagem simples)'));
      whyInput = el('textarea');
      whyInput.placeholder = 'Explique o motivo desta escolha para este aluno...';
      whyInput.value = dec.why || '';
      whyField.appendChild(whyInput);
      qcard.appendChild(whyField);
    }

    function save() {
      Store.setDecision(topic.id, decInput.value, whyInput ? whyInput.value : '');
    }
    decInput.addEventListener('input', save);
    if (whyInput) whyInput.addEventListener('input', save);

    // auditoria contextual (análise crítica)
    var auditBox = el('div');
    function refreshAudit() {
      auditBox.innerHTML = '';
      var notes = auditTopic(topic.id, decInput.value, s.anamnese);
      if (notes.length) {
        auditBox.appendChild(el('h4', null, 'Análise crítica')).style.cssText =
          'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin:20px 0 10px';
        auditBox.appendChild(noteList(notes, 'warn', ''));
      }
    }
    decInput.addEventListener('input', refreshAudit);
    refreshAudit();
    qcard.appendChild(auditBox);

    // navegação
    var nav = el('div', 'actions');
    var prev = el('button', 'btn btn--ghost', '← Anterior');
    prev.disabled = idx === 0;
    prev.addEventListener('click', function () { save(); Store.patch({ topicIndex: idx - 1 }); renderEntrevista(); });
    nav.appendChild(prev);
    nav.appendChild(el('span', 'spacer'));

    if (idx < topics.length - 1) {
      var nextBtn = el('button', 'btn btn--primary', 'Registrar e continuar →');
      nextBtn.addEventListener('click', function () { save(); Store.patch({ topicIndex: idx + 1 }); renderEntrevista(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      nav.appendChild(nextBtn);
    } else {
      var doneBtn = el('button', 'btn btn--primary', 'Concluir e ver relatório →');
      doneBtn.addEventListener('click', function () { save(); go('relatorio'); });
      nav.appendChild(doneBtn);
    }
    qcard.appendChild(nav);

    // atalhos entre tópicos
    var tnav = el('div', 'topicnav');
    topics.forEach(function (t, i) {
      var filled = s.decisions[t.id] && (s.decisions[t.id].decision || s.decisions[t.id].why);
      var b = el('button', (i === idx ? 'is-current' : '') + (filled ? ' is-filled' : ''), t.n + '. ' + esc(t.name));
      b.addEventListener('click', function () { save(); Store.patch({ topicIndex: i }); renderEntrevista(); });
      tnav.appendChild(b);
    });
    qcard.appendChild(tnav);

    split.appendChild(qcard);

    /* ---- coluna direita: relatório em tempo real ---- */
    split.appendChild(livePreview(s));
    wrap.appendChild(split);

    panel.innerHTML = '';
    panel.appendChild(wrap);
  }

  function auditTopic(topicId, decision, anamnese) {
    var rules = (MTS.TOPIC_RULES || {})[topicId] || [];
    var out = [];
    rules.forEach(function (rule) { var m = rule(anamnese, decision); if (m) out.push(m); });
    return out;
  }

  function livePreview(s) {
    var box = el('div', 'report');
    var inner = el('div', 'report__inner');
    inner.appendChild(el('div', 'qcard__meta',
      '<span class="qcard__badge">Relatório em tempo real</span>'));
    var secs = Report.sections(s);
    if (!secs.length) {
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
     PASSO 6/7 — RELATÓRIO (revisão + versões finais)
     ======================================================================= */
  function renderRelatorio() {
    var s = state();
    var comp = Report.completion(s);
    var wrap = el('div');
    wrap.appendChild(head('Passo 4 de 4', 'Relatório',
      'Revise, ajuste o texto de cada seção e gere as versões finais para o aluno.'));

    var split = el('div', 'split');

    // ---- esquerda: documento ----
    var doc = el('div', 'report');
    var inner = el('div', 'report__inner');

    var brand = el('div', 'report__brand');
    brand.innerHTML = '<span class="brand__mark">M</span>' +
      '<span class="brand__name">Montinho <small>Training Strategy</small></span>';
    inner.appendChild(brand);

    var secs = Report.sections(s);
    if (!secs.length) {
      inner.appendChild(el('p', 'report__empty',
        'Ainda não há decisões registradas. Volte à entrevista para construir o relatório.'));
    } else {
      var nome = (s.anamnese.nome || '').trim();
      inner.appendChild(el('div', 'report__title', 'Estratégia de treino' + (nome ? ' · ' + esc(nome) : '')));
      inner.appendChild(el('div', 'report__intro', esc(Report.intro(s))));

      secs.forEach(function (sec) {
        var block = el('div', 'report__section');
        block.dataset.id = sec.id;
        var h = el('h3', null, esc(sec.title));
        var tools = el('span', 'section-tools');
        var editBtn = el('button', null, 'Editar'); editBtn.dataset.edit = sec.id;
        tools.appendChild(editBtn);
        if (s.overrides && s.overrides[sec.id]) {
          var rev = el('button', null, 'Reverter'); rev.dataset.revert = sec.id;
          tools.appendChild(rev);
        }
        if (AI.isConfigured()) {
          var aiB = el('button', null, 'Reescrever com IA'); aiB.dataset.airewrite = sec.id;
          tools.appendChild(aiB);
        }
        h.appendChild(tools);
        block.appendChild(h);
        block.appendChild(el('p', null, esc(sec.body)));
        inner.appendChild(block);
      });

      inner.appendChild(el('div', 'report__closing', esc(Report.closing(s))));
    }
    doc.appendChild(inner);
    split.appendChild(doc);

    // ---- direita: ferramentas / exportação ----
    var tools = el('div');
    var toolsCard = el('div', 'formcard');
    toolsCard.appendChild(el('h3', null, 'Progresso'));
    var pb = el('div', 'progressbar');
    pb.innerHTML = '<span style="width:' + comp.pct + '%"></span>';
    toolsCard.appendChild(pb);
    toolsCard.appendChild(el('p', 'hint', comp.done + ' de ' + comp.total + ' tópicos preenchidos.'))
      .style.marginTop = '10px';

    var backBtn = el('button', 'btn btn--ghost', '← Voltar à entrevista');
    backBtn.style.marginTop = 'var(--s3)'; backBtn.style.width = '100%';
    backBtn.addEventListener('click', function () { go('entrevista'); });
    toolsCard.appendChild(backBtn);
    tools.appendChild(toolsCard);

    var expCard = el('div', 'formcard');
    expCard.appendChild(el('h3', null, 'Versões finais'));

    var waBtn = el('button', 'btn btn--primary', 'Copiar versão WhatsApp');
    waBtn.style.width = '100%';
    waBtn.addEventListener('click', function () { copyText(Report.whatsapp(state()), 'Texto do WhatsApp copiado.'); });
    expCard.appendChild(waBtn);

    var pdfBtn = el('button', 'btn btn--ghost', 'Imprimir / salvar PDF');
    pdfBtn.style.cssText = 'width:100%;margin-top:10px';
    pdfBtn.addEventListener('click', function () { window.print(); });
    expCard.appendChild(pdfBtn);

    var waToggle = el('button', 'btn btn--ghost', 'Prévia do WhatsApp');
    waToggle.style.cssText = 'width:100%;margin-top:10px';
    var waPrev = el('div', 'wa'); waPrev.style.display = 'none'; waPrev.style.marginTop = '12px';
    waToggle.addEventListener('click', function () {
      var show = waPrev.style.display === 'none';
      waPrev.style.display = show ? 'block' : 'none';
      if (show) waPrev.textContent = Report.whatsapp(state());
    });
    expCard.appendChild(waToggle);
    expCard.appendChild(waPrev);

    tools.appendChild(expCard);
    split.appendChild(tools);

    wrap.appendChild(split);
    panel.innerHTML = '';
    panel.appendChild(wrap);

    // edição de seções (delegação)
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
    saveB.addEventListener('click', function () { Store.setOverride(id, ta.value); renderRelatorio(); toast('Seção atualizada.'); });
    cancelB.addEventListener('click', function () { renderRelatorio(); });
    bar.appendChild(cancelB); bar.appendChild(saveB);
    block.appendChild(ta); block.appendChild(bar); ta.focus();
  }

  function aiRewrite(id, btn) {
    var topic = MTS.TOPICS.filter(function (t) { return t.id === id; })[0];
    var dec = state().decisions[id] || {};
    var original = btn.textContent;
    btn.textContent = '...'; btn.disabled = true;
    AI.rewriteSection(topic, dec.decision, dec.why, state()).then(function (text) {
      Store.setOverride(id, text); renderRelatorio(); toast('Seção reescrita pela IA.');
    }).catch(function (err) {
      btn.textContent = original; btn.disabled = false; toast('Falha na IA: ' + err.message);
    });
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); },
        function () { fallbackCopy(text, okMsg); });
    } else { fallbackCopy(text, okMsg); }
  }
  function fallbackCopy(text, okMsg) {
    var ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); } catch (e) { toast('Não foi possível copiar.'); }
    document.body.removeChild(ta);
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
      '<p>Ligue o assistente com a sua própria chave da API da Anthropic para gerar o resumo ' +
      'executivo e reescrever as seções em linguagem premium. A chave fica salva apenas neste ' +
      'navegador e é usada direto do seu dispositivo. Sem chave, tudo funciona normalmente — a IA só potencializa.</p>';
    var f1 = el('div', 'field');
    f1.innerHTML = '<label for="aiKey">Chave da API</label>';
    var key = el('input'); key.id = 'aiKey'; key.type = 'password'; key.placeholder = 'sk-ant-...'; key.value = cfg.key || '';
    f1.appendChild(key); m.appendChild(f1);
    var f2 = el('div', 'field');
    f2.innerHTML = '<label for="aiModel">Modelo</label>';
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
    actions.appendChild(el('span', 'spacer')).style.flex = '1';
    var cancel = el('button', 'btn btn--ghost', 'Cancelar');
    cancel.addEventListener('click', close);
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

  /* ---------- header util ---------- */
  function head(eyebrow, title, desc) {
    var h = el('div', 'panel__head');
    h.innerHTML = '<span class="eyebrow">' + esc(eyebrow) + '</span><h2>' + esc(title) + '</h2>' +
      (desc ? '<p>' + esc(desc) + '</p>' : '');
    return h;
  }

  /* ---------- render dispatcher ---------- */
  function render() {
    renderStepper();
    renderAIPill();
    var step = state().step;
    if (step === 'diagnostico') renderDiagnostico();
    else if (step === 'entrevista') renderEntrevista();
    else if (step === 'relatorio') renderRelatorio();
    else renderAnamnese();
  }

  /* ---------- eventos globais ---------- */
  document.getElementById('aiPill').addEventListener('click', openAIModal);
  document.getElementById('btnReset').addEventListener('click', function () {
    if (confirm('Começar uma nova estratégia? Os dados atuais deste navegador serão apagados.')) {
      Store.reset(); go('anamnese'); toast('Nova estratégia iniciada.');
    }
  });

  render();
})();
