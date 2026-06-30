/**
 * app.js — Orquestração do Assistente de Estratégias.
 *
 * Controla o Wizard (anamnese → análise → entrevista → validação → entrega),
 * a Identidade Visual, o Banco de Alunos e as três entregas premium
 * (WhatsApp, PDF e Documento). Nada é decidido pelo sistema: o Personal
 * confirma cada etapa e tem sempre a palavra final.
 */
(function (global) {
  'use strict';

  var brand = Store.getBrand();
  var draft = Store.getDraft();
  var ivIndex = 0;                 // pergunta atual da entrevista

  var STAGES = ['upload', 'confirm', 'interview', 'validation', 'report'];

  var els = {
    nav: document.getElementById('nav'),
    views: document.querySelectorAll('.view'),
    brandForm: document.getElementById('brandForm'),
    stepper: document.getElementById('stepper'),
    wizardStage: document.getElementById('wizardStage'),
    studentsView: document.getElementById('studentsView'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),
    toast: document.getElementById('toast'),
    sidebarLogo: document.getElementById('sidebarLogo'),
    sidebarBrandName: document.getElementById('sidebarBrandName')
  };

  // ============================================================ utilidades
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { els.toast.classList.remove('is-visible'); }, 2800);
  }
  function nowISO() { return new Date().toISOString(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function escA(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function persist() { Store.saveDraft(draft); }

  function applyBrandToShell() {
    document.documentElement.style.setProperty('--brand-primary', brand.corPrimaria);
    document.documentElement.style.setProperty('--brand-secondary', brand.corSecundaria);
    els.sidebarBrandName.textContent = brand.empresa || 'Marca';
    if (brand.logoDataUrl) els.sidebarLogo.innerHTML = '<img src="' + brand.logoDataUrl + '" alt="" />';
    else {
      var initials = (brand.empresa || 'MP').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      els.sidebarLogo.textContent = initials;
    }
  }

  // ============================================================ navegação
  function showView(view) {
    els.nav.querySelectorAll('.nav__item').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-view') === view); });
    els.views.forEach(function (v) { v.classList.toggle('is-active', v.getAttribute('data-view') === view); });
    if (view === 'alunos') renderStudents('');
  }
  els.nav.addEventListener('click', function (e) {
    var btn = e.target.closest('.nav__item');
    if (btn) showView(btn.getAttribute('data-view'));
  });

  // ============================================================ WIZARD
  function setStage(stage) {
    draft.etapa = stage;
    persist();
    renderStage();
  }
  function updateStepper() {
    var current = STAGES.indexOf(draft.etapa);
    els.stepper.querySelectorAll('.stepper__item').forEach(function (li) {
      var idx = STAGES.indexOf(li.getAttribute('data-stage'));
      li.classList.toggle('is-active', idx === current);
      li.classList.toggle('is-done', idx < current);
    });
  }
  function renderStage() {
    updateStepper();
    var s = draft.etapa;
    if (s === 'upload') renderUpload();
    else if (s === 'confirm') renderConfirm();
    else if (s === 'interview') renderInterview();
    else if (s === 'validation') renderValidation();
    else if (s === 'report') renderReport();
    else renderUpload();
    els.wizardStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---------------------------------------------------------- Etapa 1: Upload
  function renderUpload() {
    els.wizardStage.innerHTML =
      '<div class="stage-card">' +
        '<div class="stage-card__intro">' +
          '<h2>1 · Envie a anamnese</h2>' +
          '<p>Faça o upload do PDF da anamnese. Vou ler o documento, identificar as informações e organizá-las em categorias para a sua revisão.</p>' +
        '</div>' +
        '<label class="dropzone" id="dropzone">' +
          '<input type="file" id="pdfInput" accept="application/pdf" hidden />' +
          '<div class="dropzone__icon">📄</div>' +
          '<strong>Clique para enviar o PDF</strong>' +
          '<span>ou arraste o arquivo aqui</span>' +
        '</label>' +
        '<div class="stage-or"><span>ou</span></div>' +
        '<button class="btn btn--ghost" id="manualBtn">✍️ Preencher a anamnese manualmente</button>' +
        '<div class="stage-status" id="uploadStatus" hidden></div>' +
      '</div>';

    var input = document.getElementById('pdfInput');
    var dz = document.getElementById('dropzone');
    document.getElementById('manualBtn').addEventListener('click', function () {
      draft.anamneseArquivo = ''; persist(); setStage('confirm');
    });
    input.addEventListener('change', function () { if (input.files && input.files[0]) handlePdf(input.files[0]); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('is-drag'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('is-drag'); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); dz.classList.remove('is-drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handlePdf(e.dataTransfer.files[0]);
    });
  }

  function handlePdf(file) {
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { toast('Envie um arquivo PDF.'); return; }
    var status = document.getElementById('uploadStatus');
    status.hidden = false;
    status.className = 'stage-status is-loading';
    status.innerHTML = '<span class="spinner"></span> Lendo e organizando a anamnese…';
    AnamneseReader.analyzeFile(file).then(function (res) {
      draft.anamneseTexto = res.texto;
      draft.categorias = res.categorias;
      draft.anamneseArquivo = file.name;
      draft.anamneseConfirmada = false;
      persist();
      setStage('confirm');
    }).catch(function (err) {
      status.className = 'stage-status is-error';
      status.innerHTML = '⚠️ ' + (err.message || 'Falha ao ler o PDF.') + ' Você pode preencher manualmente.';
    });
  }

  // ---------------------------------------------------------- Etapa 1b: Confirmar
  function renderConfirm() {
    var cats = Store.ANAMNESE_CATEGORIES;
    var cards = cats.map(function (c) {
      return '<div class="cat-card">' +
        '<label class="cat-card__label">' + c.icon + ' ' + esc(c.label) + '</label>' +
        '<textarea class="cat-card__input" data-cat="' + c.key + '" rows="2" placeholder="—">' +
          String(draft.categorias[c.key] || '').replace(/</g, '&lt;') + '</textarea>' +
      '</div>';
    }).join('');

    els.wizardStage.innerHTML =
      '<div class="stage-card">' +
        '<div class="stage-card__intro">' +
          '<h2>2 · Confira a análise</h2>' +
          '<p>' + (draft.anamneseArquivo ? 'Li <strong>' + esc(draft.anamneseArquivo) + '</strong> e ' : '') +
          'organizei as informações abaixo. Revise, ajuste o que precisar e confirme.</p>' +
        '</div>' +
        '<div class="form__grid form__grid--2" style="margin-bottom:18px;">' +
          field('Nome do aluno', 'aluno', draft.aluno, 'Ex.: Lucas Andrade') +
          field('Objetivo (subtítulo da capa)', 'objetivo', draft.objetivo, 'Ex.: Hipertrofia em 16 semanas') +
          dateField('Data da elaboração', 'dataElaboracao', draft.dataElaboracao) +
        '</div>' +
        '<div class="cat-grid">' + cards + '</div>' +
        '<div class="confirm-bar">' +
          '<p class="confirm-bar__q">A análise está correta?</p>' +
          '<div class="confirm-bar__actions">' +
            '<button class="btn btn--ghost" id="backUpload">← Trocar anamnese</button>' +
            '<button class="btn btn--primary" id="toInterview">✓ Está correta, continuar</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    els.wizardStage.querySelectorAll('[data-cat]').forEach(function (t) {
      t.addEventListener('input', function () { draft.categorias[t.getAttribute('data-cat')] = t.value; persist(); });
    });
    els.wizardStage.querySelectorAll('[data-draft]').forEach(function (inp) {
      inp.addEventListener('input', function () { draft[inp.getAttribute('data-draft')] = inp.value; persist(); });
    });
    document.getElementById('backUpload').addEventListener('click', function () { setStage('upload'); });
    document.getElementById('toInterview').addEventListener('click', function () {
      if (!draft.aluno.trim()) { toast('Informe o nome do aluno antes de continuar.'); return; }
      draft.anamneseConfirmada = true; persist();
      ivIndex = 0; setStage('interview');
    });
  }

  function field(label, name, value, ph) {
    return '<label class="field"><span class="field__label">' + label + '</span>' +
      '<input class="field__input" type="text" data-draft="' + name + '" value="' + escA(value) + '" placeholder="' + escA(ph || '') + '" /></label>';
  }
  function dateField(label, name, value) {
    return '<label class="field"><span class="field__label">' + label + '</span>' +
      '<input class="field__input" type="date" data-draft="' + name + '" value="' + escA(value) + '" /></label>';
  }

  // ---------------------------------------------------------- Etapa 2: Entrevista
  function renderInterview() {
    var steps = Interview.STEPS;
    if (ivIndex < 0) ivIndex = 0;
    if (ivIndex >= steps.length) ivIndex = steps.length - 1;
    var step = steps[ivIndex];

    els.wizardStage.innerHTML =
      '<div class="iv-wrap">' +
        '<div class="iv-progress"><div class="iv-progress__bar" style="width:' + Math.round(((ivIndex + 1) / steps.length) * 100) + '%"></div></div>' +
        '<div id="ivStep"></div>' +
        '<div class="iv-nav">' +
          '<button class="btn btn--ghost" id="ivPrev">' + (ivIndex === 0 ? '← Voltar à análise' : '← Pergunta anterior') + '</button>' +
          '<button class="btn btn--primary" id="ivNext">' + (ivIndex === steps.length - 1 ? 'Concluir entrevista →' : 'Próxima pergunta →') + '</button>' +
        '</div>' +
      '</div>';

    var stepEl = document.getElementById('ivStep');
    Interview.renderStep(stepEl, step, draft.entrevista);
    updateAnalysis(stepEl, step);

    // autosave + análise ao vivo
    stepEl.addEventListener('input', function () {
      Interview.collectStep(stepEl, step, draft.entrevista); persist(); updateAnalysis(stepEl, step);
    });
    // chips
    stepEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) { chip.classList.toggle('is-on'); Interview.collectStep(stepEl, step, draft.entrevista); persist(); updateAnalysis(stepEl, step); return; }
      if (e.target.closest('[data-add-fase]')) {
        var holder = stepEl.querySelector('[data-fases]');
        var tmp = document.createElement('div'); tmp.innerHTML = Interview.faseRow(null);
        holder.appendChild(tmp.firstChild);
        Interview.collectStep(stepEl, step, draft.entrevista); persist(); return;
      }
      var del = e.target.closest('[data-del-fase]');
      if (del) { del.closest('[data-fase-row]').remove(); Interview.collectStep(stepEl, step, draft.entrevista); persist(); }
    });
    stepEl.addEventListener('change', function () {
      Interview.collectStep(stepEl, step, draft.entrevista); persist(); updateAnalysis(stepEl, step);
    });

    document.getElementById('ivPrev').addEventListener('click', function () {
      Interview.collectStep(stepEl, step, draft.entrevista); persist();
      if (ivIndex === 0) setStage('confirm'); else { ivIndex--; renderInterview(); }
    });
    document.getElementById('ivNext').addEventListener('click', function () {
      Interview.collectStep(stepEl, step, draft.entrevista); persist();
      if (ivIndex === steps.length - 1) setStage('validation');
      else { ivIndex++; renderInterview(); }
    });
  }

  function updateAnalysis(stepEl, step) {
    var panel = stepEl.querySelector('[data-analysis]');
    var textEl = stepEl.querySelector('[data-analysis-text]');
    if (!panel) return;
    var text = '';
    try { text = step.analysis(draft.entrevista, draft.categorias) || ''; } catch (e) { text = ''; }
    // só mostra quando há alguma resposta significativa no passo
    var answered = step.fields.some(function (f) {
      var v = draft.entrevista[f.name];
      return Array.isArray(v) ? v.length : String(v || '').trim();
    });
    if (answered && text) { textEl.textContent = text; panel.hidden = false; }
    else { panel.hidden = true; }
  }

  // ---------------------------------------------------------- Etapa 3: Validação
  function renderValidation() {
    var e = draft.entrevista;
    var items = [
      { ic: '🎯', t: 'Objetivo', v: [e.objetivoPrincipal, e.objetivoSecundario && ('Secundário: ' + e.objetivoSecundario), e.prioridade && ('Prioridade: ' + e.prioridade)], step: 0 },
      { ic: '🗂️', t: 'Divisão', v: [e.divisao], step: 1 },
      { ic: '💡', t: 'Justificativa', v: [e.divisaoPorque, e.divisaoBeneficios], step: 1 },
      { ic: '📈', t: 'Periodização', v: [e.periodizacaoModelo, (e.fases || []).length + ' fase(s)', e.deload && ('Deload: ' + e.deload)], step: 2 },
      { ic: '🔁', t: 'Estratégia de repetições', v: [e.repFaixa, (e.tecnicas || []).join(', ')], step: 3 },
      { ic: '🏋️', t: 'Exercícios', v: [e.grupoPrioridade && ('Prioridade: ' + e.grupoPrioridade), e.exObrigatorios && ('Obrigatórios: ' + e.exObrigatorios), e.exProibidos && ('Proibidos: ' + e.exProibidos)], step: 4 },
      { ic: '🔥', t: 'Aquecimento', v: [e.aquecimento, e.mobilidade, e.ativacao], step: 5 },
      { ic: '🫀', t: 'Cardio', v: [e.cardioObjetivo, e.cardioFrequencia, e.cardioIntensidade], step: 6 },
      { ic: '⏫', t: 'Progressão', v: [e.progCarga && ('Carga: ' + e.progCarga), e.progReducao && ('Reduzir: ' + e.progReducao)], step: 7 },
      { ic: '📊', t: 'Feedback esperado', v: [(e.feedback || []).join(', ')], step: 8 },
      { ic: '📝', t: 'Orientações', v: [e.orientacoes], step: 9 }
    ];

    var cards = items.map(function (it) {
      var content = it.v.filter(Boolean).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') || '<p class="muted">— não informado —</p>';
      return '<div class="val-card">' +
        '<div class="val-card__head"><span class="val-card__check">✔</span>' +
          '<strong>' + it.ic + ' ' + esc(it.t) + '</strong>' +
          '<button class="val-card__edit" data-edit-step="' + it.step + '">Editar</button></div>' +
        '<div class="val-card__body">' + content + '</div>' +
      '</div>';
    }).join('');

    els.wizardStage.innerHTML =
      '<div class="stage-card">' +
        '<div class="stage-card__intro">' +
          '<h2>4 · Validação da estratégia</h2>' +
          '<p>Este é o resumo completo da estratégia de <strong>' + esc(draft.aluno || 'o aluno') + '</strong>. Revise cada ponto.</p>' +
        '</div>' +
        '<div class="val-grid">' + cards + '</div>' +
        '<div class="confirm-bar">' +
          '<p class="confirm-bar__q">Deseja alterar algum ponto antes de gerar o relatório?</p>' +
          '<div class="confirm-bar__actions">' +
            '<button class="btn btn--ghost" id="valEdit">✏️ Ajustar respostas</button>' +
            '<button class="btn btn--primary" id="valApprove">✓ Aprovar e gerar relatório</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    els.wizardStage.querySelectorAll('[data-edit-step]').forEach(function (b) {
      b.addEventListener('click', function () { ivIndex = parseInt(b.getAttribute('data-edit-step'), 10) || 0; setStage('interview'); });
    });
    document.getElementById('valEdit').addEventListener('click', function () { ivIndex = 0; setStage('interview'); });
    document.getElementById('valApprove').addEventListener('click', function () { generateReport(); setStage('report'); });
  }

  function generateReport() {
    draft.relatorio = ReportGenerator.generate(draft);
    if (!draft.tags || !draft.tags.length) draft.tags = ReportGenerator.deriveTags(draft);
    persist();
  }

  // ---------------------------------------------------------- Etapa 4: Entrega
  function renderReport() {
    if (!draft.relatorio || !draft.relatorio.gerado) generateReport();
    var tags = draft.tags || [];

    els.wizardStage.innerHTML =
      '<div class="stage-card stage-card--success">' +
        '<div class="success-badge">✓</div>' +
        '<h2>Relatório aprovado e gerado!</h2>' +
        '<p>A estratégia de <strong>' + esc(draft.aluno || 'o aluno') + '</strong> está pronta para ser entregue. Escolha o formato:</p>' +
      '</div>' +
      '<div class="delivery-grid">' +
        deliveryCard('whatsapp', '💬', '1 · Versão para WhatsApp', 'Texto humanizado, com títulos, separadores e emojis discretos. Pronto para copiar e colar.', 'Gerar WhatsApp') +
        deliveryCard('pdf', '📄', '2 · PDF Premium', 'Documento de consultoria: capa, resumo executivo, timeline, QR Codes e rodapé. Ótimo no celular.', 'Gerar PDF') +
        deliveryCard('premium', '✨', '3 · Documento na tela', 'Apresentação de alto padrão com cartões, blocos e timeline da periodização.', 'Abrir documento') +
      '</div>' +
      '<div class="report-foot">' +
        '<div class="tags-box">' +
          '<label class="field__label">Tags para pesquisa</label>' +
          '<div class="tags-list" id="tagsList">' + tags.map(tagChip).join('') +
            '<input class="tags-input" id="tagInput" placeholder="+ adicionar tag" /></div>' +
        '</div>' +
        '<div class="report-foot__actions">' +
          '<button class="btn btn--ghost" id="reviewBtn">← Revisar validação</button>' +
          '<button class="btn btn--ghost" id="newStudentBtn">➕ Novo aluno</button>' +
          '<button class="btn btn--primary" id="saveStudentBtn">💾 Salvar no banco</button>' +
        '</div>' +
      '</div>';

    els.wizardStage.querySelector('.delivery-grid').addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-open]'); if (!btn) return;
      var what = btn.getAttribute('data-open');
      if (what === 'whatsapp') openWhatsApp();
      else if (what === 'pdf') openPremium(true);
      else openPremium(false);
    });

    document.getElementById('reviewBtn').addEventListener('click', function () { setStage('validation'); });
    document.getElementById('newStudentBtn').addEventListener('click', startNewStudent);
    document.getElementById('saveStudentBtn').addEventListener('click', function () {
      var rec = Store.upsertStudent(draft, nowISO());
      draft.id = rec.id; persist();
      toast('Estratégia salva no banco de dados.');
    });

    // tags
    var tagInput = document.getElementById('tagInput');
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && tagInput.value.trim()) {
        e.preventDefault();
        draft.tags = (draft.tags || []).concat(tagInput.value.trim().toLowerCase());
        persist(); renderReport();
      }
    });
    els.wizardStage.querySelector('#tagsList').addEventListener('click', function (e) {
      var x = e.target.closest('[data-del-tag]'); if (!x) return;
      var t = x.getAttribute('data-del-tag');
      draft.tags = (draft.tags || []).filter(function (z) { return z !== t; });
      persist(); renderReport();
    });
  }

  function deliveryCard(fmt, icon, title, desc, cta) {
    return '<article class="delivery-card" data-format="' + fmt + '">' +
      '<div class="delivery-card__icon">' + icon + '</div><h3>' + title + '</h3>' +
      '<p>' + desc + '</p>' +
      '<button class="btn btn--primary" data-open="' + fmt + '">' + cta + '</button></article>';
  }
  function tagChip(t) {
    return '<span class="minitag minitag--edit">' + esc(t) + '<button data-del-tag="' + escA(t) + '" aria-label="Remover">✕</button></span>';
  }

  function startNewStudent() {
    if (!confirm('Começar um aluno novo? O rascunho atual será limpo (sua marca é mantida). Se ainda não salvou, salve antes.')) return;
    draft = Store.resetDraft(); ivIndex = 0; persist();
    setStage('upload'); showView('wizard');
    toast('Pronto! Pode iniciar o novo aluno.');
  }

  // ============================================================ ENTREGAS (modal)
  function openModal(title) {
    els.modalTitle.textContent = title;
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    els.modalBody.innerHTML = ''; els.modalActions.innerHTML = '';
  }
  els.modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && els.modal.classList.contains('is-open')) closeModal(); });

  function actionBtn(label, cls, handler) {
    var b = document.createElement('button');
    b.className = 'btn ' + (cls || 'btn--ghost') + ' btn--sm';
    b.textContent = label; b.addEventListener('click', handler);
    return b;
  }

  function openWhatsApp() {
    var text = WhatsAppFormat.build(draft, brand);
    openModal('Versão para WhatsApp');
    els.modalBody.innerHTML = '<p class="modal__hint">Texto pronto para copiar e colar. Otimizado para o celular.</p>' +
      '<pre class="wa-preview" id="waPreview"></pre>';
    document.getElementById('waPreview').textContent = text;
    els.modalActions.appendChild(actionBtn('📋 Copiar texto', 'btn--primary', function () { copyText(text); }));
    els.modalActions.appendChild(actionBtn('💬 Abrir no WhatsApp', 'btn--ghost', function () {
      global.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }));
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Texto copiado!'); }, function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Texto copiado!'); } catch (e) { toast('Não foi possível copiar.'); }
    document.body.removeChild(ta);
  }

  function openPremium(forPdf) {
    openModal(forPdf ? 'PDF Premium' : 'Documento Premium');
    els.modalBody.innerHTML = '<div class="doc-loading">Montando o documento…</div>';
    PremiumDocument.build(draft, brand).then(function (docHtml) {
      els.modalBody.innerHTML = '<div class="doc-scroll" id="docScroll">' + docHtml + '</div>';
      var docNode = els.modalBody.querySelector('.doc');
      els.modalActions.appendChild(actionBtn('⬇️ Baixar PDF', 'btn--primary', function (ev) {
        var btn = ev.currentTarget; btn.disabled = true; btn.textContent = 'Gerando PDF…';
        PdfExport.generate(docNode, draft, brand).then(function () { toast('PDF gerado!'); })
          .catch(function (err) { toast(err.message || 'Falha ao gerar PDF.'); })
          .then(function () { btn.disabled = false; btn.textContent = '⬇️ Baixar PDF'; });
      }));
      els.modalActions.appendChild(actionBtn('🖨️ Imprimir', 'btn--ghost', function () { printDocument(docHtml); }));
    }).catch(function (err) {
      els.modalBody.innerHTML = '<div class="doc-loading">Erro: ' + (err.message || err) + '</div>';
    });
  }
  function printDocument(docHtml) {
    var w = global.open('', '_blank');
    if (!w) { toast('Permita pop-ups para imprimir.'); return; }
    var styles = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(function (n) { styles += n.outerHTML; });
    w.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Estratégia de Treinamento</title>' +
      styles + '</head><body class="print-body">' + docHtml +
      '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},400);};</scr' + 'ipt></body></html>');
    w.document.close();
  }

  // ============================================================ ALUNOS
  function renderStudents(query) {
    StudentsView.render(els.studentsView, { query: query });
  }
  els.studentsView.addEventListener('input', function (e) {
    if (e.target.id === 'studentsSearch') renderStudents(e.target.value);
  });
  els.studentsView.addEventListener('click', function (e) {
    var tag = e.target.closest('[data-tag]');
    if (tag) { renderStudents(tag.getAttribute('data-tag')); return; }
    var open = e.target.closest('[data-open-student]');
    if (open) { openStudent(open.getAttribute('data-open-student')); return; }
    var del = e.target.closest('[data-del-student]');
    if (del) {
      var id = del.getAttribute('data-del-student');
      var st = Store.getStudent(id);
      if (confirm('Excluir a estratégia de ' + (st && st.aluno || 'este aluno') + '? Esta ação não pode ser desfeita.')) {
        Store.deleteStudent(id); renderStudents(''); toast('Estratégia excluída.');
      }
      return;
    }
    if (e.target.closest('[data-go-wizard]') || e.target.closest('#newFromStudentsBtn')) { showView('wizard'); }
  });
  function openStudent(id) {
    var rec = Store.getStudent(id);
    if (!rec) return;
    draft = Store.clone(rec); persist();
    draft.relatorio && draft.relatorio.gerado ? setStage('report') : setStage('validation');
    showView('wizard');
    toast('Estratégia de ' + (rec.aluno || 'aluno') + ' carregada.');
  }
  document.getElementById('newFromStudentsBtn').addEventListener('click', function () { showView('wizard'); });

  // ============================================================ IDENTIDADE
  function renderBrand() { BrandForm.render(els.brandForm, brand); }
  els.brandForm.addEventListener('input', function (e) {
    if (e.target.type === 'color') {
      var hex = els.brandForm.querySelector('[data-hex-for="' + e.target.name + '"]'); if (hex) hex.value = e.target.value;
    }
    if (e.target.classList.contains('color-input__hex')) {
      var name = e.target.getAttribute('data-hex-for');
      var picker = els.brandForm.querySelector('input[type="color"][name="' + name + '"]');
      if (picker && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) picker.value = e.target.value;
    }
    brand = BrandForm.collect(els.brandForm, brand); Store.saveBrand(brand); applyBrandToShell();
  });
  els.brandForm.addEventListener('change', function (e) {
    var fileInput = e.target.closest('[data-image-for]');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    var name = fileInput.getAttribute('data-image-for');
    var reader = new FileReader();
    reader.onload = function () { brand[name] = reader.result; Store.saveBrand(brand); renderBrand(); applyBrandToShell(); toast('Imagem atualizada.'); };
    reader.readAsDataURL(fileInput.files[0]);
  });
  els.brandForm.addEventListener('click', function (e) {
    var clearBtn = e.target.closest('[data-clear-for]');
    if (clearBtn) { brand[clearBtn.getAttribute('data-clear-for')] = ''; Store.saveBrand(brand); renderBrand(); applyBrandToShell(); }
  });
  document.getElementById('resetBrandBtn').addEventListener('click', function () {
    if (!confirm('Restaurar a identidade visual padrão? Suas personalizações serão perdidas.')) return;
    brand = Store.resetBrand(); renderBrand(); applyBrandToShell(); toast('Identidade visual restaurada.');
  });

  // ============================================================ extras
  document.getElementById('sampleBtn').addEventListener('click', function () {
    if (!confirm('Carregar a estratégia de exemplo? O rascunho atual será substituído.')) return;
    draft = Store.clone(Store.DEFAULT_DRAFT);
    var sample = Store.clone(global.SAMPLE_DRAFT);
    Object.keys(sample).forEach(function (k) { draft[k] = sample[k]; });
    ivIndex = 0; persist(); setStage('confirm');
    toast('Exemplo carregado. Reveja e siga o fluxo.');
  });
  document.getElementById('restartWizardBtn').addEventListener('click', startNewStudent);

  // ============================================================ init
  renderBrand();
  applyBrandToShell();
  renderStage();
})(window);
