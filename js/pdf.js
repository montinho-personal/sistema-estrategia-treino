/**
 * pdf.js — Exporta o Documento Premium para PDF (A4) usando html2pdf.
 * Cada .doc-page vira uma página; o documento é otimizado para celular e
 * impressão.
 */
(function (global) {
  'use strict';

  function fileName(strategy, brand) {
    var aluno = (strategy.aluno || 'aluno').trim().replace(/\s+/g, '-').toLowerCase();
    var marca = (brand.empresa || 'estrategia').trim().replace(/\s+/g, '-').toLowerCase();
    return 'estrategia-' + aluno + '-' + marca + '.pdf';
  }

  /**
   * Gera e baixa o PDF a partir de um elemento já renderizado.
   * @param {HTMLElement} node — container com a estrutura .doc
   */
  function generate(node, strategy, brand) {
    if (!global.html2pdf) {
      return Promise.reject(new Error('Biblioteca de PDF indisponível (sem conexão).'));
    }
    var opt = {
      margin: 0,
      filename: fileName(strategy, brand),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.doc-page' }
    };
    return global.html2pdf().set(opt).from(node).save();
  }

  global.PdfExport = { generate: generate, fileName: fileName };
})(window);
