/**
 * whatsapp.js — Versão para WhatsApp da estratégia aprovada.
 *
 * Texto humanizado, fácil de ler no celular: títulos em *negrito*, separadores,
 * emojis discretos e blocos curtos. Pronto para copiar e colar.
 */
(function (global) {
  'use strict';

  var SEP = '━━━━━━━━━━━━━━━';

  function fmtDate(iso) {
    var d = iso ? new Date(iso + 'T00:00:00') : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function firstName(n) { return (String(n || '').trim().split(/\s+/)[0]) || 'atleta'; }

  // emoji por seção do relatório
  var EMOJI = {
    objetivo: '🎯', diagnostico: '🔎', estrategia: '🧠', divisao: '🗂️',
    evolucao: '📈', repeticoes: '🔁', exercicios: '🏋️', aquecimento: '🔥',
    progressao: '⏫', papel: '🤝', avaliacao: '📊', final: '💪'
  };

  function build(strategy, brand) {
    var s = strategy, b = brand;
    var rel = s.relatorio || {};
    var L = [];

    L.push('🎯 *SUA ESTRATÉGIA DE TREINO*');
    L.push('_' + (b.empresa || 'Personal') + '_');
    L.push(SEP);
    L.push('');

    var sections = rel.sections || [];
    var saud = sections.filter(function (x) { return x.key === 'saudacao'; })[0];
    if (saud) { L.push(condense(saud.body)); L.push(''); }
    else { L.push('Olá, *' + firstName(s.aluno) + '*! 👋'); L.push('Preparei a sua estratégia com muito cuidado.'); L.push(''); }

    sections.forEach(function (sec) {
      if (sec.key === 'saudacao' || sec.key === 'final') return;
      L.push(SEP);
      L.push((EMOJI[sec.key] || '•') + ' *' + sec.title.toUpperCase() + '*');
      // periodização vira lista de fases
      if (sec.key === 'evolucao' && s.entrevista && s.entrevista.fases && s.entrevista.fases.length) {
        s.entrevista.fases.forEach(function (f, i) {
          L.push('*' + (i + 1) + '. ' + (f.fase || 'Fase') + '*' + (f.duracao ? ' (' + f.duracao + ')' : ''));
          if (f.foco) L.push('🎯 ' + f.foco);
          if (f.descricao) L.push(f.descricao);
        });
      } else {
        L.push(condense(sec.body));
      }
      L.push('');
    });

    // mensagem final em destaque
    var final = sections.filter(function (x) { return x.key === 'final'; })[0];
    L.push(SEP);
    L.push('💪 *VAMOS JUNTOS*');
    L.push(final ? condense(final.body) : 'Confie no processo e mantenha a constância. Estou com você!');
    L.push('');

    L.push(SEP);
    L.push('*' + (b.personal || b.empresa || '') + '*' + (b.cref ? ' · ' + b.cref : ''));
    var contatos = [];
    if (b.instagram) contatos.push('📷 @' + String(b.instagram).replace(/^@/, ''));
    if (b.site) contatos.push('🌐 ' + b.site);
    if (contatos.length) L.push(contatos.join('   '));
    L.push('🗓️ ' + fmtDate(s.dataElaboracao));

    return L.join('\n');
  }

  // transforma o corpo (com bullets •) em texto compacto para WhatsApp
  function condense(body) {
    return String(body || '').split('\n').map(function (l) {
      l = l.trim();
      if (!l) return '';
      return l;
    }).filter(Boolean).join('\n');
  }

  global.WhatsAppFormat = { build: build };
})(window);
