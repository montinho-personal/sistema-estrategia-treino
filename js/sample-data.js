/**
 * sample-data.js — Estratégia de exemplo para demonstrar o valor das entregas.
 */
(function (global) {
  'use strict';

  global.SAMPLE_STRATEGY = {
    aluno: 'Lucas Andrade',
    objetivo: 'Hipertrofia e recomposição corporal em 16 semanas',
    dataElaboracao: '',
    resumoExecutivo:
      'Plano estruturado em 4 mesociclos com foco em ganho de massa magra e ' +
      'redução de gordura. A periodização prioriza progressão de carga nas ' +
      'primeiras fases e densidade/volume na fase final. Frequência de 5 ' +
      'treinos semanais, com ajuste nutricional progressivo e controle quinzenal ' +
      'de medidas. Expectativa: +3 a 4 kg de massa magra e -4% de gordura.',
    anamnese: [
      { pergunta: 'Objetivo principal', resposta: 'Ganhar massa muscular e reduzir percentual de gordura.' },
      { pergunta: 'Histórico de lesões ou dores', resposta: 'Leve desconforto no ombro direito ao elevar carga acima da cabeça.' },
      { pergunta: 'Doenças ou condições de saúde', resposta: 'Nenhuma relatada.' },
      { pergunta: 'Uso de medicamentos', resposta: 'Não faz uso contínuo.' },
      { pergunta: 'Cirurgias anteriores', resposta: 'Nenhuma.' },
      { pergunta: 'Experiência com treino', resposta: 'Intermediário — treina há cerca de 3 anos.' },
      { pergunta: 'Disponibilidade semanal (dias/horários)', resposta: 'Segunda a sexta, no período da noite.' },
      { pergunta: 'Qualidade do sono', resposta: '6 a 7 horas por noite, sono regular.' },
      { pergunta: 'Alimentação atual', resposta: 'Três refeições principais; pouca ingestão de proteína.' },
      { pergunta: 'Tabagismo / consumo de álcool', resposta: 'Não fuma; bebe socialmente nos fins de semana.' },
      { pergunta: 'Nível de estresse', resposta: 'Moderado, por conta do trabalho.' },
      { pergunta: 'Observações adicionais', resposta: 'Prefere treinos objetivos, de até 60 minutos.' }
    ],
    avaliacao: [
      { rotulo: 'Idade', valor: '28 anos' },
      { rotulo: 'Peso atual', valor: '82 kg' },
      { rotulo: 'Altura', valor: '1,79 m' },
      { rotulo: 'Gordura corporal', valor: '21%' },
      { rotulo: 'Experiência', valor: 'Intermediário' },
      { rotulo: 'Frequência', valor: '5x / semana' }
    ],
    metas: [
      { titulo: 'Massa magra', descricao: 'Ganhar de 3 a 4 kg de músculo em 16 semanas.' },
      { titulo: 'Gordura corporal', descricao: 'Reduzir de 21% para ~17%.' },
      { titulo: 'Força', descricao: 'Aumentar 15% nas cargas dos principais compostos.' },
      { titulo: 'Consistência', descricao: 'Manter 90%+ de adesão aos treinos e refeições.' }
    ],
    periodizacao: [
      { fase: 'Mesociclo 1 — Adaptação', duracao: 'Semanas 1–4', foco: 'Técnica e base', descricao: 'Volume moderado, foco em execução perfeita e amplitude completa.' },
      { fase: 'Mesociclo 2 — Acúmulo', duracao: 'Semanas 5–8', foco: 'Volume', descricao: 'Aumento progressivo de séries e densidade. Introdução de drop-sets.' },
      { fase: 'Mesociclo 3 — Intensificação', duracao: 'Semanas 9–12', foco: 'Carga', descricao: 'Cargas altas nos compostos, repetições baixas e descanso ampliado.' },
      { fase: 'Mesociclo 4 — Realização', duracao: 'Semanas 13–16', foco: 'Definição', descricao: 'Densidade alta, déficit calórico controlado e cardio estratégico.' }
    ],
    treinos: [
      { dia: 'Segunda', grupo: 'Peito e Tríceps', detalhe: 'Supino reto, supino inclinado, crucifixo, tríceps corda e francês.' },
      { dia: 'Terça', grupo: 'Costas e Bíceps', detalhe: 'Barra fixa, remada curvada, puxada, rosca direta e martelo.' },
      { dia: 'Quarta', grupo: 'Pernas (quadríceps)', detalhe: 'Agachamento, leg press, cadeira extensora e panturrilha.' },
      { dia: 'Quinta', grupo: 'Ombros e Abdômen', detalhe: 'Desenvolvimento, elevação lateral, encolhimento e core.' },
      { dia: 'Sexta', grupo: 'Posterior e Glúteos', detalhe: 'Stiff, mesa flexora, elevação pélvica e cadeira abdutora.' }
    ],
    recomendacoes: [
      'Ingestão de 1,8 a 2,2 g de proteína por kg de peso corporal.',
      'Hidratação mínima de 3 litros de água por dia.',
      'Sono de 7 a 8 horas — pilar do crescimento muscular.',
      'Registrar cargas a cada treino para garantir progressão.',
      'Foto e medidas a cada 15 dias para acompanhamento.'
    ],
    observacoes:
      'Reavaliação completa na semana 8. Qualquer dor articular deve ser ' +
      'comunicada imediatamente para ajuste de exercícios.'
  };
})(window);
