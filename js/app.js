/**
 * app.js — Orquestração da aplicação.
 * Navegação, formulários com autosave, listas repetíveis, modal de
 * pré-visualização e as três entregas finais.
 */
(function (global) {
  'use strict';

  var brand = Store.getBrand();
  var strategy = Store.getStrategy();

  var els = {
    nav: document.getElementById('nav'),
    views: document.querySelectorAll('.view'),
    brandForm: document.getElementById('brandForm'),
    strategyForm: document.getElementById('strategyForm'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),
    toast: document.getElementById('toast'),
    entregaAlunoNome: document.getElementById('entregaAlunoNome'),
    sidebarLogo: document.getElementById('sidebarLogo'),
    sidebarBrandName: document.getElementById('sidebarBrandName')
  };

  // ---------------------------------------------------------------- utilidades
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { els.toast.classList.remove('is-visible'); }, 2600);
  }

  function applyBrandToShell() {
    document.documentElement.style.setProperty('--brand-primary', brand.corPrimaria);
    document.documentElement.style.setProperty('--brand-secondary', brand.corSecundaria);
    els.sidebarBrandName.textContent = brand.empresa || 'Marca';
    if (brand.logoDataUrl) {
      els.sidebarLogo.innerHTML = '<img src="' + brand.logoDataUrl + '" alt="" />';
    } else {
      var initials = (brand.empresa || 'MP').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      els.sidebarLogo.textContent = initials;
    }
    els.entregaAlunoNome.textContent = strategy.aluno || 'o aluno';
  }

  // ---------------------------------------------------------------- navegação
  els.nav.addEventListener('click', function (e) {
    var btn = e.target.closest('.nav__item');
    if (!btn) return;
    var view = btn.getAttribute('data-view');
    els.nav.querySelectorAll('.nav__item').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
    els.views.forEach(function (v) { v.classList.toggle('is-active', v.getAttribute('data-view') === view); });
  });

  // ---------------------------------------------------------------- brand form
  function renderBrand() {
    BrandForm.render(els.brandForm, brand);
  }

  els.brandForm.addEventListener('input', function (e) {
    // sincroniza hex<->color
    if (e.target.type === 'color') {
      var hex = els.brandForm.querySelector('[data-hex-for="' + e.target.name + '"]');
      if (hex) hex.value = e.target.value;
    }
    if (e.target.classList.contains('color-input__hex')) {
      var name = e.target.getAttribute('data-hex-for');
      var picker = els.brandForm.querySelector('input[type="color"][name="' + name + '"]');
      if (picker && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) picker.value = e.target.value;
    }
    brand = BrandForm.collect(els.brandForm, brand);
    Store.saveBrand(brand);
    applyBrandToShell();
  });

  // upload de imagem (logo / assinatura)
  els.brandForm.addEventListener('change', function (e) {
    var fileInput = e.target.closest('[data-image-for]');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    var name = fileInput.getAttribute('data-image-for');
    var reader = new FileReader();
    reader.onload = function () {
      brand[name] = reader.result;
      Store.saveBrand(brand);
      renderBrand();
      applyBrandToShell();
      toast('Imagem atualizada.');
    };
    reader.readAsDataURL(fileInput.files[0]);
  });

  els.brandForm.addEventListener('click', function (e) {
    var clearBtn = e.target.closest('[data-clear-for]');
    if (clearBtn) {
      var name = clearBtn.getAttribute('data-clear-for');
      brand[name] = '';
      Store.saveBrand(brand);
      renderBrand();
      applyBrandToShell();
    }
  });

  document.getElementById('resetBrandBtn').addEventListener('click', function () {
    if (!confirm('Restaurar a identidade visual padrão? Suas personalizações serão perdidas.')) return;
    brand = Store.resetBrand();
    renderBrand();
    applyBrandToShell();
    toast('Identidade visual restaurada.');
  });

  // ---------------------------------------------------------------- strategy form
  function renderStrategy() {
    StrategyForm.render(els.strategyForm, strategy);
  }

  function persistStrategy() {
    strategy = StrategyForm.collect(els.strategyForm, strategy);
    Store.saveStrategy(strategy);
    els.entregaAlunoNome.textContent = strategy.aluno || 'o aluno';
  }

  els.strategyForm.addEventListener('input', persistStrategy);

  els.strategyForm.addEventListener('click', function (e) {
    var addBtn = e.target.closest('[data-add-row]');
    if (addBtn) {
      var key = addBtn.getAttribute('data-add-row');
      var rowsWrap = els.strategyForm.querySelector('[data-rows="' + key + '"]');
      var tmp = document.createElement('div');
      tmp.innerHTML = StrategyForm.rowHtml(key, StrategyForm.LISTS[key].cols, null);
      rowsWrap.appendChild(tmp.firstChild);
      return;
    }
    var delBtn = e.target.closest('[data-del-row]');
    if (delBtn) {
      delBtn.closest('.row').remove();
      persistStrategy();
    }
  });

  document.getElementById('loadSampleBtn').addEventListener('click', function () {
    if (!confirm('Carregar a estratégia de exemplo? Os dados atuais serão substituídos.')) return;
    strategy = Store.clone(global.SAMPLE_STRATEGY);
    Store.saveStrategy(strategy);
    renderStrategy();
    applyBrandToShell();
    toast('Estratégia de exemplo carregada.');
  });

  document.getElementById('newStudentBtn').addEventListener('click', function () {
    if (!confirm('Começar um aluno novo? Os dados do aluno atual serão apagados. Sua identidade visual (marca) será mantida.')) return;
    strategy = Store.resetStrategy();
    renderStrategy();
    applyBrandToShell();
    toast('Pronto! Pode preencher o novo aluno.');
  });

  // ---------------------------------------------------------------- modal
  function openModal(title) {
    els.modalTitle.textContent = title;
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    els.modalBody.innerHTML = '';
    els.modalActions.innerHTML = '';
  }
  els.modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && els.modal.classList.contains('is-open')) closeModal();
  });

  function actionBtn(label, cls, handler) {
    var b = document.createElement('button');
    b.className = 'btn ' + (cls || 'btn--ghost') + ' btn--sm';
    b.textContent = label;
    b.addEventListener('click', handler);
    return b;
  }

  function strategyHasContent() {
    return !!(strategy.aluno || strategy.resumoExecutivo ||
      (strategy.periodizacao && strategy.periodizacao.length) ||
      (strategy.treinos && strategy.treinos.length));
  }

  function ensureContentOrWarn() {
    if (strategyHasContent()) return true;
    toast('Preencha a estratégia primeiro (ou carregue o exemplo).');
    return false;
  }

  // ---------------------------------------------------------------- ENTREGA 1: WhatsApp
  function openWhatsApp() {
    if (!ensureContentOrWarn()) return;
    var text = WhatsAppFormat.build(strategy, brand);
    openModal('Versão para WhatsApp');
    els.modalBody.innerHTML =
      '<p class="modal__hint">Texto pronto para copiar e colar. Otimizado para leitura no celular.</p>' +
      '<pre class="wa-preview" id="waPreview"></pre>';
    document.getElementById('waPreview').textContent = text;

    els.modalActions.appendChild(actionBtn('📋 Copiar texto', 'btn--primary', function () {
      copyText(text);
    }));
    els.modalActions.appendChild(actionBtn('💬 Abrir no WhatsApp', 'btn--ghost', function () {
      var url = 'https://wa.me/?text=' + encodeURIComponent(text);
      global.open(url, '_blank');
    }));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Texto copiado!'); },
        function () { fallbackCopy(text); });
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Texto copiado!'); }
    catch (e) { toast('Não foi possível copiar automaticamente.'); }
    document.body.removeChild(ta);
  }

  // ---------------------------------------------------------------- ENTREGA 2 + 3: Documento Premium
  function openPremium(forPdf) {
    if (!ensureContentOrWarn()) return;
    openModal(forPdf ? 'Relatório Premium em PDF' : 'Documento Premium');
    els.modalBody.innerHTML = '<div class="doc-loading">Montando o documento…</div>';

    PremiumDocument.build(strategy, brand).then(function (docHtml) {
      els.modalBody.innerHTML = '<div class="doc-scroll" id="docScroll">' + docHtml + '</div>';
      var docNode = els.modalBody.querySelector('.doc');

      els.modalActions.appendChild(actionBtn('⬇️ Baixar PDF', 'btn--primary', function (e) {
        var btn = e.currentTarget;
        btn.disabled = true; btn.textContent = 'Gerando PDF…';
        PdfExport.generate(docNode, strategy, brand).then(function () {
          toast('PDF gerado com sucesso!');
        }).catch(function (err) {
          toast(err.message || 'Falha ao gerar PDF.');
        }).then(function () {
          btn.disabled = false; btn.textContent = '⬇️ Baixar PDF';
        });
      }));
      els.modalActions.appendChild(actionBtn('🖨️ Imprimir', 'btn--ghost', function () {
        printDocument(docHtml);
      }));
    }).catch(function (err) {
      els.modalBody.innerHTML = '<div class="doc-loading">Erro: ' + (err.message || err) + '</div>';
    });
  }

  function printDocument(docHtml) {
    var w = global.open('', '_blank');
    if (!w) { toast('Permita pop-ups para imprimir.'); return; }
    var styles = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(function (n) { styles += n.outerHTML; });
    w.document.write(
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' +
      '<title>Estratégia Personalizada de Treinamento</title>' + styles +
      '</head><body class="print-body">' + docHtml +
      '<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>' +
      '</body></html>'
    );
    w.document.close();
  }

  // ---------------------------------------------------------------- delivery buttons
  document.querySelector('.view[data-view="entrega"]').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-open]');
    if (!btn) return;
    var what = btn.getAttribute('data-open');
    if (what === 'whatsapp') openWhatsApp();
    else if (what === 'pdf') openPremium(true);
    else if (what === 'premium') openPremium(false);
  });

  // ---------------------------------------------------------------- init
  renderBrand();
  renderStrategy();
  applyBrandToShell();
})(window);
