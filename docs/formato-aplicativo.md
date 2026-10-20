# Pacote da estratégia para o aplicativo de treino

Gerado no **Relatório → Aplicativo de treino** ("Copiar dados para o app" ou
"Baixar arquivo para o app"). JSON em UTF-8, formato `montinho-estrategia`,
versão `1`. Código: `lib/domain/app-export.ts`.

```jsonc
{
  "formato": "montinho-estrategia",
  "versao": 1,
  "geradoEm": "2026-10-20T13:00:00.000Z",
  "aluno": {
    "nome": "Carol Zorzi",
    "dataNascimento": "1979-02-10",   // AAAA-MM-DD ou null
    "idade": 47,                       // calculada pela data de nascimento
    "sexo": "Feminino",
    "email": "carol@email.com",        // minúsculas, validado, ou null
    "whatsapp": "5511988887777",       // só dígitos, com DDI 55, ou null
    "modalidade": "Online"
  },
  "plano": {
    "titulo": "Missão Musa do Green Valley",
    "objetivo": "Hipertrofia",
    "experiencia": "Intermediário",
    "diasPorSemana": 4,
    "minutosPorSessao": 60,
    "prioridadeMuscular": ["Glúteos", "Costas"],
    "estrategiasDePrioridade": ["Maior frequência semanal"],
    "divisao": "Lower / Upper / Lower / Full Body",
    "frequenciaPorGrupo": "2x por semana",
    "volumeSemanal": [{ "grupo": "Glúteos", "series": 16 }],
    "intensidade": ["Pirâmide crescente", "Bi-set"],
    "faixaDeRepeticoes": "8–12 (hipertrofia)",
    "periodizacao": "Fase 1 adaptação (4 semanas) / ...",
    "aquecimento": ["Aquecimento", "Mobilidade"],
    "selecaoDeExercicios": ["..."],
    "exerciciosChave": "Agachamento livre",
    "exerciciosAEvitar": "Leg press 45°",
    "cardio": ["Caminhada inclinada 20 min"],   // [] = sem cardio
    "progressao": ["Dupla progressão (repetições → carga)"]
  },
  "cuidados": { "dores": null, "lesoes": null, "limitacoes": null },
  "decisoes": [
    { "id": "divisao_qual", "tema": "Divisão do treinamento", "pergunta": "Qual divisão será utilizada?", "resposta": "ABC" }
  ]
}
```

Campos ausentes vêm como `null` (ou lista vazia). `decisoes` traz todas as
respostas da entrevista, inclusive os "porquês", para o app exibir o que quiser.
