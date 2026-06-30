/**
 * store.js — Persistência local (Identidade Visual, rascunho do Wizard e
 * Banco de Dados de Alunos).
 *
 * Tudo é salvo no próprio navegador (localStorage). A identidade visual é
 * configurada uma única vez e reutilizada em todas as entregas. O Wizard
 * trabalha sobre um "rascunho" (draft) que, ao final, é salvo como um aluno
 * no banco de dados — com versionamento e tags de pesquisa.
 */
(function (global) {
  'use strict';

  var KEYS = {
    brand: 'mp.brand.v2',
    draft: 'mp.draft.v2',
    students: 'mp.students.v2'
  };

  // ---- Identidade visual padrão (Montinho Personal) -------------------------
  var DEFAULT_BRAND = {
    empresa: 'Montinho Personal',
    personal: 'Montinho',
    cref: 'CREF 000000-G/SP',
    slogan: 'Estratégia inteligente, resultado real.',
    logoDataUrl: '',
    telefone: '(11) 90000-0000',
    whatsapp: '5511900000000',
    instagram: 'montinhopersonal',
    site: 'www.montinhopersonal.com.br',
    email: 'contato@montinhopersonal.com.br',
    endereco: 'São Paulo · SP',
    corPrimaria: '#0F766E',
    corSecundaria: '#F59E0B',
    corFundo: '#0B1220',
    corTexto: '#111827',
    fonteTitulo: 'Sora',
    fonteTexto: 'Inter',
    rodape: 'Documento exclusivo · uso pessoal e intransferível',
    assinatura: '',
    mostrarAssinatura: true,
    mostrarQrWhatsapp: true,
    mostrarQrInstagram: true
  };

  // ---- Categorias da anamnese (Etapa 1) -------------------------------------
  // Cada categoria é editável pelo Personal após a leitura automática do PDF.
  var ANAMNESE_CATEGORIES = [
    { key: 'dadosPessoais', label: 'Dados pessoais', icon: '🪪' },
    { key: 'objetivos', label: 'Objetivos', icon: '🎯' },
    { key: 'historico', label: 'Histórico', icon: '📜' },
    { key: 'experiencia', label: 'Experiência', icon: '🏋️' },
    { key: 'disponibilidade', label: 'Disponibilidade', icon: '🗓️' },
    { key: 'dores', label: 'Dores', icon: '⚡' },
    { key: 'lesoes', label: 'Lesões', icon: '🩹' },
    { key: 'mobilidade', label: 'Mobilidade', icon: '🤸' },
    { key: 'composicao', label: 'Composição corporal', icon: '📊' },
    { key: 'rotina', label: 'Rotina', icon: '⏰' },
    { key: 'sono', label: 'Sono', icon: '😴' },
    { key: 'estresse', label: 'Estresse', icon: '🧠' },
    { key: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
    { key: 'modalidade', label: 'Modalidade esportiva', icon: '🥊' },
    { key: 'restricoes', label: 'Restrições', icon: '⛔' },
    { key: 'observacoes', label: 'Observações', icon: '📝' }
  ];

  function emptyCategorias() {
    var obj = {};
    ANAMNESE_CATEGORIES.forEach(function (c) { obj[c.key] = ''; });
    return obj;
  }

  // ---- Rascunho/Estratégia padrão (Wizard) ----------------------------------
  var DEFAULT_DRAFT = {
    id: '',
    aluno: '',
    objetivo: '',                 // subtítulo curto (capa)
    dataElaboracao: '',           // ISO; vazio = hoje
    tags: [],                     // pesquisa (hipertrofia, dor lombar, etc.)

    etapa: 'upload',              // controle de progresso do wizard
    anamneseConfirmada: false,

    // Etapa 1 — anamnese categorizada + texto bruto
    categorias: emptyCategorias(),
    anamneseTexto: '',
    anamneseArquivo: '',

    // Etapa 2 — entrevista estratégica (decisões do Personal)
    entrevista: {
      // 1 — objetivo
      objetivoPrincipal: '',
      objetivoSecundario: '',
      prioridade: '',
      // 2 — divisão
      divisao: '',
      divisaoPorque: '',
      divisaoBeneficios: '',
      divisaoAlternativas: '',
      divisaoDescarte: '',
      // 3 — periodização
      periodizacaoModelo: '',
      fases: [],                  // [{fase, duracao, foco, descricao}]
      volumeEvol: '',
      intensidadeEvol: '',
      deload: '',
      // 4 — repetições / intensidade
      repFaixa: '',
      repPorque: '',
      tecnicas: [],               // RIR, RPE, Falha, Cadência, TUT, Isometrias, Avançadas...
      tecnicasQuando: '',
      // 5 — exercícios
      grupoPrioridade: '',
      exObrigatorios: '',
      exProibidos: '',
      adaptacoesDor: '',
      // 6 — aquecimento
      aquecimento: '',
      mobilidade: '',
      ativacao: '',
      core: '',
      // 7 — cardio
      cardioObjetivo: '',
      cardioFrequencia: '',
      cardioIntensidade: '',
      // 8 — progressão
      progCarga: '',
      progVolume: '',
      progTroca: '',
      progReducao: '',
      // 9 — feedback semanal
      feedback: [],               // ['Sono', 'Dor', ...]
      // 10 — orientações
      orientacoes: ''
    },

    // Divisão de treinos opcional (para a timeline/quadro do relatório)
    treinos: [],                  // [{dia, grupo, detalhe}]

    // Etapa 4 — relatório gerado (narrativa para o aluno)
    relatorio: {
      gerado: false,
      resumoExecutivo: '',
      sections: []                // [{key, title, body}]
    },

    criadoEm: '',
    atualizadoEm: ''
  };

  // ---------------------------------------------------------------- helpers
  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return clone(fallback);
      return deepMerge(clone(fallback), JSON.parse(raw));
    } catch (e) {
      return clone(fallback);
    }
  }
  function write(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // mescla preservando objetos aninhados conhecidos (entrevista, relatorio…)
  function deepMerge(base, extra) {
    Object.keys(extra || {}).forEach(function (k) {
      var v = extra[k];
      if (v && typeof v === 'object' && !Array.isArray(v) &&
          base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        base[k] = deepMerge(base[k], v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  // id incremental simples e estável (sem Date.now/Math.random)
  function nextId(students) {
    var max = 0;
    students.forEach(function (s) {
      var n = parseInt(String(s.id).replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return 'al-' + (max + 1);
  }

  var Store = {
    DEFAULT_BRAND: DEFAULT_BRAND,
    DEFAULT_DRAFT: DEFAULT_DRAFT,
    ANAMNESE_CATEGORIES: ANAMNESE_CATEGORIES,
    emptyCategorias: emptyCategorias,
    clone: clone,
    nextId: nextId,

    // --- marca ---
    getBrand: function () { return read(KEYS.brand, DEFAULT_BRAND); },
    saveBrand: function (b) { return write(KEYS.brand, b); },
    resetBrand: function () { global.localStorage.removeItem(KEYS.brand); return clone(DEFAULT_BRAND); },

    // --- rascunho do wizard ---
    getDraft: function () { return read(KEYS.draft, DEFAULT_DRAFT); },
    saveDraft: function (d) { return write(KEYS.draft, d); },
    resetDraft: function () { global.localStorage.removeItem(KEYS.draft); return clone(DEFAULT_DRAFT); },

    // --- banco de dados de alunos ---
    getStudents: function () {
      try { return JSON.parse(global.localStorage.getItem(KEYS.students) || '[]'); }
      catch (e) { return []; }
    },
    saveStudents: function (list) { return write(KEYS.students, list); },

    /**
     * Salva (ou atualiza) o aluno atual no banco, criando uma nova versão do
     * histórico. Retorna o registro salvo.
     */
    upsertStudent: function (draft, dateISO) {
      var list = this.getStudents();
      var record = clone(draft);
      record.atualizadoEm = dateISO || '';

      var idx = -1;
      if (record.id) {
        idx = list.findIndex(function (s) { return s.id === record.id; });
      }

      if (idx === -1) {
        record.id = nextId(list);
        record.criadoEm = dateISO || '';
        record.versoes = [{ data: dateISO || '', resumo: record.relatorio && record.relatorio.resumoExecutivo || '' }];
        list.unshift(record);
      } else {
        var prev = list[idx];
        record.criadoEm = prev.criadoEm || dateISO || '';
        record.versoes = (prev.versoes || []).slice();
        record.versoes.push({ data: dateISO || '', resumo: record.relatorio && record.relatorio.resumoExecutivo || '' });
        list[idx] = record;
      }
      this.saveStudents(list);
      return record;
    },

    getStudent: function (id) {
      return this.getStudents().find(function (s) { return s.id === id; }) || null;
    },

    deleteStudent: function (id) {
      var list = this.getStudents().filter(function (s) { return s.id !== id; });
      this.saveStudents(list);
      return list;
    }
  };

  global.Store = Store;
})(window);
