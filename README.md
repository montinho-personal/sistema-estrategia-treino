# Montinho Training Strategy

> Estratégias inteligentes. Resultados consistentes.

Plataforma profissional que auxilia o Personal Trainer **Renato Nascimento
(Montinho Personal Trainer)** a construir, organizar, apresentar e entregar as
estratégias de treinamento dos seus alunos.

O sistema **não** monta treinos automaticamente e **não** substitui o
conhecimento do treinador. Ele organiza o raciocínio do Personal Trainer,
conduz uma entrevista inteligente, estrutura a estratégia e gera documentos
premium que aumentam a percepção de valor da consultoria.

**Não é um gerador de treino. É um assistente estratégico para Personal Trainers.**

---

## Princípios

1. **O treinador sempre decide.** A IA auxilia, questiona e organiza — nunca
   substitui.
2. **Fundamentado em evidências.** Baseado nas metodologias dos maiores
   especialistas da musculação mundial, sempre adaptado ao indivíduo e nunca
   copiado literalmente.
3. **Clareza acima de tudo.** O aluno entende o motivo de cada decisão, sem
   excesso técnico.
4. **Todo documento transmite valor.** O objetivo não é só informar — é
   impressionar.

### A regra mais importante

> "Se eu fosse um aluno pagando uma consultoria premium, eu ficaria
> impressionado ao receber esse material?"

Se a resposta for **não**, o material é melhorado — e o processo se repete até
atingir o nível premium.

---

## Módulo 1 — Fundação & Identidade

Estabelece a base do produto: identidade de marca, princípios, posicionamento,
o fluxo de trabalho e a filosofia de design premium (inspirada em Apple, Notion,
Stripe, Tesla, Nubank, Linear e Vercel — muito espaço em branco, cor mínima,
elegância). Página de entrada em `index.html`.

## Módulo 2 — O cérebro & a entrevista

Traz o **workspace** (`app.html`): a ferramenta que operacionaliza o processo do
system prompt, do primeiro dado à entrega.

- **O cérebro.** O system prompt do consultor vive em
  [`prompts/system-prompt.md`](prompts/system-prompt.md) (fonte da verdade,
  legível) e espelhado em `js/config.js` (constante `SYSTEM_PROMPT`, usada em
  tempo de execução).
- **Anamnese.** Ficha de entrada do aluno, com autosave local.
- **Diagnóstico.** Resumo executivo organizado a partir da anamnese, com pontos
  de atenção e oportunidades. Nunca monta estratégia nesta etapa.
- **Entrevista guiada.** Uma pergunta por vez, na ordem fixa dos 11 tópicos. A
  cada decisão o sistema registra e pergunta o porquê (a *regra das decisões*),
  e faz uma *análise crítica* frente à anamnese.
- **Relatório em tempo real.** À medida que o treinador responde, o documento do
  aluno é escrito — em linguagem clara, explicando o motivo de cada escolha.
- **Versões finais.** Relatório editável, exportação para PDF (impressão) e
  versão pronta para WhatsApp.

O princípio nº 1 é respeitado em todo o fluxo: **o treinador decide, o sistema
apenas organiza e explica.**

### Assistente de IA (opcional, bring-your-own-key)

O workspace funciona 100% offline com a lógica determinística. Opcionalmente, o
treinador pode ligar um assistente com a própria chave da API da Anthropic
(salva apenas no navegador) para gerar o resumo executivo e reescrever seções em
linguagem premium — executando o `SYSTEM_PROMPT`. A IA apenas potencializa;
nunca decide.

### Estrutura

```
index.html            Módulo 1 — página de fundação
app.html              Módulo 2 — workspace (anamnese → diagnóstico → entrevista → relatório)
prompts/
  system-prompt.md    O cérebro do sistema (fonte da verdade)
css/
  app.css             Design system premium (tokens, tipografia, dark mode)
  workspace.css        Estilos do workspace
js/
  app.js              Conteúdo e interações da landing
  config.js           SYSTEM_PROMPT, schema da anamnese, 11 tópicos, regras de auditoria
  store.js            Estado + persistência local (localStorage)
  report.js           Diagnóstico, relatório e versão WhatsApp (determinístico)
  ai.js               Camada de IA opcional (bring-your-own-key)
  workspace.js        Orquestração da UI do workspace
.nojekyll             Serve os arquivos como estão no GitHub Pages
```

### Rodando localmente

Basta abrir o `index.html` no navegador. Ou sirva a pasta:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

---

## Roadmap

| Módulo | Etapa | Status |
| ------ | ----- | ------ |
| 01 | Fundação & Identidade | ✅ Disponível |
| 02 | O cérebro & a entrevista (anamnese, diagnóstico, entrevista, relatório) | ✅ Disponível |
| 03 | Análise crítica & ciência aprofundadas | Em breve |
| 04 | Estratégia estruturada e editável | Em breve |
| 05 | Entrega premium com identidade visual completa | Em breve |

---

© Renato Nascimento · Montinho Personal Trainer
