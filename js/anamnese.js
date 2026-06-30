/**
 * anamnese.js — Leitura do PDF da anamnese e categorização automática.
 *
 * Usa pdf.js (carregado via CDN) para extrair o texto do documento e, em
 * seguida, organiza as informações nas categorias do sistema por meio de
 * heurísticas (palavras-chave + leitura de "rótulo: valor"). O Personal sempre
 * revisa e corrige o resultado antes de confirmar — nada é decidido sozinho.
 */
(function (global) {
  'use strict';

  // Sinônimos/gatilhos por categoria. A ordem importa: categorias mais
  // específicas primeiro.
  var RULES = {
    objetivos:      ['objetivo', 'meta', 'pretende', 'deseja', 'quero', 'busca', 'finalidade'],
    lesoes:         ['lesão', 'lesao', 'lesões', 'lesoes', 'cirurgia', 'fratura', 'rompimento', 'tendinite', 'hérnia', 'hernia', 'luxação'],
    dores:          ['dor', 'dores', 'desconforto', 'incômodo', 'incomodo', 'dói', 'doi', 'dolor'],
    mobilidade:     ['mobilidade', 'flexibilidade', 'amplitude', 'postura', 'encurtamento'],
    composicao:     ['peso', 'altura', 'imc', 'gordura', 'percentual', '% gordura', 'massa magra', 'circunferência', 'circunferencia', 'medidas', 'bioimpedância', 'bioimpedancia', 'kg', 'cm'],
    experiencia:    ['experiência', 'experiencia', 'treina há', 'treina ha', 'iniciante', 'intermediário', 'intermediario', 'avançado', 'avancado', 'tempo de treino', 'academia há', 'pratica há'],
    disponibilidade:['disponibilidade', 'dias por semana', 'dias na semana', 'frequência', 'frequencia', 'horário', 'horario', 'quantos dias', 'manhã', 'manha', 'tarde', 'noite'],
    sono:           ['sono', 'dorme', 'horas de sono', 'insônia', 'insonia', 'qualidade do sono'],
    estresse:       ['estresse', 'stress', 'ansiedade', 'estressado', 'nível de estresse', 'nivel de estresse'],
    alimentacao:    ['alimentação', 'alimentacao', 'dieta', 'refeições', 'refeicoes', 'nutrição', 'nutricao', 'proteína', 'proteina', 'come', 'água', 'agua', 'suplement'],
    modalidade:     ['muay thai', 'jiu', 'futebol', 'corrida', 'crossfit', 'natação', 'natacao', 'esporte', 'modalidade', 'luta', 'ciclismo', 'maratona', 'atleta'],
    restricoes:     ['restrição', 'restricao', 'restrições', 'restricoes', 'não pode', 'nao pode', 'evitar', 'proibido', 'contraindicação', 'contraindicacao', 'limitação', 'limitacao', 'medicamento', 'remédio', 'remedio', 'pressão', 'pressao', 'diabete', 'cardíac', 'cardiac'],
    historico:      ['histórico', 'historico', 'já treinou', 'ja treinou', 'parou', 'passado', 'anteriormente', 'há anos', 'ha anos'],
    rotina:         ['rotina', 'trabalho', 'profissão', 'profissao', 'expediente', 'sedentário', 'sedentario', 'dia a dia', 'trabalha'],
    dadosPessoais:  ['nome', 'idade', 'anos', 'nascimento', 'telefone', 'e-mail', 'email', 'profissão', 'sexo', 'whatsapp', 'cpf']
  };

  function normalize(text) {
    return String(text || '')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Quebra o texto em "linhas significativas" (frases / pares rótulo:valor).
  function toLines(text) {
    return text.split(/\n+/)
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 2; });
  }

  function score(line, words) {
    var t = line.toLowerCase();
    var s = 0;
    words.forEach(function (w) { if (t.indexOf(w) !== -1) s++; });
    return s;
  }

  /**
   * Distribui as linhas do texto nas categorias. Cada linha vai para a
   * categoria de maior pontuação; linhas sem correspondência viram observações.
   */
  function categorize(text) {
    var cat = {};
    Object.keys(RULES).forEach(function (k) { cat[k] = []; });
    cat.observacoes = [];

    toLines(text).forEach(function (line) {
      var best = null, bestScore = 0;
      Object.keys(RULES).forEach(function (k) {
        var s = score(line, RULES[k]);
        if (s > bestScore) { bestScore = s; best = k; }
      });
      if (best && bestScore > 0) cat[best].push(line);
      else if (line.length > 8) cat.observacoes.push(line);
    });

    // junta em texto por categoria, limitando ruído
    var out = {};
    Object.keys(cat).forEach(function (k) {
      out[k] = cat[k].slice(0, 12).join('\n');
    });
    return out;
  }

  // ------------------------------------------------------------- pdf.js bridge
  function extractFromPdf(file) {
    return new Promise(function (resolve, reject) {
      var pdfjs = global.pdfjsLib;
      if (!pdfjs) { reject(new Error('Leitor de PDF indisponível (sem conexão).')); return; }

      var reader = new FileReader();
      reader.onload = function () {
        var task = pdfjs.getDocument({ data: new Uint8Array(reader.result) });
        task.promise.then(function (pdf) {
          var pages = [];
          for (var i = 1; i <= pdf.numPages; i++) pages.push(i);
          return pages.reduce(function (chain, n) {
            return chain.then(function (acc) {
              return pdf.getPage(n).then(function (page) {
                return page.getTextContent().then(function (content) {
                  var strings = content.items.map(function (it) { return it.str; });
                  // reconstrói quebras de linha aproximadas pelo "transform Y"
                  var text = '';
                  var lastY = null;
                  content.items.forEach(function (it) {
                    var y = it.transform ? Math.round(it.transform[5]) : null;
                    if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) text += '\n';
                    else if (text && !/\s$/.test(text)) text += ' ';
                    text += it.str;
                    lastY = y;
                  });
                  acc.push(text || strings.join(' '));
                  return acc;
                });
              });
            });
          }, Promise.resolve([])).then(function (all) {
            resolve(normalize(all.join('\n\n')));
          });
        }).catch(reject);
      };
      reader.onerror = function () { reject(new Error('Não foi possível ler o arquivo.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Lê o PDF e devolve { texto, categorias } prontos para revisão.
   */
  function analyzeFile(file) {
    return extractFromPdf(file).then(function (texto) {
      return { texto: texto, categorias: mergeIntoSchema(categorize(texto)) };
    });
  }

  // garante todas as chaves do schema, mesmo as vazias
  function mergeIntoSchema(parsed) {
    var base = Store.emptyCategorias();
    Object.keys(base).forEach(function (k) {
      if (parsed[k]) base[k] = parsed[k];
    });
    return base;
  }

  global.AnamneseReader = {
    analyzeFile: analyzeFile,
    categorize: function (t) { return mergeIntoSchema(categorize(normalize(t))); },
    normalize: normalize
  };
})(window);
