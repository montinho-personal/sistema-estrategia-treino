/* =========================================================================
   Montinho Training Strategy — Diagnóstico & Relatório (determinístico)
   Organiza a anamnese e as decisões do treinador. Nunca inventa estratégia:
   apenas estrutura o que foi informado, em linguagem para o aluno.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Report = (function () {
  function has(v) { return v != null && String(v).trim() !== ''; }
  function clean(v) { return String(v == null ? '' : v).trim(); }
  function firstName(nome) { return clean(nome).split(/\s+/)[0] || 'aluno'; }

  /* ---- Diagnóstico / resumo executivo (Passo 3) ---------------------------
     Somente organiza a anamnese. Não define estratégia. */
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

    // Pontos de atenção derivados das regras da anamnese.
    (MTS.ANAMNESE_RULES || []).forEach(function (rule) {
      var msg = rule(a);
      if (msg) out.atencao.push(msg);
    });

    // Oportunidades (leitura positiva, sem inventar estratégia).
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

  /* ---- Seções do relatório (Passo 5) --------------------------------------
     Uma seção por tópico respondido, escrita para o aluno. */
  function joinPhrase(lead, decision) {
    var l = clean(lead), d = clean(decision);
    if (!d) return '';
    // Se o lead termina com ":" mantemos a decisão como continuação direta.
    if (/[:]$/.test(l)) return l + ' ' + d + '.';
    return l + ' ' + d + '.';
  }

  function sectionBody(topic, dec) {
    if (MTS.__override && MTS.__override[topic.id]) return MTS.__override[topic.id];
    var parts = [];
    var main = joinPhrase(topic.lead, dec.decision);
    if (main) parts.push(main);
    if (has(dec.why)) parts.push('Por que dessa forma? ' + clean(dec.why));
    return parts.join('\n\n');
  }

  function sections(state) {
    MTS.__override = state.overrides || {};
    var list = [];
    (MTS.TOPICS || []).forEach(function (topic) {
      var dec = (state.decisions || {})[topic.id];
      var overridden = state.overrides && state.overrides[topic.id];
      if (!overridden && (!dec || (!has(dec.decision) && !has(dec.why)))) return;
      list.push({
        id: topic.id,
        title: topic.title,
        body: overridden ? state.overrides[topic.id] : sectionBody(topic, dec || {})
      });
    });
    return list;
  }

  /* ---- Abertura e fechamento voltados ao aluno ---- */
  function intro(state) {
    var a = state.anamnese || {};
    var nome = firstName(a.nome);
    var obj = has(a.objetivo) ? a.objetivo.toLowerCase() : 'seus objetivos';
    return 'Olá, ' + nome + '! Esta é a estratégia que preparei especialmente para ' +
      'você, pensada a partir de tudo o que conversamos. A ideia aqui não é só te ' +
      'entregar um treino, mas te explicar o porquê de cada decisão — para que ' +
      'você treine com clareza e confiança rumo a ' + obj + '.';
  }

  function closing(state) {
    var nome = firstName((state.anamnese || {}).nome);
    return 'Cada escolha aqui tem um motivo e foi pensada para você, ' + nome + '. ' +
      'Qualquer dúvida, dor ou dificuldade, fale comigo: o plano é vivo e vamos ' +
      'ajustando juntos ao longo do caminho.';
  }

  function completion(state) {
    var total = (MTS.TOPICS || []).length;
    var done = sections(state).length;
    return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  /* ---- Versão para WhatsApp (texto puro, pronto para colar) ---- */
  function whatsapp(state) {
    var a = state.anamnese || {};
    var nome = firstName(a.nome);
    var lines = [];
    lines.push('*Sua estratégia de treino* 💪');
    lines.push('');
    lines.push('Olá, ' + nome + '! Preparei seu plano e quero que você entenda o porquê de cada escolha.');
    sections(state).forEach(function (s) {
      lines.push('');
      lines.push('*' + s.title + '*');
      lines.push(s.body.replace(/\n{2,}/g, '\n'));
    });
    lines.push('');
    lines.push('_Qualquer dúvida, é só me chamar. Vamos juntos! — Montinho Personal Trainer_');
    return lines.join('\n');
  }

  return {
    diagnosis: diagnosis,
    sections: sections,
    intro: intro,
    closing: closing,
    completion: completion,
    whatsapp: whatsapp
  };
})();
