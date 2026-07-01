import { SYSTEM_PROMPT, ANAMNESE_SECTIONS } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import type { AiConfig } from "@/lib/store";
import { DEFAULT_AI_MODEL } from "@/lib/store";

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

/** Passo 2/3 — análise técnica + resumo executivo (não monta estratégia). */
export function aiDiagnose(config: AiConfig, state: StrategyState): Promise<string> {
  const prompt =
    "Aqui está a anamnese de um aluno. Faça a análise técnica e escreva um RESUMO " +
    "EXECUTIVO curto (máx. 6 linhas), em linguagem clara para o treinador. Aponte " +
    "pontos de atenção, riscos e oportunidades. NÃO monte estratégia, não sugira " +
    "divisão, exercícios nem periodização.\n\nANAMNESE:\n" +
    anamneseText(state);
  return call(config, prompt, 700);
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
  return call(config, prompt, 600);
}
