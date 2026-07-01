/* =========================================================================
   Montinho Training Strategy — Configuração (fonte da verdade)
   Módulo 2: o cérebro (system prompt) + schema da anamnese.
   Módulo 3: entrevista inteligente — múltiplas perguntas por tópico,
   perguntas adaptativas por anamnese e auditoria de inconsistências.
   Sem dependências.
   ========================================================================= */
window.MTS = window.MTS || {};

(function () {
  /* ---- helpers de leitura da anamnese/respostas ---- */
  function has(v) {
    if (Array.isArray(v)) return v.length > 0;
    return v != null && String(v).trim() !== '';
  }
  function low(v) { return String(v == null ? '' : v).toLowerCase(); }
  function joinAns() {
    return Array.prototype.slice.call(arguments).map(function (v) {
      return Array.isArray(v) ? v.join(' ') : String(v == null ? '' : v);
    }).join(' ');
  }

  /* -----------------------------------------------------------------------
     SYSTEM PROMPT — o cérebro do sistema.
     Espelho de prompts/system-prompt.md. Mantenha os dois em sincronia.
     ----------------------------------------------------------------------- */
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
    'Seu nome é Montinho Training Strategy. Uso interno do Montinho Personal Trainer. Nenhum aluno usa o sistema. Você conversa apenas com o Personal Trainer.',
    '',
    'MISSÃO',
    'Transformar uma simples anamnese em uma estratégia de treinamento extremamente bem estruturada. Nunca monte um treino automaticamente. Nunca substitua o treinador. Você existe para potencializar a tomada de decisão dele.',
    '',
    'COMO VOCÊ RACIOCINA',
    'Pense como uma banca de especialistas (hipertrofia, emagrecimento, performance, preparação física, biomecânica, cinesiologia, periodização, controle de carga, reabilitação, psicologia do esporte, mudança de comportamento, adesão). Referências: Fabrício Pacholok, Leandro Twin, Hany Rambod, Mike Israetel, Brad Schoenfeld, Greg Nuckols, Eric Helms, Chris Beardsley, Christian Thibaudeau, Charles Poliquin (quando pertinente), Yuri Verkhoshansky, Vladimir Zatsiorsky, Tudor Bompa. Nunca copie ninguém literalmente. Nunca transforme opinião individual em regra. Sempre adapte ao aluno e priorize o consenso entre evidência e prática.',
    '',
    'REGRA MAIS IMPORTANTE',
    'Você nunca toma decisões sozinho. Nunca inventa estratégias, escolhe exercícios, divisões ou periodização. Todas essas decisões pertencem ao treinador. Sua função é conduzir uma entrevista inteligente para entender essas decisões.',
    '',
    'A ENTREVISTA (o coração do sistema)',
    'A entrevista não é um formulário: é uma conversa entre dois Personal Trainers experientes. Faça apenas UMA pergunta por vez, espere a resposta e só então continue. O treinador nunca deve sentir que preenche um formulário — a conversa é leve, natural, inteligente, didática e profissional.',
    '',
    'ADAPTAÇÃO',
    'Antes de iniciar, analise toda a anamnese e adapte as perguntas. Se houver dores, acrescente perguntas específicas; atleta, sobre performance; idoso, sobre segurança; emagrecimento, sobre gasto energético; hipertrofia, sobre volume; reabilitação, sobre limitações. Cada entrevista deve ser diferente.',
    '',
    'ORDEM',
    '1 Objetivo, 2 Filosofia da estratégia, 3 Divisão, 4 Estratégia de intensidade, 5 Periodização, 6 Mobilidade, 7 Estratégia dos exercícios, 8 Cardio, 9 Progressão, 10 Acompanhamento, 11 Mensagem final.',
    '',
    'REGRA DAS DECISÕES',
    'A cada resposta do treinador, imediatamente: (1) registre no relatório; (2) transforme em linguagem simples; (3) explique para o aluno; (4) valide tecnicamente; (5) só então siga para a próxima pergunta. E sempre pergunte o porquê de cada decisão — nunca apenas registre.',
    '',
    'INTELIGÊNCIA / AUDITORIA',
    'Durante toda a entrevista faça auditorias. Se perceber uma inconsistência (ex.: treino de força com dor aguda), pergunte: "Gostaria de rever essa estratégia ou manter sua decisão?" Jamais ignore e jamais altere sozinho.',
    '',
    'CHECKLIST FINAL',
    'Antes de finalizar, confirme se todas as áreas foram respondidas. Se faltar qualquer informação, pergunte. Nunca gere relatório incompleto.',
    '',
    'ESCRITA E ESTILO',
    'Vá escrevendo o relatório durante a entrevista; ao final ele já deve estar quase pronto — só revisar e gerar as versões. Escreva sempre falando diretamente com o aluno, nunca para outro profissional. Explique, ensine, mostre o motivo. O aluno deve sentir confiança.',
    '',
    'QUALIDADE',
    'Antes de finalizar qualquer texto pergunte: "Esse texto parece realmente escrito por um Personal Trainer premium?" Se não, reescreva.',
    '',
    'OBJETIVO FINAL',
    'Ao final, o aluno deve pensar: "Agora entendi exatamente por que meu treino foi montado dessa forma." Se esse sentimento não existir, o relatório ainda não está pronto.'
  ].join('\n');

  /* -----------------------------------------------------------------------
     SCHEMA DA ANAMNESE — o que o treinador preenche sobre o aluno.
     ----------------------------------------------------------------------- */
  MTS.ANAMNESE = [
    { id: 'identificacao', title: 'Identificação', fields: [
      { id: 'nome', label: 'Nome do aluno', type: 'text', placeholder: 'Ex.: Marina Souza' },
      { id: 'idade', label: 'Idade', type: 'number', placeholder: 'Ex.: 34' },
      { id: 'modalidade', label: 'Modalidade', type: 'select', options: ['Presencial', 'Online', 'Híbrido'] }
    ] },
    { id: 'objetivo', title: 'Objetivo & experiência', fields: [
      { id: 'objetivo', label: 'Objetivo principal', type: 'select', options: ['Hipertrofia', 'Emagrecimento', 'Performance', 'Saúde e qualidade de vida', 'Reabilitação', 'Competição'] },
      { id: 'experiencia', label: 'Experiência de treino', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado', 'Atleta'] },
      { id: 'historico', label: 'Histórico de treino', type: 'textarea', placeholder: 'Há quanto tempo treina, o que já fez, resultados anteriores...' }
    ] },
    { id: 'disponibilidade', title: 'Disponibilidade & rotina', fields: [
      { id: 'diasSemana', label: 'Dias disponíveis por semana', type: 'number', placeholder: 'Ex.: 4' },
      { id: 'tempoSessao', label: 'Tempo por sessão (min)', type: 'number', placeholder: 'Ex.: 60' },
      { id: 'rotina', label: 'Rotina', type: 'textarea', placeholder: 'Trabalho, horários, viagens, quando consegue treinar...' }
    ] },
    { id: 'saude', title: 'Saúde & histórico físico', fields: [
      { id: 'dores', label: 'Dores atuais', type: 'textarea', placeholder: 'Onde, quando aparece, intensidade...' },
      { id: 'lesoes', label: 'Lesões / cirurgias', type: 'textarea', placeholder: 'Lesões passadas ou atuais, cirurgias...' },
      { id: 'limitacoes', label: 'Limitações & medicamentos', type: 'textarea', placeholder: 'Restrições médicas, medicamentos contínuos...' },
      { id: 'mobilidade', label: 'Mobilidade & estabilidade', type: 'textarea', placeholder: 'Amplitudes limitadas, controle motor, equilíbrio...' }
    ] },
    { id: 'estilo', title: 'Composição & estilo de vida', fields: [
      { id: 'composicao', label: 'Composição corporal', type: 'textarea', placeholder: 'Peso, altura, % de gordura, avaliação...' },
      { id: 'alimentacao', label: 'Alimentação', type: 'select', options: ['Não avaliado', 'Precisa de ajustes', 'Regular', 'Boa', 'Acompanhamento com nutricionista'] },
      { id: 'sono', label: 'Sono', type: 'select', options: ['Não avaliado', 'Ruim', 'Irregular', 'Bom', 'Ótimo'] },
      { id: 'hidratacao', label: 'Hidratação', type: 'select', options: ['Não avaliado', 'Baixa', 'Regular', 'Boa'] },
      { id: 'estresse', label: 'Nível de estresse', type: 'select', options: ['Não avaliado', 'Baixo', 'Moderado', 'Alto'] }
    ] },
    { id: 'comportamento', title: 'Comportamento & motivação', fields: [
      { id: 'motivacao', label: 'Motivação atual', type: 'select', options: ['Não avaliado', 'Baixa', 'Moderada', 'Alta'] },
      { id: 'aderencia', label: 'Histórico de aderência', type: 'textarea', placeholder: 'Já desistiu antes? O que ajudou ou atrapalhou a constância?' },
      { id: 'fatoresAbandono', label: 'Possíveis fatores de abandono', type: 'textarea', placeholder: 'Falta de tempo, dor, tédio, viagens, resultados lentos...' },
      { id: 'observacoes', label: 'Observações gerais', type: 'textarea', placeholder: 'Qualquer contexto relevante sobre o aluno...' }
    ] }
  ];

  /* -----------------------------------------------------------------------
     TÓPICOS DA ENTREVISTA — ordem fixa, cada um com várias perguntas.
     mainQ = pergunta principal (abre a seção); whyQ = o motivo.
     label = rótulo curto usado no relatório para respostas de apoio.
     optional = não bloqueia o checklist final.
     condition(anamnese, answers) = pergunta condicional.
     ----------------------------------------------------------------------- */
  MTS.TOPICS = [
    { id: 'objetivo', n: 1, name: 'Objetivo', title: 'Seu objetivo',
      lead: 'O foco principal do seu plano é', mainQ: 'objetivo_principal', whyQ: 'objetivo_porque',
      questions: [
        { id: 'objetivo_principal', prompt: 'Qual será o objetivo principal deste ciclo?', type: 'textarea', placeholder: 'Ex.: Hipertrofia de membros superiores nas próximas 12 semanas' },
        { id: 'objetivo_secundario', prompt: 'Existe algum objetivo secundário?', type: 'text', optional: true, label: 'Objetivo secundário', placeholder: 'Ex.: Melhorar a postura' },
        { id: 'objetivo_prioridade', prompt: 'Existe alguma prioridade muscular?', type: 'text', optional: true, label: 'Prioridade muscular', placeholder: 'Ex.: Ombros e dorsais' },
        { id: 'objetivo_porque', prompt: 'Por que você escolheu esse objetivo para este aluno?', type: 'textarea', why: true }
      ] },
    { id: 'filosofia', n: 2, name: 'Filosofia da estratégia', title: 'A filosofia do seu treino',
      lead: 'A ideia que guia todo o seu treino é', mainQ: 'filosofia_frase', whyQ: null,
      questions: [
        { id: 'filosofia_frase', prompt: 'Se você tivesse que resumir toda essa estratégia em uma frase, qual seria?', type: 'textarea', placeholder: 'Ex.: Constância inteligente — treinar forte respeitando o corpo.', hint: 'Esta frase abrirá o relatório do aluno.' }
      ] },
    { id: 'divisao', n: 3, name: 'Divisão do treinamento', title: 'Como seus treinos estão divididos',
      lead: 'Seus treinos foram organizados assim:', mainQ: 'divisao_qual', whyQ: 'divisao_porque',
      questions: [
        { id: 'divisao_qual', prompt: 'Qual divisão será utilizada e como ela fica distribuída na semana?', type: 'textarea', placeholder: 'Ex.: Upper/Lower, 4x — A: superiores, B: inferiores...' },
        { id: 'divisao_porque', prompt: 'Por que escolheu essa divisão?', type: 'textarea', why: true },
        { id: 'divisao_vantagens', prompt: 'Quais vantagens ela oferece para este aluno?', type: 'textarea', optional: true, label: 'Vantagens para você' },
        { id: 'divisao_adaptacoes', prompt: 'Existe alguma adaptação por rotina, lesão, equipamentos ou modalidade?', type: 'textarea', optional: true, label: 'Adaptações' }
      ] },
    { id: 'intensidade', n: 4, name: 'Estratégia de intensidade', title: 'A intensidade dos treinos',
      lead: 'A forma como vamos trabalhar o esforço nos treinos é', mainQ: 'intensidade_estrategia', whyQ: 'intensidade_porque',
      questions: [
        { id: 'intensidade_estrategia', prompt: 'Qual estratégia de intensidade será utilizada?', type: 'choice', options: ['Pirâmide crescente', 'Pirâmide decrescente', 'Carga fixa', 'Dupla progressão', 'Top Set', 'Back Off', 'Cluster', 'Outro'] },
        { id: 'intensidade_porque', prompt: 'Por que escolheu essa estratégia?', type: 'textarea', why: true },
        { id: 'intensidade_reps', prompt: 'Como será a faixa de repetições?', type: 'text', optional: true, label: 'Faixa de repetições', placeholder: 'Ex.: 8–12 nos compostos, 12–15 nos isoladores' },
        { id: 'intensidade_tecnicas', prompt: 'Quais recursos de intensidade serão usados? (marque o que se aplica)', type: 'multi', optional: true, label: 'Recursos de intensidade', options: ['Falha', 'RIR', 'RPE', 'Cadência', 'Tempo sob tensão', 'Isometria', 'Drop-set', 'Rest-pause', 'Cluster'] }
      ] },
    { id: 'periodizacao', n: 5, name: 'Periodização', title: 'A evolução ao longo do tempo',
      lead: 'Ao longo das próximas semanas, o plano vai evoluir assim:', mainQ: 'periodizacao_fases', whyQ: 'periodizacao_porque',
      questions: [
        { id: 'periodizacao_fases', prompt: 'Como pretende dividir este planejamento? Quantas fases, e qual objetivo, duração e estratégia de cada uma?', type: 'textarea', placeholder: 'Ex.: Fase 1 (4 sem) adaptação; Fase 2 (4 sem) acúmulo; Fase 3 (3 sem) intensificação; deload' },
        { id: 'periodizacao_porque', prompt: 'Por que decidiu fazer essa periodização?', type: 'textarea', why: true }
      ] },
    { id: 'mobilidade', n: 6, name: 'Mobilidade', title: 'Aquecimento e mobilidade',
      lead: 'Antes de cada treino, a preparação do seu corpo será', mainQ: 'mobilidade_o_que', whyQ: 'mobilidade_porque',
      questions: [
        { id: 'mobilidade_o_que', prompt: 'O que fará parte da preparação para os treinos?', type: 'multi', options: ['Aquecimento', 'Mobilidade', 'Alongamentos', 'Ativação', 'Core', 'Estabilidade'] },
        { id: 'mobilidade_porque', prompt: 'Por que essas estratégias são importantes para este aluno?', type: 'textarea', why: true }
      ] },
    { id: 'exercicios', n: 7, name: 'Estratégia dos exercícios', title: 'A escolha dos exercícios',
      lead: 'A seleção dos seus exercícios seguiu esta lógica:', mainQ: 'exercicios_logica', whyQ: 'exercicios_porque',
      questions: [
        { id: 'exercicios_logica', prompt: 'Qual é a lógica geral de seleção dos exercícios?', type: 'textarea', placeholder: 'Ex.: Prioridade em compostos livres; máquinas para isolar pontos fracos' },
        { id: 'exercicios_prioridade', prompt: 'Existe prioridade para algum grupo muscular?', type: 'text', optional: true, label: 'Prioridade', placeholder: 'Ex.: Dorsais' },
        { id: 'exercicios_obrigatorio', prompt: 'Existe algum exercício obrigatório?', type: 'text', optional: true, label: 'Exercícios-chave' },
        { id: 'exercicios_proibido', prompt: 'Existe algum exercício proibido (por dor, equipamento, etc.)?', type: 'text', optional: true, label: 'A evitar' },
        { id: 'exercicios_porque', prompt: 'Por que essas escolhas e adaptações foram necessárias?', type: 'textarea', why: true }
      ] },
    { id: 'cardio', n: 8, name: 'Cardio', title: 'O cardio no seu plano',
      lead: 'O trabalho aeróbico (cardio) entra assim no seu plano:', mainQ: 'cardio_have', whyQ: 'cardio_porque',
      questions: [
        { id: 'cardio_have', prompt: 'Haverá cardio neste ciclo?', type: 'choice', options: ['Sim', 'Não'] },
        { id: 'cardio_detalhe', prompt: 'Qual o objetivo, a frequência e a intensidade do cardio?', type: 'textarea', label: 'Como será', placeholder: 'Ex.: 3x/semana, 30 min, zona 2, para saúde cardiovascular', condition: function (a, ans) { return ans.cardio_have === 'Sim'; } },
        { id: 'cardio_porque', prompt: 'Por que decidiu dessa forma?', type: 'textarea', why: true }
      ] },
    { id: 'progressao', n: 9, name: 'Progressão', title: 'Como você vai progredir',
      lead: 'Para você continuar evoluindo, a progressão será', mainQ: 'progressao_como', whyQ: 'progressao_porque',
      questions: [
        { id: 'progressao_como', prompt: 'Como será feita a progressão? (quando subir carga, séries, trocar exercícios, inserir técnicas e reavaliar)', type: 'textarea', placeholder: 'Ex.: Progressão dupla; +séries a cada bloco; reavaliar a cada 4 semanas' },
        { id: 'progressao_porque', prompt: 'Por que escolheu essa estratégia de progressão?', type: 'textarea', why: true }
      ] },
    { id: 'acompanhamento', n: 10, name: 'Acompanhamento', title: 'O que vamos acompanhar juntos',
      lead: 'Para acompanhar sua evolução de perto, vamos registrar', mainQ: 'acompanhamento_info', whyQ: 'acompanhamento_porque',
      questions: [
        { id: 'acompanhamento_info', prompt: 'Quais informações você quer receber semanalmente?', type: 'multi', options: ['Peso', 'Fotos', 'Sono', 'Dor', 'Fadiga', 'Execução', 'Cargas', 'Recuperação', 'Medidas'] },
        { id: 'acompanhamento_porque', prompt: 'Por que essas informações são importantes?', type: 'textarea', why: true }
      ] },
    { id: 'mensagem', n: 11, name: 'Mensagem final', title: 'Uma mensagem para você',
      lead: '', mainQ: 'mensagem_final', whyQ: null,
      questions: [
        { id: 'mensagem_final', prompt: 'Qual mensagem final você quer deixar para este aluno?', type: 'textarea', placeholder: 'Ex.: Confie no processo. Estarei com você em cada passo.' }
      ] }
  ];

  /* -----------------------------------------------------------------------
     PERGUNTAS ADAPTATIVAS — injetadas conforme a anamnese.
     Cada entrevista fica diferente. Entram ao fim do tópico indicado.
     ----------------------------------------------------------------------- */
  MTS.ADAPTIVE = [
    { id: 'adapt_dor', topic: 'exercicios', label: 'Cuidado com a região sensível', optional: true,
      when: function (a) { return has(a.dores) || has(a.lesoes); },
      prompt: 'A anamnese aponta dor/lesão. Como a estratégia protege essa região, e há movimentos a evitar?', type: 'textarea' },
    { id: 'adapt_atleta', topic: 'objetivo', label: 'Demandas de performance', optional: true,
      when: function (a) { return low(a.experiencia) === 'atleta' || low(a.objetivo) === 'competição' || low(a.objetivo) === 'performance'; },
      prompt: 'Sendo um foco de performance/atleta, quais demandas específicas do esporte guiam este ciclo?', type: 'textarea' },
    { id: 'adapt_idoso', topic: 'mobilidade', label: 'Segurança e estabilidade', optional: true,
      when: function (a) { var i = parseInt(a.idade, 10); return i && i >= 60; },
      prompt: 'Para este aluno mais velho, quais cuidados de segurança e estabilidade são prioritários?', type: 'textarea' },
    { id: 'adapt_emagrecimento', topic: 'cardio', label: 'Gasto energético', optional: true,
      when: function (a) { return low(a.objetivo) === 'emagrecimento'; },
      prompt: 'Como será a estratégia de gasto energético (déficit, NEAT, cardio) neste ciclo?', type: 'textarea' },
    { id: 'adapt_hipertrofia', topic: 'intensidade', label: 'Volume de treino', optional: true,
      when: function (a) { return low(a.objetivo) === 'hipertrofia'; },
      prompt: 'Qual será o volume semanal (séries por grupo) e como ele progride ao longo do ciclo?', type: 'textarea' },
    { id: 'adapt_reab', topic: 'exercicios', label: 'Limitações da reabilitação', optional: true,
      when: function (a) { return low(a.objetivo) === 'reabilitação'; },
      prompt: 'Quais limitações e amplitudes seguras devem ser respeitadas nesta fase de reabilitação?', type: 'textarea' }
  ];

  /* -----------------------------------------------------------------------
     REGRAS DE ANÁLISE — anamnese (diagnóstico) e auditoria contextual.
     ----------------------------------------------------------------------- */
  MTS.ANAMNESE_RULES = [
    function (a) { if (has(a.dores) || has(a.lesoes)) return 'Há relato de dores ou lesões. Vale detalhar bem o aquecimento, a mobilidade e a seleção de exercícios para proteger essa região.'; },
    function (a) { var d = parseInt(a.diasSemana, 10); if (d && d <= 2) return 'Disponibilidade baixa (' + d + ' dia(s)/semana). A divisão e o volume precisam caber bem nessa frequência.'; },
    function (a) { if (low(a.sono) === 'ruim' || low(a.estresse) === 'alto') return 'Sono e/ou estresse aparecem como pontos frágeis. A recuperação pode limitar volume e intensidade.'; },
    function (a) { var i = parseInt(a.idade, 10); if (i && i >= 50) return 'Aluno com 50+ anos: priorizar progressão gradual, cuidado articular e boa preparação antes das cargas altas.'; },
    function (a) { if (low(a.motivacao) === 'baixa' || has(a.fatoresAbandono)) return 'Existem sinais de risco de abandono. Estratégias de adesão (metas curtas, constância acima de intensidade) tendem a pesar bastante aqui.'; },
    function (a) { if (low(a.experiencia) === 'iniciante') return 'Aluno iniciante: técnica e constância vêm antes de complexidade. Técnicas avançadas podem entrar mais adiante.'; }
  ];

  /* Auditoria de INCONSISTÊNCIA durante a entrevista (Módulo 3).
     Nunca altera a decisão: apenas pergunta se o treinador quer rever ou manter.
     Retorna { id, topic, text }. */
  MTS.CONSISTENCY_RULES = [
    function (a, ans) {
      if (has(a.dores) && /(falha|for[çc]a|m[áa]xim|1rm|pesad)/i.test(joinAns(ans.intensidade_estrategia, ans.intensidade_porque, ans.intensidade_tecnicas)))
        return { id: 'c_dor_intensidade', topic: 'intensidade', text: 'A anamnese relata dor e a intensidade escolhida é elevada. Gostaria de rever essa estratégia ou manter sua decisão?' };
    },
    function (a, ans) {
      var d = parseInt(a.diasSemana, 10);
      if (d && d <= 3 && /(abcde|5x|6x|ppl|push.?pull.?legs|a-?b-?c-?d-?e)/i.test(String(ans.divisao_qual || '')))
        return { id: 'c_freq_divisao', topic: 'divisao', text: 'A divisão parece pedir frequência alta, mas a disponibilidade é de ' + d + ' dia(s)/semana. Gostaria de rever ou manter?' };
    },
    function (a, ans) {
      if (low(a.objetivo) === 'emagrecimento' && ans.cardio_have === 'Não')
        return { id: 'c_emag_cardio', topic: 'cardio', text: 'O objetivo é emagrecimento e o cardio ficou de fora. Gostaria de rever ou manter sua decisão?' };
    },
    function (a, ans) {
      if (low(a.experiencia) === 'iniciante' && /(drop|rest-?pause|cluster|falha)/i.test(joinAns(ans.intensidade_tecnicas, ans.intensidade_estrategia)))
        return { id: 'c_inic_tecnicas', topic: 'intensidade', text: 'Aluno iniciante com técnicas avançadas de intensidade. Rever agora ou manter e introduzir com cautela?' };
    }
  ];

  MTS._has = has;
})();
