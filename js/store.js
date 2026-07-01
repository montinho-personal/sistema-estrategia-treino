/* =========================================================================
   Montinho Training Strategy — Estado + persistência local
   Guarda a anamnese, as respostas da entrevista e o progresso. Nada sai do
   navegador do treinador.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Store = (function () {
  var KEY = 'mts.strategy.v2';
  var AI_KEY = 'mts.ai.v1';

  var subs = [];

  function fresh() {
    return {
      anamnese: {},          // { campoId: valor }
      answers: {},           // { perguntaId: valor }
      acknowledged: {},      // { inconsistenciaId: true } — decisões mantidas pelo treinador
      overrides: {},         // { topicoId: textoDoRelatorioEditado }
      diagnosisNote: '',      // resumo executivo (opcional, ex.: gerado por IA)
      step: 'anamnese',      // anamnese | diagnostico | entrevista | revisao | relatorio
      currentQ: null,         // id da pergunta atual da entrevista
      updatedAt: null
    };
  }

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var parsed = JSON.parse(raw);
      var base = fresh();
      for (var k in parsed) if (parsed.hasOwnProperty(k)) base[k] = parsed[k];
      return base;
    } catch (e) {
      return fresh();
    }
  }

  function persist() {
    try {
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* quota / modo privado — segue sem persistir */ }
  }

  function emit() { subs.forEach(function (fn) { try { fn(state); } catch (e) {} }); }

  return {
    get: function () { return state; },

    subscribe: function (fn) {
      subs.push(fn);
      return function () { subs = subs.filter(function (f) { return f !== fn; }); };
    },

    patch: function (obj) {
      for (var k in obj) if (obj.hasOwnProperty(k)) state[k] = obj[k];
      persist(); emit();
    },

    setAnamnese: function (fieldId, value) { state.anamnese[fieldId] = value; persist(); emit(); },

    setAnswer: function (qId, value) { state.answers[qId] = value; persist(); emit(); },

    acknowledge: function (id) { state.acknowledged[id] = true; persist(); emit(); },

    setOverride: function (topicId, text) {
      if (text == null || text === '') delete state.overrides[topicId];
      else state.overrides[topicId] = text;
      persist(); emit();
    },

    reset: function () { state = fresh(); persist(); emit(); },

    /* ---- Configuração de IA (bring-your-own-key, opcional) ---- */
    getAI: function () { try { return JSON.parse(localStorage.getItem(AI_KEY)) || {}; } catch (e) { return {}; } },
    setAI: function (cfg) { try { localStorage.setItem(AI_KEY, JSON.stringify(cfg || {})); } catch (e) {} },
    clearAI: function () { try { localStorage.removeItem(AI_KEY); } catch (e) {} }
  };
})();
