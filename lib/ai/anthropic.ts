import {
  SYSTEM_PROMPT,
  ANAMNESE_SECTIONS,
  analyzeHistory,
  insightsText,
  trainerMemoryText,
  writingSamples,
} from "@/lib/domain";
import type { StrategyState, Anamnese, VolumeRow } from "@/lib/domain/schema";
import type { AiConfig } from "@/lib/store";
import { DEFAULT_AI_MODEL, useDnaStore, useHistoryStore } from "@/lib/store";

/**
 * Camada de IA opcional (bring-your-own-key). Executa o SYSTEM_PROMPT — o
 * cérebro do sistema — usando a chave que o próprio treinador configura.
 * Tudo é opcional: sem chave, o sistema funciona 100% offline. A IA só auxilia.
 */
const ENDPOINT = "https://api.anthropic.com/v1/messages";

interface MessagesResponse {
  content?: { type: string; text?: string }[];
}

async function call(config: AiConfig, userText: string, maxTokens: number): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_AI_MODEL,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t.slice(0, 200)}`);
  }
  const data: MessagesResponse = await res.json();
  const block = (data.content ?? []).find((b) => b.type === "text");
  return block?.text?.trim() ?? "";
}

function anamneseText(state: StrategyState): string {
  const a = state.anamnese;
  const rows: string[] = [];
  for (const section of ANAMNESE_SECTIONS) {
    for (const field of section.fields) {
      const v = a[field.id];
      if (v != null && String(v).trim() !== "") rows.push(`- ${field.label}: ${v}`);
    }
  }
  return rows.join("\n") || "(anamnese ainda vazia)";
}

/**
 * Memória do treinador: princípios que ele escreveu, padrões das estratégias
 * salvas no histórico e exemplos da escrita dele. A IA não aprende sozinha
 * (cada chamada começa do zero) — é esta memória, enviada junto, que faz as
 * respostas ficarem cada vez mais parecidas com o jeito dele de pensar.
 */
export function trainerMemory(): string {
  try {
    const snapshots = useHistoryStore.getState().snapshots;
    const dna = useDnaStore.getState();
    return trainerMemoryText({
      insights: analyzeHistory(snapshots),
      principios: dna.principles,
      amostras: writingSamples(snapshots, dna.samples.map((x) => x.t)),
    });
  } catch {
    return "";
  }
}

function withMemory(prompt: string): string {
  const mem = trainerMemory();
  if (!mem) return prompt;
  return (
    `${prompt}\n\nMEMÓRIA DO TREINADOR — use para alinhar a resposta ao jeito como ele pensa, ` +
    "decide e escreve. Os dados do aluno atual sempre têm prioridade sobre os padrões; " +
    `não mencione esta memória no texto.\n${mem}`
  );
}

/** Passo 2/3 — análise técnica + resumo executivo (não monta estratégia). */
export function aiDiagnose(config: AiConfig, state: StrategyState): Promise<string> {
  const prompt =
    "Aqui está a anamnese de um aluno. Faça a análise técnica e escreva um RESUMO " +
    "EXECUTIVO curto (máx. 6 linhas), em linguagem clara para o treinador. Aponte " +
    "pontos de atenção, riscos e oportunidades. NÃO monte estratégia, não sugira " +
    "divisão, exercícios nem periodização.\n\nANAMNESE:\n" +
    anamneseText(state);
  return call(config, withMemory(prompt), 700);
}

/**
 * Envia um bloco de conteúdo (texto + documento/PDF) com um system prompt
 * específico. Usado pela importação de anamnese a partir de PDF.
 */
type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "document";
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    }
  | {
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    };

async function callWithContent(
  config: AiConfig,
  system: string,
  content: ContentBlock[],
  maxTokens: number,
): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t.slice(0, 200)}`);
  }
  const data: MessagesResponse = await res.json();
  const block = (data.content ?? []).find((b) => b.type === "text");
  return block?.text?.trim() ?? "";
}

/** Lista os campos da anamnese (com opções válidas) para guiar a extração. */
function anamneseFieldGuide(): string {
  const lines: string[] = [];
  for (const section of ANAMNESE_SECTIONS) {
    for (const f of section.fields) {
      let line = `- "${f.id}" (${f.label})`;
      if (f.type === "select" && f.options?.length) {
        line += ` — use EXATAMENTE uma destas opções: ${f.options.join(" | ")}`;
      } else if (f.extractHint) {
        line += ` — ${f.extractHint}`;
      } else if (f.type === "number") {
        line += " — apenas o número";
      }
      lines.push(line);
    }
  }
  return lines.join("\n");
}

const ANAMNESE_FIELD_IDS = new Set<string>(
  ANAMNESE_SECTIONS.flatMap((s) => s.fields.map((f) => f.id)),
);

/**
 * Isola o trecho JSON de uma resposta do modelo. Tolera cercas de código
 * fechadas (```json ... ```) OU não fechadas — caso em que a resposta foi
 * truncada — além de texto ao redor.
 */
function jsonSlice(text: string, open: "{" | "[", close: "}" | "]"): string {
  let t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    t = fenced[1].trim();
  } else {
    // cerca de abertura sem fechamento (resposta cortada): remove o prefixo
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  const start = t.indexOf(open);
  if (start > 0) t = t.slice(start);
  const end = t.lastIndexOf(close);
  if (end >= 0) t = t.slice(0, end + 1);
  return t;
}

/** Extrai um objeto JSON de uma resposta, tolerando cercas de código e texto ao redor. */
function extractJsonObject(text: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSlice(text, "{", "}"));
  } catch {
    throw new Error("A IA devolveu uma resposta incompleta ou fora do formato. Tente novamente — se o PDF for muito grande, divida-o.");
  }
  if (!parsed || typeof parsed !== "object") return {};
  return parsed as Record<string, unknown>;
}

const EXTRACT_SYSTEM =
  "Você é um assistente que extrai dados estruturados de documentos de anamnese " +
  "e avaliações físicas para um Personal Trainer. Seja fiel ao documento: nunca " +
  "invente informações que não estejam escritas nele. Não decide estratégia de " +
  "treino — apenas organiza o que já está no PDF.";

/**
 * Lê um PDF de anamnese (em base64, sem o prefixo data:) e devolve os campos da
 * ficha que puderam ser identificados. O treinador sempre revisa o resultado.
 */
export async function aiExtractAnamnese(
  config: AiConfig,
  pdfBase64: string,
): Promise<Partial<Anamnese>> {
  const prompt =
    "Este PDF é a anamnese/avaliação de um aluno. Extraia as informações e " +
    "preencha os campos listados abaixo. Leia o documento INTEIRO com atenção: " +
    "várias respostas aparecem dentro de textos corridos (parágrafos, respostas " +
    "abertas), não só em campos isolados do formulário — procure em todo o " +
    "conteúdo antes de considerar um campo ausente. Responda APENAS com um " +
    "objeto JSON válido: comece a resposta com { e termine com } — sem nenhum " +
    "texto antes ou depois e sem cercas de código. Mapeie o id do campo para o " +
    "valor extraído. Seja conciso nos valores. Inclua somente os campos que " +
    "você conseguir determinar a partir do documento; omita os demais. Para " +
    "campos com opções, use exatamente uma das opções indicadas. Não invente nada.\n\nCAMPOS:\n" +
    anamneseFieldGuide();

  const raw = await callWithContent(
    config,
    EXTRACT_SYSTEM,
    [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
      { type: "text", text: prompt },
    ],
    8000,
  );

  const parsed = extractJsonObject(raw);
  const out: Partial<Anamnese> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (!ANAMNESE_FIELD_IDS.has(k) || v == null) continue;
    const value = String(v).trim();
    if (value) out[k as keyof Anamnese] = value;
  }
  return out;
}

/** Extrai um array de strings de uma resposta, tolerando cercas de código e texto ao redor. */
function extractStringArray(text: string): string[] {
  try {
    const parsed = JSON.parse(jsonSlice(text, "[", "]")) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean).slice(0, 6);
    }
  } catch {
    /* resposta fora do formato — devolve vazio */
  }
  return [];
}

/**
 * Gera sugestões de resposta para uma pergunta aberta da entrevista (ex.: o
 * "porquê" de uma decisão), no tom do Montinho e a partir do contexto do aluno.
 * O treinador clica para inserir e continua livre para editar/acrescentar.
 */
export async function aiSuggestAnswers(
  config: AiConfig,
  question: string,
  state: StrategyState,
  extraContext?: string,
): Promise<string[]> {
  const context = anamneseText(state) + (extraContext ? `\n\n${extraContext}` : "");
  const prompt =
    "Você é o Personal Trainer preenchendo o seu planejamento. Para a pergunta abaixo, " +
    "gere 4 sugestões de resposta curtas (1 a 2 frases cada), em primeira pessoa, na voz de " +
    "um Personal falando direto com o aluno em linguagem simples (este texto será mostrado ao " +
    "aluno no relatório). As sugestões devem ser variadas entre si, coerentes com o contexto e " +
    "prontas para usar. Não invente dados específicos do aluno que não estejam no contexto. " +
    "Responda APENAS com um array JSON de strings, sem comentários.\n\n" +
    `PERGUNTA: ${question}\n\nCONTEXTO DO ALUNO:\n${context}`;
  const raw = await call(config, withMemory(prompt), 800);
  return extractStringArray(raw);
}

/** Extrai um array de objetos de volume ({grupo, series}) de uma resposta JSON. */
function extractVolumeArray(text: string): VolumeRow[] {
  try {
    const arr = JSON.parse(jsonSlice(text, "[", "]")) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((o) => {
        const obj = (o ?? {}) as Record<string, unknown>;
        const grupo = String(obj.grupo ?? obj.grupoMuscular ?? obj.group ?? obj.musculo ?? "").trim();
        const m = String(obj.series ?? obj["séries"] ?? obj.sets ?? obj.set ?? "").match(/\d+/);
        return { grupo, series: m ? m[0] : "" };
      })
      .filter((r) => r.grupo && r.series);
  } catch {
    return [];
  }
}

const VOLUME_SYSTEM =
  "Você extrai tabelas de volume de treino (grupo muscular e nº de séries semanais) " +
  "de imagens ou textos. Seja fiel ao conteúdo; ignore percentuais, totais e cabeçalhos.";

/**
 * Lê a imagem (print) de uma tabela de volume semanal e devolve as linhas
 * (grupo muscular + nº de séries). O treinador sempre revisa o resultado.
 */
export async function aiExtractVolumeFromImage(
  config: AiConfig,
  imageBase64: string,
  mediaType: string,
): Promise<VolumeRow[]> {
  const prompt =
    "Esta imagem contém uma tabela de volume semanal de treino, com grupos musculares e o " +
    "número de séries por semana de cada um. Extraia cada linha. Responda APENAS com um array " +
    'JSON de objetos no formato {"grupo": "Peito", "series": 12}. Use o número inteiro de séries; ' +
    "ignore percentuais, linhas de total e cabeçalhos. Não invente linhas que não estejam na imagem.";
  const raw = await callWithContent(
    config,
    VOLUME_SYSTEM,
    [
      { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
      { type: "text", text: prompt },
    ],
    1500,
  );
  return extractVolumeArray(raw);
}

/** Reescreve uma seção mantendo as decisões, melhorando a voz do Montinho. */
export function aiRewriteText(
  config: AiConfig,
  title: string,
  text: string,
  state: StrategyState,
): Promise<string> {
  const prompt =
    `Reescreva a seção "${title}" do relatório de treino abaixo, falando DIRETAMENTE ` +
    "com o aluno, na voz de um Personal experiente pelo WhatsApp: primeira pessoa, tom " +
    "pessoal, linguagem simples, parágrafos curtos. Mantenha exatamente as mesmas " +
    "decisões e informações — não invente nada novo, apenas melhore a escrita.\n\n" +
    `TEXTO ATUAL:\n${text}\n\nCONTEXTO DO ALUNO:\n${anamneseText(state)}`;
  return call(config, withMemory(prompt), 600);
}

/**
 * Aprimora uma seção: corrige português/gramática, melhora a escrita na voz do
 * Montinho e pode enriquecer com informação complementar VÁLIDA — sem inventar
 * dados do aluno nem mudar as decisões técnicas que o treinador já tomou.
 */
export function aiEnhanceText(
  config: AiConfig,
  title: string,
  text: string,
  state: StrategyState,
): Promise<string> {
  const prompt =
    `Você é o Personal Trainer escrevendo a seção "${title}" do relatório para o seu ` +
    "aluno. Aprimore o texto abaixo:\n" +
    "1) Corrija todos os erros de português, ortografia, pontuação e gramática.\n" +
    "2) Deixe a escrita mais clara, fluida e profissional, na voz de um Personal " +
    "experiente falando direto com o aluno pelo WhatsApp: primeira pessoa, tom pessoal, " +
    "parágrafos curtos.\n" +
    "3) Você PODE acrescentar explicações complementares que agreguem valor e sejam " +
    "tecnicamente corretas (o porquê de uma escolha, um cuidado importante, um incentivo).\n\n" +
    "REGRAS: nunca invente dados específicos do aluno (números, medidas, diagnósticos, " +
    "lesões) que não estejam no texto; nunca contrarie nem altere as decisões técnicas já " +
    "tomadas pelo treinador; mantenha o mesmo formato — se houver listas com “✓” ou “•”, " +
    "preserve esses marcadores. Responda APENAS com o texto aprimorado, sem comentários.\n\n" +
    `TEXTO ATUAL:\n${text}\n\nCONTEXTO DO ALUNO (use só para dar precisão, não copie cru):\n` +
    anamneseText(state);
  return call(config, withMemory(prompt), 900);
}

/**
 * Painel do treinador: a IA lê o cruzamento de todas as estratégias salvas e
 * escreve um relatório da metodologia do treinador (padrões, pontos cegos,
 * oportunidades). Baseia-se só nos dados — não inventa números.
 */
export function aiMethodologyReport(config: AiConfig, principios: string): Promise<string> {
  const snapshots = useHistoryStore.getState().snapshots;
  const dados = insightsText(analyzeHistory(snapshots));
  const prompt =
    "Você é um consultor sênior de metodologia de treinamento analisando o trabalho do " +
    "Personal Trainer Renato (Montinho). Abaixo está o cruzamento estatístico das estratégias " +
    "que ele montou para os alunos. Escreva um RELATÓRIO DA METODOLOGIA DELE, falando direto " +
    "com ele (\"você\"), em português, com estas seções:\n" +
    "**Sua metodologia em uma frase**\n" +
    "**O que você faz muito bem**\n" +
    "**Padrões nas suas escolhas** (cite os números)\n" +
    "**Pontos cegos e riscos** (só o que os dados sustentam)\n" +
    "**Oportunidades para evoluir** (práticas e específicas)\n" +
    "**Perguntas para você refletir** (2 ou 3)\n\n" +
    "Regras: baseie-se SOMENTE nos dados abaixo; nunca invente números; se a amostra for " +
    "pequena (menos de 5 estratégias), diga isso com clareza e trate as conclusões como " +
    "hipóteses; leve em conta os princípios que ele definiu; seja direto e prático. Formato: " +
    "cada título em **negrito** numa linha própria, itens começando com \"• \", sem tabelas.\n\n" +
    (principios.trim() ? `PRINCÍPIOS QUE ELE DEFINIU:\n${principios.trim()}\n\n` : "") +
    `DADOS DAS ESTRATÉGIAS:\n${dados || "(nenhuma estratégia salva ainda)"}`;
  return call(config, prompt, 1800);
}

/**
 * Comparar ciclos: mensagem de WhatsApp para o aluno explicando o que muda no
 * novo ciclo em relação ao anterior — sem inventar motivos que não estejam
 * nos dados (quando não houver motivo escrito, explica o benefício da mudança).
 */
export function aiCycleMessage(config: AiConfig, nome: string, comparacao: string): Promise<string> {
  const prompt =
    `Escreva uma mensagem curta de WhatsApp do Personal Trainer para o aluno ${nome || "aluno"}, ` +
    "apresentando o NOVO CICLO de treino e explicando o que muda em relação ao ciclo anterior, e por quê. " +
    "Primeira pessoa, tom próximo, linguagem simples, 5 a 9 linhas curtas. Comece reconhecendo a evolução " +
    "do aluno; destaque as 2 a 4 mudanças mais importantes; diga o que se mantém, se fizer sentido; termine " +
    "com um incentivo. Use os motivos escritos pelo treinador quando existirem; quando não houver, explique " +
    "de forma geral o benefício daquela mudança — nunca invente dados do aluno (peso, medidas, lesões). " +
    "Pode usar *negrito* do WhatsApp com moderação; sem títulos e sem listas longas. Responda só com a mensagem.\n\n" +
    `COMPARAÇÃO ENTRE OS CICLOS:\n${comparacao}`;
  return call(config, withMemory(prompt), 700);
}
