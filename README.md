# Sistema Profissional de Estratégias de Treinamento · Montinho Personal

Assistente inteligente, de uso interno, que ajuda o Personal Trainer a
transformar uma simples **anamnese** em uma **apresentação profissional da
estratégia** entregue ao aluno.

> **Não é um gerador automático de treinos.** O sistema funciona como um
> segundo treinador experiente: organiza o raciocínio, faz perguntas
> inteligentes, valida as decisões e gera o material premium. **A decisão final
> é sempre do Personal.**

Aplicação web **sem build e sem servidor** — basta abrir o `index.html`. Tudo é
salvo localmente no navegador (identidade visual, rascunho e banco de alunos).

---

## 🪄 O Wizard (passo a passo)

| Etapa | O que acontece |
|---|---|
| **1 · Anamnese** | Upload do **PDF** da anamnese. O sistema lê o documento, identifica as informações e organiza tudo em **16 categorias** (dados pessoais, objetivos, dores, lesões, sono, composição corporal, etc.). Também é possível preencher manualmente. |
| **2 · Análise** | Revisão das categorias detectadas. *"A análise está correta?"* — só avança após a sua confirmação. |
| **3 · Entrevista estratégica** | **10 perguntas, uma de cada vez** (objetivo, divisão, periodização, repetições, exercícios, aquecimento, cardio, progressão, feedback, orientações). Após cada resposta, o assistente devolve uma **análise técnica** baseada em evidência — sem nunca decidir por você. |
| **4 · Validação** | Resumo completo com checklist (✔ objetivo, divisão, justificativa, periodização, repetições, exercícios, cardio, progressão, feedback). Cada ponto é editável. *"Deseja alterar algum ponto antes de gerar o relatório?"* |
| **5 · Entrega** | Após a sua aprovação, o **relatório premium** é gerado — escrito **diretamente para o aluno**, explicando o porquê de cada decisão. |

## 📦 As três entregas

- 💬 **WhatsApp** — texto humanizado, com títulos, separadores e emojis discretos, pronto para copiar e colar.
- 📄 **PDF Premium** — documento de consultoria: capa, resumo executivo, diagnóstico, narrativa, timeline da periodização, QR Codes, assinatura e rodapé numerado.
- ✨ **Documento na tela** — a mesma apresentação de alto padrão para visualizar e imprimir.

## 👥 Banco de alunos

Cada estratégia pode ser salva no banco local, com **versionamento** e
**tags de pesquisa** (hipertrofia, emagrecimento, dor lombar, muay thai,
idosos, performance…), derivadas automaticamente e editáveis.

## 🎨 Identidade visual

Configurável uma única vez e reutilizada em todas as entregas: logo, nome,
CREF, contatos, cores da marca, tipografia, rodapé, assinatura e QR Codes
(gerados a partir do WhatsApp e Instagram).

## 🧠 Base de conhecimento

As análises técnicas seguem o consenso entre ciência e prática (Schoenfeld,
Helms, Nuckols, Israetel, Beardsley, Zatsiorsky, Verkhoshansky, Bompa,
Thibaudeau, entre outros). Nunca copiam um profissional específico e nunca
substituem a decisão do Personal.

---

## 🚀 Como usar

1. Abra `index.html` no navegador (Chrome, Edge, Firefox ou Safari).
2. Em **Identidade Visual**, configure a marca (uma vez só).
3. Em **Nova Estratégia**, siga o Wizard — ou clique em **Ver exemplo**.

> Para servir localmente: `python3 -m http.server` e acesse `http://localhost:8000`.

## 🧱 Estrutura

```
index.html            Shell do app (sidebar, wizard, modal)
css/
  app.css             Interface (wizard, stepper, entrevista, alunos)
  document.css        Documento/relatório premium (tela, PDF e impressão)
js/
  store.js            Persistência local (marca, rascunho, banco de alunos)
  knowledge.js        Catálogos + análises técnicas baseadas em evidência
  anamnese.js         Leitura do PDF (pdf.js) + categorização automática
  interview.js        As 10 perguntas da entrevista estratégica
  report.js           Geração do relatório (narrativa para o aluno)
  document.js         Documento premium com identidade visual
  whatsapp.js         Versão para WhatsApp
  pdf.js / qr.js      Exportação em PDF (html2pdf) e QR Codes
  students.js         Banco de alunos (lista, busca por tag)
  brand.js            Formulário de identidade visual
  sample-data.js      Estratégia de exemplo
  app.js              Orquestração de todo o fluxo
```

Bibliotecas externas (via CDN): **pdf.js** (leitura da anamnese),
**qrcodejs** (QR Codes) e **html2pdf.js** (exportação em PDF).
