/* =========================================================================
   Montinho Training Strategy — Módulo 2 · Configuração (fonte da verdade)
   Contém: o system prompt (cérebro), o schema da anamnese, os 11 tópicos da
   entrevista e as regras de análise crítica. Sem dependências.
   ========================================================================= */
window.MTS = window.MTS || {};

/* -------------------------------------------------------------------------
   SYSTEM PROMPT — o cérebro do sistema.
   Espelho de prompts/system-prompt.md. Mantenha os dois em sincronia.
   ------------------------------------------------------------------------- */
MTS.SYSTEM_PROMPT = [
  'Você é o cérebro do sistema "Montinho Training Strategy".',
  '',
  'Você não é um chatbot. Você não é um gerador de textos. Você não é um gerador automático de treinos.',
  '',
  'Você é um consultor estratégico especializado em treinamento físico, desenvolvido exclusivamente para auxiliar o Personal Trainer Renato Nascimento durante o processo de criação das estratégias de treinamento dos seus alunos.',
  '',
  'Seu trabalho é organizar o raciocínio do treinador, ajudá-lo a tomar decisões melhores e transformar essas decisões em uma apresentação extremamente profissional para o aluno.',
  '',
  'IDENTIDADE',
  'Seu nome é Montinho Training Strategy. Você foi criado exclusivamente para uso interno do Montinho Personal Trainer. Nenhum aluno utilizará este sistema. Você conversa apenas com o Personal Trainer.',
  '',
  'MISSÃO',
  'Transformar uma simples anamnese em uma estratégia de treinamento extremamente bem estruturada. Você nunca deve montar um treino automaticamente. Você nunca deve substituir o treinador. Você existe para potencializar sua tomada de decisão.',
  '',
  'COMO VOCÊ RACIOCINA',
  'Pense como uma banca de especialistas (hipertrofia, emagrecimento, performance, preparação física, biomecânica, cinesiologia, periodização, controle de carga, reabilitação baseada em exercício, psicologia do esporte, mudança de comportamento e adesão). Referências metodológicas: Fabrício Pacholok, Leandro Twin, Hany Rambod, Mike Israetel, Brad Schoenfeld, Greg Nuckols, Eric Helms, Chris Beardsley, Christian Thibaudeau, Charles Poliquin (quando pertinente), Yuri Verkhoshansky, Vladimir Zatsiorsky e Tudor Bompa. Nunca copie literalmente ninguém. Nunca transforme opiniões individuais em regras. Sempre adapte ao contexto do aluno e priorize o consenso entre evidência e prática.',
  '',
  'COMPORTAMENTO',
  'Você é extremamente organizado, faz perguntas inteligentes, identifica inconsistências e explica o motivo das sugestões. Nunca responde apenas "sim" ou "não": sempre justifica.',
  '',
  'TOM DE VOZ',
  'Profissional, claro, humano, direto, didático e objetivo. Nunca escreva como artigo científico nem como robô. Nunca use palavras difíceis só para parecer inteligente. Explique como um excelente Personal Trainer explicaria para outro.',
  '',
  'REGRA MAIS IMPORTANTE',
  'Você nunca toma decisões sozinho. Nunca inventa estratégias, escolhe exercícios, escolhe divisões ou define periodização. Todas essas decisões pertencem ao treinador. Sua função é conduzir uma entrevista inteligente para entender essas decisões.',
  '',
  'FLUXO',
  '1) Receber a anamnese. 2) Fazer uma análise técnica completa. 3) Apresentar o diagnóstico resumido. 4) Começar a entrevista. 5) Montar o relatório em tempo real. 6) Revisar todo o relatório. 7) Gerar versões finais.',
  '',
  'ANÁLISE DA ANAMNESE',
  'Identifique automaticamente: objetivo, idade, experiência, disponibilidade, rotina, modalidade, dores, lesões, limitações, mobilidade, estabilidade, composição corporal, alimentação, sono, hidratação, estresse, motivação, perfil comportamental, fatores de abandono, pontos fortes, oportunidades e riscos. Depois escreva um resumo executivo. Nunca monte estratégia nesta etapa.',
  '',
  'ENTREVISTA',
  'Faça apenas UMA pergunta por vez. Jamais várias ao mesmo tempo. Espere a resposta e prossiga. Ordem: 1 Objetivo, 2 Filosofia da estratégia, 3 Divisão do treinamento, 4 Estratégia de intensidade, 5 Periodização, 6 Mobilidade e aquecimento, 7 Estratégia dos exercícios, 8 Cardio, 9 Progressão, 10 Feedback esperado, 11 Observações finais.',
  '',
  'REGRA DAS DECISÕES',
  'A cada decisão técnica do treinador: (1) registre no relatório; (2) pergunte o motivo. Depois transforme a explicação em linguagem simples para o aluno. Vale para todas as decisões. O aluno precisa entender o motivo de todas as escolhas.',
  '',
  'ANÁLISE CRÍTICA',
  'Após cada resposta, faça uma auditoria: coerência, lógica, ciência, compatibilidade com a anamnese e possíveis riscos. Se houver ponto de atenção, informe. Jamais altere a decisão do treinador — apenas apresente observações.',
  '',
  'ESCRITA E ESTILO',
  'Vá escrevendo o relatório durante a entrevista; ao terminar, ele já deve estar quase pronto. Escreva sempre como se conversasse diretamente com o aluno — nunca para outro profissional. Explique, ensine, mostre o motivo. O aluno deve sentir confiança.',
  '',
  'QUALIDADE',
  'Antes de finalizar qualquer texto pergunte: "Esse texto parece realmente escrito por um Personal Trainer premium?" Se não, reescreva.',
  '',
  'OBJETIVO FINAL',
  'Ao final, o aluno deve pensar: "Agora entendi exatamente por que meu treino foi montado dessa forma." Se esse sentimento não existir, o relatório ainda não está pronto.'
].join('\n');

/* -------------------------------------------------------------------------
   SCHEMA DA ANAMNESE — o que o treinador preenche sobre o aluno.
   ------------------------------------------------------------------------- */
MTS.ANAMNESE = [
  {
    id: 'identificacao',
    title: 'Identificação',
    fields: [
      { id: 'nome', label: 'Nome do aluno', type: 'text', placeholder: 'Ex.: Marina Souza' },
      { id: 'idade', label: 'Idade', type: 'number', placeholder: 'Ex.: 34' },
      { id: 'modalidade', label: 'Modalidade', type: 'select', options: ['Presencial', 'Online', 'Híbrido'] }
    ]
  },
  {
    id: 'objetivo',
    title: 'Objetivo & experiência',
    fields: [
      { id: 'objetivo', label: 'Objetivo principal', type: 'select', options: ['Hipertrofia', 'Emagrecimento', 'Performance', 'Saúde e qualidade de vida', 'Reabilitação', 'Competição'] },
      { id: 'experiencia', label: 'Experiência de treino', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado', 'Atleta'] },
      { id: 'historico', label: 'Histórico de treino', type: 'textarea', placeholder: 'Há quanto tempo treina, o que já fez, resultados anteriores...' }
    ]
  },
  {
    id: 'disponibilidade',
    title: 'Disponibilidade & rotina',
    fields: [
      { id: 'diasSemana', label: 'Dias disponíveis por semana', type: 'number', placeholder: 'Ex.: 4' },
      { id: 'tempoSessao', label: 'Tempo por sessão (min)', type: 'number', placeholder: 'Ex.: 60' },
      { id: 'rotina', label: 'Rotina', type: 'textarea', placeholder: 'Trabalho, horários, viagens, quando consegue treinar...' }
    ]
  },
  {
    id: 'saude',
    title: 'Saúde & histórico físico',
    fields: [
      { id: 'dores', label: 'Dores atuais', type: 'textarea', placeholder: 'Onde, quando aparece, intensidade...' },
      { id: 'lesoes', label: 'Lesões / cirurgias', type: 'textarea', placeholder: 'Lesões passadas ou atuais, cirurgias...' },
      { id: 'limitacoes', label: 'Limitações & medicamentos', type: 'textarea', placeholder: 'Restrições médicas, medicamentos contínuos...' },
      { id: 'mobilidade', label: 'Mobilidade & estabilidade', type: 'textarea', placeholder: 'Amplitudes limitadas, controle motor, equilíbrio...' }
    ]
  },
  {
    id: 'estilo',
    title: 'Composição & estilo de vida',
    fields: [
      { id: 'composicao', label: 'Composição corporal', type: 'textarea', placeholder: 'Peso, altura, % de gordura, avaliação...' },
      { id: 'alimentacao', label: 'Alimentação', type: 'select', options: ['Não avaliado', 'Precisa de ajustes', 'Regular', 'Boa', 'Acompanhamento com nutricionista'] },
      { id: 'sono', label: 'Sono', type: 'select', options: ['Não avaliado', 'Ruim', 'Irregular', 'Bom', 'Ótimo'] },
      { id: 'hidratacao', label: 'Hidratação', type: 'select', options: ['Não avaliado', 'Baixa', 'Regular', 'Boa'] },
      { id: 'estresse', label: 'Nível de estresse', type: 'select', options: ['Não avaliado', 'Baixo', 'Moderado', 'Alto'] }
    ]
  },
  {
    id: 'comportamento',
    title: 'Comportamento & motivação',
    fields: [
      { id: 'motivacao', label: 'Motivação atual', type: 'select', options: ['Não avaliado', 'Baixa', 'Moderada', 'Alta'] },
      { id: 'aderencia', label: 'Histórico de aderência', type: 'textarea', placeholder: 'Já desistiu antes? O que ajudou ou atrapalhou a constância?' },
      { id: 'fatoresAbandono', label: 'Possíveis fatores de abandono', type: 'textarea', placeholder: 'Falta de tempo, dor, tédio, viagens, resultados lentos...' },
      { id: 'observacoes', label: 'Observações gerais', type: 'textarea', placeholder: 'Qualquer contexto relevante sobre o aluno...' }
    ]
  }
];

/* -------------------------------------------------------------------------
   TÓPICOS DA ENTREVISTA — a ordem fixa do system prompt.
   ask   = pergunta que o sistema faz ao treinador (a DECISÃO)
   why   = pergunta de justificativa (o MOTIVO)
   lead  = abertura da seção no relatório, já em linguagem para o aluno
   title = título da seção no relatório (voltado ao aluno)
   ------------------------------------------------------------------------- */
MTS.TOPICS = [
  { id: 'objetivo', n: 1, name: 'Objetivo', title: 'Seu objetivo',
    ask: 'Qual é o objetivo central que você definiu para este aluno?',
    placeholder: 'Ex.: Hipertrofia com foco em membros superiores nos próximos 3 meses',
    why: 'Por que esse é o foco principal agora, considerando a anamnese?',
    lead: 'O foco principal do seu plano é' },
  { id: 'filosofia', n: 2, name: 'Filosofia da estratégia', title: 'A filosofia do seu treino',
    ask: 'Qual é a filosofia geral que vai guiar toda a estratégia?',
    placeholder: 'Ex.: Consistência acima de intensidade; técnica impecável antes de carga',
    why: 'Por que essa abordagem faz sentido para este aluno especificamente?',
    lead: 'A ideia que guia todo o seu treino é' },
  { id: 'divisao', n: 3, name: 'Divisão do treinamento', title: 'Como seus treinos estão divididos',
    ask: 'Qual divisão de treino você escolheu?',
    placeholder: 'Ex.: Upper / Lower, 4x na semana',
    why: 'Por que escolheu essa divisão para este aluno?',
    lead: 'Seus treinos foram organizados assim:' },
  { id: 'intensidade', n: 4, name: 'Estratégia de intensidade', title: 'A intensidade dos treinos',
    ask: 'Como você vai trabalhar a intensidade e o esforço?',
    placeholder: 'Ex.: RIR 1-2 nos básicos, faixa 8-12 reps, sem falha nos multiarticulares',
    why: 'Por que essa forma de controlar a intensidade?',
    lead: 'A forma como vamos trabalhar o esforço nos treinos é' },
  { id: 'periodizacao', n: 5, name: 'Periodização', title: 'A evolução ao longo do tempo',
    ask: 'Como será a periodização ao longo do tempo?',
    placeholder: 'Ex.: Blocos de 4 semanas com progressão de carga e semana de deload',
    why: 'Por que periodizar dessa maneira?',
    lead: 'Ao longo das próximas semanas, o plano vai evoluir assim:' },
  { id: 'mobilidade', n: 6, name: 'Mobilidade e aquecimento', title: 'Aquecimento e mobilidade',
    ask: 'Como será o aquecimento e o trabalho de mobilidade?',
    placeholder: 'Ex.: Aquecimento específico + mobilidade de ombro e quadril antes dos treinos',
    why: 'Por que essa preparação antes dos treinos?',
    lead: 'Antes de cada treino, a preparação do seu corpo será' },
  { id: 'exercicios', n: 7, name: 'Estratégia dos exercícios', title: 'A escolha dos exercícios',
    ask: 'Qual é a lógica de seleção dos exercícios?',
    placeholder: 'Ex.: Prioridade em multiarticulares livres; máquinas para isolar pontos fracos',
    why: 'Por que priorizar esses exercícios ou esse critério?',
    lead: 'A seleção dos seus exercícios seguiu esta lógica:' },
  { id: 'cardio', n: 8, name: 'Cardio', title: 'O cardio no seu plano',
    ask: 'Como o cardio entra nessa estratégia?',
    placeholder: 'Ex.: 3x 30 min de caminhada inclinada em jejum; sem HIIT por enquanto',
    why: 'Por que essa abordagem de cardio para este aluno?',
    lead: 'O trabalho aeróbico (cardio) entra assim no seu plano:' },
  { id: 'progressao', n: 9, name: 'Progressão', title: 'Como você vai progredir',
    ask: 'Como será a progressão de cargas e estímulos?',
    placeholder: 'Ex.: Progressão dupla — subir reps até o topo da faixa, depois carga',
    why: 'Por que progredir dessa forma?',
    lead: 'Para você continuar evoluindo, a progressão será' },
  { id: 'feedback', n: 10, name: 'Feedback esperado', title: 'O que vamos acompanhar juntos',
    ask: 'Que feedback você espera do aluno ao longo do processo?',
    placeholder: 'Ex.: Registro de cargas, qualidade do sono, dores e nível de energia',
    why: 'Por que esses sinais são importantes de acompanhar?',
    lead: 'O que vamos acompanhar juntos ao longo do caminho é' },
  { id: 'observacoes', n: 11, name: 'Observações finais', title: 'Observações finais',
    ask: 'Alguma observação final ou orientação especial para este aluno?',
    placeholder: 'Ex.: Priorizar constância nas semanas de viagem; falar comigo diante de qualquer dor',
    why: null,
    lead: 'Orientações importantes para você:' }
];

/* -------------------------------------------------------------------------
   REGRAS DE ANÁLISE CRÍTICA (auditoria determinística).
   Cada regra recebe o estado completo e devolve observações. Nunca altera
   a decisão do treinador — apenas levanta pontos de atenção.
   ------------------------------------------------------------------------- */
(function () {
  function has(v) { return v != null && String(v).trim() !== ''; }
  function low(v) { return String(v || '').toLowerCase(); }
  function mentions(text, words) {
    var t = low(text);
    return words.some(function (w) { return t.indexOf(w) !== -1; });
  }

  // Regras sobre a anamnese como um todo (mostradas no diagnóstico).
  MTS.ANAMNESE_RULES = [
    function (a) {
      if (has(a.dores) || has(a.lesoes))
        return 'Há relato de dores ou lesões. Vale detalhar bem o aquecimento, a mobilidade e a seleção de exercícios para proteger essa região.';
    },
    function (a) {
      var d = parseInt(a.diasSemana, 10);
      if (d && d <= 2)
        return 'Disponibilidade baixa (' + d + ' dia(s)/semana). A divisão e o volume precisam caber bem nessa frequência para não comprometer o resultado.';
    },
    function (a) {
      if (low(a.sono) === 'ruim' || low(a.estresse) === 'alto')
        return 'Sono e/ou estresse aparecem como pontos frágeis. A recuperação pode limitar volume e intensidade — algo a considerar na estratégia.';
    },
    function (a) {
      var idade = parseInt(a.idade, 10);
      if (idade && idade >= 50)
        return 'Aluno com 50+ anos: priorizar progressão gradual, cuidado articular e boa preparação antes das cargas mais altas.';
    },
    function (a) {
      if (low(a.motivacao) === 'baixa' || has(a.fatoresAbandono))
        return 'Existem sinais de risco de abandono. Estratégias de adesão (metas curtas, constância acima de intensidade) tendem a pesar bastante aqui.';
    },
    function (a) {
      if (low(a.experiencia) === 'iniciante')
        return 'Aluno iniciante: técnica e constância vêm antes de complexidade. Técnicas avançadas podem entrar mais adiante, com base bem construída.';
    }
  ];

  // Regras contextuais por tópico (mostradas após registrar a decisão).
  MTS.TOPIC_RULES = {
    intensidade: [
      function (a, dec) {
        if (low(a.experiencia) === 'iniciante' && mentions(dec, ['falha', 'drop', 'drop-set', 'dropset', 'rest-pause', 'cluster']))
          return 'Aluno iniciante com técnicas avançadas de intensidade: pode ser mais seguro introduzi-las gradualmente, depois da base técnica.';
      }
    ],
    divisao: [
      function (a, dec) {
        var d = parseInt(a.diasSemana, 10);
        if (d && d <= 3 && mentions(dec, ['abcde', 'a-b-c-d-e', '5x', '6x', 'ppl', 'push pull legs']))
          return 'A divisão sugere frequência alta, mas a disponibilidade é de ' + d + ' dia(s)/semana. Confirme se ela cabe bem nessa rotina.';
      }
    ],
    cardio: [
      function (a, dec) {
        if (low(a.objetivo) === 'emagrecimento' && !has(dec))
          return 'O objetivo é emagrecimento e o cardio ficou em aberto. A estratégia de gasto calórico costuma ter peso importante nesse caso.';
      }
    ],
    mobilidade: [
      function (a, dec) {
        if ((has(a.dores) || has(a.lesoes)) && !has(dec))
          return 'Há dores/lesões na anamnese, mas a preparação (aquecimento/mobilidade) ainda não foi detalhada. Vale reforçar este ponto.';
      }
    ]
  };
})();
