# Sistema de Estratégia de Treino · Entrega Final

Módulo de **entrega final** do sistema de estratégias de treino do **Montinho Personal**.
Depois de montar a estratégia do aluno, o sistema pergunta **em qual formato você
quer entregar** e gera um material com alto valor percebido — do jeito que um
cliente pagaria caro para receber.

> Aplicação web, sem build e sem servidor. Basta abrir o `index.html` no navegador.
> Tudo é salvo localmente (no próprio navegador), inclusive a identidade visual,
> que é **reutilizada em todas as entregas futuras**.

## ✨ As três entregas

| | Formato | O que gera |
|---|---|---|
| **1** | 💬 **WhatsApp** | Texto humanizado, com títulos, separadores e emojis discretos — fácil de ler no celular e pronto para copiar e colar (ou abrir direto no WhatsApp). |
| **2** | 📄 **Relatório Premium em PDF** | Documento A4 profissional: capa, resumo executivo, ícones, timeline, QR Codes, rodapé e numeração de páginas. Ótimo no celular e na impressão. |
| **3** | ✨ **Documento com Identidade Visual** | Apresentação de alto padrão na tela: capa elegante, cartões, blocos coloridos de metas, timeline da periodização e infográficos simples. |

As opções 2 e 3 compartilham o **mesmo documento premium** (a opção 3 é a
visualização; a opção 2 exporta esse documento para PDF e também permite imprimir).

## 🎨 Personalização da marca

Tudo configurável uma única vez em **Identidade Visual** e reaproveitado em todos
os relatórios:

- Logo, nome da empresa, nome do Personal e CREF
- Telefone, WhatsApp, Instagram, site, e-mail e endereço
- Cores da marca (primária, secundária, fundo da capa e texto)
- Tipografia (títulos e corpo)
- Rodapé, assinatura digital e QR Codes (WhatsApp e Instagram)

Os QR Codes são gerados automaticamente a partir do WhatsApp e do Instagram
informados.

## 🚀 Como usar

1. Abra `index.html` no navegador (Chrome, Edge, Firefox ou Safari).
2. Em **Identidade Visual**, configure a marca do Montinho Personal (uma vez só).
3. Em **Estratégia / Aluno**, preencha os dados — ou clique em **Carregar exemplo**
   para ver o sistema funcionando na hora.
4. Em **Entrega Final**, escolha o formato e gere o material.

> Dica: para servir localmente em vez de abrir o arquivo direto:
> `python3 -m http.server` e acesse `http://localhost:8000`.

## 🧱 Estrutura

```
index.html              Shell da aplicação (navegação + modal)
css/
  app.css               Interface (editor, cards, formulários)
  document.css          Documento/relatório premium (tela, PDF e impressão)
js/
  store.js              Persistência local (identidade visual + estratégia)
  sample-data.js        Estratégia de exemplo
  qr.js                 Geração de QR Codes (WhatsApp / Instagram)
  brand.js              Formulário de identidade visual
  strategy.js           Formulário da estratégia (com listas repetíveis)
  whatsapp.js           Gerador do texto para WhatsApp
  document.js           Renderização do documento premium
  pdf.js                Exportação para PDF (A4)
  app.js                Orquestração geral
```

## 🔌 Dependências externas

Carregadas via CDN (necessário acesso à internet na primeira vez):

- [`qrcodejs`](https://github.com/davidshimjs/qrcodejs) — QR Codes
- [`html2pdf.js`](https://github.com/eKoopmans/html2pdf.js) — exportação em PDF
- Google Fonts (`Inter`, `Sora`)

Sem internet, a aplicação continua funcionando para edição e para a entrega de
WhatsApp; a geração de PDF e os QR Codes exigem as bibliotecas acima.

---

Feito para transmitir **profissionalismo, organização, exclusividade e alto padrão
de atendimento** — fortalecendo a marca **Montinho Personal**.
