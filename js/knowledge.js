/**
 * knowledge.js — Base de conhecimento do assistente.
 *
 * Reúne opções consagradas (divisões, periodização, estratégias de repetição)
 * e gera ANÁLISES TÉCNICAS curtas baseadas em evidência e na prática de grandes
 * nomes do treinamento. O assistente NUNCA decide pelo Personal: ele apoia,
 * valida e contextualiza a decisão já tomada.
 *
 * Referências de consenso: Schoenfeld, Helms, Nuckols, Israetel, Beardsley,
 * Zatsiorsky, Verkhoshansky, Bompa, Thibaudeau, Pacholok, Twin, Rambod.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- catálogos
  var DIVISOES = [
    { value: 'Full Body', dias: '2–4x', nota:
      'Maior frequência por grupo muscular na semana. A meta-análise de Schoenfeld (2016) mostra vantagem de treinar cada grupo ≥2x/semana para hipertrofia — o Full Body entrega isso com poucos dias. Excelente para iniciantes, retorno de pausa e agendas curtas.' },
    { value: 'Upper / Lower', dias: '4x', nota:
      'Equilíbrio clássico entre frequência (2x/grupo) e volume por sessão. Permite gerenciar bem a fadiga e distribuir o volume semanal — uma escolha "à prova de erro" para intermediários.' },
    { value: 'Push / Pull / Legs', dias: '3–6x', nota:
      'Organiza por padrão de movimento, reduz sobreposição e facilita volume alto com boa recuperação. Em 6x/semana atinge frequência 2x/grupo; em 3x, vira 1x/grupo (mais volume por sessão).' },
    { value: 'ABC', dias: '3x', nota:
      'Divisão prática e popular no Brasil (linha Leandro Twin/Pacholok). Boa para quem treina 3–6 dias; cada sessão concentra volume suficiente para estímulo robusto. Atenção à frequência semanal por grupo se rodar só 1x.' },
    { value: 'ABCD', dias: '4x', nota:
      'Permite especializar grupos e dar mais volume a regiões prioritárias. Indicada para intermediários/avançados com boa capacidade de recuperação e agenda estável.' },
    { value: 'ABCDE', dias: '5x', nota:
      'Alto volume por grupo e foco em pontos fracos — modelo de fisiculturismo. Exige boa recuperação, sono e nutrição; frequência tende a 1x/grupo, então o volume por sessão precisa ser bem dosado.' },
    { value: 'Arnold / Antagonistas', dias: '4–6x', nota:
      'Pares agonista/antagonista aumentam densidade e bombeamento. Bom para experiência avançada e objetivo estético; controle o volume para não comprometer a qualidade das últimas séries.' }
  ];

  var PERIODIZACOES = [
    { value: 'Linear', nota:
      'Progressão clássica (Bompa): volume alto → intensidade alta ao longo das semanas. Previsível e ótima para construir base. Pode perder qualidades treinadas no início se o ciclo for muito longo.' },
    { value: 'Ondulatória (DUP)', nota:
      'Variação de volume/intensidade dentro da semana. Evidência (Helms, Zourdos) mostra resultados iguais ou superiores à linear para intermediários, com menos monotonia e bom manejo de fadiga.' },
    { value: 'Por Blocos', nota:
      'Blocos sequenciais de acumulação → transmutação → realização (Verkhoshansky). Concentra o estímulo numa qualidade por vez — forte para atletas e objetivos de performance.' },
    { value: 'Conjugada', nota:
      'Desenvolve várias qualidades simultaneamente (Zatsiorsky/Westside). Exige boa gestão de carga; potente para força e potência em avançados.' },
    { value: 'Ondulatória Diária', nota:
      'Cada sessão tem um foco (força / hipertrofia / metabólico). Mantém múltiplos estímulos vivos e combina bem com divisões de maior frequência.' }
  ];

  var FAIXAS_REP = [
    { value: 'Força (1–5)', nota: 'Predomínio neural e tensão mecânica máxima. Descansos longos (3–5 min) preservam a qualidade.' },
    { value: 'Força-Hipertrofia (6–8)', nota: 'Ótimo custo-benefício entre carga e volume — faixa "carro-chefe" para a maioria dos compostos.' },
    { value: 'Hipertrofia (8–12)', nota: 'Faixa mais estudada para hipertrofia; equilibra tensão e estresse metabólico com fadiga gerenciável.' },
    { value: 'Resistência / Metabólico (12–20+)', nota: 'Útil em isoladores e pump; Schoenfeld mostra que altas reps próximas à falha também hipertrofiam. Cuidado com fadiga sistêmica.' },
    { value: 'Mista (por exercício)', nota: 'Cargas baixas nos compostos e reps altas nos isoladores — abordagem prática e muito usada na prática avançada.' }
  ];

  var TECNICAS = [
    'RIR', 'RPE', 'Falha', 'Cadência', 'Tempo sob tensão',
    'Isometrias', 'Drop-set', 'Rest-pause', 'Bi-set / Super-set',
    'Myo-reps', 'Séries gigantes', 'Excêntrica acentuada', 'Parciais'
  ];

  var FEEDBACK_ITENS = [
    'Sono', 'Dor', 'Fadiga', 'Recuperação', 'Peso', 'Fotos', 'Performance', 'Execução'
  ];

  var TECNICA_NOTAS = {
    'RIR': 'RIR (reps in reserve) é a forma mais prática de autorregular intensidade (Helms). Manter 1–3 RIR na maioria das séries maximiza estímulo com fadiga controlada.',
    'RPE': 'A escala de RPE (Zourdos) deixa o aluno calibrar o esforço dia a dia, respeitando prontidão e sono.',
    'Falha': 'A falha aumenta o estímulo, mas também a fadiga e o risco (Nuckols, Beardsley). Reservá-la para isoladores e últimas séries costuma render mais por unidade de fadiga.',
    'Cadência': 'Controlar a cadência melhora conexão e segurança, mas TUT extremo não é requisito para hipertrofia — priorize tensão e proximidade da falha.',
    'Tempo sob tensão': 'TUT é consequência de boa execução, não um fim em si. Útil para reforçar técnica e excêntrica em fases iniciais.',
    'Isometrias': 'Isometrias agregam controle e reforço articular — ótimas em reabilitação, core e pontos de aderência (sticking points).',
    'Drop-set': 'Drop-sets aumentam volume efetivo em pouco tempo (Israetel) — potentes em isoladores e no fim da sessão; usar com parcimônia para não estourar a fadiga.',
    'Rest-pause': 'Rest-pause eleva a densidade e o volume próximo à falha; excelente em finalizadores e quando o tempo é curto.',
    'Bi-set / Super-set': 'Super-sets aumentam densidade e eficiência de tempo; combine antagonistas para manter a qualidade da carga.',
    'Myo-reps': 'Myo-reps (linha Israetel/Berkhan) entregam muito estímulo em pouco tempo — boas para isoladores com agenda apertada.',
    'Séries gigantes': 'Alta demanda metabólica e de tempo; reserve para fases de densidade/definição e grupos resistentes.',
    'Excêntrica acentuada': 'A fase excêntrica controlada é fortemente ligada à hipertrofia e ao reforço tendíneo — ótima para técnica e dor articular.',
    'Parciais': 'Parciais no estiramento (lengthened partials) têm evidência recente favorável (Schoenfeld) para isoladores — usar como complemento, não como base.'
  };

  // ---------------------------------------------------------------- utilidades
  function pick(list, value) {
    return list.filter(function (o) {
      return o.value && value && o.value.toLowerCase() === String(value).toLowerCase();
    })[0];
  }
  function has(text, words) {
    var t = ' ' + String(text || '').toLowerCase() + ' ';
    return words.some(function (w) { return t.indexOf(w) !== -1; });
  }

  // ---------------------------------------------------------------- análises
  // Cada função recebe a entrevista (e categorias) e devolve um parágrafo de
  // análise técnica de apoio — nunca uma decisão.
  var Analysis = {
    objetivo: function (e, cat) {
      var msg = [];
      var alvo = (e.objetivoPrincipal || '').toLowerCase();
      if (has(alvo, ['hipertrofia', 'massa', 'muscul'])) {
        msg.push('Objetivo de hipertrofia: o motor principal é volume semanal progressivo próximo à falha (Schoenfeld) com frequência ≥2x por grupo.');
      } else if (has(alvo, ['emagre', 'gordura', 'definic', 'recomp'])) {
        msg.push('Objetivo de emagrecimento/recomposição: preservar massa magra com treino de força é prioridade — o déficit cuida da gordura, a musculação protege o músculo.');
      } else if (has(alvo, ['forca', 'força', 'performance', 'atleta'])) {
        msg.push('Objetivo de força/performance: especificidade e gestão de carga ganham peso — compostos pesados, técnica impecável e progressão controlada.');
      } else if (alvo) {
        msg.push('Objetivo bem definido ajuda a priorizar as variáveis certas ao longo do ciclo.');
      }
      if (e.objetivoSecundario) msg.push('Ter um objetivo secundário é ótimo, desde que ele não compita por recurso com o principal — defina qual vence em caso de conflito.');
      if (cat && has(cat.dores + ' ' + cat.lesoes, ['ombro', 'lombar', 'joelho', 'coluna', 'dor', 'lesã', 'lesa']))
        msg.push('Atenção: a anamnese aponta dores/lesões — vale alinhar o objetivo às adaptações necessárias desde já.');
      return msg.join(' ') || 'Objetivo registrado. Ele será o fio condutor de todas as decisões seguintes.';
    },

    divisao: function (e) {
      var d = pick(DIVISOES, e.divisao);
      var base = d ? d.nota : 'Divisão registrada. O que mais importa não é o nome, e sim a frequência semanal por grupo e a distribuição do volume.';
      var extra = e.divisaoPorque ? ' Sua justificativa fortalece a escolha e será explicada ao aluno no relatório.' :
        ' Vale registrar o "porquê" — ele aumenta muito a percepção de valor para o aluno.';
      return base + extra;
    },

    periodizacao: function (e) {
      var p = pick(PERIODIZACOES, e.periodizacaoModelo);
      var msg = [p ? p.nota : 'Modelo registrado. Periodizar = ter um plano de como volume e intensidade evoluem no tempo.'];
      if (e.fases && e.fases.length) msg.push('Você definiu ' + e.fases.length + ' fase(s) — boa estrutura para mostrar evolução no relatório (timeline).');
      if (e.deload && /n[ãa]o/i.test(e.deload)) msg.push('Sem deload programado: monitore fadiga e sono de perto e considere uma semana leve se a performance cair.');
      else if (e.deload) msg.push('Deload programado é uma decisão madura — preserva articulações e mantém a progressão sustentável.');
      return msg.join(' ');
    },

    repeticoes: function (e) {
      var f = pick(FAIXAS_REP, e.repFaixa);
      var msg = [f ? f.nota : 'Estratégia de repetições registrada.'];
      (e.tecnicas || []).slice(0, 3).forEach(function (t) {
        if (TECNICA_NOTAS[t]) msg.push(TECNICA_NOTAS[t]);
      });
      if ((e.tecnicas || []).length > 3) msg.push('Você selecionou várias técnicas — defina bem QUANDO cada uma entra para não acumular fadiga em excesso.');
      return msg.join(' ');
    },

    exercicios: function (e, cat) {
      var msg = [];
      if (e.grupoPrioridade) msg.push('Priorizar ' + e.grupoPrioridade + ' faz sentido: coloque esse grupo no início da sessão, quando a energia está alta, e dê a ele o maior volume semanal.');
      if (e.exProibidos) msg.push('Exercícios proibidos registrados — eles entram como restrição absoluta no plano.');
      if ((cat && has(cat.dores + ' ' + cat.lesoes, ['ombro', 'lombar', 'joelho', 'coluna'])) && !e.adaptacoesDor)
        msg.push('A anamnese indica dores/lesões: recomendo registrar adaptações específicas (amplitude, ângulo, substituições) para blindar a execução.');
      else if (e.adaptacoesDor) msg.push('Adaptações para dor/lesão bem documentadas — isso transmite cuidado e profissionalismo ao aluno.');
      return msg.join(' ') || 'Seleção de exercícios registrada. Obrigatórios e proibidos guiarão a montagem das sessões.';
    },

    aquecimento: function (e) {
      var msg = [];
      if (e.mobilidade || e.ativacao) msg.push('Aquecimento com mobilidade + ativação prepara articulações e recruta a musculatura-alvo, reduzindo risco e melhorando as primeiras séries.');
      if (e.core) msg.push('Incluir core/estabilidade protege a coluna e melhora a transferência de força nos compostos.');
      return msg.join(' ') || 'Protocolo de aquecimento registrado — ritual de preparo aumenta segurança e qualidade do treino.';
    },

    cardio: function (e) {
      var msg = [];
      var obj = (e.cardioObjetivo || '').toLowerCase();
      if (has(obj, ['gordura', 'emagre', 'definic'])) msg.push('Cardio para gasto calórico: o LISS preserva melhor a recuperação para a musculação; o HIIT rende em menos tempo, mas soma fadiga — equilibre conforme o volume de força.');
      else if (has(obj, ['condic', 'cardio', 'saude', 'saúde', 'vo2'])) msg.push('Cardio para condicionamento/saúde: 2–3 sessões semanais já trazem ganho cardiovascular relevante sem comprometer a hipertrofia.');
      else if (obj) msg.push('Objetivo do cardio definido — alinhe frequência e intensidade a ele para não competir com a recuperação do treino de força.');
      if (e.cardioFrequencia) msg.push('Frequência registrada; o "efeito interferência" é pequeno quando o cardio não esgota as pernas antes das sessões de força.');
      return msg.join(' ') || 'Estratégia de cardio registrada.';
    },

    progressao: function (e) {
      var msg = ['Critérios claros de progressão são o que separa um plano amador de um profissional.'];
      if (e.progCarga) msg.push('Progressão de carga definida: o princípio da sobrecarga progressiva (Zatsiorsky) é o gatilho número 1 de adaptação.');
      if (e.progVolume) msg.push('Progressão de volume registrada — subir séries ao longo do mesociclo (modelo Israetel: MEV → MAV) é uma alavanca poderosa.');
      if (e.progReducao) msg.push('Ter um gatilho para REDUZIR volume é sinal de maturidade: previne overreaching e mantém a performance.');
      return msg.join(' ');
    },

    feedback: function (e) {
      var n = (e.feedback || []).length;
      if (!n) return 'Defina quais informações o aluno envia toda semana — é o que permite ajustar o plano com base em dados, não em achismo.';
      return 'Você vai acompanhar ' + n + ' indicador(es) por semana. Sono, dor e performance são os mais sensíveis para detectar excesso de fadiga cedo e ajustar a tempo.';
    },

    orientacoes: function (e) {
      return e.orientacoes ?
        'Orientação personalizada registrada — esse toque humano eleva muito a percepção de valor do material.' :
        'Sem orientação específica adicional. Tudo certo: o relatório seguirá com as decisões já tomadas.';
    }
  };

  global.Knowledge = {
    DIVISOES: DIVISOES,
    PERIODIZACOES: PERIODIZACOES,
    FAIXAS_REP: FAIXAS_REP,
    TECNICAS: TECNICAS,
    FEEDBACK_ITENS: FEEDBACK_ITENS,
    Analysis: Analysis
  };
})(window);
