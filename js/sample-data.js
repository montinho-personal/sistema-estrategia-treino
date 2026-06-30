/**
 * sample-data.js — Estratégia de exemplo para demonstrar o sistema.
 * Preenche o wizard inteiro (anamnese categorizada + entrevista) já confirmado,
 * pronto para gerar a validação e o relatório.
 */
(function (global) {
  'use strict';

  global.SAMPLE_DRAFT = {
    aluno: 'Lucas Andrade',
    objetivo: 'Hipertrofia e recomposição corporal em 16 semanas',
    dataElaboracao: '',
    tags: [],
    etapa: 'confirm',
    anamneseConfirmada: true,
    anamneseTexto: '',
    anamneseArquivo: 'anamnese-lucas.pdf',
    categorias: {
      dadosPessoais: 'Lucas Andrade, 28 anos, analista de sistemas.',
      objetivos: 'Ganhar massa muscular e reduzir percentual de gordura.',
      historico: 'Treina de forma intermitente há 3 anos; parou 4 meses no último ano.',
      experiencia: 'Intermediário — boa execução nos principais exercícios.',
      disponibilidade: 'Segunda a sexta, no período da noite (5 dias).',
      dores: 'Leve desconforto no ombro direito ao elevar carga acima da cabeça.',
      lesoes: 'Nenhuma lesão estruturada relatada.',
      mobilidade: 'Mobilidade de quadril limitada para agachamento profundo.',
      composicao: 'Peso: 82 kg\nAltura: 1,79 m\nGordura: 21%\nFrequência: 5x/semana',
      rotina: 'Trabalho sentado, alta carga de tela; caminha pouco durante o dia.',
      sono: '6 a 7 horas por noite, qualidade regular.',
      estresse: 'Moderado, por conta do trabalho.',
      alimentacao: 'Três refeições principais; baixa ingestão de proteína.',
      modalidade: 'Nenhuma modalidade esportiva no momento.',
      restricoes: 'Sem restrições médicas; evitar sobrecarga no ombro direito.',
      observacoes: 'Prefere treinos objetivos, de até 60 minutos.'
    },
    entrevista: {
      objetivoPrincipal: 'Hipertrofia com ênfase em dorsais e ombros',
      objetivoSecundario: 'Redução do percentual de gordura',
      prioridade: 'Ganho de massa magra preservando a saúde do ombro',
      divisao: 'Upper / Lower',
      divisaoPorque: 'entrega frequência 2x por grupo na semana, encaixa nos 4–5 dias disponíveis e facilita gerenciar a fadiga do ombro',
      divisaoBeneficios: 'alta frequência, boa recuperação e progressão consistente nos compostos',
      divisaoAlternativas: 'ABC e Push/Pull/Legs',
      divisaoDescarte: 'rodariam a maioria dos grupos só 1x na semana, o que reduz a frequência ideal para o objetivo atual',
      periodizacaoModelo: 'Ondulatória (DUP)',
      fases: [
        { fase: 'Adaptação', duracao: 'Semanas 1–4', foco: 'Técnica e base', descricao: 'Volume moderado, foco em execução perfeita e amplitude segura no ombro.' },
        { fase: 'Acúmulo', duracao: 'Semanas 5–9', foco: 'Volume', descricao: 'Aumento progressivo de séries; introdução de myo-reps nos isoladores.' },
        { fase: 'Intensificação', duracao: 'Semanas 10–13', foco: 'Carga', descricao: 'Cargas mais altas nos compostos, RIR mais baixo, descanso ampliado.' },
        { fase: 'Realização', duracao: 'Semanas 14–16', foco: 'Definição', descricao: 'Densidade alta, déficit calórico controlado e cardio estratégico.' }
      ],
      volumeEvol: 'Começa em ~12 séries por grupo e sobe até ~18 nas fases de acúmulo',
      intensidadeEvol: 'De 2–3 RIR na adaptação para 0–1 RIR na intensificação',
      deload: 'Semana 9 com volume reduzido em ~50%',
      repFaixa: 'Hipertrofia (8–12)',
      repPorque: 'melhor equilíbrio entre tensão e estresse metabólico com fadiga gerenciável para o ombro',
      tecnicas: ['RIR', 'Myo-reps', 'Excêntrica acentuada'],
      tecnicasQuando: 'Myo-reps apenas nos isoladores e a partir da fase de acúmulo; excêntrica acentuada nos exercícios de ombro para reforço articular',
      grupoPrioridade: 'Dorsais e posterior de ombro',
      exObrigatorios: 'Remada, puxada, desenvolvimento neutro e agachamento/leg press',
      exProibidos: 'Desenvolvimento militar pesado por trás da nuca',
      adaptacoesDor: 'Desenvolvimento com pegada neutra e amplitude parcial no ombro direito; aumentar carga só sem dor',
      aquecimento: '5 min de bicicleta + séries de aproximação progressivas',
      mobilidade: 'Mobilidade de quadril e torácica',
      ativacao: 'Ativação de manguito rotador e glúteo',
      core: 'Prancha e dead bug no fim da sessão',
      cardioObjetivo: 'Gasto calórico e saúde cardiovascular',
      cardioFrequencia: '3x por semana, 25–30 min',
      cardioIntensidade: 'LISS em Zona 2; 1 sessão de HIIT leve na fase final',
      progCarga: 'Ao atingir o topo da faixa de repetições com técnica limpa',
      progVolume: 'A cada 2 semanas, +1 série nos grupos prioritários até o teto planejado',
      progTroca: 'A cada mesociclo, ou imediatamente se surgir dor',
      progReducao: 'Queda de performance por 2 sessões seguidas, sono ruim ou dor articular',
      feedback: ['Sono', 'Dor', 'Fadiga', 'Peso', 'Performance', 'Fotos'],
      orientacoes: 'Comunique qualquer dor no ombro no mesmo dia — vamos ajustar na hora, sem perder o ritmo do ciclo.'
    },
    treinos: [
      { dia: 'Segunda', grupo: 'Upper A (foco dorsais)', detalhe: 'Puxada, remada curvada, desenvolvimento neutro, rosca e tríceps.' },
      { dia: 'Terça', grupo: 'Lower A', detalhe: 'Agachamento/leg press, stiff, cadeira extensora e panturrilha.' },
      { dia: 'Quinta', grupo: 'Upper B (foco ombros)', detalhe: 'Supino inclinado, remada baixa, elevação lateral e bíceps/tríceps.' },
      { dia: 'Sexta', grupo: 'Lower B', detalhe: 'Levantamento terra romeno, mesa flexora, elevação pélvica e core.' }
    ],
    relatorio: { gerado: false, resumoExecutivo: '', sections: [] }
  };
})(window);
