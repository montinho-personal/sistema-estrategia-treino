import type { OptionDetail } from "../types";

/**
 * Explicações "Quando usar e vantagens" exibidas nas opções da entrevista.
 * As chaves precisam ser idênticas ao texto das opções em topics.ts.
 */

export const DIVISAO_DETAILS: Record<string, OptionDetail> = {
  "Full Body": {
    quando: "Iniciantes, quem treina 2–3x por semana ou tem rotina imprevisível, e objetivos de emagrecimento ou condicionamento.",
    vantagens: [
      "Cada grupo é treinado 2–3x por semana.",
      "Faltar um treino pesa menos: nenhum grupo fica sem estímulo.",
      "Ótimo para aprender e repetir os movimentos básicos.",
      "Maior gasto energético por sessão.",
    ],
  },
  "Upper / Lower": {
    quando: "Quem treina 4x por semana, alunos intermediários, hipertrofia ou força.",
    vantagens: [
      "Cada grupo 2x por semana — a frequência mais indicada pela ciência para hipertrofia.",
      "Bom equilíbrio entre volume e recuperação.",
      "Sessões focadas e objetivas.",
      "Flexível: funciona de 3 a 6 dias por semana.",
    ],
  },
  "Push / Pull / Legs": {
    quando: "3 dias (cada grupo 1x) ou 6 dias (cada grupo 2x); intermediários e avançados que gostam de treinar bastante.",
    vantagens: [
      "Agrupa músculos que trabalham juntos (empurrar, puxar, pernas).",
      "Boa recuperação entre as sessões do mesmo grupo.",
      "Na versão 6x, combina frequência 2x com volume alto.",
    ],
  },
  "Lower / Upper / Lower / Full Body": {
    quando: "4 dias por semana com prioridade para membros inferiores (glúteos e pernas).",
    vantagens: [
      "Inferiores treinados até 3x por semana.",
      "Superiores mantidos com frequência 2x.",
      "Ideal para quem quer foco em glúteos e pernas sem abandonar o resto.",
    ],
  },
  "Upper / Lower + Push / Pull / Legs": {
    quando: "5 dias por semana, intermediários e avançados com foco em hipertrofia.",
    vantagens: [
      "Frequência 2x para quase todos os grupos.",
      "Volume alto bem distribuído na semana.",
      "Combina os dias mais pesados (Upper/Lower) com os de mais volume (PPL).",
    ],
  },
  ABC: {
    quando: "3 dias por semana, ou 6 dias repetindo a sequência (ABCABC); quem prefere sessões mais completas por grupo.",
    vantagens: [
      "Simples de organizar e de seguir.",
      "Bom volume para cada grupo na sessão.",
      "Repetido em 6 dias (ABCABC), cada grupo fica com frequência 2x.",
    ],
  },
  ABCD: {
    quando: "4 dias por semana, quem gosta de dividir os grupos em sessões menores.",
    vantagens: [
      "Sessões mais curtas e focadas.",
      "Permite dar um dia exclusivo para um grupo prioritário.",
      "Boa recuperação entre os treinos do mesmo grupo.",
    ],
  },
  ABCDE: {
    quando: "5 dias, alunos avançados que gostam de treinar um grupo por dia. Vale saber: para hipertrofia, treinar cada grupo 2x por semana costuma render mais.",
    vantagens: [
      "Muito volume e foco total em cada grupo na sessão.",
      "Recuperação longa para cada músculo.",
      "Formato conhecido e motivador para quem já está acostumado.",
    ],
  },
};

export const INTENSIDADE_HINTS: Record<string, string> = {
  "Pirâmide crescente": "A carga sobe e as repetições caem a cada série",
  "Pirâmide decrescente": "Começa pesado e reduz a carga a cada série",
  "Carga fixa": "A mesma carga em todas as séries",
  "Dupla progressão": "Sobe as repetições até o topo da faixa, depois a carga",
  "Top Set": "Uma série principal mais pesada",
  "Back Off": "Séries mais leves depois da série principal",
  Cluster: "Pausas curtas dentro da série",
};

export const INTENSIDADE_DETAILS: Record<string, OptionDetail> = {
  "Pirâmide crescente": {
    quando: "Hipertrofia, alunos intermediários e quem precisa aquecer bem as articulações antes das séries pesadas.",
    vantagens: [
      "Aquece o músculo e as articulações de forma progressiva.",
      "Chega às séries mais pesadas com segurança.",
      "Fácil de entender e de aplicar.",
    ],
  },
  "Pirâmide decrescente": {
    quando: "Alunos experientes, depois de um bom aquecimento, quando o foco é carga alta logo no início.",
    vantagens: [
      "A série mais pesada é feita com o músculo descansado.",
      "Maior estímulo de força.",
      "As séries seguintes, mais leves, somam volume com boa técnica.",
    ],
  },
  "Carga fixa": {
    quando: "Iniciantes, fase de aprendizado técnico, ou quando você quer um controle simples da progressão.",
    vantagens: [
      "Simples de registrar e de progredir.",
      "Foco total na técnica.",
      "Fácil comparar a evolução semana a semana.",
    ],
  },
  "Dupla progressão": {
    quando: "Hipertrofia em praticamente qualquer nível — é o método principal para intermediários.",
    vantagens: [
      "Progressão clara e mensurável.",
      "Evita subir a carga cedo demais.",
      "Muito usada e bem respaldada pela prática e pela ciência.",
    ],
  },
  "Top Set": {
    quando: "Força com hipertrofia, alunos com boa técnica nos exercícios compostos.",
    vantagens: [
      "Estímulo de carga alta com pouca fadiga acumulada.",
      "Ótimo marcador da evolução de força.",
      "Combina muito bem com séries Back Off.",
    ],
  },
  "Back Off": {
    quando: "Depois de uma série principal (Top Set), para acumular volume com qualidade.",
    vantagens: [
      "Volume extra mantendo a boa execução.",
      "Equilibra intensidade e volume na mesma sessão.",
      "Reduz o risco de fadiga excessiva.",
    ],
  },
  Cluster: {
    quando: "Alunos avançados, foco em força ou potência, ou para manter carga alta por mais repetições.",
    vantagens: [
      "Mais repetições com carga alta.",
      "Mantém a qualidade da execução até o fim.",
      "Útil para quebrar platôs.",
    ],
  },
};

export const PRIORIDADE_DETAILS: Record<string, OptionDetail> = {
  "Mais volume de séries": {
    quando: "Grupo prioritário com boa recuperação, que responde bem a mais trabalho.",
    vantagens: [
      "O volume é o principal motor da hipertrofia.",
      "Permite ajustar o estímulo aos poucos, semana a semana.",
    ],
  },
  "Maior frequência semanal": {
    quando: "Quando o grupo tem muitas séries — melhor dividi-las em 2 ou 3 sessões.",
    vantagens: [
      "Séries de mais qualidade, com menos fadiga em cada sessão.",
      "Mais estímulos de crescimento ao longo da semana.",
    ],
  },
  "Começar a sessão pelo prioritário": {
    quando: "Sempre que um grupo é prioridade — é a estratégia mais simples e eficaz.",
    vantagens: [
      "Mais energia, foco e carga nas séries que mais importam.",
      "Melhor execução, sem a fadiga dos outros exercícios.",
    ],
  },
  "Treinar o prioritário descansado": {
    quando: "Quando outro grupo pode cansar o prioritário (ex.: costas pesada antes de bíceps).",
    vantagens: [
      "Evita que exercícios auxiliares roubem rendimento do foco.",
      "Organiza a semana para o prioritário chegar sempre recuperado.",
    ],
  },
  "Prioritário no início da semana": {
    quando: "Rotina que cansa ao longo da semana, ou alunos que costumam faltar mais no fim de semana.",
    vantagens: [
      "Treina o foco com mais disposição.",
      "Garante que o treino mais importante seja feito.",
    ],
  },
  "Manutenção nos demais grupos": {
    quando: "Recuperação limitada (tempo, sono, rotina) ou ciclos de especialização.",
    vantagens: [
      "Sobra energia e recuperação para o grupo prioritário.",
      "Os demais grupos não regridem com o volume de manutenção.",
    ],
  },
  "Mais proximidade da falha": {
    quando: "Alunos com técnica sólida, principalmente em isoladores e máquinas.",
    vantagens: [
      "Mais fibras musculares recrutadas.",
      "Extrai mais estímulo de cada série.",
    ],
  },
  "Mais exercícios e ângulos": {
    quando: "Músculos grandes ou com várias regiões (glúteos, costas, ombros).",
    vantagens: [
      "Desenvolvimento mais completo e harmônico.",
      "Menos sobrecarga repetida na mesma articulação.",
    ],
  },
  "Progressão de carga mais agressiva": {
    quando: "Quando o aluno está progredindo bem no grupo ou em fases de intensificação.",
    vantagens: [
      "Sinal claro de evolução para o aluno.",
      "Acelera os ganhos no grupo prioritário.",
    ],
  },
  "Técnicas avançadas no prioritário": {
    quando: "Intermediários e avançados, no fim da sessão ou em fases de intensificação.",
    vantagens: [
      "Mais estímulo em menos tempo.",
      "Ajuda a quebrar platôs.",
    ],
  },
  "Pré-exaustão (isolador antes do composto)": {
    quando: "Quando outro músculo limita o composto (ex.: o glúteo trabalha pouco no agachamento).",
    vantagens: [
      "O músculo-alvo já chega ativado no composto.",
      "Mais estímulo no alvo dentro do exercício principal.",
    ],
  },
  "Conexão mente-músculo": {
    quando: "Isoladores com carga moderada e alunos com dificuldade de \"sentir\" o músculo.",
    vantagens: [
      "Mais ativação do músculo-alvo (comprovada em estudos com cargas moderadas).",
      "Melhora a qualidade da execução.",
    ],
  },
};

export const FREQUENCIA_PRIORITARIOS = "Prioritários 2–3x · demais 1–2x";

export const FREQUENCIA_HINTS: Record<string, string> = {
  "1x por semana": "Cada grupo em um dia da semana",
  "2x por semana": "Cada grupo em dois dias · a mais indicada para hipertrofia",
  "3x por semana": "Alta frequência · ideal para Full Body",
  [FREQUENCIA_PRIORITARIOS]: "Frequência maior só para o foco",
};

export const FREQUENCIA_DETAILS: Record<string, OptionDetail> = {
  "1x por semana": {
    quando: "Divisões em que cada dia é de um grupo (ABCDE), sessões longas por grupo, ou manutenção de grupos que não são prioridade.",
    vantagens: [
      "Muito volume e foco total em cada sessão.",
      "Recuperação longa para cada grupo.",
    ],
  },
  "2x por semana": {
    quando: "A maioria dos casos de hipertrofia e recomposição — Upper/Lower, Full Body 2x, PPL 6x.",
    vantagens: [
      "É a frequência com melhor evidência para hipertrofia.",
      "Divide o volume em sessões de mais qualidade e menos fadiga.",
      "Bom equilíbrio entre estímulo e recuperação.",
    ],
  },
  "3x por semana": {
    quando: "Full Body 3x, grupos prioritários, ou iniciantes aprendendo os movimentos.",
    vantagens: [
      "Mais estímulos na semana com pouco volume em cada sessão.",
      "Mais prática dos movimentos — a técnica evolui rápido.",
      "Ótima para dar foco a um grupo prioritário.",
    ],
  },
  [FREQUENCIA_PRIORITARIOS]: {
    quando: "Quando há grupos prioritários e o tempo de treino na semana é limitado.",
    vantagens: [
      "Concentra a energia no que mais importa.",
      "Mantém os demais grupos sem regredir.",
    ],
  },
};
