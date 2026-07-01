# Montinho Training Strategy

> Estratégias inteligentes. Resultados consistentes.

Plataforma profissional de uso **exclusivo** do Personal Trainer **Renato
Nascimento (Montinho Personal Trainer)** para construir, organizar, apresentar e
entregar estratégias personalizadas de treinamento.

O sistema **não monta treinos automaticamente** e **não substitui o treinador**.
Ele entrevista o Personal, organiza as decisões dele, escreve um relatório
profissional em tempo real, permite editar e gera uma entrega premium (PDF,
WhatsApp e HTML).

**Não é um gerador de treino. É um assistente estratégico para Personal Trainers.**

---

## Stack

Versão profissional (v2), portada da implementação de referência em JS puro:

| Camada | Tecnologia | Motivo |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** | Padrão premium; caminho nativo para o banco de dados futuro (server actions / route handlers). |
| Linguagem | **TypeScript** (strict) | Tipagem forte, baixo acoplamento. |
| Estilo | **Tailwind CSS v4** + tokens CSS | Design system minimalista (branco/preto/cinza/dourado). |
| UI | **shadcn/ui** (Radix) + **Lucide** | Componentes ownáveis e acessíveis, estética Linear/Stripe. |
| Estado | **Zustand** + persist | Ergonômico, sem boilerplate, LocalStorage hoje / DB depois. |
| Formulários | **React Hook Form** + **Zod** | Zod como fonte única: schema → tipos → validação. |
| Animação | **Framer Motion** | Transições sutis e premium. |
| PDF | **Print CSS** nos mesmos componentes do preview | Garante “Preview === PDF”. |
| Deploy | **Vercel** | DX ideal para Next.js; preview por commit. |

## Arquitetura de pastas

```
app/                    # Rotas (App Router)
  layout.tsx · globals.css · page.tsx    # Home (Módulo 1)
  alunos/                                # Workspace (próximas fases)
components/
  ui/                   # Primitivos shadcn (Button, Badge, ...)
  site/                 # Nav e Footer institucionais
  brand-mark.tsx        # Marca gráfica
lib/
  utils.ts              # cn()
  site-content.ts       # Conteúdo institucional
  domain/               # (próxima fase) lógica pura portada e testada
  store/                # (próxima fase) Zustand
content/
  system-prompt.md      # O "cérebro" do sistema (fonte da verdade)
legacy/                 # Implementação de referência (Módulos 1–8 em JS puro)
```

O princípio central: **`lib/domain` será 100% puro** (sem React), portando a
lógica já validada — entrevista, memória, biblioteca, DNA, relatório, PDF — agora
com tipagem forte. Componentes ficam finos.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint
```

## Fases

1. **Fundação** — scaffold, design system, Home. ✅
2. **Domínio** — Zod + lógica portada (`lib/domain`) + 26 testes. ✅
3. **Dados** — Zustand + persistência (`lib/store`) + 7 testes. ✅
4. Fluxo (Nav, Stepper, Anamnese, Diagnóstico)
5. Entrevista + Memória (dashboard, sugestões, consistência)
6. Biblioteca + DNA
7. Relatório editor (preview = exportação)
8. PDF premium + exportação (PDF/WhatsApp/HTML)
9. Polimento (Framer Motion, a11y, QA)

A pasta [`legacy/`](legacy/) contém a implementação completa e funcional dos 8
módulos em HTML/CSS/JS puro, usada como referência para o port.

---

© Renato Nascimento · Montinho Personal Trainer
