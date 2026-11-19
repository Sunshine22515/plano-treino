// Aba Perfil: nome e progressão de carga por exercício.

// --- Progresso de carga ---

// Compara a maior carga da primeira semana com a da última, em cada exercício.
function calcularProgressao(lista) {
  const porExercicio = new Map();
  lista.filter(serie => serie.carga !== null).forEach(serie => {
    const semanas = porExercicio.get(serie.exercicio) ?? new Map();
    semanas.set(serie.semana, Math.max(semanas.get(serie.semana) ?? 0, Number(serie.carga)));
    porExercicio.set(serie.exercicio, semanas);
  });

  return [...porExercicio.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([exercicio, semanas]) => {
      const numeros = [...semanas.keys()].sort((a, b) => a - b);
      const primeira = numeros[0];
      const ultima = numeros[numeros.length - 1];
      const cargaInicial = semanas.get(primeira);
      const cargaFinal = semanas.get(ultima);
      // Sem duas semanas, ou partindo de carga zero, não existe porcentagem para mostrar.
      const percentual = primeira !== ultima && cargaInicial > 0
        ? ((cargaFinal - cargaInicial) / cargaInicial) * 100
        : null;
      // A maior carga de cada semana, para mostrar a evolução quando o grupo é aberto.
      const historico = numeros.map(semana => ({ semana, carga: semanas.get(semana) }));
      return { exercicio, primeira, ultima, cargaInicial, cargaFinal, percentual, historico };
    });
}

function formatarPercentual(valor) {
  const arredondado = Math.round(valor * 10) / 10;
  const sinal = arredondado > 0 ? '+' : '';
  return `${sinal}${arredondado.toLocaleString(LOCALIDADE, { maximumFractionDigits: 1 })}%`;
}

// "▲ +12,5%", "▼ −5%" ou "novo". A seta e o sublinhado da queda não dependem de cor.
function criarValorProgressao(percentual) {
  const valor = document.createElement('span');
  valor.className = 'progressao-valor';
  if (percentual === null) {
    valor.textContent = t('novo');
    valor.classList.add('sem-comparacao');
    return valor;
  }
  const seta = percentual > 0 ? '▲ ' : percentual < 0 ? '▼ ' : '= ';
  valor.textContent = seta + formatarPercentual(percentual);
  valor.classList.toggle('queda', percentual < 0);
  return valor;
}

// Um exercício dentro do grupo aberto: nome, progressão e a maior carga de cada semana.
function criarExercicioProgresso(linha) {
  const item = document.createElement('li');
  item.className = 'exercicio-progresso';

  const topo = document.createElement('div');
  topo.className = 'exercicio-progresso-topo';
  const nome = document.createElement('span');
  nome.className = 'exercicio-progresso-nome';
  nome.textContent = nomeExercicio(linha.exercicio);
  topo.append(nome, criarValorProgressao(linha.percentual));

  const semanas = document.createElement('ol');
  semanas.className = 'semanas-carga';
  semanas.setAttribute('aria-label', t('Maior carga de cada semana'));
  semanas.append(...linha.historico.map(({ semana, carga }) => {
    const passo = document.createElement('li');
    const rotulo = document.createElement('span');
    rotulo.textContent = t('Sem. {n}', { n: semana });
    const peso = document.createElement('strong');
    peso.textContent = `${formatarCargaCampo(carga)} kg`;
    passo.append(rotulo, peso);
    return passo;
  }));

  item.append(topo, semanas);
  return item;
}

// Progresso por grupo muscular. Cada grupo é uma linha com uma seta para baixo; ao tocar, abre os exercícios.
// Usa <details>, que o navegador já sabe abrir e fechar, inclusive pelo teclado.
function desenharTabelaProgresso(recipiente, vazio, listaSeries) {
  const linhas = calcularProgressao(listaSeries);
  vazio.hidden = linhas.length > 0;
  if (linhas.length === 0) {
    recipiente.replaceChildren();
    return;
  }

  // Agrupa pelo grupo principal de cada exercício, na ordem do catálogo.
  const ordemDosGrupos = [...Object.keys(CATALOGO), 'Outros'];
  const porGrupo = new Map();
  linhas.forEach(linha => {
    const grupo = buscarExercicio(linha.exercicio).grupo;
    porGrupo.set(grupo, [...(porGrupo.get(grupo) ?? []), linha]);
  });
  const posicaoDoGrupo = grupo => {
    const posicao = ordemDosGrupos.indexOf(grupo);
    return posicao === -1 ? ordemDosGrupos.length : posicao;
  };
  const grupos = [...porGrupo.entries()].sort(([a], [b]) => posicaoDoGrupo(a) - posicaoDoGrupo(b));

  recipiente.replaceChildren(...grupos.map(([grupo, doGrupo]) => {
    doGrupo.sort((a, b) => nomeExercicio(a.exercicio).localeCompare(nomeExercicio(b.exercicio), LOCALIDADE));
    const comPercentual = doGrupo.filter(linha => linha.percentual !== null);
    const media = comPercentual.length > 0
      ? comPercentual.reduce((soma, linha) => soma + linha.percentual, 0) / comPercentual.length
      : null;

    const bloco = document.createElement('details');
    bloco.className = 'grupo-progresso';

    const resumo = document.createElement('summary');
    const texto = document.createElement('span');
    texto.className = 'grupo-progresso-texto';
    const nome = document.createElement('span');
    nome.className = 'grupo-progresso-nome';
    nome.textContent = t(grupo);
    const quantos = document.createElement('span');
    quantos.className = 'grupo-progresso-quantos';
    quantos.textContent = quantosExercicios(doGrupo.length);
    texto.append(nome, quantos);
    const seta = document.createElement('span');
    seta.className = 'grupo-progresso-seta';
    seta.setAttribute('aria-hidden', 'true');
    seta.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    resumo.append(texto, criarValorProgressao(media), seta);

    const lista = document.createElement('ul');
    lista.className = 'exercicios-progresso';
    lista.append(...doGrupo.map(criarExercicioProgresso));

    bloco.append(resumo, lista);
    return bloco;
  }));
}

function desenharProgresso() {
  // Faixa do topo: semana atual, quantas semanas têm algo anotado e quantos sets foram anotados no total.
  const anotados = series.filter(temValores);
  perfilSemana.textContent = String(perfil?.semana_atual ?? 1);
  perfilSemanas.textContent = String(new Set(anotados.map(serie => serie.semana)).size);
  perfilSets.textContent = String(anotados.length);

  desenharTabelaProgresso(progresso, progressoVazio, series);

  const linhas = calcularProgressao(series);
  const comPercentual = linhas.filter(linha => linha.percentual !== null);
  progressoCartao.hidden = linhas.length === 0;
  perfilResumo.hidden = comPercentual.length === 0;
  if (comPercentual.length === 0) {
    return;
  }

  const media = comPercentual.reduce((soma, linha) => soma + linha.percentual, 0) / comPercentual.length;
  const primeira = Math.min(...comPercentual.map(linha => linha.primeira));
  const ultima = Math.max(...comPercentual.map(linha => linha.ultima));
  perfilResumoPeriodo.textContent = t('Da semana {a} à semana {b}', { a: primeira, b: ultima });
  perfilResumoValor.textContent = formatarPercentual(media);
  perfilResumoDetalhe.textContent = t('de progressão de carga, em média de {exercicios}', {
    exercicios: quantosExercicios(comPercentual.length)
  });
}
