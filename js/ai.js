/* =========================================================================
   Montinho Training Strategy — Camada de IA (opcional, bring-your-own-key)
   Executa o SYSTEM_PROMPT (o cérebro) usando a chave que o próprio treinador
   configura. Tudo é opcional: sem chave, o sistema funciona 100% offline com
   a lógica determinística. A IA apenas AUXILIA — nunca decide.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.AI = (function () {
  var ENDPOINT = 'https://api.anthropic.com/v1/messages';
  var DEFAULT_MODEL = 'claude-sonnet-5';

  function cfg() { return MTS.Store.getAI(); }
  function isConfigured() { return !!(cfg() && cfg().key); }

  function call(userText, maxTokens) {
    var c = cfg();
    if (!c || !c.key) return Promise.reject(new Error('IA não configurada.'));
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': c.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: c.model || DEFAULT_MODEL,
        max_tokens: maxTokens || 1024,
        system: MTS.SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userText }]
      })
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error('API ' + r.status + ': ' + t.slice(0, 200));
        });
      }
      return r.json();
    }).then(function (data) {
      var block = (data.content || []).find(function (b) { return b.type === 'text'; });
      return block ? block.text.trim() : '';
    });
  }

  function anamneseText(a) {
    var rows = [];
    (MTS.ANAMNESE || []).forEach(function (sec) {
      sec.fields.forEach(function (f) {
        var v = a[f.id];
        if (v != null && String(v).trim() !== '') rows.push('- ' + f.label + ': ' + v);
      });
    });
    return rows.join('\n') || '(anamnese ainda vazia)';
  }

  /* Passo 2/3 — análise técnica + resumo executivo. Não monta estratégia. */
  function diagnose(state) {
    var prompt =
      'Aqui está a anamnese de um aluno. Faça a análise técnica e escreva um ' +
      'RESUMO EXECUTIVO curto (máx. 6 linhas), em linguagem clara para o treinador. ' +
      'Aponte pontos de atenção, riscos e oportunidades. NÃO monte estratégia, ' +
      'não sugira divisão, exercícios nem periodização.\n\nANAMNESE:\n' +
      anamneseText(state.anamnese || {});
    return call(prompt, 700);
  }

  /* Passo 5 — transforma as respostas do treinador em texto para o aluno. */
  function topicAnswersText(topic, state) {
    var A = state.answers || {};
    var rows = [];
    MTS.Interview.questionsForTopic(topic, state).forEach(function (q) {
      var v = A[q.id];
      if (v == null || String(v).trim() === '') return;
      rows.push('- ' + (q.label || q.prompt) + ': ' + (Array.isArray(v) ? v.join(', ') : v));
    });
    return rows.join('\n') || '(sem respostas ainda)';
  }

  function rewriteSection(topic, state) {
    var prompt =
      'O treinador definiu o bloco "' + topic.name + '" para o aluno abaixo. ' +
      'Reescreva como uma seção do relatório, falando DIRETAMENTE com o aluno, de forma ' +
      'clara, humana e didática (2 a 4 frases). Explique o porquê. Não invente nada além ' +
      'do que o treinador decidiu.\n\n' +
      'DECISÕES DO TREINADOR:\n' + topicAnswersText(topic, state) + '\n\n' +
      'CONTEXTO DO ALUNO:\n' + anamneseText(state.anamnese || {});
    return call(prompt, 500);
  }

  return {
    isConfigured: isConfigured,
    defaultModel: DEFAULT_MODEL,
    diagnose: diagnose,
    rewriteSection: rewriteSection
  };
})();
