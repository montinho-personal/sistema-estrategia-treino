/**
 * students.js — Banco de Dados de Alunos.
 *
 * Lista as estratégias salvas, permite pesquisar por tag (hipertrofia,
 * emagrecimento, dor lombar, muay thai, idosos, performance…), abrir uma
 * estratégia para revisar/duplicar, ver o histórico de versões e excluir.
 */
(function (global) {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function firstName(n) { return (String(n || '').trim().split(/\s+/)[0]) || '—'; }
  function initials(n) {
    return String(n || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function matches(student, query) {
    if (!query) return true;
    var q = query.toLowerCase();
    var hay = [student.aluno, (student.tags || []).join(' '),
      student.objetivo, student.entrevista && student.entrevista.objetivoPrincipal].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function allTags(students) {
    var set = {};
    students.forEach(function (s) { (s.tags || []).forEach(function (t) { set[t] = (set[t] || 0) + 1; }); });
    return Object.keys(set).sort(function (a, b) { return set[b] - set[a]; });
  }

  function render(container, opts) {
    opts = opts || {};
    var students = Store.getStudents();
    var query = opts.query || '';
    var filtered = students.filter(function (s) { return matches(s, query); });
    var tags = allTags(students);

    var html = '';

    // barra de pesquisa + tags
    html += '<div class="students-bar">' +
      '<input class="students-search" id="studentsSearch" type="search" placeholder="🔎 Pesquisar por nome ou tag (hipertrofia, dor lombar, muay thai…)" value="' + esc(query) + '" />' +
      '</div>';
    if (tags.length) {
      html += '<div class="students-tags">' +
        '<button class="tagchip' + (!query ? ' is-on' : '') + '" data-tag="">Todos (' + students.length + ')</button>' +
        tags.map(function (t) {
          return '<button class="tagchip' + (query.toLowerCase() === t.toLowerCase() ? ' is-on' : '') + '" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('') + '</div>';
    }

    if (!students.length) {
      html += '<div class="empty-state"><div class="empty-state__icon">📂</div>' +
        '<h3>Nenhum aluno salvo ainda</h3>' +
        '<p>Conclua uma estratégia no Wizard e salve para começar o seu banco de dados.</p>' +
        '<button class="btn btn--primary" data-go-wizard>Iniciar nova estratégia</button></div>';
    } else if (!filtered.length) {
      html += '<div class="empty-state"><div class="empty-state__icon">🔍</div>' +
        '<h3>Nada encontrado</h3><p>Tente outra busca ou tag.</p></div>';
    } else {
      html += '<div class="students-grid">';
      filtered.forEach(function (s) {
        var versoes = (s.versoes || []).length || 1;
        html += '<article class="student-card" data-student="' + esc(s.id) + '">' +
          '<div class="student-card__top">' +
            '<div class="student-card__avatar">' + esc(initials(s.aluno)) + '</div>' +
            '<div class="student-card__id"><strong>' + esc(s.aluno || 'Sem nome') + '</strong>' +
              '<span>' + esc(s.objetivo || (s.entrevista && s.entrevista.objetivoPrincipal) || 'Estratégia') + '</span></div>' +
          '</div>' +
          ((s.tags && s.tags.length) ? '<div class="student-card__tags">' + s.tags.map(function (t) { return '<span class="minitag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '<div class="student-card__meta">' +
            '<span>📄 ' + versoes + ' versão' + (versoes > 1 ? 'es' : '') + '</span>' +
            '<span>🗓️ ' + esc(fmtDate(s.atualizadoEm || s.criadoEm)) + '</span>' +
          '</div>' +
          '<div class="student-card__actions">' +
            '<button class="btn btn--primary btn--sm" data-open-student="' + esc(s.id) + '">Abrir</button>' +
            '<button class="btn btn--ghost btn--sm" data-del-student="' + esc(s.id) + '">Excluir</button>' +
          '</div>' +
        '</article>';
      });
      html += '</div>';
    }

    container.innerHTML = html;
  }

  global.StudentsView = { render: render };
})(window);
