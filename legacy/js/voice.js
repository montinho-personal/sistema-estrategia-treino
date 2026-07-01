/* =========================================================================
   Montinho Training Strategy — DNA do Montinho (Módulo 6)
   Define como o sistema escreve e se comunica, para que todo relatório pareça
   escrito pelo próprio Renato Nascimento — nunca por uma IA.

   Voz: conversa de um excelente Personal com seu aluno pelo WhatsApp. Leve,
   natural, organizada, em primeira pessoa, com linguagem simples. Traduz o
   técnico, evita frases genéricas e aprende continuamente o jeito do treinador.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.Voice = (function () {
  var qualityQuestion = 'Esse texto parece realmente escrito pelo Montinho Personal?';

  /* Aberturas em primeira pessoa por tópico — deixam o texto humano. */
  var LEADS = {
    objetivo: 'Neste ciclo, nosso foco será',
    filosofia: 'A ideia que vai guiar todo o seu treino é simples:',
    divisao: 'Escolhi organizar os seus treinos assim:',
    intensidade: 'Para o esforço dos treinos, optei por',
    periodizacao: 'Ao longo das próximas semanas, vamos evoluir assim:',
    mobilidade: 'Antes de cada treino, preparei esta rotina para o seu corpo:',
    exercicios: 'Para a escolha dos seus exercícios, segui esta lógica:',
    cardio: 'Sobre o trabalho aeróbico, neste momento faz mais sentido',
    progressao: 'Para você seguir evoluindo com segurança, pensei a progressão assim:',
    acompanhamento: 'Para acompanhar você de perto, nosso combinado será registrar',
    mensagem: ''
  };
  function personalLead(topicId) { return LEADS.hasOwnProperty(topicId) ? LEADS[topicId] : null; }

  /* Glossário: técnico -> simples. Traduz o conhecimento para o aluno. */
  var JARGON = [
    ['densidade de treino', 'menos tempo de intervalo para aumentar o estímulo'],
    ['estresse metabólico', 'mais estímulo dentro do músculo sem depender só de aumentar a carga'],
    ['hipertrofia miofibrilar', 'ganho de massa muscular'],
    ['hipertrofia', 'ganho de massa muscular'],
    ['sobrecarga progressiva', 'aumentar o desafio do treino aos poucos'],
    ['tempo sob tensão', 'tempo que o músculo fica trabalhando'],
    ['recrutamento de unidades motoras', 'ativação das fibras musculares'],
    ['unidades motoras', 'fibras musculares'],
    ['amplitude de movimento', 'o quanto você move a articulação'],
    ['cadência', 'ritmo do movimento'],
    ['propriocepção', 'percepção do corpo no espaço'],
    ['déficit calórico', 'gastar mais energia do que se consome'],
    ['periodização', 'organização do treino em fases'],
    ['sinergistas', 'músculos que ajudam no movimento'],
    ['isometria', 'segurar a posição parado, sob tensão']
  ];

  /* Frases genéricas a evitar. */
  var GENERIC = ['você consegue', 'vamos pra cima', 'vamos para cima', 'bora pra cima', 'foco total', 'partiu treino'];

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function wordRe(term) {
    try { return new RegExp('(?<![\\p{L}])' + escRe(term) + '(?![\\p{L}])', 'giu'); }
    catch (e) { return new RegExp(escRe(term), 'gi'); }
  }

  /* Reescreve termos técnicos em linguagem simples. */
  function simplify(text) {
    var out = String(text == null ? '' : text);
    JARGON.forEach(function (pair) {
      out = out.replace(wordRe(pair[0]), function (m) {
        // preserva a inicial maiúscula quando o termo abre a frase
        var repl = pair[1];
        return /^[A-ZÀ-Þ]/.test(m) ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;
      });
    });
    return out;
  }

  /* Auditoria de voz: aponta o que destoa do jeito do Montinho. */
  function check(text) {
    var t = String(text == null ? '' : text);
    var issues = [];

    // parágrafos longos (o aluno lê pelo celular)
    var longs = t.split(/\n{2,}/).filter(function (p) { return p.trim().length > 360; });
    if (longs.length) issues.push({ level: 'warn', text: longs.length + ' parágrafo(s) longo(s) — quebre em partes menores para leitura no celular.' });

    // jargão técnico
    var found = [];
    JARGON.forEach(function (pair) { if (wordRe(pair[0]).test(t)) found.push(pair[0]); });
    if (found.length) issues.push({ level: 'warn', text: 'Termos técnicos encontrados: ' + found.slice(0, 4).join(', ') + '. Prefira linguagem simples.' });

    // frases genéricas
    var gen = GENERIC.filter(function (g) { return wordRe(g).test(t); });
    if (gen.length) issues.push({ level: 'warn', text: 'Frase genérica: “' + gen[0] + '”. Personalize para este aluno.' });

    // tom pessoal
    if (!/(escolhi|optei|nosso foco|neste (primeiro )?ciclo|preparei|pensei|decidi)/i.test(t))
      issues.push({ level: 'warn', text: 'Falta tom pessoal — use expressões como “Escolhi…”, “Nosso foco será…”.' });

    return issues;
  }

  /* DNA DO MONTINHO — memória viva do jeito de pensar e escrever do treinador. */
  function dna(state) {
    var Store = MTS.Store;
    var out = [];
    var prefs = Store.prefList();
    prefs.slice(0, 4).forEach(function (p) { out.push('Costuma usar ' + String(p.title).toLowerCase() + ' (' + p.count + 'x).'); });

    var samples = [(state && state.answers) || {}];
    Store.history().forEach(function (h) { samples.push(h.answers || {}); });
    var mob = 0, fb = 0, adapt = 0, whyF = 0, whyT = 0;
    samples.forEach(function (a) {
      if (Array.isArray(a.mobilidade_o_que) && a.mobilidade_o_que.length >= 3) mob++;
      if (Array.isArray(a.acompanhamento_info) && a.acompanhamento_info.length >= 4) fb++;
      if (/adapta/i.test(String(a.periodizacao_fases || ''))) adapt++;
      ['objetivo_porque', 'divisao_porque', 'intensidade_porque'].forEach(function (k) { whyT++; if (a[k] && String(a[k]).trim()) whyF++; });
    });
    if (mob) out.push('Valoriza mobilidade e preparação antes dos treinos.');
    if (fb) out.push('Prioriza acompanhamento próximo e aderência do aluno.');
    if (adapt) out.push('Gosta de iniciar ciclos com uma fase de adaptação.');
    if (whyT && whyF / whyT >= 0.6) out.push('Explica o motivo de cada decisão para o aluno.');
    out.push('Prefere documentos organizados e em linguagem simples.');

    return { insights: out.slice(0, 7), prefs: prefs, cycles: Store.history().length, styleSamples: Store.styleSamples().length };
  }

  return { qualityQuestion: qualityQuestion, personalLead: personalLead, simplify: simplify, check: check, dna: dna, JARGON: JARGON };
})();
