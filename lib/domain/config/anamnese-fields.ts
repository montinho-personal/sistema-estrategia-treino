import type { AnamneseSectionDef } from "../types";

/** Schema da anamnese — o que o treinador preenche sobre o aluno. */
export const ANAMNESE_SECTIONS: AnamneseSectionDef[] = [
  {
    id: "identificacao",
    title: "Identificação",
    fields: [
      { id: "nome", label: "Nome do aluno", type: "text", placeholder: "Ex.: Marina Souza" },
      { id: "idade", label: "Idade", type: "number", placeholder: "Ex.: 34" },
      { id: "sexo", label: "Sexo", type: "select", options: ["Masculino", "Feminino", "Prefiro não informar"] },
      { id: "modalidade", label: "Modalidade", type: "select", options: ["Presencial", "Online", "Híbrido"] },
    ],
  },
  {
    id: "objetivo",
    title: "Objetivo & experiência",
    fields: [
      { id: "objetivo", label: "Objetivo principal", type: "select", options: ["Hipertrofia", "Emagrecimento", "Performance", "Saúde e qualidade de vida", "Reabilitação", "Competição"] },
      { id: "experiencia", label: "Experiência de treino", type: "select", options: ["Iniciante", "Intermediário", "Avançado", "Atleta"] },
      { id: "historico", label: "Histórico de treino", type: "textarea", placeholder: "Há quanto tempo treina, o que já fez, resultados anteriores..." },
    ],
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade & rotina",
    fields: [
      { id: "diasSemana", label: "Dias disponíveis por semana", type: "number", placeholder: "Ex.: 4" },
      { id: "tempoSessao", label: "Tempo por sessão (min)", type: "number", placeholder: "Ex.: 60" },
      { id: "rotina", label: "Rotina", type: "textarea", placeholder: "Trabalho, horários, viagens, quando consegue treinar..." },
    ],
  },
  {
    id: "saude",
    title: "Saúde & histórico físico",
    fields: [
      { id: "dores", label: "Dores atuais", type: "textarea", placeholder: "Onde, quando aparece, intensidade..." },
      { id: "lesoes", label: "Lesões / cirurgias", type: "textarea", placeholder: "Lesões passadas ou atuais, cirurgias..." },
      { id: "limitacoes", label: "Limitações & medicamentos", type: "textarea", placeholder: "Restrições médicas, medicamentos contínuos..." },
      { id: "mobilidade", label: "Mobilidade & estabilidade", type: "textarea", placeholder: "Amplitudes limitadas, controle motor, equilíbrio..." },
    ],
  },
  {
    id: "estilo",
    title: "Composição & estilo de vida",
    fields: [
      { id: "composicao", label: "Composição corporal", type: "textarea", placeholder: "Peso, altura, % de gordura, avaliação..." },
      { id: "alimentacao", label: "Alimentação", type: "select", options: ["Não avaliado", "Precisa de ajustes", "Regular", "Boa", "Acompanhamento com nutricionista"] },
      { id: "sono", label: "Sono", type: "select", options: ["Não avaliado", "Ruim", "Irregular", "Bom", "Ótimo"] },
      { id: "hidratacao", label: "Hidratação", type: "select", options: ["Não avaliado", "Baixa", "Regular", "Boa"] },
      { id: "estresse", label: "Nível de estresse", type: "select", options: ["Não avaliado", "Baixo", "Moderado", "Alto"] },
    ],
  },
  {
    id: "comportamento",
    title: "Comportamento & motivação",
    fields: [
      { id: "motivacao", label: "Motivação atual", type: "select", options: ["Não avaliado", "Baixa", "Moderada", "Alta"] },
      { id: "aderencia", label: "Histórico de aderência", type: "textarea", placeholder: "Já desistiu antes? O que ajudou ou atrapalhou a constância?" },
      { id: "fatoresAbandono", label: "Possíveis fatores de abandono", type: "textarea", placeholder: "Falta de tempo, dor, tédio, viagens, resultados lentos..." },
      { id: "observacoes", label: "Observações gerais", type: "textarea", placeholder: "Qualquer contexto relevante sobre o aluno..." },
    ],
  },
];
