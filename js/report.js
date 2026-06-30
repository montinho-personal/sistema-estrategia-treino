/**
 * report.js — Geração do relatório premium (narrativa para o aluno).
 *
 * Transforma as decisões do Personal (entrevista) e a anamnese em um texto
 * escrito DIRETAMENTE para o aluno — como um Personal Trainer premium, claro,
 * motivador, didático e sempre explicando o PORQUÊ de cada decisão.
 *
 * Estrutura (PRD): Saudação · Objetivo · Diagnóstico Atual · Estratégia Geral ·
 * Divisão Escolhida · Como Vamos Evoluir · Estratégia de Repetições ·
 * Estratégia dos Exercícios · Aquecimento · Estratégia de Progressão ·
 * Seu Papel no Processo · Como Avaliaremos sua Evolução · Mensagem Final.
 */
(function (global) {
  'use strict';

  function firstName(nome) {
    return (String(nome || '').trim().split(/\s+/)[0]) || 'atleta';
  }
  function p(text) { return text; }
  function join(parts) { return parts.filter(Boolean).join(' '); }
  function lower(s) { return String(s || '').toLowerCase(); }

  // -------------------------------------------------------------- seções
  function saudacao(d) {
    var nome = firstName(d.aluno);
    return join([
      'Olá, ' + nome + '! Que bom ter você nesse processo.',
      'Este documento não é um treino genérico — é a sua estratégia, construída a partir da sua anamnese, dos seus objetivos e da sua realidade.',
      'Aqui você vai entender não só o QUE vamos fazer, mas principalmente o PORQUÊ de cada decisão. Quando você entende o caminho, fica muito mais fácil percorrê-lo com consistência.'
    ]);
  }

  function objetivo(d) {
    var e = d.entrevista;
    var parts = [];
    if (e.objetivoPrincipal) parts.push('Nosso foco principal neste ciclo é claro: ' + e.objetivoPrincipal + '.');
    if (e.objetivoSecundario) parts.push('Em paralelo, vamos cuidar de um objetivo secundário — ' + e.objetivoSecundario + ' — sempre respeitando a prioridade do que é principal.');
    if (e.prioridade) parts.push('A nossa prioridade número um é: ' + e.prioridade + '. É por ela que as escolhas mais importantes serão guiadas.');
    parts.push('Ter um objetivo bem definido é o que permite escolher as variáveis certas de treino — e medir, de verdade, se estamos evoluindo.');
    return join(parts);
  }

  function diagnostico(d) {
    var c = d.categorias || {};
    var parts = ['Antes de montar qualquer estratégia, olhei com atenção para o seu ponto de partida.'];
    if (c.experiencia) parts.push('Sobre a sua experiência: ' + resume(c.experiencia) + '.');
    if (c.composicao) parts.push('Na composição corporal e nas medidas, considerei: ' + resume(c.composicao) + '.');
    if (c.dores || c.lesoes) {
      var dl = [c.dores, c.lesoes].filter(Boolean).map(resume).join('; ');
      parts.push('Pontos de atenção que vão guiar adaptações: ' + dl + '. Nada aqui é impeditivo — é justamente o que vamos respeitar e fortalecer.');
    }
    if (c.sono || c.estresse) parts.push('Recuperação importa tanto quanto o treino, então sono e estresse entraram na conta da dosagem de volume.');
    if (c.disponibilidade) parts.push('A sua disponibilidade (' + resume(c.disponibilidade) + ') definiu o formato realista do plano — treino bom é o que cabe na sua vida.');
    parts.push('Em resumo: o plano abaixo foi desenhado para a SUA realidade, não para um aluno teórico.');
    return join(parts);
  }

  function estrategiaGeral(d) {
    var e = d.entrevista;
    var parts = ['A lógica geral é simples e poderosa: aplicar o estímulo certo, na dose certa, e progredir de forma sustentável.'];
    if (e.periodizacaoModelo) parts.push('Para isso, organizei o ciclo em uma periodização do tipo ' + e.periodizacaoModelo + ' — ou seja, o treino muda de propósito ao longo das semanas, em vez de fazer sempre a mesma coisa.');
    if (e.volumeEvol) parts.push('O volume (quantidade de trabalho) vai evoluir assim: ' + e.volumeEvol + '.');
    if (e.intensidadeEvol) parts.push('Já a intensidade (o peso e o esforço) seguirá esta lógica: ' + e.intensidadeEvol + '.');
    if (e.deload) parts.push('E, importante: ' + deloadFrase(e.deload));
    return join(parts);
  }

  function deloadFrase(deload) {
    if (/n[ãa]o/i.test(deload) && deload.length < 8) return 'não programei uma semana de deload fixa, mas vou acompanhar a sua fadiga de perto e inserir um alívio se a performance pedir.';
    return 'haverá deload (semana de alívio) — ' + deload + '. Descansar de forma planejada é o que permite avançar sem travar.';
  }

  function divisao(d) {
    var e = d.entrevista;
    var parts = [];
    if (e.divisao) parts.push('A divisão de treino escolhida foi a ' + e.divisao + '.');
    if (e.divisaoPorque) parts.push('Escolhi essa divisão porque ' + e.divisaoPorque + '.');
    if (e.divisaoBeneficios) parts.push('Os principais benefícios dela para você são: ' + e.divisaoBeneficios + '.');
    if (e.divisaoAlternativas) parts.push('Existiam outras opções na mesa, como ' + e.divisaoAlternativas + '.');
    if (e.divisaoDescarte) parts.push('Elas foram descartadas porque ' + e.divisaoDescarte + '.');
    parts.push('Em outras palavras: essa não foi uma escolha aleatória. Foi a que melhor encaixa no seu objetivo, na sua agenda e na sua recuperação.');
    return join(parts);
  }

  function evolucao(d) {
    var fases = (d.entrevista.fases || []);
    if (!fases.length) {
      return 'A nossa evolução vai acontecer por etapas: começamos construindo base e técnica, depois aumentamos o estímulo de forma progressiva e, por fim, colhemos o resultado. Cada fase tem um propósito — e você vai sentir a diferença.';
    }
    var intro = 'Pense no ciclo como uma jornada em ' + fases.length + ' fases, cada uma com um objetivo claro:';
    var corpo = fases.map(function (f, i) {
      return '• Fase ' + (i + 1) + (f.fase ? ' — ' + f.fase : '') + (f.duracao ? ' (' + f.duracao + ')' : '') + ': ' +
        join([f.foco ? 'foco em ' + lower(f.foco) + '.' : '', f.descricao || '']);
    }).join('\n');
    return intro + '\n' + corpo + '\nCada fase prepara a seguinte — é assim que a evolução vira algo previsível, e não sorte.';
  }

  function repeticoes(d) {
    var e = d.entrevista;
    var parts = [];
    if (e.repFaixa) parts.push('A sua estratégia de repetições vai girar em torno da faixa de ' + e.repFaixa + '.');
    if (e.repPorque) parts.push('O motivo é direto: ' + e.repPorque + '.');
    if (e.tecnicas && e.tecnicas.length) {
      parts.push('Ao longo do ciclo, vamos usar recursos como ' + listar(e.tecnicas) + ' — cada um na hora certa, para extrair mais resultado de cada série.');
    }
    if (e.tecnicasQuando) parts.push('Sobre quando essas estratégias entram: ' + e.tecnicasQuando + '.');
    parts.push('A regra de ouro é qualidade antes de quantidade: cada repetição precisa valer a pena.');
    return join(parts);
  }

  function exercicios(d) {
    var e = d.entrevista;
    var parts = [];
    if (e.grupoPrioridade) parts.push('Demos prioridade ao desenvolvimento de ' + e.grupoPrioridade + ', então esse grupo aparece em momentos estratégicos, quando você está com mais energia.');
    if (e.exObrigatorios) parts.push('Alguns exercícios são pilares do seu plano: ' + e.exObrigatorios + '. Eles têm o melhor retorno para o seu objetivo.');
    if (e.exProibidos) parts.push('Por outro lado, evitamos conscientemente: ' + e.exProibidos + '. Menos é mais quando se trata da sua segurança.');
    if (e.adaptacoesDor) parts.push('E fizemos adaptações pensadas para o seu corpo: ' + e.adaptacoesDor + '. Treinar bem é treinar respeitando os seus sinais.');
    parts.push('Cada exercício tem uma função. Nenhum está ali por acaso.');
    return join(parts);
  }

  function aquecimento(d) {
    var e = d.entrevista;
    var parts = ['Todo treino começa com um ritual de preparo — ele reduz risco e melhora muito as primeiras séries.'];
    if (e.aquecimento) parts.push('O aquecimento geral será: ' + e.aquecimento + '.');
    if (e.mobilidade) parts.push('Mobilidade: ' + e.mobilidade + '.');
    if (e.ativacao) parts.push('Ativação muscular: ' + e.ativacao + '.');
    if (e.core) parts.push('Core e estabilidade: ' + e.core + ' — uma base forte protege a sua coluna e melhora todos os outros exercícios.');
    return join(parts);
  }

  function progressao(d) {
    var e = d.entrevista;
    var parts = ['Progredir não é "aumentar peso no chute". Vamos seguir critérios claros:'];
    var bullets = [];
    if (e.progCarga) bullets.push('• Aumentar a carga quando: ' + e.progCarga + '.');
    if (e.progVolume) bullets.push('• Aumentar o volume quando: ' + e.progVolume + '.');
    if (e.progTroca) bullets.push('• Trocar exercícios quando: ' + e.progTroca + '.');
    if (e.progReducao) bullets.push('• Reduzir o volume quando: ' + e.progReducao + '.');
    var corpo = bullets.length ? '\n' + bullets.join('\n') : ' a sobrecarga será progressiva e baseada na sua resposta real ao treino.';
    return parts[0] + corpo + '\nÉ esse controle que garante evolução contínua, sem estagnar e sem se machucar.';
  }

  function papel(d) {
    var parts = [
      'A estratégia é minha responsabilidade. A execução é a nossa parceria.',
      'O seu papel é simples e decisivo: treinar com consistência, respeitar a técnica, cuidar do sono e da alimentação, e ser honesto comigo sobre como está se sentindo.'
    ];
    if (d.entrevista.orientacoes) parts.push('Uma orientação especial para você: ' + d.entrevista.orientacoes + '.');
    parts.push('Resultado é a soma de boas decisões repetidas. Eu cuido do plano; você cuida da constância. Juntos, a conta fecha.');
    return join(parts);
  }

  function avaliacao(d) {
    var fb = d.entrevista.feedback || [];
    var parts = ['Para ajustar o plano com precisão, vou acompanhar a sua evolução de perto.'];
    if (fb.length) parts.push('Toda semana, vou pedir que você me envie: ' + listar(fb) + '. Não é burocracia — são os dados que me permitem decidir o próximo passo com segurança.');
    parts.push('Com essas informações em mãos, ajustamos o que for preciso. O plano é vivo: ele evolui com você.');
    return join(parts);
  }

  function mensagemFinal(d) {
    var nome = firstName(d.aluno);
    return join([
      nome + ', você acabou de ler uma estratégia feita sob medida para você.',
      'Agora começa a parte mais importante: a execução, dia após dia.',
      'Eu vou estar com você em cada etapa — ajustando, cobrando e comemorando junto.',
      'Confie no processo, respeite o seu corpo e mantenha a constância. O resultado é consequência. Bora pra cima! 💪'
    ]);
  }

  // -------------------------------------------------------------- utilidades
  function resume(text, max) {
    var t = String(text || '').replace(/\n+/g, '; ').replace(/\s+/g, ' ').trim();
    max = max || 220;
    return t.length > max ? t.slice(0, max).trim() + '…' : t;
  }
  function listar(arr) {
    var a = (arr || []).filter(Boolean);
    if (a.length <= 1) return a.join('');
    return a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
  }

  // ----------------------------------------------- derivados p/ documento/db
  function resumoExecutivo(d) {
    var e = d.entrevista;
    return join([
      (e.objetivoPrincipal ? 'Estratégia com foco em ' + lower(e.objetivoPrincipal) + '.' : 'Estratégia personalizada de treinamento.'),
      (e.periodizacaoModelo ? 'Periodização ' + lower(e.periodizacaoModelo) + (e.divisao ? ', divisão ' + e.divisao + '.' : '.') : (e.divisao ? 'Divisão ' + e.divisao + '.' : '')),
      (e.repFaixa ? 'Trabalho predominante na faixa de ' + lower(e.repFaixa) + '.' : ''),
      'Progressão controlada e acompanhamento semanal para ajuste fino do plano.'
    ]);
  }

  function metas(d) {
    var e = d.entrevista, out = [];
    if (e.objetivoPrincipal) out.push({ titulo: 'Objetivo principal', descricao: e.objetivoPrincipal });
    if (e.objetivoSecundario) out.push({ titulo: 'Objetivo secundário', descricao: e.objetivoSecundario });
    if (e.prioridade) out.push({ titulo: 'Prioridade', descricao: e.prioridade });
    if (e.grupoPrioridade) out.push({ titulo: 'Foco muscular', descricao: e.grupoPrioridade });
    return out;
  }

  function avaliacaoCards(d) {
    // tenta extrair pares "rótulo: valor" da composição corporal
    var c = (d.categorias && d.categorias.composicao) || '';
    var cards = [];
    c.split(/\n|;/).forEach(function (line) {
      var m = line.split(/[:–-]/);
      if (m.length >= 2 && m[0].trim().length <= 24 && m[1].trim()) {
        cards.push({ rotulo: m[0].trim(), valor: m[1].trim().slice(0, 18) });
      }
    });
    return cards.slice(0, 6);
  }

  function recomendacoes(d) {
    return (d.entrevista.feedback || []).map(function (f) {
      return 'Enviar semanalmente: ' + f + '.';
    });
  }

  function deriveTags(d) {
    var bag = [
      d.entrevista.objetivoPrincipal, d.entrevista.objetivoSecundario,
      d.categorias && d.categorias.modalidade, d.categorias && d.categorias.objetivos,
      d.entrevista.grupoPrioridade
    ].join(' ').toLowerCase();
    var dict = {
      'hipertrofia': ['hipertrofia', 'massa', 'muscul'],
      'emagrecimento': ['emagre', 'gordura', 'definic', 'recomp'],
      'força': ['forca', 'força'],
      'performance': ['performance', 'atleta', 'condic'],
      'muay thai': ['muay'],
      'corrida': ['corrida', 'maratona'],
      'dor lombar': ['lombar', 'coluna'],
      'ombro': ['ombro'],
      'joelho': ['joelho'],
      'idosos': ['idoso', 'terceira idade']
    };
    var tags = [];
    Object.keys(dict).forEach(function (tag) {
      if (dict[tag].some(function (w) { return bag.indexOf(w) !== -1; })) tags.push(tag);
    });
    return tags;
  }

  // -------------------------------------------------------------- principal
  function generate(d) {
    var sections = [
      { key: 'saudacao',     title: 'Saudação',                      body: saudacao(d) },
      { key: 'objetivo',     title: 'Seu Objetivo',                  body: objetivo(d) },
      { key: 'diagnostico',  title: 'Diagnóstico Atual',             body: diagnostico(d) },
      { key: 'estrategia',   title: 'Estratégia Geral',              body: estrategiaGeral(d) },
      { key: 'divisao',      title: 'A Divisão Escolhida',           body: divisao(d) },
      { key: 'evolucao',     title: 'Como Vamos Evoluir',            body: evolucao(d) },
      { key: 'repeticoes',   title: 'Estratégia de Repetições',      body: repeticoes(d) },
      { key: 'exercicios',   title: 'Estratégia dos Exercícios',     body: exercicios(d) },
      { key: 'aquecimento',  title: 'Aquecimento e Preparo',         body: aquecimento(d) },
      { key: 'progressao',   title: 'Estratégia de Progressão',      body: progressao(d) },
      { key: 'papel',        title: 'Seu Papel no Processo',         body: papel(d) },
      { key: 'avaliacao',    title: 'Como Avaliaremos sua Evolução', body: avaliacao(d) },
      { key: 'final',        title: 'Mensagem Final',                body: mensagemFinal(d) }
    ];
    return {
      gerado: true,
      resumoExecutivo: resumoExecutivo(d),
      sections: sections
    };
  }

  global.ReportGenerator = {
    generate: generate,
    resumoExecutivo: resumoExecutivo,
    metas: metas,
    avaliacaoCards: avaliacaoCards,
    recomendacoes: recomendacoes,
    deriveTags: deriveTags
  };
})(window);
