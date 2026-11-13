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
      return { exercicio, primeira, ultima, cargaInicial, cargaFinal, percentual };
    });
}

function formatarPercentual(valor) {
  const arredondado = Math.round(valor * 10) / 10;
  const sinal = arredondado > 0 ? '+' : '';
  return `${sinal}${arredondado.toLocaleString(LOCALIDADE, { maximumFractionDigits: 1 })}%`;
}

function desenharTabelaProgresso(recipiente, vazio, listaSeries) {
  const linhas = calcularProgressao(listaSeries);
  vazio.hidden = linhas.length > 0;
  if (linhas.length === 0) {
    recipiente.replaceChildren();
    return;
  }

  const tabela = document.createElement('table');
  tabela.className = 'tabela-progresso';

  const cabecalho = tabela.createTHead().insertRow();
  [t('Exercício'), t('Progressão')].forEach(texto => {
    const celula = document.createElement('th');
    celula.scope = 'col';
    celula.textContent = texto;
    cabecalho.append(celula);
  });

  const corpo = tabela.createTBody();
  linhas.forEach(linha => {
    const fileira = corpo.insertRow();
    const nome = document.createElement('th');
    nome.scope = 'row';
    nome.textContent = nomeExercicio(linha.exercicio);
    const detalhe = document.createElement('span');
    detalhe.className = 'progresso-detalhe';
    detalhe.textContent = linha.primeira === linha.ultima
      ? t('Semana {a}: {carga} kg', { a: linha.primeira, carga: formatarCargaCampo(linha.cargaFinal) })
      : t('Semana {a} a {b}: {inicial} → {final} kg', {
        a: linha.primeira,
        b: linha.ultima,
        inicial: formatarCargaCampo(linha.cargaInicial),
        final: formatarCargaCampo(linha.cargaFinal)
      });
    nome.append(detalhe);
    fileira.append(nome);
    const progressao = fileira.insertCell();
    progressao.className = 'progressao-valor';
    progressao.textContent = linha.percentual === null ? '–' : formatarPercentual(linha.percentual);
  });

  recipiente.replaceChildren(tabela);
}

function desenharProgresso() {
  perfilNome.textContent = perfil?.usuario ?? '';
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
