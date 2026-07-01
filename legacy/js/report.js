/* =========================================================================
   Montinho Training Strategy — Geração do relatório (Módulo 7)
   Transforma as decisões da entrevista numa apresentação profissional para o
   aluno, na estrutura fixa do PRD. Antes de escrever, consulta memória,
   biblioteca, DNA, anamnese e preferências. Nunca inventa estratégia.

   Estrutura fixa (nunca alterar a ordem):
   Abertura · Objetivo · Diagnóstico · Nossa Estratégia · Divisão ·
   Intensidade · Periodização · Mobilidade · Progressão · Seu Papel · Mensagem.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Report = (function () {
  function has(v) { return Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== ''); }
  function clean(v) { if (Array.isArray(v)) return v.join(', '); return String(v == null ? '' : v).trim(); }
  function firstName(nome) { return clean(nome).split(/\s+/)[0] || 'aluno'; }
  function ans(state) { return state.answers || {}; }
  function lead(topicId) { return (MTS.Voice && MTS.Voice.personalLead(topicId)) || ''; }
  function sentence(s) { s = clean(s); if (!s) return ''; return /[.!?:]$/.test(s) ? s : s + '.'; }
  function para() { return Array.prototype.slice.call(arguments).map(clean).filter(has).join(' '); }
  function kb(state, topicId, max) {
    if (!MTS.Knowledge) return [];
    return MTS.Knowledge.forTopic(state, topicId).slice(0, max || 2)
      .map(function (e) { return MTS.Knowledge.explain(e, state).text; });
  }

  /* ---- Diagnóstico técnico (etapa do workspace, para o treinador) ---- */
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
    (MTS.ANAMNESE_RULES || []).forEach(function (rule) { var m = rule(a); if (m) out.atencao.push(m); });
    if (['alta', 'moderada'].indexOf(clean(a.motivacao).toLowerCase()) !== -1)
      out.oportunidades.push('Motivação favorável — bom momento para construir constância.');
    var dias = parseInt(a.diasSemana, 10);
    if (dias && dias >= 4) out.oportunidades.push('Boa disponibilidade semanal, o que amplia as opções de organização do treino.');
    if (['bom', 'ótimo', 'otimo'].indexOf(clean(a.sono).toLowerCase()) !== -1) out.oportunidades.push('Sono em bom nível favorece a recuperação e a progressão.');
    if (['boa', 'acompanhamento com nutricionista'].indexOf(clean(a.alimentacao).toLowerCase()) !== -1) out.oportunidades.push('Alimentação alinhada tende a acelerar os resultados do treino.');
    return out;
  }

  /* ---- Diagnóstico voltado ao aluno: resume, nunca assusta, mostra solução ---- */
  function studentDiagnosisData(state) {
    var a = state.anamnese || {};
    var fortes = [], atencao = [];
    var sono = clean(a.sono).toLowerCase(), estresse = clean(a.estresse).toLowerCase();
    var motiv = clean(a.motivacao).toLowerCase(), alim = clean(a.alimentacao).toLowerCase();
    var dias = parseInt(a.diasSemana, 10), idade = parseInt(a.idade, 10);

    if (['bom', 'ótimo', 'otimo'].indexOf(sono) !== -1) fortes.push('seu sono está em dia, o que ajuda muito na recuperação');
    if (['alta', 'moderada'].indexOf(motiv) !== -1) fortes.push('você chega motivado, e isso conta muito no resultado');
    if (dias && dias >= 4) fortes.push('você tem uma boa disponibilidade na semana');
    if (['boa', 'acompanhamento com nutricionista'].indexOf(alim) !== -1) fortes.push('sua alimentação já está alinhada com o objetivo');
    if (has(a.experiencia) && clean(a.experiencia).toLowerCase() !== 'iniciante') fortes.push('você já tem experiência de treino, o que acelera a evolução');

    if (has(a.dores) || has(a.lesoes)) atencao.push('você comentou um incômodo, então vamos caprichar no aquecimento, na técnica e na escolha dos exercícios para você treinar com segurança');
    if (dias && dias <= 3) atencao.push('como o tempo na semana é mais curto, organizei o treino para render bastante em cada sessão');
    if (sono === 'ruim' || estresse === 'alto') atencao.push('nos dias de sono ou rotina mais puxados, vamos ajustar o esforço para respeitar sua recuperação');
    if (idade && idade >= 60) atencao.push('vamos priorizar a segurança das articulações e uma evolução gradual e sólida');

    return { fortes: fortes, atencao: atencao };
  }

  function studentDiagnosis(state) {
    var d = studentDiagnosisData(state);
    var fortes = d.fortes, atencao = d.atencao;
    var body = [];
    if (fortes.length) {
      body.push('Você já tem pontos muito a seu favor:');
      body.push(fortes.map(function (f) { return '✓ ' + upperFirst(f); }).join('\n'));
    }
    if (atencao.length) {
      body.push('E há alguns detalhes que vamos cuidar juntos:');
      body.push(atencao.map(function (t) { return '• ' + upperFirst(t); }).join('\n'));
    }
    body.push('No geral, seu potencial de evolução é grande. Com consistência e o plano certo, os resultados vêm.');
    return body.join('\n\n');
  }
  function upperFirst(s) { s = clean(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---- Como a musculação ajuda a atingir o objetivo ---- */
  function comoAjuda(objetivo) {
    var o = clean(objetivo).toLowerCase();
    if (o === 'hipertrofia') return 'A musculação é o principal caminho para construir massa muscular de forma consistente e visível.';
    if (o === 'emagrecimento') return 'A musculação acelera seu metabolismo e preserva seus músculos enquanto você perde gordura — é o que garante um emagrecimento com qualidade.';
    if (o === 'performance' || o === 'competição') return 'A musculação constrói a base de força e resistência que a sua modalidade exige.';
    if (o === 'saúde e qualidade de vida') return 'A musculação melhora sua disposição, sua postura e sua saúde no dia a dia.';
    if (o === 'reabilitação') return 'A musculação, bem dosada, fortalece a região com segurança e devolve confiança aos seus movimentos.';
    return 'A musculação é a base para você alcançar esse objetivo com consistência.';
  }

  /* =====================================================================
     SEÇÕES (estrutura fixa)
     ===================================================================== */
  function objetivoSection(state) {
    var A = ans(state), a = state.anamnese || {};
    var p = [];
    if (has(A.objetivo_principal)) p.push(sentence(lead('objetivo') + ' ' + clean(A.objetivo_principal)));
    if (has(A.objetivo_secundario)) p.push('Como objetivo secundário, também vamos trabalhar ' + sentence(A.objetivo_secundario));
    if (has(A.objetivo_prioridade)) p.push('Com atenção especial para ' + sentence(A.objetivo_prioridade));
    if (has(A.objetivo_prazo)) p.push('A previsão para esta etapa é de ' + sentence(A.objetivo_prazo));
    if (has(A.objetivo_porque)) p.push('Escolhi esse foco porque ' + sentence(lowerFirst(A.objetivo_porque)));
    p.push(comoAjuda(a.objetivo));
    return { id: 'objetivo', title: 'Seu objetivo', body: joinP(p) };
  }

  function diagnosticoSection(state) {
    return { id: 'diagnostico', title: 'Seu diagnóstico', body: studentDiagnosis(state) };
  }

  function estrategiaSection(state) {
    var A = ans(state);
    var p = [];
    if (has(A.filosofia_frase)) p.push(sentence(lead('filosofia') + ' “' + clean(A.filosofia_frase) + '”'));
    p.push('Cada escolha do seu treino tem um motivo — nada aqui é por acaso. Abaixo eu te explico a lógica de cada parte.');
    // lógica dos exercícios
    var ex = [];
    if (has(A.exercicios_logica)) ex.push('Na seleção dos exercícios, ' + lowerFirst(clean(A.exercicios_logica)));
    if (has(A.exercicios_prioridade)) ex.push('com prioridade para ' + clean(A.exercicios_prioridade));
    if (has(A.exercicios_proibido)) ex.push('e evitando ' + clean(A.exercicios_proibido));
    if (ex.length) p.push(sentence(ex.join(', ')));
    if (has(A.adapt_dor)) p.push(sentence(A.adapt_dor));
    if (has(A.adapt_reab)) p.push(sentence(A.adapt_reab));
    // cardio, como parte da estratégia
    if (clean(A.cardio_have) === 'Sim' || has(A.cardio_detalhe)) {
      var c = 'Sobre o trabalho aeróbico, ' + (has(A.cardio_detalhe) ? lowerFirst(clean(A.cardio_detalhe)) : 'ele entra de forma estratégica no seu plano');
      p.push(sentence(c));
      if (has(A.adapt_emagrecimento)) p.push(sentence(A.adapt_emagrecimento));
    }
    return { id: 'estrategia', title: 'Nossa estratégia', body: joinP(p) };
  }

  function divisaoSection(state) {
    var A = ans(state), a = state.anamnese || {};
    var p = [];
    if (has(A.divisao_qual)) p.push(sentence(lead('divisao') + ' ' + clean(A.divisao_qual)));
    if (has(A.divisao_porque)) p.push('Escolhi essa divisão porque ' + sentence(lowerFirst(A.divisao_porque)));
    if (has(A.divisao_vantagens)) p.push('Na prática, ela te dá ' + sentence(lowerFirst(A.divisao_vantagens)));
    if (has(A.divisao_adaptacoes)) p.push(sentence(A.divisao_adaptacoes));
    if (has(a.objetivo)) p.push('Isso conversa direto com o seu objetivo de ' + clean(a.objetivo).toLowerCase() + '.');
    kb(state, 'divisao', 1).forEach(function (t) { p.push(t); });
    return { id: 'divisao', title: 'Como seus treinos estão divididos', body: joinP(p) };
  }

  function intensidadeSection(state) {
    var A = ans(state);
    var p = [];
    if (has(A.intensidade_estrategia)) p.push(sentence(lead('intensidade') + ' ' + clean(A.intensidade_estrategia)));
    if (has(A.intensidade_porque)) p.push('Optei por isso porque ' + sentence(lowerFirst(A.intensidade_porque)));
    if (has(A.intensidade_reps)) p.push('Sua faixa de repetições será ' + sentence(A.intensidade_reps));
    // explica cada técnica (nunca apenas lista)
    var techMap = { 'Falha': 'falha', 'RIR': 'rir', 'RPE': 'rpe', 'Cadência': 'cadencia', 'Tempo sob tensão': 'tempo_sob_tensao', 'Isometria': 'isometria', 'Drop-set': 'drop_set', 'Rest-pause': 'rest_pause', 'Cluster': 'cluster' };
    (Array.isArray(A.intensidade_tecnicas) ? A.intensidade_tecnicas : []).slice(0, 5).forEach(function (t) {
      var e = MTS.Knowledge && MTS.Knowledge.byId(techMap[t]);
      if (e) p.push(MTS.Knowledge.explain(e, state).text);
    });
    kb(state, 'intensidade', 1).forEach(function (t) { p.push(t); });
    return { id: 'intensidade', title: 'A intensidade dos seus treinos', body: joinP(p) };
  }

  function periodizacaoSection(state) {
    var A = ans(state);
    var p = [];
    if (has(A.periodizacao_fases)) p.push(sentence(lead('periodizacao') + ' ' + clean(A.periodizacao_fases)));
    if (has(A.periodizacao_porque)) p.push('Decidi evoluir assim porque ' + sentence(lowerFirst(A.periodizacao_porque)));
    p.push('Na prática, isso significa que seu treino não fica parado no tempo: ele evolui junto com você, fase após fase.');
    return { id: 'periodizacao', title: 'Como você vai evoluir ao longo do tempo', body: joinP(p) };
  }

  function mobilidadeSection(state) {
    var A = ans(state), a = state.anamnese || {};
    var p = [];
    var itens = Array.isArray(A.mobilidade_o_que) ? A.mobilidade_o_que : [];
    if (itens.length) p.push(sentence(lead('mobilidade') + ' ' + itens.join(', ')));
    if (has(A.mobilidade_porque)) p.push('Isso é importante porque ' + sentence(lowerFirst(A.mobilidade_porque)));
    if (has(A.adapt_idoso)) p.push(sentence(A.adapt_idoso));
    if (has(a.dores) || has(a.lesoes)) p.push('No seu caso, essa preparação é ainda mais importante para proteger a região que você comentou e treinar sem dor.');
    if (p.length) p.push('São poucos minutos antes do treino que fazem toda a diferença na qualidade e na segurança da sua sessão.');
    return { id: 'mobilidade', title: 'Aquecimento e preparação', body: joinP(p) };
  }

  function progressaoSection(state) {
    var A = ans(state);
    var p = [];
    if (has(A.progressao_como)) p.push(sentence(lead('progressao') + ' ' + clean(A.progressao_como)));
    if (has(A.progressao_porque)) p.push('Pensei assim porque ' + sentence(lowerFirst(A.progressao_porque)));
    p.push('O combinado é simples: a gente só avança quando você domina a etapa atual. Assim sua evolução é segura e constante, e você sempre sabe qual é o próximo passo.');
    return { id: 'progressao', title: 'As regras da sua progressão', body: joinP(p) };
  }

  function papelSection(state) {
    var A = ans(state);
    var itens = Array.isArray(A.acompanhamento_info) ? A.acompanhamento_info : [];
    var p = [];
    p.push('Os resultados vêm de um trabalho em equipe. A minha parte é montar e ajustar a sua estratégia; a sua é treinar com constância e me manter informado.');
    if (itens.length) {
      p.push('Toda semana, o que eu preciso que você me envie:');
      p.push(itens.map(function (i) { return '✓ ' + i; }).join('\n'));
    }
    if (has(A.acompanhamento_porque)) p.push('Peço essas informações porque ' + sentence(lowerFirst(A.acompanhamento_porque)));
    p.push('Com esses dados em mãos, consigo ajustar seu treino no tempo certo e manter sua evolução sempre no rumo.');
    return { id: 'papel', title: 'Seu papel no processo', body: joinP(p) };
  }

  /* ---- Documento completo (ordem fixa) ---- */
  function document(state) {
    var built = [
      objetivoSection(state), diagnosticoSection(state), estrategiaSection(state),
      divisaoSection(state), intensidadeSection(state), periodizacaoSection(state),
      mobilidadeSection(state), progressaoSection(state), papelSection(state)
    ];
    return built;
  }

  function sections(state) {
    return document(state).map(function (s) {
      var ov = state.overrides && state.overrides[s.id];
      return { id: s.id, title: s.title, body: ov != null ? ov : s.body };
    }).filter(function (s) { return has(s.body); });
  }

  /* ---- Abertura ---- */
  function intro(state) {
    var a = state.anamnese || {}, A = ans(state);
    var nome = firstName(a.nome);
    var obj = has(a.objetivo) ? a.objetivo.toLowerCase() : 'seus objetivos';
    var base = 'Olá, ' + nome + '! Preparei esta estratégia especialmente para você, a partir de ' +
      'tudo o que conversamos. Aqui eu não quero só te passar um treino — quero te explicar o ' +
      'porquê de cada escolha, para você treinar com clareza e confiança rumo a ' + obj + '.';
    if (has(A.filosofia_frase)) base += '\n\nEm uma frase, é isto: “' + clean(A.filosofia_frase) + '”.';
    return base;
  }

  /* ---- Mensagem final: exclusiva, adaptada ao perfil ---- */
  function closing(state) {
    var A = ans(state), a = state.anamnese || {};
    var nome = firstName(a.nome);
    if (has(A.mensagem_final)) return clean(A.mensagem_final);
    var o = clean(a.objetivo).toLowerCase();
    var idade = parseInt(a.idade, 10);
    var exp = clean(a.experiencia).toLowerCase();
    var msg;
    if (exp === 'atleta' || o === 'performance' || o === 'competição')
      msg = 'Cada detalhe deste plano foi pensado para elevar o seu rendimento. Confie no processo, execute com qualidade, e vamos buscar juntos a sua melhor performance.';
    else if (o === 'emagrecimento')
      msg = 'Emagrecer com saúde é sobre consistência, não pressa. Não precisa ser perfeito — precisa ser constante. Faça a sua parte nos treinos e no dia a dia, que os resultados vão aparecer, e eu estarei com você em cada etapa.';
    else if (idade && idade >= 60)
      msg = 'Mais do que estética, aqui a gente treina pela sua saúde, sua autonomia e sua qualidade de vida. Vamos com calma e firmeza: cada treino é um investimento no seu bem-estar por muitos anos.';
    else if (o === 'hipertrofia')
      msg = 'Construir músculo é um trabalho de paciência e consistência. Cada treino bem feito é um tijolo nessa construção. Confie no plano, capriche na execução, e o seu físico vai responder.';
    else if (o === 'reabilitação')
      msg = 'Nosso foco agora é te devolver movimento com segurança e confiança. Sem pressa e sem dor: cada passo é uma vitória. Estarei aqui te acompanhando de perto em toda a recuperação.';
    else
      msg = 'Este plano foi feito sob medida para você, ' + nome + '. Faça a sua parte com constância que eu faço a minha, ajustando tudo ao longo do caminho. Vamos juntos nessa.';
    return msg;
  }

  function completion(state) {
    var missing = MTS.Interview.requiredMissing(state).length;
    var reqPerTopic = 0;
    (MTS.TOPICS || []).forEach(function (t) { reqPerTopic += (t.mainQ ? 1 : 0) + (t.whyQ ? 1 : 0); });
    var done = reqPerTopic - missing;
    return { done: done, total: reqPerTopic, topics: (MTS.TOPICS || []).length, pct: reqPerTopic ? Math.round((done / reqPerTopic) * 100) : 0, complete: missing === 0 };
  }

  /* ---- Versão WhatsApp: títulos, emojis discretos, pronto para colar ---- */
  var WA_EMOJI = { objetivo: '🎯', diagnostico: '🩺', estrategia: '🧠', divisao: '🗓️', intensidade: '🔥', periodizacao: '📈', mobilidade: '🤸', progressao: '📊', papel: '✅' };
  function whatsapp(state) {
    var nome = firstName((state.anamnese || {}).nome);
    var lines = ['*Sua estratégia de treino* 💪', '', intro(state).replace(/\n{2,}/g, '\n')];
    sections(state).forEach(function (s) {
      lines.push('');
      lines.push('*' + (WA_EMOJI[s.id] ? WA_EMOJI[s.id] + ' ' : '') + s.title + '*');
      lines.push(s.body.replace(/\n{2,}/g, '\n'));
    });
    lines.push('', '*Mensagem final*', closing(state), '', '_Vamos juntos! — Montinho Personal Trainer_');
    return lines.join('\n');
  }

  /* utils */
  function joinP(arr) { return arr.filter(has).join('\n\n'); }
  function lowerFirst(s) { s = clean(s); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  return {
    diagnosis: diagnosis, studentDiagnosis: studentDiagnosis, studentDiagnosisData: studentDiagnosisData,
    sections: sections, document: document, intro: intro, closing: closing,
    completion: completion, whatsapp: whatsapp
  };
})();
