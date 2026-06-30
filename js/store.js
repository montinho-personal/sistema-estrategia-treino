/**
 * store.js — Persistência local da Identidade Visual e da Estratégia.
 *
 * A identidade visual é gravada uma única vez e reutilizada em todas as
 * entregas futuras (WhatsApp, PDF e Documento Premium).
 */
(function (global) {
  'use strict';

  var KEYS = {
    brand: 'mp.brand.v1',
    strategy: 'mp.strategy.v1'
  };

  // ---- Identidade visual padrão (Montinho Personal) -------------------------
  var DEFAULT_BRAND = {
    empresa: 'Montinho Personal',
    personal: 'Montinho',
    cref: 'CREF 000000-G/SP',
    slogan: 'Treino inteligente, resultado real.',
    logoDataUrl: '',          // imagem (base64) opcional
    telefone: '(11) 90000-0000',
    whatsapp: '5511900000000', // somente dígitos, com DDI
    instagram: 'montinhopersonal',
    site: 'www.montinhopersonal.com.br',
    email: 'contato@montinhopersonal.com.br',
    endereco: 'São Paulo · SP',
    // Cores da identidade
    corPrimaria: '#0F766E',    // teal escuro
    corSecundaria: '#F59E0B',  // âmbar
    corFundo: '#0B1220',       // fundo da capa
    corTexto: '#111827',
    // Tipografia
    fonteTitulo: 'Sora',
    fonteTexto: 'Inter',
    // Rodapé e assinatura
    rodape: 'Documento exclusivo · uso pessoal e intransferível',
    assinatura: '',            // imagem (base64) opcional
    mostrarAssinatura: true,
    mostrarQrWhatsapp: true,
    mostrarQrInstagram: true
  };

  // ---- Estratégia padrão (vazia) -------------------------------------------
  var DEFAULT_STRATEGY = {
    aluno: '',
    objetivo: '',
    dataElaboracao: '',        // ISO yyyy-mm-dd; vazio = hoje
    resumoExecutivo: '',
    avaliacao: [],             // [{rotulo, valor}]
    metas: [],                 // [{titulo, descricao}]
    periodizacao: [],          // [{fase, duracao, foco, descricao}]
    treinos: [],               // [{dia, grupo, detalhe}]
    recomendacoes: [],         // [string]
    observacoes: ''
  };

  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return clone(fallback);
      return Object.assign(clone(fallback), JSON.parse(raw));
    } catch (e) {
      return clone(fallback);
    }
  }

  function write(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var Store = {
    DEFAULT_BRAND: DEFAULT_BRAND,
    DEFAULT_STRATEGY: DEFAULT_STRATEGY,

    getBrand: function () { return read(KEYS.brand, DEFAULT_BRAND); },
    saveBrand: function (b) { return write(KEYS.brand, b); },
    resetBrand: function () { global.localStorage.removeItem(KEYS.brand); return clone(DEFAULT_BRAND); },

    getStrategy: function () { return read(KEYS.strategy, DEFAULT_STRATEGY); },
    saveStrategy: function (s) { return write(KEYS.strategy, s); },
    resetStrategy: function () { global.localStorage.removeItem(KEYS.strategy); return clone(DEFAULT_STRATEGY); },

    clone: clone
  };

  global.Store = Store;
})(window);
