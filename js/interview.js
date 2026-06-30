/**
 * interview.js — Entrevista Estratégica (Etapa 2).
 *
 * Define as 10 perguntas do PRD, uma por vez, com sub-perguntas e campos
 * inteligentes (selects consagrados, chips de técnicas, lista de fases). Após
 * cada resposta o assistente devolve uma ANÁLISE TÉCNICA de apoio — sem nunca
 * decidir pelo Personal.
 */
(function (global) {
  'use strict';

  var K = global.Knowledge;

  function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function escT(s) { return String(s == null ? '' : s).replace(/</g, '&lt;'); }

  function optList(arr) {
    return arr.map(function (o) { return typeof o === 'string' ? { value: o } : o; });
  }

  // ---------------------------------------------------------------- definições
  var STEPS = [
    {
      num: 1, title: 'Objetivo do ciclo', icon: '🎯',
      subqs: ['Qual será o objetivo principal deste ciclo?', 'Existe objetivo secundário?', 'Existe alguma prioridade?'],
      fields: [
        { name: 'objetivoPrincipal', label: 'Objetivo principal', type: 'textarea', ph: 'Ex.: Hipertrofia com ênfase em membros superiores' },
        { name: 'objetivoSecundario', label: 'Objetivo secundário (opcional)', type: 'text', ph: 'Ex.: Melhora do condicionamento' },
        { name: 'prioridade', label: 'Prioridade número 1', type: 'text', ph: 'O que vence em caso de conflito?' }
      ],
      analysis: function (e, c) { return K.Analysis.objetivo(e, c); }
    },
    {
      num: 2, title: 'Divisão de treino', icon: '🗂️',
      subqs: ['Qual divisão você escolheu?', 'Por que escolheu essa divisão?', 'Quais benefícios ela oferece?', 'Existiam outras opções? Por que foram descartadas?'],
      fields: [
        { name: 'divisao', label: 'Divisão escolhida', type: 'select', options: K.DIVISOES, ph: 'Selecione…' },
        { name: 'divisaoPorque', label: 'Por que escolheu', type: 'textarea', ph: 'O raciocínio por trás da escolha' },
        { name: 'divisaoBeneficios', label: 'Benefícios para este aluno', type: 'textarea', ph: 'O que ela entrega de melhor aqui' },
        { name: 'divisaoAlternativas', label: 'Outras opções consideradas', type: 'text', ph: 'Ex.: Upper/Lower, PPL' },
        { name: 'divisaoDescarte', label: 'Por que foram descartadas', type: 'textarea', ph: 'O motivo de não usá-las' }
      ],
      analysis: function (e) { return K.Analysis.divisao(e); }
    },
    {
      num: 3, title: 'Periodização', icon: '📈',
      subqs: ['Qual o modelo de periodização?', 'Quantas fases e qual o objetivo de cada uma?', 'Como evoluem volume e intensidade?', 'Haverá deload?'],
      fields: [
        { name: 'periodizacaoModelo', label: 'Modelo de periodização', type: 'select', options: K.PERIODIZACOES, ph: 'Selecione…' },
        { name: 'fases', label: 'Fases (timeline)', type: 'fases' },
        { name: 'volumeEvol', label: 'Evolução do volume', type: 'textarea', ph: 'Ex.: Sobe de 12 para 18 séries/grupo ao longo do mesociclo' },
        { name: 'intensidadeEvol', label: 'Evolução da intensidade', type: 'textarea', ph: 'Ex.: De 2–3 RIR para 0–1 RIR no fim do bloco' },
        { name: 'deload', label: 'Deload', type: 'text', ph: 'Ex.: Semana 7, volume reduzido em 50% — ou "Não"' }
      ],
      analysis: function (e) { return K.Analysis.periodizacao(e); }
    },
    {
      num: 4, title: 'Estratégia de repetições', icon: '🔁',
      subqs: ['Qual a faixa de repetições e por quê?', 'Vai usar RIR, RPE, falha, cadência, TUT, isometrias, técnicas avançadas?', 'Quando essas estratégias entram?'],
      fields: [
        { name: 'repFaixa', label: 'Faixa de repetições', type: 'select', options: K.FAIXAS_REP, ph: 'Selecione…' },
        { name: 'repPorque', label: 'Por que essa escolha', type: 'textarea', ph: 'O motivo para o objetivo do aluno' },
        { name: 'tecnicas', label: 'Recursos e técnicas', type: 'chips', options: K.TECNICAS },
        { name: 'tecnicasQuando', label: 'Quando cada estratégia entra', type: 'textarea', ph: 'Ex.: Drop-set só na última série dos isoladores, a partir da fase 2' }
      ],
      analysis: function (e) { return K.Analysis.repeticoes(e); }
    },
    {
      num: 5, title: 'Estratégia dos exercícios', icon: '🏋️',
      subqs: ['Há prioridade para algum grupo muscular?', 'Exercícios obrigatórios? Proibidos?', 'Adaptações por causa de dores?'],
      fields: [
        { name: 'grupoPrioridade', label: 'Grupo muscular prioritário', type: 'text', ph: 'Ex.: Dorsais e posterior de ombro' },
        { name: 'exObrigatorios', label: 'Exercícios obrigatórios', type: 'textarea', ph: 'Pilares que não saem do plano' },
        { name: 'exProibidos', label: 'Exercícios proibidos', type: 'textarea', ph: 'O que evitar e por quê' },
        { name: 'adaptacoesDor', label: 'Adaptações por dores/lesões', type: 'textarea', ph: 'Amplitude, ângulo, substituições' }
      ],
      analysis: function (e, c) { return K.Analysis.exercicios(e, c); }
    },
    {
      num: 6, title: 'Aquecimento e preparo', icon: '🔥',
      subqs: ['Como será o aquecimento?', 'Mobilidade? Ativação? Core? Estabilidade?'],
      fields: [
        { name: 'aquecimento', label: 'Aquecimento geral', type: 'textarea', ph: 'Ex.: 5 min de esteira + séries de aproximação' },
        { name: 'mobilidade', label: 'Mobilidade', type: 'text', ph: 'Ex.: Mobilidade de quadril e ombro' },
        { name: 'ativacao', label: 'Ativação muscular', type: 'text', ph: 'Ex.: Ativação de glúteo e manguito' },
        { name: 'core', label: 'Core / estabilidade', type: 'text', ph: 'Ex.: Prancha e dead bug' }
      ],
      analysis: function (e) { return K.Analysis.aquecimento(e); }
    },
    {
      num: 7, title: 'Cardio', icon: '🫀',
      subqs: ['Qual o objetivo do cardio?', 'Frequência?', 'Intensidade?'],
      fields: [
        { name: 'cardioObjetivo', label: 'Objetivo do cardio', type: 'text', ph: 'Ex.: Gasto calórico / condicionamento' },
        { name: 'cardioFrequencia', label: 'Frequência', type: 'text', ph: 'Ex.: 3x por semana, 30 min' },
        { name: 'cardioIntensidade', label: 'Intensidade', type: 'text', ph: 'Ex.: LISS Zona 2 / HIIT 1x' }
      ],
      analysis: function (e) { return K.Analysis.cardio(e); }
    },
    {
      num: 8, title: 'Estratégia de progressão', icon: '⏫',
      subqs: ['Quando aumentar carga?', 'Quando aumentar volume?', 'Quando trocar exercícios?', 'Quando reduzir volume?'],
      fields: [
        { name: 'progCarga', label: 'Quando aumentar a carga', type: 'textarea', ph: 'Ex.: Ao bater o topo da faixa de reps com técnica' },
        { name: 'progVolume', label: 'Quando aumentar o volume', type: 'textarea', ph: 'Ex.: A cada 2 semanas, +1 série nos grupos prioritários' },
        { name: 'progTroca', label: 'Quando trocar exercícios', type: 'textarea', ph: 'Ex.: A cada mesociclo ou se houver dor' },
        { name: 'progReducao', label: 'Quando reduzir o volume', type: 'textarea', ph: 'Ex.: Queda de performance, sono ruim, dores articulares' }
      ],
      analysis: function (e) { return K.Analysis.progressao(e); }
    },
    {
      num: 9, title: 'Feedback semanal', icon: '📊',
      subqs: ['Quais informações deseja receber do aluno toda semana?'],
      fields: [
        { name: 'feedback', label: 'Indicadores semanais', type: 'chips', options: K.FEEDBACK_ITENS }
      ],
      analysis: function (e) { return K.Analysis.feedback(e); }
    },
    {
      num: 10, title: 'Orientações importantes', icon: '📝',
      subqs: ['Existe alguma orientação importante para este aluno?'],
      fields: [
        { name: 'orientacoes', label: 'Orientação personalizada', type: 'textarea', ph: 'Mensagem ou cuidado específico para este aluno' }
      ],
      analysis: function (e) { return K.Analysis.orientacoes(e); }
    }
  ];

  // ---------------------------------------------------------------- render
  function fieldHtml(f, e) {
    var v = e[f.name];
    var inner;
    if (f.type === 'textarea') {
      inner = '<textarea class="field__input" data-iv="' + f.name + '" rows="3" placeholder="' + esc(f.ph || '') + '">' + escT(v || '') + '</textarea>';
    } else if (f.type === 'select') {
      var opts = '<option value="">' + esc(f.ph || 'Selecione…') + '</option>' + optList(f.options).map(function (o) {
        return '<option value="' + esc(o.value) + '"' + (o.value === v ? ' selected' : '') + '>' + esc(o.value) + (o.dias ? ' · ' + o.dias : '') + '</option>';
      }).join('');
      inner = '<select class="field__input" data-iv="' + f.name + '">' + opts + '</select>';
    } else if (f.type === 'chips') {
      var sel = Array.isArray(v) ? v : [];
      inner = '<div class="chips" data-iv-chips="' + f.name + '">' + optList(f.options).map(function (o) {
        var on = sel.indexOf(o.value) !== -1;
        return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-chip="' + esc(o.value) + '">' + esc(o.value) + '</button>';
      }).join('') + '</div>';
    } else if (f.type === 'fases') {
      inner = fasesHtml(v || []);
    } else {
      inner = '<input class="field__input" type="text" data-iv="' + f.name + '" value="' + esc(v || '') + '" placeholder="' + esc(f.ph || '') + '" />';
    }
    var wide = (f.type === 'textarea' || f.type === 'chips' || f.type === 'fases') ? ' field--wide' : '';
    return '<label class="field' + wide + '"><span class="field__label">' + esc(f.label) + '</span>' + inner + '</label>';
  }

  function fasesHtml(fases) {
    var rows = (fases.length ? fases : []).map(faseRow).join('');
    return '<div class="fases" data-fases>' + rows + '</div>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-add-fase>＋ Adicionar fase</button>';
  }
  function faseRow(f) {
    f = f || {};
    return '<div class="fase-row" data-fase-row>' +
      '<input class="row__input" data-fcol="fase" placeholder="Fase (ex.: Acúmulo)" value="' + esc(f.fase) + '" />' +
      '<input class="row__input" data-fcol="duracao" placeholder="Duração (ex.: Sem 1–4)" value="' + esc(f.duracao) + '" />' +
      '<input class="row__input" data-fcol="foco" placeholder="Foco" value="' + esc(f.foco) + '" />' +
      '<input class="row__input row__input--wide" data-fcol="descricao" placeholder="Descrição" value="' + esc(f.descricao) + '" />' +
      '<button type="button" class="row__del" data-del-fase aria-label="Remover">✕</button>' +
      '</div>';
  }

  function renderStep(container, step, e) {
    container.innerHTML =
      '<div class="iv-step">' +
        '<div class="iv-step__head">' +
          '<span class="iv-step__badge">' + step.icon + ' Pergunta ' + step.num + ' de ' + STEPS.length + '</span>' +
          '<h2 class="iv-step__title">' + esc(step.title) + '</h2>' +
          '<ul class="iv-step__subqs">' + step.subqs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="iv-step__fields">' + step.fields.map(function (f) { return fieldHtml(f, e); }).join('') + '</div>' +
        '<div class="iv-analysis" data-analysis hidden>' +
          '<div class="iv-analysis__tag">🧠 Análise técnica do assistente</div>' +
          '<p class="iv-analysis__text" data-analysis-text></p>' +
          '<p class="iv-analysis__note">Apoio à sua decisão — a palavra final é sempre sua.</p>' +
        '</div>' +
      '</div>';
  }

  // coleta os campos do passo atual para dentro de `entrevista`
  function collectStep(container, step, e) {
    step.fields.forEach(function (f) {
      if (f.type === 'chips') {
        var chips = container.querySelectorAll('[data-iv-chips="' + f.name + '"] .chip.is-on');
        e[f.name] = Array.prototype.map.call(chips, function (c) { return c.getAttribute('data-chip'); });
      } else if (f.type === 'fases') {
        var rows = container.querySelectorAll('[data-fase-row]');
        e[f.name] = Array.prototype.map.call(rows, function (r) {
          var o = {};
          r.querySelectorAll('[data-fcol]').forEach(function (inp) { o[inp.getAttribute('data-fcol')] = inp.value.trim(); });
          return o;
        }).filter(function (o) { return o.fase || o.duracao || o.foco || o.descricao; });
      } else {
        var el = container.querySelector('[data-iv="' + f.name + '"]');
        if (el) e[f.name] = el.value;
      }
    });
    return e;
  }

  global.Interview = {
    STEPS: STEPS,
    renderStep: renderStep,
    collectStep: collectStep,
    faseRow: faseRow
  };
})(window);
