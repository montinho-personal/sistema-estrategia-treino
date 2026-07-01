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
- **Entrevista guiada.** Base do processo: a ordem fixa dos 11 tópicos e a
  *regra das decisões* (registrar + perguntar o porquê).
- **Relatório em tempo real.** À medida que o treinador responde, o documento do
  aluno é escrito — em linguagem clara, explicando o motivo de cada escolha.
- **Versões finais.** Relatório editável, exportação para PDF (impressão) e
  versão pronta para WhatsApp.

## Módulo 3 — Entrevista inteligente

O coração do sistema: a entrevista deixa de ser um formulário e vira uma
conversa entre dois treinadores. Aprofunda o Módulo 2 com:

- **Múltiplas perguntas por área**, uma de cada vez — nunca um questionário
  enorme.
- **Perguntas adaptativas.** A anamnese é analisada antes de começar e perguntas
  extras entram conforme o perfil: dor, atleta, idoso, emagrecimento,
  hipertrofia, reabilitação. Cada entrevista fica diferente.
- **Auditoria de inconsistências.** Combinações de risco (ex.: força com dor
  aguda, cardio ausente no emagrecimento, técnicas avançadas em iniciante) geram
  um alerta *"rever ou manter?"*. O sistema nunca altera a decisão do treinador —
  apenas pergunta.
- **Revisão / checklist final.** Confirma que todas as áreas foram respondidas
  antes de liberar o relatório. Nunca gera relatório incompleto.

## Módulo 4 — Memória estratégica & dashboard

O sistema deixa de ser só uma entrevista e passa a **construir a estratégia em
tempo real**, com uma memória viva de tudo que foi definido.

- **Memória estratégica.** Um retrato organizado do aluno nas 11 áreas do PRD
  (👤 Aluno, 🎯 Objetivo, 🧠 Filosofia, 🏋 Divisão, 🔥 Intensidade,
  📈 Periodização, 🦵 Exercícios, 🤸 Mobilidade, 🏃 Cardio, 📊 Progressão,
  📲 Feedback), atualizado a cada resposta. Acesse por **“Estratégia”** na barra
  superior ou por **“Ver estratégia completa”**.
- **Painel “Estratégia em construção”.** Durante a entrevista, um dashboard com
  barra de progresso em blocos e porcentagem, e o status de cada área
  (✓ concluída · ● em andamento · ○ pendente). Alterne com o relatório em tempo
  real.
- **Sugestões oportunas.** O sistema aponta lacunas (progressão não definida,
  falta de adaptação para uma limitação, etc.) — sem nunca obrigar.
- **Consistência.** Cada resposta é comparada com a memória; conflitos (ex.:
  hipertrofia × força) geram o alerta *“alterar ou manter?”*.
- **Edição a qualquer momento.** Alterar uma decisão atualiza memória, painel e
  relatório na hora, sem reiniciar a entrevista.
- **Versões finais.** A revisão pergunta *“deseja alterar algo antes de gerar?”*
  e o relatório oferece as três versões do PRD: WhatsApp, PDF Premium ou ambos.
- **Histórico de estratégias.** Snapshots salvos localmente — base para a visão
  de futuro (comparar ciclos, reutilizar planejamentos, banco por perfil).

## Módulo 5 — Biblioteca inteligente (Knowledge Base)

Uma biblioteca interna de conhecimento que fundamenta cada decisão durante a
entrevista — sempre em linguagem simples para o aluno, nunca substituindo o
treinador.

- **Justificativas automáticas.** Ao escolher uma estratégia (Upper/Lower,
  Pirâmide decrescente, Drop-set, Falha, etc.), a biblioteca responde sozinha:
  o que é, por que usar, benefícios, riscos, quando usar, quando evitar e como
  explicar ao aluno.
- **Base científica.** Prioriza o consenso entre evidências atuais e experiência
  prática; nunca copia nem defende opiniões isoladas.
- **Adaptação por perfil.** A mesma estratégia é explicada de forma diferente
  para atleta, idoso, emagrecimento, reabilitação, iniciante, etc.
- **Nível de confiança.** Cada entrada carrega um nível (muito alto → baixo) e
  avisa quando a evidência é limitada.
- **Enriquecimento automático do relatório.** As justificativas técnicas entram
  sozinhas no documento — o treinador não precisa escrevê-las.
- **Aprendizado de preferências.** O sistema aprende as escolhas recorrentes do
  treinador para personalizar as próximas entrevistas (sem substituir a ciência).
- **Biblioteca navegável.** Botão **“Biblioteca”** com busca e todas as entradas.

## Módulo 6 — DNA do Montinho

Define como o sistema escreve e se comunica, para que todo relatório pareça
escrito pelo próprio Renato — nunca por uma IA.

- **Voz pessoal.** O relatório fala com o aluno como um Personal pelo WhatsApp:
  tom em primeira pessoa (“Escolhi…”, “Neste ciclo, nosso foco será…”), leve,
  organizado e fácil de entender.
- **Linguagem simples.** Um glossário traduz o técnico (ex.: “densidade de
  treino” → “diminuir os intervalos para aumentar o estímulo”), com um botão
  **“Aplicar linguagem simples”**.
- **Revisão de voz.** Antes de gerar, o sistema pergunta *“esse texto parece
  realmente escrito pelo Montinho?”* e aponta parágrafos longos, jargão, frases
  genéricas e falta de tom pessoal.
- **DNA do Montinho.** Uma memória viva que aprende o jeito do treinador
  (métodos preferidos, valoriza mobilidade, prioriza aderência, começa com
  adaptação, explica cada decisão…) e personaliza a comunicação — acessível pelo
  botão **“DNA”**. Nunca substitui a ciência.

## Módulo 7 — Geração do relatório

Transforma as decisões da entrevista numa **apresentação profissional** para o
aluno, em estrutura fixa e sempre respondendo *por quê*.

- **Três perguntas.** Todo relatório responde: qual é o meu objetivo, por que
  meu treino foi montado assim e como vamos chegar lá.
- **Estrutura fixa (nunca alterada):** Abertura · Objetivo · Diagnóstico · Nossa
  Estratégia · Divisão · Intensidade · Periodização · Mobilidade · Progressão ·
  Seu Papel no Processo · Mensagem Final.
- **Diagnóstico para o aluno.** Resume a anamnese (nunca copia): pontos fortes,
  pontos de atenção e potencial — sem assustar, sempre com solução.
- **Intensidade explicada.** Cada recurso (falha, RIR, cadência, drop-set…) é
  explicado, nunca apenas listado.
- **Seu papel = checklist.** O que o treinador precisa receber toda semana.
- **Mensagem final exclusiva**, adaptada ao perfil (atleta → performance,
  emagrecimento → consistência, idoso → saúde, hipertrofia → construção
  muscular).
- **Feito para o celular:** parágrafos curtos, listas e checklists; versão
  WhatsApp com emojis discretos e versão PDF para impressão.

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
app.html              Workspace: anamnese → diagnóstico → entrevista → revisão → relatório
prompts/
  system-prompt.md    O cérebro do sistema (fonte da verdade)
css/
  app.css             Design system premium (tokens, tipografia, dark mode)
  workspace.css        Estilos do workspace
js/
  app.js              Conteúdo e interações da landing
  config.js           SYSTEM_PROMPT, anamnese, 11 tópicos + perguntas, adaptativas, auditorias
  store.js            Estado + persistência local + histórico + preferências do treinador
  interview.js        Motor da entrevista: plano adaptativo, progresso, inconsistências, checklist
  memory.js           Memória estratégica: estrutura por área, status do dashboard, sugestões
  knowledge.js        Knowledge Base: entradas, matcher, adaptação por perfil, confiança
  voice.js            DNA do Montinho: voz pessoal, glossário, revisão de voz, insights
  report.js           Geração do relatório: estrutura fixa, diagnóstico ao aluno, WhatsApp/PDF
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
| 02 | O cérebro & o workspace (anamnese, diagnóstico, entrevista, relatório) | ✅ Disponível |
| 03 | Entrevista inteligente (adaptativa, auditoria, checklist) | ✅ Disponível |
| 04 | Memória estratégica & dashboard (painel, sugestões, histórico) | ✅ Disponível |
| 05 | Biblioteca inteligente (justificativas automáticas, confiança, preferências) | ✅ Disponível |
| 06 | DNA do Montinho (voz pessoal, linguagem simples, revisão de voz, aprendizado) | ✅ Disponível |
| 07 | Geração do relatório (estrutura fixa, diagnóstico ao aluno, mensagem exclusiva) | ✅ Disponível |

---

© Renato Nascimento · Montinho Personal Trainer
