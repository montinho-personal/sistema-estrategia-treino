import { TOPICS } from "./config";
import { questionsForTopic } from "./interview";
import type { StrategyState } from "./schema";

export type Confidence = "Muito alto" | "Alto" | "Moderado" | "Baixo";
export type ProfileKey =
  | "idoso" | "atleta" | "emagrecimento" | "reabilitacao" | "iniciante" | "feminino";

export interface KbEntry {
  id: string;
  title: string;
  cat: string;
  conf: Confidence;
  match: RegExp;
  what: string;
  why: string;
  benefits: string[];
  risks: string[];
  whenUse: string;
  whenAvoid: string;
  student: string;
  adapt?: Partial<Record<ProfileKey, string>>;
}

export const CONF_ORDER: Record<Confidence, number> = {
  "Muito alto": 4,
  Alto: 3,
  Moderado: 2,
  Baixo: 1,
};

const PROFILE_LABEL: Record<ProfileKey, string> = {
  idoso: "idoso",
  atleta: "atleta",
  emagrecimento: "emagrecimento",
  reabilitacao: "reabilitação",
  iniciante: "iniciante",
  feminino: "treino feminino",
};

/* Entradas — o que é, por que, benefícios, riscos, quando usar/evitar,
   como explicar ao aluno (adaptável ao perfil). Consenso entre evidência e prática. */
export const KB_ENTRIES: KbEntry[] = [
  { id: "volume", title: "Volume de treino", cat: "Conceito", conf: "Muito alto",
    match: /volume|s[ée]ries semanais|s[ée]ries por grupo/i,
    what: "A quantidade de séries efetivas por grupo muscular ao longo da semana.",
    why: "É um dos principais motores da hipertrofia, dentro de um intervalo bem tolerado.",
    benefits: ["Mais estímulo de crescimento até certo ponto", "Fácil de progredir ao longo do tempo"],
    risks: ["Volume alto demais atrapalha a recuperação", "Precisa caber na disponibilidade do aluno"],
    whenUse: "Sempre — é a base do planejamento de hipertrofia.",
    whenAvoid: "Excesso quando o sono, o estresse ou a recuperação estão comprometidos.",
    student: "A quantidade de séries do seu treino foi calculada para dar estímulo suficiente para evoluir, sem exagerar a ponto de atrapalhar sua recuperação.",
    adapt: { iniciante: "Começamos com um volume enxuto e bem executado: pouca coisa feita com qualidade já traz ótimos resultados no início." } },

  { id: "progressao", title: "Sobrecarga progressiva", cat: "Conceito", conf: "Muito alto",
    match: /sobrecarga progressiva|progress[ãa]o|progredir|aumentar carga/i,
    what: "Aumentar gradualmente a exigência do treino (carga, repetições, séries).",
    why: "Sem aumentar o desafio com o tempo, o corpo para de se adaptar.",
    benefits: ["Garante evolução contínua", "Dá um critério claro para subir de nível"],
    risks: ["Progredir rápido demais aumenta risco de lesão"],
    whenUse: "Em todos os objetivos, com critérios definidos.",
    whenAvoid: "Forçar carga com técnica ruim ou dor.",
    student: "Seu treino vai ficando um pouco mais desafiador com o tempo. É assim que seu corpo continua evoluindo, em vez de estagnar." },

  { id: "upper_lower", title: "Upper / Lower", cat: "Divisão", conf: "Alto",
    match: /upper.?lower|upper\s*\/\s*lower|superiores?.*inferiores?/i,
    what: "Divisão que alterna treinos de membros superiores e inferiores.",
    why: "Permite treinar cada grupo 2x por semana com boa recuperação — ótima relação custo-benefício.",
    benefits: ["Boa frequência por grupo", "Cabe bem em 4 dias/semana", "Simples de organizar"],
    risks: ["Sessões podem ficar longas se o volume for alto"],
    whenUse: "Para a maioria dos alunos, especialmente com 3–4 dias disponíveis.",
    whenAvoid: "Quando há só 1–2 dias, um Full Body costuma render mais.",
    student: "Seu treino foi dividido entre parte de cima e parte de baixo do corpo. Assim você treina cada região duas vezes por semana, o que acelera seus resultados com uma boa recuperação." },

  { id: "ppl", title: "Push / Pull / Legs", cat: "Divisão", conf: "Alto",
    match: /push.?pull.?legs|\bppl\b|empurrar.*puxar/i,
    what: "Divide os treinos em empurrar, puxar e pernas.",
    why: "Agrupa músculos com funções parecidas, o que organiza bem o volume em quem treina mais dias.",
    benefits: ["Ótimo para 5–6 dias/semana", "Volume alto bem distribuído"],
    risks: ["Frequência baixa por grupo se treinar poucos dias"],
    whenUse: "Para quem tem boa disponibilidade e já treina há algum tempo.",
    whenAvoid: "Para quem treina 3 dias ou menos.",
    student: "Seus treinos foram organizados por movimentos parecidos — empurrar, puxar e pernas. Isso ajuda a dar atenção de qualidade a cada grupo muscular." },

  { id: "full_body", title: "Full Body", cat: "Divisão", conf: "Alto",
    match: /full.?body|corpo (inteiro|todo)/i,
    what: "Cada sessão treina o corpo todo.",
    why: "Alta frequência por grupo com poucos dias de treino — eficiente para iniciantes e agendas apertadas.",
    benefits: ["Excelente com 2–3 dias/semana", "Muita prática dos movimentos", "Flexível se faltar um dia"],
    risks: ["Sessões podem cansar se mal dosadas"],
    whenUse: "Iniciantes ou quem tem pouco tempo.",
    whenAvoid: "Quando se quer volume muito alto por grupo numa única sessão.",
    student: "Em cada treino você trabalha o corpo inteiro. Isso é ótimo para aprender bem os exercícios e aproveitar ao máximo mesmo treinando poucos dias.",
    adapt: { iniciante: "Como você está começando, treinar o corpo todo em cada sessão faz você praticar bastante os movimentos e evoluir rápido, mesmo com poucos dias." } },

  { id: "divisao_grupo", title: "Divisão por grupo (ABC/ABCDE)", cat: "Divisão", conf: "Moderado",
    match: /abcde|abcd|a-?b-?c|divis[ãa]o por grupo|bro split/i,
    what: "Cada dia foca um ou dois grupos musculares.",
    why: "Permite volume alto por sessão; funciona bem em quem treina muitos dias e já é avançado.",
    benefits: ["Muito volume por grupo no dia", "Foco em pontos fracos"],
    risks: ["Frequência baixa (1x/semana por grupo)", "Pouco ideal para iniciantes"],
    whenUse: "Avançados com 5–6 dias e bom histórico.",
    whenAvoid: "Iniciantes e quem treina poucos dias.",
    student: "Cada dia do seu treino tem um foco específico. Isso permite caprichar no volume de cada grupo muscular a cada semana." },

  { id: "piramide_crescente", title: "Pirâmide crescente", cat: "Intensidade", conf: "Moderado",
    match: /pir[âa]mide crescente/i,
    what: "Aumenta a carga e reduz as repetições série a série.",
    why: "Aquece progressivamente e prepara o corpo para as cargas mais altas com segurança.",
    benefits: ["Aquecimento natural", "Transição segura para cargas pesadas"],
    risks: ["As primeiras séries somam menos estímulo efetivo"],
    whenUse: "Em exercícios principais, para preparar cargas altas.",
    whenAvoid: "Quando o tempo é curto e você quer eficiência máxima.",
    student: "Nesse método, você começa mais leve e vai aumentando o peso a cada série. Isso prepara seu corpo aos poucos e deixa as séries pesadas mais seguras." },

  { id: "piramide_decrescente", title: "Pirâmide decrescente", cat: "Intensidade", conf: "Moderado",
    match: /pir[âa]mide decrescente/i,
    what: "Começa com a carga mais alta e vai reduzindo, aumentando as repetições.",
    why: "Aproveita a força inicial no peso mais pesado e acumula volume nas séries seguintes.",
    benefits: ["Muito estímulo logo na primeira série", "Acumula bom volume total"],
    risks: ["Exige bom aquecimento antes", "Fadiga alta se mal dosada"],
    whenUse: "Após aquecer bem, para explorar força e volume no mesmo exercício.",
    whenAvoid: "Sem aquecimento adequado ou com alunos muito iniciantes.",
    student: "Você faz sua série mais pesada primeiro, aproveitando a força no começo, e depois vai aliviando o peso e fazendo mais repetições. Assim juntamos força e volume no mesmo exercício.",
    adapt: { idoso: "Depois de um bom aquecimento, você começa no peso mais desafiador com segurança e vai aliviando a carga nas séries seguintes, sempre com controle total do movimento." } },

  { id: "carga_fixa", title: "Carga fixa", cat: "Intensidade", conf: "Alto",
    match: /carga fixa|peso fixo|straight sets?/i,
    what: "A mesma carga em todas as séries do exercício.",
    why: "Simples, consistente e fácil de progredir — excelente para controlar a evolução.",
    benefits: ["Fácil de acompanhar", "Progressão clara", "Ótimo para iniciantes"],
    risks: ["Últimas séries podem cair de repetições com a fadiga"],
    whenUse: "Praticamente sempre, sobretudo para aprender a progredir.",
    whenAvoid: "Quando se busca variação intencional de estímulo.",
    student: "Você usa o mesmo peso em todas as séries. É a forma mais clara de acompanhar sua evolução: quando ficar fácil, subimos a carga." },

  { id: "dupla_progressao", title: "Dupla progressão", cat: "Intensidade", conf: "Alto",
    match: /dupla progress[ãa]o|double progression/i,
    what: "Primeiro você sobe as repetições dentro de uma faixa; depois aumenta a carga.",
    why: "Dá um critério objetivo e seguro para progredir — dos métodos mais confiáveis que existem.",
    benefits: ["Progressão segura e mensurável", "Funciona para todos os níveis"],
    risks: ["Evolução um pouco mais lenta, porém consistente"],
    whenUse: "Como padrão de progressão na maioria dos programas.",
    whenAvoid: "Raramente — é uma estratégia muito versátil.",
    student: "A regra é simples: primeiro você aumenta as repetições até o topo da faixa; quando conseguir, a gente sobe o peso. Assim você evolui de um jeito seguro e sempre sabe qual é o próximo passo." },

  { id: "top_set", title: "Top Set + Back Off", cat: "Intensidade", conf: "Alto",
    match: /top.?set|back.?off/i,
    what: "Uma série pesada principal (top set) seguida de séries mais leves (back off).",
    why: "Combina um estímulo intenso de força com volume adicional para hipertrofia.",
    benefits: ["Estímulo pesado + volume no mesmo exercício", "Eficiente no tempo"],
    risks: ["Exige boa gestão de fadiga e aquecimento"],
    whenUse: "Em exercícios principais, para unir força e tamanho.",
    whenAvoid: "Iniciantes que ainda dominam a técnica.",
    student: "Você faz uma série mais puxada como a principal do dia e, na sequência, algumas séries mais leves. Assim ganhamos força na pesada e volume nas seguintes." },

  { id: "cluster", title: "Cluster", cat: "Intensidade", conf: "Moderado",
    match: /cluster/i,
    what: "Divide a série em mini-blocos com pequenas pausas internas.",
    why: "Permite mais repetições de qualidade com cargas altas, mantendo boa técnica.",
    benefits: ["Mais volume com carga alta", "Técnica preservada"],
    risks: ["Mais complexo de aplicar", "Sessão mais longa"],
    whenUse: "Avançados buscando força e volume com cargas pesadas.",
    whenAvoid: "Iniciantes ou quando o tempo é curto.",
    student: "Sua série é quebrada em pequenos blocos com micro-pausas. Isso deixa você levantar um peso mais alto mantendo a execução bonita do começo ao fim." },

  { id: "falha", title: "Falha muscular", cat: "Técnica", conf: "Moderado",
    match: /falha( muscular)?|até a falha|training to failure/i,
    what: "Levar a série até não conseguir completar outra repetição com boa técnica.",
    why: "Garante alto esforço, mas não precisa ser usada o tempo todo para haver bons resultados.",
    benefits: ["Máximo recrutamento no fim da série", "Bom em exercícios isolados/máquinas"],
    risks: ["Muita fadiga e recuperação lenta se usada em excesso", "Maior risco em exercícios pesados livres"],
    whenUse: "De forma pontual, sobretudo em isoladores e máquinas.",
    whenAvoid: "Em todas as séries, em iniciantes, ou em multiarticulares muito pesados.",
    student: "Em algumas séries você vai até o limite, quando não consegue mais fazer com boa forma. Usamos isso com critério, nos exercícios certos, para intensificar sem te esgotar.",
    adapt: {
      idoso: "Vamos trabalhar perto do seu limite, mas com margem de segurança — sem ir até a falha total, priorizando o controle e a saúde das articulações.",
      iniciante: "Por enquanto não precisamos ir até a falha total. Deixar uma ou duas repetições na reserva já traz ótimos resultados e te ajuda a aprender a técnica com segurança.",
      emagrecimento: "Em algumas séries chegamos perto do limite para intensificar o gasto, mas sem comprometer a qualidade dos próximos treinos.",
    } },

  { id: "rir", title: "RIR (repetições em reserva)", cat: "Técnica", conf: "Alto",
    match: /\brir\b|repeti[çc][õo]es em reserva|reps in reserve/i,
    what: "Controlar quantas repetições você ainda conseguiria fazer ao parar a série.",
    why: "Ferramenta simples e confiável para dosar o esforço e a fadiga com precisão.",
    benefits: ["Controle fino da intensidade", "Menos risco de excesso"],
    risks: ["Exige alguma experiência para estimar bem"],
    whenUse: "Como termômetro de esforço na maioria das séries.",
    whenAvoid: "Raramente — é muito útil em todos os níveis.",
    student: 'Em vez de sempre ir ao limite, você para deixando 1 ou 2 repetições "na reserva". Isso mantém o esforço alto o suficiente para evoluir, sem te esgotar.' },

  { id: "rpe", title: "RPE (percepção de esforço)", cat: "Técnica", conf: "Alto",
    match: /\brpe\b|percep[çc][ãa]o de esfor[çc]o|escala de esfor[çc]o/i,
    what: "Uma nota de 0 a 10 para o quão difícil a série foi.",
    why: "Ajusta o treino ao seu dia real — nem sempre estamos 100%.",
    benefits: ["Adapta a carga ao dia", "Boa comunicação sobre o esforço"],
    risks: ["Subjetivo no começo"],
    whenUse: "Para regular a intensidade conforme sono, estresse e recuperação.",
    whenAvoid: "Quando se prefere um alvo fixo de repetições.",
    student: 'Você dá uma "nota" de esforço para cada série. Assim conseguimos ajustar o treino ao seu dia — se você está mais cansado, respeitamos isso sem perder o progresso.' },

  { id: "cadencia", title: "Cadência", cat: "Técnica", conf: "Moderado",
    match: /cad[êe]ncia|tempo (de )?execu[çc][ãa]o/i,
    what: "O ritmo controlado de cada fase do movimento.",
    why: "Melhora a técnica e a conexão com o músculo, tornando o estímulo mais eficiente.",
    benefits: ["Execução mais segura", "Mais controle e percepção muscular"],
    risks: ["Reduz a carga usada — não é problema, é proposital"],
    whenUse: "Para melhorar técnica e ênfase muscular.",
    whenAvoid: "Quando o foco é carga máxima de força.",
    student: "Você faz o movimento num ritmo controlado, sem pressa. Isso melhora sua técnica e faz o músculo trabalhar de verdade em cada repetição." },

  { id: "tempo_sob_tensao", title: "Tempo sob tensão", cat: "Técnica", conf: "Moderado",
    match: /tempo sob tens[ãa]o|\btut\b|time under tension/i,
    what: "O tempo total que o músculo passa trabalhando na série.",
    why: "Aumentar o tempo de trabalho pode intensificar o estímulo com menos carga.",
    benefits: ["Bom estímulo com menos peso", "Poupa as articulações"],
    risks: ["Sozinho não substitui carga e progressão"],
    whenUse: "Para intensificar isoladores e proteger articulações.",
    whenAvoid: "Como única variável, ignorando a progressão de carga.",
    student: "A ideia é manter o músculo trabalhando por mais tempo em cada série. Isso gera um ótimo estímulo mesmo com um peso mais amigável para suas articulações." },

  { id: "isometria", title: "Isometria", cat: "Técnica", conf: "Moderado",
    match: /isometria|isom[ée]tric/i,
    what: "Sustentar uma posição sob tensão, sem movimento.",
    why: "Fortalece pontos específicos e é muito útil para controle e reabilitação.",
    benefits: ["Fortalece ângulos específicos", "Segura para articulações sensíveis", "Ótima para estabilidade"],
    risks: ["Estímulo mais localizado"],
    whenUse: "Reabilitação, estabilidade e pontos de dificuldade.",
    whenAvoid: "Como base única de um treino de hipertrofia.",
    student: "Em alguns momentos você segura a posição parado, sob tensão. É um jeito seguro e eficaz de fortalecer regiões específicas e ganhar controle.",
    adapt: { reabilitacao: "Vamos usar posições sustentadas, sem movimento, para fortalecer a região com segurança e devolver estabilidade à articulação, respeitando totalmente seus limites atuais." } },

  { id: "drop_set", title: "Drop-set", cat: "Técnica", conf: "Moderado",
    match: /drop.?set/i,
    what: "Ao falhar, reduzir a carga na hora e continuar a série.",
    why: "Acumula bastante volume e estímulo em pouco tempo.",
    benefits: ["Muito estímulo em pouco tempo", "Ótimo como finalizador"],
    risks: ["Fadiga alta", "Usar demais atrapalha a recuperação"],
    whenUse: "Pontualmente, ao final de um exercício isolado.",
    whenAvoid: "Em todas as séries ou em multiarticulares pesados.",
    student: "Ao chegar no limite, a gente reduz o peso na hora e você continua por mais algumas repetições. É um jeito de arrancar mais estímulo no fim do exercício.",
    adapt: {
      atleta: "Como finalizador estratégico, o drop-set adiciona um pico de estímulo e tolerância à fadiga sem comprometer seu trabalho de força principal.",
      idoso: "Se usarmos, será com muito cuidado e só em máquinas seguras, reduzindo o peso gradualmente e sempre respeitando o controle do movimento.",
      emagrecimento: "O drop-set aumenta o trabalho total em pouco tempo, o que ajuda no gasto de energia da sua sessão — usado com moderação para não atrapalhar a recuperação.",
    } },

  { id: "rest_pause", title: "Rest-pause", cat: "Técnica", conf: "Moderado",
    match: /rest.?pause/i,
    what: "Chegar perto da falha, descansar poucos segundos e fazer mais repetições.",
    why: "Permite mais repetições de qualidade com a mesma carga alta.",
    benefits: ["Volume extra com carga alta", "Eficiente no tempo"],
    risks: ["Muito exigente", "Fadiga elevada"],
    whenUse: "Avançados, como intensificador pontual.",
    whenAvoid: "Iniciantes ou em exercícios muito pesados.",
    student: "Você faz o máximo, descansa poucos segundos e volta para mais algumas repetições com o mesmo peso. É uma forma de espremer mais trabalho de qualidade da série." },

  { id: "bi_set", title: "Bi-set", cat: "Técnica", conf: "Moderado",
    match: /bi.?set/i,
    what: "Dois exercícios seguidos, sem descanso entre eles.",
    why: "Economiza tempo e aumenta a densidade do treino.",
    benefits: ["Treino mais rápido", "Bom estímulo metabólico"],
    risks: ["Pode reduzir a carga do segundo exercício"],
    whenUse: "Quando o tempo é curto ou para intensificar.",
    whenAvoid: "Quando o foco é carga máxima em cada exercício.",
    student: "Você une dois exercícios em sequência, sem pausa entre eles. Isso deixa o treino mais rápido e intenso, aproveitando melhor seu tempo." },

  { id: "super_set", title: "Super-set (agonista/antagonista)", cat: "Técnica", conf: "Moderado",
    match: /super.?set/i,
    what: "Dois exercícios de músculos opostos em sequência (ex.: bíceps e tríceps).",
    why: "Economiza tempo e um grupo descansa enquanto o outro trabalha.",
    benefits: ["Eficiente no tempo", "Bom desempenho mantido"],
    risks: ["Organização exige planejamento dos aparelhos"],
    whenUse: "Para ganhar tempo sem perder qualidade.",
    whenAvoid: "Academia muito cheia (dois aparelhos ao mesmo tempo).",
    student: "Você combina exercícios de músculos opostos, um atrás do outro. Enquanto um trabalha, o outro descansa — assim você rende bem e ainda economiza tempo." },

  { id: "giant_set", title: "Giant set", cat: "Técnica", conf: "Baixo",
    match: /giant.?set|s[ée]rie gigante/i,
    what: "Três ou mais exercícios seguidos para o mesmo grupo.",
    why: "Gera muito estímulo metabólico e volume em pouco tempo.",
    benefits: ["Muito trabalho num período curto", 'Sensação intensa de "pump"'],
    risks: ["Fadiga muito alta", "Difícil manter carga e técnica"],
    whenUse: "Pontualmente, em fases específicas ou finalizações.",
    whenAvoid: "Como base do treino ou em iniciantes.",
    student: "Você faz vários exercícios do mesmo músculo em sequência. É bem intenso e serve como um estímulo especial em momentos escolhidos do plano." },

  { id: "myo_reps", title: "Myo-reps", cat: "Técnica", conf: "Moderado",
    match: /myo.?reps/i,
    what: "Uma série de ativação seguida de mini-séries com pausas curtas.",
    why: "Acumula muitas repetições efetivas de forma eficiente.",
    benefits: ["Muito estímulo em pouco tempo", "Boa para isoladores"],
    risks: ["Exigente", "Requer experiência para dosar"],
    whenUse: "Intermediários/avançados, em isoladores.",
    whenAvoid: "Iniciantes ou multiarticulares pesados.",
    student: "Depois de uma série inicial, você faz várias mini-séries com pausas curtinhas. É um jeito eficiente de acumular bastante trabalho de qualidade no músculo." },

  { id: "fst7", title: "FST-7", cat: "Técnica", conf: "Baixo",
    match: /fst.?7/i,
    what: "Sete séries de um isolador com descanso curto ao final do grupo.",
    why: 'Estratégia de "pump" e volume localizado, mais empírica que baseada em evidência forte.',
    benefits: ["Sensação intensa de congestão", "Volume localizado"],
    risks: ["Evidência limitada", "Fadiga alta se mal usada"],
    whenUse: "Como finalizador pontual em grupos específicos.",
    whenAvoid: "Como base do programa ou em iniciantes.",
    student: 'É uma finalização com várias séries seguidas de um exercício, buscando aquela sensação de músculo "cheio". Usamos como um toque especial em pontos que queremos destacar.' },

  { id: "cardio_liss", title: "Cardio de baixa intensidade (LISS)", cat: "Cardio", conf: "Alto",
    match: /liss|caminhada|zona 2|baixa intensidade|aer[óo]bico leve/i,
    what: "Atividade aeróbica leve e contínua, como caminhada.",
    why: "Aumenta o gasto calórico e a saúde cardiovascular com baixo impacto na recuperação.",
    benefits: ["Fácil de manter", "Pouca interferência na musculação", "Bom para o coração"],
    risks: ["Gasto por minuto menor que o de alta intensidade"],
    whenUse: "Emagrecimento, saúde e recuperação ativa.",
    whenAvoid: "Quando o tempo é muito curto e se busca eficiência máxima.",
    student: "O cardio leve, como caminhar, ajuda a gastar energia e cuida do seu coração, sem atrapalhar a recuperação dos seus treinos de musculação." },

  { id: "hiit", title: "HIIT (alta intensidade)", cat: "Cardio", conf: "Alto",
    match: /hiit|alta intensidade|intervalado/i,
    what: "Tiros intensos alternados com períodos de recuperação.",
    why: "Gasto calórico eficiente em pouco tempo e boa melhora do condicionamento.",
    benefits: ["Eficiente no tempo", "Melhora o condicionamento"],
    risks: ["Mais desgaste e recuperação", "Pode interferir na musculação se em excesso"],
    whenUse: "Quando há pouco tempo e boa capacidade de recuperação.",
    whenAvoid: "Fadiga alta, dores articulares ou iniciantes destreinados.",
    student: "O cardio intervalado alterna momentos intensos e de descanso. Rende bastante em pouco tempo, e vamos dosá-lo para não competir com a recuperação da musculação.",
    adapt: { idoso: "Se usarmos intervalos mais intensos, será de forma leve e segura, respeitando seu ritmo e a saúde das suas articulações." } },

  { id: "lombalgia", title: "Lombalgia / dor lombar", cat: "Condição", conf: "Alto",
    match: /lombar|lombalgia|coluna|hérnia|hernia/i,
    what: "Dor na região lombar, comum e geralmente manejável com exercício.",
    why: "Fortalecer o core e progredir com controle costuma reduzir dor e melhorar função.",
    benefits: ["Mais estabilidade e menos dor", "Retorno seguro à carga"],
    risks: ["Progressão apressada pode irritar a região"],
    whenUse: "Priorizar controle, core e amplitude tolerada.",
    whenAvoid: "Cargas máximas em amplitude dolorosa sem preparo.",
    student: "Como você relatou incômodo na lombar, montamos o treino para fortalecer sua região central e progredir com cuidado. O objetivo é te deixar mais forte e com menos dor." },

  { id: "ombro", title: "Ombro sensível", cat: "Condição", conf: "Alto",
    match: /ombro|manguito|tendinite/i,
    what: "Desconforto no ombro, articulação móvel e sensível a certos movimentos.",
    why: "Ajustar ângulos, amplitude e fortalecer estabilizadores costuma resolver bem.",
    benefits: ["Menos dor nos empurrões", "Ombro mais estável"],
    risks: ["Exercícios acima da cabeça mal dosados podem irritar"],
    whenUse: "Escolher ângulos amigáveis e fortalecer o manguito.",
    whenAvoid: "Amplitudes dolorosas e cargas altas sem preparo.",
    student: "Por causa da sensibilidade no seu ombro, escolhemos ângulos confortáveis e incluímos exercícios que dão estabilidade à articulação, para você treinar forte e sem dor." },
];

/* ------------------------------- engine ------------------------------- */
function textOf(v: unknown): string {
  return Array.isArray(v) ? v.join(" ") : String(v ?? "");
}

export function matchKnowledge(text: unknown): KbEntry[] {
  const t = textOf(text);
  if (!t.trim()) return [];
  return KB_ENTRIES.filter((e) => e.match.test(t));
}

export function kbById(id: string): KbEntry | null {
  return KB_ENTRIES.find((e) => e.id === id) ?? null;
}

export function allKnowledge(): KbEntry[] {
  return KB_ENTRIES.slice();
}

export function profileKeys(state: StrategyState): ProfileKey[] {
  const a = state.anamnese;
  const keys: ProfileKey[] = [];
  const idade = parseInt(a.idade ?? "", 10);
  const obj = (a.objetivo ?? "").toLowerCase();
  const exp = (a.experiencia ?? "").toLowerCase();
  if (idade && idade >= 60) keys.push("idoso");
  if (exp === "atleta" || obj === "competição" || obj === "performance") keys.push("atleta");
  if (obj === "emagrecimento") keys.push("emagrecimento");
  if (obj === "reabilitação") keys.push("reabilitacao");
  if (exp === "iniciante") keys.push("iniciante");
  if ((a.sexo ?? "").toLowerCase() === "feminino") keys.push("feminino");
  return keys;
}

export interface KbExplanation {
  text: string;
  profile: string | null;
}

export function explainKnowledge(entry: KbEntry, state: StrategyState): KbExplanation {
  for (const k of profileKeys(state)) {
    const adapted = entry.adapt?.[k];
    if (adapted) return { text: adapted, profile: PROFILE_LABEL[k] };
  }
  return { text: entry.student, profile: null };
}

export function confidenceNote(entry: KbEntry): string {
  if (entry.conf === "Muito alto") return "Forte consenso científico.";
  if (entry.conf === "Alto") return "Bem apoiado pelas evidências atuais.";
  if (entry.conf === "Moderado") return "Evidência razoável; funciona bem quando bem aplicado.";
  return "Evidência ainda limitada — mais experiência prática do que ciência forte.";
}

export function confidenceClass(entry: KbEntry): "good" | "warn" | "low" {
  if (entry.conf === "Muito alto" || entry.conf === "Alto") return "good";
  if (entry.conf === "Moderado") return "warn";
  return "low";
}

/** Entradas relacionadas às respostas de um tópico. */
export function knowledgeForTopic(state: StrategyState, topicId: string): KbEntry[] {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return [];
  const texts = questionsForTopic(topic, state).map((q) => textOf(state.answers[q.id]));
  if (topicId === "exercicios" || topicId === "mobilidade") {
    texts.push(textOf(state.anamnese.dores), textOf(state.anamnese.lesoes));
  }
  const found = new Set<string>();
  const out: KbEntry[] = [];
  for (const t of texts) {
    for (const e of matchKnowledge(t)) {
      if (!found.has(e.id)) {
        found.add(e.id);
        out.push(e);
      }
    }
  }
  return out;
}
