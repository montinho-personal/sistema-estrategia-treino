/* =========================================================================
   Montinho Training Strategy — Motor da entrevista (Módulo 3)
   Monta o plano adaptativo de perguntas, mede o progresso, roda a auditoria
   de inconsistências e o checklist final. Sem dependências além de config.js.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Interview = (function () {
  function has(v) {
    if (Array.isArray(v)) return v.length > 0;
    return v != null && String(v).trim() !== '';
  }

  /* Perguntas aplicáveis de um tópico (fixas filtradas por condição + adaptativas). */
  function questionsForTopic(topic, state) {
    var a = state.anamnese || {}, ans = state.answers || {};
    var list = [];
    (topic.questions || []).forEach(function (q) {
      if (q.condition && !q.condition(a, ans)) return;
      list.push(q);
    });
    (MTS.ADAPTIVE || []).forEach(function (aq) {
      if (aq.topic === topic.id && aq.when(a)) list.push(aq);
    });
    return list;
  }

  /* Plano completo: [{ q, topic }] na ordem dos tópicos. */
  function plan(state) {
    var out = [];
    (MTS.TOPICS || []).forEach(function (topic) {
      questionsForTopic(topic, state).forEach(function (q) {
        out.push({ q: q, topic: topic });
      });
    });
    return out;
  }

  function isAnswered(q, answers) { return has((answers || {})[q.id]); }

  function progress(state) {
    var p = plan(state), ans = state.answers || {};
    var answered = p.filter(function (it) { return isAnswered(it.q, ans); }).length;
    return { answered: answered, total: p.length, pct: p.length ? Math.round((answered / p.length) * 100) : 0 };
  }

  /* Perguntas obrigatórias faltando, por tópico (principal + porquê). */
  function requiredMissing(state) {
    var ans = state.answers || {};
    var missing = [];
    (MTS.TOPICS || []).forEach(function (topic) {
      var reqIds = [];
      if (topic.mainQ) reqIds.push(topic.mainQ);
      if (topic.whyQ) reqIds.push(topic.whyQ);
      reqIds.forEach(function (id) {
        if (!has(ans[id])) {
          var q = (topic.questions || []).filter(function (x) { return x.id === id; })[0];
          missing.push({ topic: topic, q: q, id: id });
        }
      });
    });
    return missing;
  }

  function isComplete(state) { return requiredMissing(state).length === 0; }

  /* Navegação por id de pergunta dentro do plano atual. */
  function ids(state) { return plan(state).map(function (it) { return it.q.id; }); }

  function firstUnanswered(state) {
    var p = plan(state), ans = state.answers || {};
    for (var i = 0; i < p.length; i++) if (!isAnswered(p[i].q, ans)) return p[i].q.id;
    return p.length ? p[0].q.id : null;
  }
  function currentId(state) {
    var list = ids(state);
    if (state.currentQ && list.indexOf(state.currentQ) !== -1) return state.currentQ;
    return firstUnanswered(state);
  }
  function neighbor(state, id, dir) {
    var list = ids(state);
    var i = list.indexOf(id);
    if (i === -1) return null;
    var j = i + dir;
    return (j >= 0 && j < list.length) ? list[j] : null;
  }
  function firstIdOfTopic(state, topicId) {
    var p = plan(state);
    for (var i = 0; i < p.length; i++) if (p[i].topic.id === topicId) return p[i].q.id;
    return null;
  }
  function itemById(state, id) {
    return plan(state).filter(function (it) { return it.q.id === id; })[0] || null;
  }

  /* Auditoria de inconsistências (exclui as já reconhecidas pelo treinador). */
  function consistency(state) {
    var a = state.anamnese || {}, ans = state.answers || {}, ack = state.acknowledged || {};
    var out = [];
    (MTS.CONSISTENCY_RULES || []).forEach(function (rule) {
      var note = rule(a, ans);
      if (note && !ack[note.id]) out.push(note);
    });
    return out;
  }

  return {
    questionsForTopic: questionsForTopic,
    plan: plan,
    isAnswered: isAnswered,
    progress: progress,
    requiredMissing: requiredMissing,
    isComplete: isComplete,
    firstUnanswered: firstUnanswered,
    currentId: currentId,
    neighbor: neighbor,
    firstIdOfTopic: firstIdOfTopic,
    itemById: itemById,
    consistency: consistency
  };
})();
