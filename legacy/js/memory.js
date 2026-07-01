/* =========================================================================
   Montinho Training Strategy — Memória estratégica (Módulo 4)
   Memória viva: mapeia anamnese + respostas na estrutura organizada do PRD,
   calcula o status de cada área ("Estratégia em construção") e gera sugestões.
   Atualiza em tempo real; nunca é apagada durante a sessão.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Memory = (function () {
  function has(v) { return Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== ''); }
  function val(v) { if (Array.isArray(v)) return v.join(', '); return v == null ? '' : String(v).trim(); }
  function join() {
    return Array.prototype.slice.call(arguments).map(val).filter(has).join(' · ');
  }
  function inArr(arr, name) { return (Array.isArray(arr) && arr.indexOf(name) !== -1) ? 'Sim' : ''; }
  function anyIn(arr, names) { return names.some(function (n) { return inArr(arr, n) === 'Sim'; }) ? 'Sim' : ''; }

  /* Estrutura completa da memória, na ordem e nas seções do PRD. */
  function build(state) {
    var a = state.anamnese || {}, x = state.answers || {};
    var tec = x.intensidade_tecnicas, mob = x.mobilidade_o_que, fb = x.acompanhamento_info;

    return [
      { emoji: '👤', title: 'Aluno', editStep: 'anamnese', rows: [
        ['Nome', val(a.nome)], ['Idade', a.idade ? a.idade + ' anos' : ''], ['Sexo', val(a.sexo)],
        ['Experiência', val(a.experiencia)], ['Objetivo', val(a.objetivo)],
        ['Disponibilidade', a.diasSemana ? a.diasSemana + ' dia(s)/semana' : ''],
        ['Tempo por treino', a.tempoSessao ? a.tempoSessao + ' min' : ''], ['Modalidade', val(a.modalidade)]
      ] },
      { emoji: '🎯', title: 'Objetivo', editTopic: 'objetivo', rows: [
        ['Objetivo principal', val(x.objetivo_principal)], ['Objetivos secundários', val(x.objetivo_secundario)],
        ['Prioridades musculares', val(x.objetivo_prioridade)], ['Prazo', val(x.objetivo_prazo)],
        ['Motivo', val(x.objetivo_porque)]
      ] },
      { emoji: '🧠', title: 'Filosofia', editTopic: 'filosofia', rows: [
        ['Frase principal da estratégia', val(x.filosofia_frase)]
      ] },
      { emoji: '🏋', title: 'Divisão', editTopic: 'divisao', rows: [
        ['Divisão e distribuição', val(x.divisao_qual)], ['Justificativa', val(x.divisao_porque)],
        ['Vantagens', val(x.divisao_vantagens)], ['Adaptações', val(x.divisao_adaptacoes)]
      ] },
      { emoji: '🔥', title: 'Intensidade', editTopic: 'intensidade', rows: [
        ['Estratégia escolhida', val(x.intensidade_estrategia)], ['Faixa de repetições', val(x.intensidade_reps)],
        ['Falha', inArr(tec, 'Falha')], ['RIR', inArr(tec, 'RIR')], ['RPE', inArr(tec, 'RPE')],
        ['Cadência', inArr(tec, 'Cadência')], ['Tempo sob tensão', inArr(tec, 'Tempo sob tensão')],
        ['Isometrias', inArr(tec, 'Isometria')], ['Técnicas avançadas', anyIn(tec, ['Drop-set', 'Rest-pause', 'Cluster'])],
        ['Volume semanal', val(x.adapt_hipertrofia)], ['Motivo da escolha', val(x.intensidade_porque)]
      ] },
      { emoji: '📈', title: 'Periodização', editTopic: 'periodizacao', rows: [
        ['Fases, objetivos e duração', val(x.periodizacao_fases)], ['Justificativa', val(x.periodizacao_porque)]
      ] },
      { emoji: '🦵', title: 'Exercícios', editTopic: 'exercicios', rows: [
        ['Lógica de seleção', val(x.exercicios_logica)], ['Prioridades', val(x.exercicios_prioridade)],
        ['Obrigatórios', val(x.exercicios_obrigatorio)], ['Proibidos', val(x.exercicios_proibido)],
        ['Adaptações / segurança', join(x.adapt_dor, x.adapt_reab)], ['Motivo', val(x.exercicios_porque)]
      ] },
      { emoji: '🤸', title: 'Mobilidade', editTopic: 'mobilidade', rows: [
        ['Aquecimento', inArr(mob, 'Aquecimento')], ['Mobilidade', inArr(mob, 'Mobilidade')],
        ['Alongamentos', inArr(mob, 'Alongamentos')], ['Ativação', inArr(mob, 'Ativação')],
        ['Core', inArr(mob, 'Core')], ['Estabilidade', inArr(mob, 'Estabilidade')],
        ['Segurança (idoso)', val(x.adapt_idoso)], ['Motivo', val(x.mobilidade_porque)]
      ] },
      { emoji: '🏃', title: 'Cardio', editTopic: 'cardio', rows: [
        ['Haverá cardio', val(x.cardio_have)], ['Objetivo, frequência e intensidade', val(x.cardio_detalhe)],
        ['Gasto energético', val(x.adapt_emagrecimento)], ['Motivo', val(x.cardio_porque)]
      ] },
      { emoji: '📊', title: 'Progressão', editTopic: 'progressao', rows: [
        ['Como progredir (carga, volume, critérios, técnicas futuras)', val(x.progressao_como)],
        ['Justificativa', val(x.progressao_porque)]
      ] },
      { emoji: '📲', title: 'Feedback', editTopic: 'acompanhamento', rows: [
        ['Peso', inArr(fb, 'Peso')], ['Fotos', inArr(fb, 'Fotos')], ['Sono', inArr(fb, 'Sono')],
        ['Dor', inArr(fb, 'Dor')], ['Cargas', inArr(fb, 'Cargas')], ['Recuperação', inArr(fb, 'Recuperação')],
        ['Fadiga', inArr(fb, 'Fadiga')], ['Medidas', inArr(fb, 'Medidas')], ['Execução', inArr(fb, 'Execução')],
        ['Por que acompanhar', val(x.acompanhamento_porque)], ['Mensagem final', val(x.mensagem_final)]
      ] }
    ];
  }

  /* Status de cada área da entrevista para o painel "Estratégia em construção". */
  function areaStatus(state, currentTopicId) {
    var missing = MTS.Interview.requiredMissing(state);
    var missByTopic = {};
    missing.forEach(function (m) { missByTopic[m.topic.id] = (missByTopic[m.topic.id] || 0) + 1; });
    var ans = state.answers || {};
    return (MTS.TOPICS || []).map(function (t) {
      var done = !missByTopic[t.id];
      var anyAnswered = MTS.Interview.questionsForTopic(t, state).some(function (q) { return has(ans[q.id]); });
      var status = done ? 'done' : ((t.id === currentTopicId || anyAnswered) ? 'progress' : 'pending');
      return { id: t.id, n: t.n, name: t.name, status: status };
    });
  }

  /* Sugestões oportunas (nunca obrigatórias). */
  function suggestions(state) {
    var a = state.anamnese || {}, x = state.answers || {};
    var out = [];

    if (!has(x.progressao_como))
      out.push('Ainda não definimos a estratégia de progressão para este aluno.');
    if ((has(a.dores) || has(a.lesoes)) && !has(x.adapt_dor) && !has(x.exercicios_proibido))
      out.push('Ainda não existe nenhuma adaptação para a limitação relatada na anamnese.');
    if (!has(x.periodizacao_fases))
      out.push('Que tal estruturar as fases da periodização deste ciclo?');
    if (String(a.objetivo || '').toLowerCase() === 'emagrecimento' && x.cardio_have !== 'Sim' && !has(x.cardio_detalhe))
      out.push('O foco é emagrecimento — vale definir a estratégia de cardio e gasto energético.');

    return out.slice(0, 3);
  }

  return { build: build, areaStatus: areaStatus, suggestions: suggestions, has: has };
})();
