# Arquitetura — Montinho Training Strategy

Documento vivo da arquitetura da versão profissional (Next.js + TypeScript).
Atualizado a cada fase.

## Princípios

1. **Domínio puro e testável.** Toda a lógica de negócio vive em `lib/domain`,
   sem dependência de React ou DOM. Componentes apenas consomem funções puras.
2. **Fonte única de tipos.** Schemas **Zod** definem a forma dos dados; os tipos
   TypeScript são inferidos deles e a mesma validação protege o LocalStorage.
3. **Baixo acoplamento.** UI → stores → domínio. O domínio nunca conhece a UI.
4. **Arquivos pequenos.** Uma responsabilidade por arquivo; componentização.
5. **Persistência abstraída.** LocalStorage hoje via Zustand `persist`; a
   fronteira permite trocar por um banco de dados sem tocar na UI.
6. **Preview === PDF.** O documento premium é renderizado uma vez; a exportação
   PDF usa `@media print` sobre os mesmos componentes, garantindo paridade.

## Camadas

```
┌───────────────────────────────────────────────┐
│  app/ (rotas) + components/ (apresentação)     │  React / Next
├───────────────────────────────────────────────┤
│  lib/store/ (Zustand)                          │  estado + persistência
├───────────────────────────────────────────────┤
│  lib/domain/ (puro, tipado, testado)           │  regras de negócio
│   config · interview · memory · knowledge ·    │
│   voice · report · systemPrompt · schema       │
└───────────────────────────────────────────────┘
```

## Mapa de port (JS legado → TS)

| Legado (`legacy/js`) | Destino | Conteúdo |
| --- | --- | --- |
| `config.js` | `lib/domain/config` + `lib/domain/schema` | tópicos, adaptativas, regras, SYSTEM_PROMPT |
| `interview.js` | `lib/domain/interview.ts` | plano adaptativo, progresso, consistência |
| `memory.js` | `lib/domain/memory.ts` | memória estratégica, status, sugestões |
| `knowledge.js` | `lib/domain/knowledge.ts` | biblioteca + engine + adaptação |
| `voice.js` | `lib/domain/voice.ts` | DNA do Montinho, glossário, revisão de voz |
| `report.js` | `lib/domain/report.ts` | geração do relatório (estrutura fixa) |
| `store.js` | `lib/store/*` | estratégia, marca, preferências, DNA, histórico |
| `workspace.js` | `components/*` + rotas | UI do fluxo |
| `premium.js` | `components/premium/*` | documento premium de 5 páginas |
| `ai.js` | `lib/ai/*` | cliente Anthropic (BYOK) |
| `qr.js` | `components/premium/qr-block.tsx` | QR Codes |

## Fluxo (rotas)

```
/                         Home (identidade)
/alunos                   Lista / histórico de estratégias
/alunos/[id]/anamnese     Passo 1
/alunos/[id]/diagnostico  Passo 2
/alunos/[id]/entrevista   Passo 3 (dashboard "Estratégia em construção")
/alunos/[id]/revisao      Passo 4 (checklist final)
/alunos/[id]/relatorio    Passo 5 (editor + preview + exportação)
```

## Design tokens

Definidos em `app/globals.css` (`:root` + `@theme inline`): `background`,
`foreground`, `primary` (preto), `muted` (cinzas), `gold`/`gold-soft` (dourado,
apenas destaque), `border`, `ring`. Tipografia **Inter** via `next/font`.
