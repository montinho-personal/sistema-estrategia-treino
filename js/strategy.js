/**
 * strategy.js — Formulário da Estratégia / Aluno.
 * Suporta listas repetíveis (avaliação, metas, periodização, treinos,
 * recomendações) que alimentam todas as entregas.
 */
(function (global) {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  // Esquema das listas repetíveis: campos de cada linha.
  var LISTS = {
    avaliacao: { legend: 'Avaliação física', add: 'Adicionar item', cols: [
      { name: 'rotulo', label: 'Rótulo', ph: 'Peso atual' },
      { name: 'valor', label: 'Valor', ph: '82 kg' }
    ]},
    metas: { legend: 'Metas / objetivos (blocos coloridos)', add: 'Adicionar meta', cols: [
      { name: 'titulo', label: 'Título', ph: 'Massa magra' },
      { name: 'descricao', label: 'Descrição', ph: 'Ganhar 3 a 4 kg', wide: true }
    ]},
    periodizacao: { legend: 'Periodização (timeline)', add: 'Adicionar fase', cols: [
      { name: 'fase', label: 'Fase', ph: 'Mesociclo 1 — Adaptação' },
      { name: 'duracao', label: 'Duração', ph: 'Semanas 1–4' },
      { name: 'foco', label: 'Foco', ph: 'Técnica e base' },
      { name: 'descricao', label: 'Descrição', ph: 'Volume moderado...', wide: true }
    ]},
    treinos: { legend: 'Divisão de treinos', add: 'Adicionar dia', cols: [
      { name: 'dia', label: 'Dia', ph: 'Segunda' },
      { name: 'grupo', label: 'Grupo muscular', ph: 'Peito e Tríceps' },
      { name: 'detalhe', label: 'Exercícios', ph: 'Supino, crucifixo...', wide: true }
    ]},
    recomendacoes: { legend: 'Recomendações', add: 'Adicionar recomendação', simple: true, cols: [
      { name: 'value', label: 'Recomendação', ph: 'Ingerir 2g de proteína/kg', wide: true }
    ]}
  };

  function textField(label, name, value, type) {
    return (
      '<label class="field">' +
        '<span class="field__label">' + label + '</span>' +
        '<input class="field__input" type="' + (type || 'text') + '" name="' + name + '" value="' + esc(value) + '" />' +
      '</label>'
    );
  }

  function areaField(label, name, value, rows) {
    return (
      '<label class="field field--wide">' +
        '<span class="field__label">' + label + '</span>' +
        '<textarea class="field__input" name="' + name + '" rows="' + (rows || 3) + '">' + esc(value) + '</textarea>' +
      '</label>'
    );
  }

  function rowHtml(key, cols, item) {
    var simple = LISTS[key].simple;
    var inner = cols.map(function (c) {
      var v = simple ? (item || '') : (item ? item[c.name] : '');
      return (
        '<input class="row__input ' + (c.wide ? 'row__input--wide' : '') + '" ' +
          'data-col="' + c.name + '" placeholder="' + c.label + '" ' +
          'value="' + esc(v) + '" />'
      );
    }).join('');
    return (
      '<div class="row" data-list="' + key + '">' +
        inner +
        '<button type="button" class="row__del" data-del-row aria-label="Remover">✕</button>' +
      '</div>'
    );
  }

  function listSection(key, data) {
    var cfg = LISTS[key];
    var items = data[key] || [];
    var rows = items.map(function (it) { return rowHtml(key, cfg.cols, it); }).join('');
    return (
      '<fieldset class="form__section" data-list-section="' + key + '">' +
        '<legend>' + cfg.legend + '</legend>' +
        '<div class="rows" data-rows="' + key + '">' + rows + '</div>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-add-row="' + key + '">＋ ' + cfg.add + '</button>' +
      '</fieldset>'
    );
  }

  function render(form, s) {
    form.innerHTML =
      '<fieldset class="form__section"><legend>Dados do aluno</legend><div class="form__grid">' +
        textField('Nome do aluno', 'aluno', s.aluno) +
        textField('Objetivo (subtítulo)', 'objetivo', s.objetivo) +
        textField('Data da elaboração', 'dataElaboracao', s.dataElaboracao, 'date') +
      '</div></fieldset>' +
      '<fieldset class="form__section"><legend>Resumo executivo</legend><div class="form__grid">' +
        areaField('Resumo (primeira página do relatório)', 'resumoExecutivo', s.resumoExecutivo, 5) +
      '</div></fieldset>' +
      listSection('avaliacao', s) +
      listSection('metas', s) +
      listSection('periodizacao', s) +
      listSection('treinos', s) +
      listSection('recomendacoes', s) +
      '<fieldset class="form__section"><legend>Observações finais</legend><div class="form__grid">' +
        areaField('Observações', 'observacoes', s.observacoes, 3) +
      '</div></fieldset>';
  }

  function collect(form, current) {
    var s = Store.clone(current);
    // Campos simples
    form.querySelectorAll('input[name], textarea[name], select[name]').forEach(function (el) {
      if (el.name) s[el.name] = el.value;
    });
    // Listas
    Object.keys(LISTS).forEach(function (key) {
      var cfg = LISTS[key];
      var rows = form.querySelectorAll('.row[data-list="' + key + '"]');
      var arr = [];
      rows.forEach(function (row) {
        if (cfg.simple) {
          var v = row.querySelector('[data-col="value"]').value.trim();
          if (v) arr.push(v);
        } else {
          var obj = {};
          var any = false;
          cfg.cols.forEach(function (c) {
            var input = row.querySelector('[data-col="' + c.name + '"]');
            obj[c.name] = input ? input.value.trim() : '';
            if (obj[c.name]) any = true;
          });
          if (any) arr.push(obj);
        }
      });
      s[key] = arr;
    });
    return s;
  }

  global.StrategyForm = {
    LISTS: LISTS,
    render: render,
    collect: collect,
    rowHtml: rowHtml
  };
})(window);
