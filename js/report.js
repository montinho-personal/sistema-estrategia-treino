/* =========================================================================
   Montinho Training Strategy — Diagnóstico & Relatório (determinístico)
   Organiza a anamnese e as respostas da entrevista. Nunca inventa estratégia:
   apenas estrutura o que o treinador informou, em linguagem para o aluno.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Report = (function () {
  function has(v) {
    if (Array.isArray(v)) return v.length > 0;
    return v != null && String(v).trim() !== '';
  }
  function clean(v) {
    if (Array.isArray(v)) return v.join(', ');
    return String(v == null ? '' : v).trim();
  }
  function firstName(nome) { return clean(nome).split(/\s+/)[0] || 'aluno'; }
  function ans(state) { return state.answers || {}; }

  /* ---- Diagnóstico / resumo executivo (Passo 3) ---- */
  function diagnosis(state) {
    var a = state.anamnese || {};
    var out = { perfil: [], atencao: [], oportunidades: [] };

    if (has(a.objetivo)) out.perfil.push(['Objetivo', a.objetivo]);
    if (has(a.experiencia)) out.perfil.push(['Experiência', a.experiencia]);
    if (has(a.idade)) out.perfil.push(['Idade', a.idade + ' anos']);
    if (has(a.modalidade)) out.perfil.push(['Modalidade', a.modalidade]);
    if (has(a.diasSemana)) {
      var t = a.diasSemana + ' dia(s)/semana';
      if (has(a.tempoSessao)) t += ' · ' + a.tempoSessao + ' min/sessão';
      out.perfil.push(['Disponibilidade', t]);
    }
    if (has(a.composicao)) out.perfil.push(['Composição', clean(a.composicao)]);

    (MTS.ANAMNESE_RULES || []).forEach(function (rule) {
      var msg = rule(a); if (msg) out.atencao.push(msg);
    });

    if (['alta', 'moderada'].indexOf(clean(a.motivacao).toLowerCase()) !== -1)
      out.oportunidades.push('Motivação favorável — bom momento para construir constância.');
    var dias = parseInt(a.diasSemana, 10);
    if (dias && dias >= 4)
      out.oportunidades.push('Boa disponibilidade semanal, o que amplia as opções de organização do treino.');
    if (['bom', 'ótimo', 'otimo'].indexOf(clean(a.sono).toLowerCase()) !== -1)
      out.oportunidades.push('Sono em bom nível favorece a recuperação e a progressão.');
    if (['boa', 'acompanhamento com nutricionista'].indexOf(clean(a.alimentacao).toLowerCase()) !== -1)
      out.oportunidades.push('Alimentação alinhada tende a acelerar os resultados do treino.');

    return out;
  }

  /* ---- Composição de uma seção a partir das respostas do tópico ---- */
  function sectionBody(topic, state) {
    var A = ans(state);
    var parts = [];

    // 1) frase principal (lead + resposta principal)
    var mainVal = topic.mainQ ? A[topic.mainQ] : '';
    if (has(mainVal)) {
      var lead = clean(topic.lead);
      var main = clean(mainVal);
      parts.push(lead ? (lead + ' ' + main + (/[.!?:]$/.test(main) ? '' : '.')) : main);
    }

    // 2) o porquê
    if (topic.whyQ && has(A[topic.whyQ]))
      parts.push('Por que dessa forma? ' + clean(A[topic.whyQ]));

    // 3) respostas de apoio (demais perguntas do tópico, incl. adaptativas)
    MTS.Interview.questionsForTopic(topic, state).forEach(function (q) {
      if (q.id === topic.mainQ || q.id === topic.whyQ) return;
      if (!has(A[q.id])) return;
      var label = q.label || q.prompt;
      parts.push(label + ': ' + clean(A[q.id]) + '.');
    });

    return parts.join('\n\n');
  }

  function sections(state) {
    var list = [];
    (MTS.TOPICS || []).forEach(function (topic) {
      // mensagem final é tratada como fechamento, não como seção comum
      if (topic.id === 'mensagem') return;
      var overridden = state.overrides && state.overrides[topic.id];
      var body = overridden != null ? overridden : sectionBody(topic, state);
      if (!has(body)) return;
      list.push({ id: topic.id, title: topic.title, body: body });
    });
    return list;
  }

  /* ---- Abertura e fechamento voltados ao aluno ---- */
  function intro(state) {
    var a = state.anamnese || {};
    var A = ans(state);
    var nome = firstName(a.nome);
    var obj = has(a.objetivo) ? a.objetivo.toLowerCase() : 'seus objetivos';
    var base = 'Olá, ' + nome + '! Esta é a estratégia que preparei especialmente para você, ' +
      'pensada a partir de tudo o que conversamos. A ideia não é só te entregar um treino, mas ' +
      'te explicar o porquê de cada decisão — para você treinar com clareza e confiança rumo a ' + obj + '.';
    if (has(A.filosofia_frase))
      base += '\n\nEm uma frase: “' + clean(A.filosofia_frase) + '”.';
    return base;
  }

  function closing(state) {
    var A = ans(state);
    var nome = firstName((state.anamnese || {}).nome);
    if (has(A.mensagem_final)) return clean(A.mensagem_final);
    return 'Cada escolha aqui tem um motivo e foi pensada para você, ' + nome + '. ' +
      'Qualquer dúvida, dor ou dificuldade, fale comigo: o plano é vivo e vamos ajustando juntos.';
  }

  function completion(state) {
    var missing = MTS.Interview.requiredMissing(state).length;
    var totalTopics = (MTS.TOPICS || []).length;
    var reqPerTopic = 0;
    (MTS.TOPICS || []).forEach(function (t) { reqPerTopic += (t.mainQ ? 1 : 0) + (t.whyQ ? 1 : 0); });
    var done = reqPerTopic - missing;
    return { done: done, total: reqPerTopic, topics: totalTopics, pct: reqPerTopic ? Math.round((done / reqPerTopic) * 100) : 0, complete: missing === 0 };
  }

  /* ---- Versão para WhatsApp ---- */
  function whatsapp(state) {
    var a = state.anamnese || {};
    var nome = firstName(a.nome);
    var lines = [];
    lines.push('*Sua estratégia de treino* 💪');
    lines.push('');
    lines.push('Olá, ' + nome + '! Preparei seu plano e quero que você entenda o porquê de cada escolha.');
    if (has((ans(state)).filosofia_frase)) lines.push('_' + clean(ans(state).filosofia_frase) + '_');
    sections(state).forEach(function (s) {
      lines.push('');
      lines.push('*' + s.title + '*');
      lines.push(s.body.replace(/\n{2,}/g, '\n'));
    });
    lines.push('');
    lines.push(closing(state));
    lines.push('');
    lines.push('_Vamos juntos! — Montinho Personal Trainer_');
    return lines.join('\n');
  }

  return {
    diagnosis: diagnosis, sections: sections, intro: intro, closing: closing,
    completion: completion, whatsapp: whatsapp
  };
})();
