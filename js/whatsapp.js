/**
 * whatsapp.js — Gera texto otimizado para WhatsApp.
 * Fácil de ler no celular, títulos destacados, separadores, emojis discretos,
 * linguagem humanizada e sem blocos enormes. Pronto para copiar e colar.
 */
(function (global) {
  'use strict';

  var SEP = '━━━━━━━━━━━━━━━';

  function fmtDate(iso) {
    var d = iso ? new Date(iso + 'T00:00:00') : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function build(strategy, brand) {
    var s = strategy, b = brand;
    var L = [];
    var first = (s.aluno || '').trim().split(' ')[0] || 'atleta';

    // Cabeçalho
    L.push('🎯 *ESTRATÉGIA PERSONALIZADA DE TREINO*');
    L.push('_' + (b.empresa || 'Personal') + '_');
    L.push(SEP);
    L.push('');
    L.push('Olá, *' + first + '*! 👋');
    L.push('Preparei a sua estratégia completa com muito cuidado. Bora pra cima! 💪');
    L.push('');

    if (s.objetivo) {
      L.push('🏆 *Objetivo*');
      L.push(s.objetivo);
      L.push('');
    }

    if (s.resumoExecutivo) {
      L.push('📌 *Resumo*');
      L.push(s.resumoExecutivo);
      L.push('');
    }

    if (s.avaliacao && s.avaliacao.length) {
      L.push(SEP);
      L.push('📊 *Sua avaliação*');
      s.avaliacao.forEach(function (a) {
        L.push('• ' + a.rotulo + ': *' + a.valor + '*');
      });
      L.push('');
    }

    if (s.metas && s.metas.length) {
      L.push(SEP);
      L.push('🚀 *Metas*');
      s.metas.forEach(function (m) {
        L.push('✅ *' + m.titulo + '* — ' + m.descricao);
      });
      L.push('');
    }

    if (s.periodizacao && s.periodizacao.length) {
      L.push(SEP);
      L.push('🗓️ *Periodização*');
      L.push('');
      s.periodizacao.forEach(function (p, i) {
        L.push('*' + (i + 1) + '. ' + p.fase + '*');
        if (p.duracao) L.push('⏱️ ' + p.duracao + (p.foco ? '  ·  🎯 ' + p.foco : ''));
        if (p.descricao) L.push(p.descricao);
        L.push('');
      });
    }

    if (s.treinos && s.treinos.length) {
      L.push(SEP);
      L.push('🏋️ *Divisão de treinos*');
      L.push('');
      s.treinos.forEach(function (t) {
        L.push('📍 *' + t.dia + '* — ' + t.grupo);
        if (t.detalhe) L.push('_' + t.detalhe + '_');
      });
      L.push('');
    }

    if (s.recomendacoes && s.recomendacoes.length) {
      L.push(SEP);
      L.push('💡 *Recomendações*');
      s.recomendacoes.forEach(function (r) { L.push('• ' + r); });
      L.push('');
    }

    if (s.observacoes) {
      L.push(SEP);
      L.push('📝 *Observações*');
      L.push(s.observacoes);
      L.push('');
    }

    // Rodapé
    L.push(SEP);
    L.push('Qualquer dúvida, é só me chamar por aqui. Estou com você em cada treino! 🤝');
    L.push('');
    L.push('*' + (b.personal || b.empresa || '') + '*' + (b.cref ? ' · ' + b.cref : ''));
    var contatos = [];
    if (b.instagram) contatos.push('📷 @' + String(b.instagram).replace(/^@/, ''));
    if (b.site) contatos.push('🌐 ' + b.site);
    if (contatos.length) L.push(contatos.join('   '));
    L.push('🗓️ ' + fmtDate(s.dataElaboracao));

    return L.join('\n');
  }

  global.WhatsAppFormat = { build: build };
})(window);
