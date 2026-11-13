// Aba Treino: planilha do dia, tabela de séries, dica da semana anterior e conclusão da semana.

// --- Treino do cliente ---

// As séries da semana anterior mais recente desse exercício. Prefere o mesmo dia, se ele aparecer em dois.
function buscarSeriesAnteriores(item) {
  const anteriores = series.filter(serie =>
    serie.exercicio === item.exercicio && serie.semana < perfil.semana_atual && temValores(serie)
  );
  if (anteriores.length === 0) {
    return [];
  }
  const semana = Math.max(...anteriores.map(serie => serie.semana));
  const daSemana = anteriores.filter(serie => serie.semana === semana);
  const doMesmoDia = daSemana.filter(serie => serie.dia_semana === item.dia_semana);
  return (doMesmoDia.length > 0 ? doMesmoDia : daSemana).sort((a, b) => a.serie - b.serie);
}

function buscarSerieAtual(item, numero) {
  return series.find(serie =>
    serie.semana === perfil.semana_atual &&
    serie.dia_semana === item.dia_semana &&
    serie.exercicio === item.exercicio &&
    serie.serie === numero
  ) ?? null;
}

function buscarAnotacaoAtual(item) {
  return registros.find(registro =>
    registro.semana === perfil.semana_atual &&
    registro.dia_semana === item.dia_semana &&
    registro.exercicio === item.exercicio
  )?.anotacao ?? '';
}

// A anotação mais recente de uma semana anterior vira o lembrete.
function buscarLembrete(exercicio) {
  return registros
    .filter(registro => registro.exercicio === exercicio && registro.semana < perfil.semana_atual && registro.anotacao)
    .sort((a, b) => b.semana - a.semana)[0]?.anotacao ?? null;
}

function criarDica(anteriores, lembrete) {
  const textos = [];
  // Nas Configurações, a pessoa pode esconder os números da semana passada. O lembrete continua.
  if (anteriores.length > 0 && lerPreferencia('mostrarAnterior')) {
    textos.push(`${t('Semana {n}', { n: anteriores[0].semana })}: ${anteriores.map(formatarCarga).join(' · ')}`);
  }
  if (lembrete) {
    textos.push(`${t('Lembrete')}: ${lembrete}`);
  }
  if (textos.length === 0) {
    return null;
  }
  const dica = document.createElement('p');
  dica.className = 'dica';
  dica.textContent = textos.join(' — ');
  return dica;
}

function mostrarSalvo(situacao) {
  situacao.textContent = t('Salvo');
  setTimeout(() => {
    situacao.textContent = '';
  }, TEMPO_SALVO_MS);
}

async function salvarSerie(item, numero, campos, situacao) {
  // Um erro de digitação não pode apagar o que já estava salvo.
  const invalida = (campo, maximo) => campo.value.trim() !== '' && lerNumero(campo.value, maximo) === null;
  if (invalida(campos.carga, 9999) || invalida(campos.repeticoes, 999)) {
    const atual = buscarSerieAtual(item, numero);
    campos.carga.value = formatarCargaCampo(atual?.carga);
    campos.repeticoes.value = atual?.repeticoes === null || atual?.repeticoes === undefined ? '' : String(atual.repeticoes);
    mostrarAviso(t('Use só números na carga e nas repetições.'));
    return;
  }

  const dados = {
    user_id: usuario.id,
    semana: perfil.semana_atual,
    dia_semana: item.dia_semana,
    exercicio: item.exercicio,
    serie: numero,
    carga: lerNumero(campos.carga.value, 9999),
    repeticoes: lerNumero(campos.repeticoes.value, 999),
    atualizado_em: new Date().toISOString()
  };
  if (dados.repeticoes !== null) {
    dados.repeticoes = Math.round(dados.repeticoes);
  }

  situacao.textContent = t('Salvando...');
  const { data, error } = await cliente
    .from(TABELA_SERIES)
    .upsert(dados, { onConflict: 'user_id,semana,dia_semana,exercicio,serie' })
    .select()
    .single();
  if (error) {
    situacao.textContent = '';
    mostrarAviso(mensagemDoErro(error));
    return;
  }

  series = [...series.filter(serie => serie.id !== data.id), data];
  mostrarAviso('');
  // Mostra no campo o valor que realmente foi guardado, já arredondado.
  campos.carga.value = formatarCargaCampo(data.carga);
  campos.repeticoes.value = data.repeticoes === null ? '' : String(data.repeticoes);
  mostrarSalvo(situacao);
  atualizarResumo();
  desenharProgresso();
}

async function salvarAnotacao(item, campo, situacao) {
  situacao.textContent = t('Salvando...');
  const { data, error } = await cliente
    .from(TABELA_REGISTROS)
    .upsert({
      user_id: usuario.id,
      semana: perfil.semana_atual,
      dia_semana: item.dia_semana,
      exercicio: item.exercicio,
      anotacao: campo.value.trim() || null,
      atualizado_em: new Date().toISOString()
    }, { onConflict: 'user_id,semana,dia_semana,exercicio' })
    .select()
    .single();
  if (error) {
    situacao.textContent = '';
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  registros = [...registros.filter(registro => registro.id !== data.id), data];
  mostrarSalvo(situacao);
}

function atualizarResumo() {
  const doDia = planilha.filter(item => item.dia_semana === diaAtivo);
  const feitos = doDia.filter(item =>
    series.some(serie =>
      serie.semana === perfil?.semana_atual &&
      serie.dia_semana === item.dia_semana &&
      serie.exercicio === item.exercicio &&
      temValores(serie)
    )
  );
  resumoSemana.textContent = String(perfil?.semana_atual ?? 1);
  resumoExercicios.textContent = String(doDia.length);
  resumoFeitos.textContent = `${feitos.length}/${doDia.length}`;
}

function desenharBarrasDias() {
  const contagem = dia => planilha.filter(item => item.dia_semana === dia.numero).length;
  const maior = Math.max(1, ...DIAS.map(contagem));
  diasTreino.replaceChildren(...DIAS.map(dia => {
    const quantidade = contagem(dia);
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'barra';
    botao.disabled = quantidade === 0;
    botao.setAttribute('aria-pressed', String(dia.numero === diaAtivo));
    botao.setAttribute('aria-label', `${dia.completo}: ${quantosExercicios(quantidade)}`);
    botao.addEventListener('click', () => {
      diaAtivo = dia.numero;
      desenharTreino();
    });

    const preenchimento = document.createElement('span');
    preenchimento.className = 'barra-valor';
    preenchimento.style.height = `${quantidade === 0 ? 6 : 20 + (quantidade / maior) * 80}%`;
    const rotulo = document.createElement('span');
    rotulo.className = 'barra-dia';
    rotulo.textContent = dia.nome;

    const trilho = document.createElement('span');
    trilho.className = 'barra-trilho';
    trilho.append(preenchimento);
    botao.append(trilho, rotulo);
    return botao;
  }));
}

// Uma linha por série. O número de linhas vem das séries definidas pelo admin.
function criarTabelaSeries(item, anteriores, situacao) {
  const tabela = document.createElement('table');
  tabela.className = 'tabela-series';

  const cabecalho = tabela.createTHead().insertRow();
  [t('Set'), t('Carga (kg)'), t('Reps ({faixa})', { faixa: item.repeticoes })].forEach(texto => {
    const celula = document.createElement('th');
    celula.scope = 'col';
    celula.textContent = texto;
    cabecalho.append(celula);
  });

  const corpo = tabela.createTBody();
  for (let numero = 1; numero <= item.series; numero += 1) {
    const atual = buscarSerieAtual(item, numero);
    const anterior = anteriores.find(serie => serie.serie === numero);
    const descricao = { n: numero, exercicio: nomeExercicio(item.exercicio) };
    const carga = criarEntrada(formatarCargaCampo(atual?.carga), 'decimal', t('Carga do set {n} de {exercicio}', descricao));
    const repeticoes = criarEntrada(atual?.repeticoes, 'numeric', t('Repetições do set {n} de {exercicio}', descricao));
    // O valor da semana anterior fica visível no campo vazio, se a pessoa não desligou isso nas Configurações.
    if (lerPreferencia('mostrarAnterior')) {
      carga.placeholder = formatarCargaCampo(anterior?.carga);
      repeticoes.placeholder = anterior?.repeticoes === null || anterior?.repeticoes === undefined ? '' : String(anterior.repeticoes);
    }

    const campos = { carga, repeticoes };
    Object.values(campos).forEach(campo => {
      campo.addEventListener('change', () => salvarSerie(item, numero, campos, situacao));
    });

    const linha = corpo.insertRow();
    const rotulo = document.createElement('th');
    rotulo.scope = 'row';
    rotulo.textContent = String(numero);
    linha.append(rotulo);
    linha.insertCell().append(carga);
    linha.insertCell().append(repeticoes);
  }
  return tabela;
}

// --- Janela de demonstração ---

let trocaDeFoto = null;
let demonstracaoAtual = null;

function criarBotaoDemonstracao(exercicio) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-demonstracao';
  botao.setAttribute('aria-label', t('Ver a execução de {exercicio}', { exercicio: nomeExercicio(exercicio) }));
  botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
  botao.append(t('Execução'));
  botao.addEventListener('click', () => abrirDemonstracao(exercicio));
  return botao;
}

// Carrega as duas fotos e só começa a alternar quando as duas chegaram.
function abrirDemonstracao(exercicio) {
  const fotos = fotosDaDemonstracao(exercicio);
  pararDemonstracao();
  demonstracaoAtual = exercicio;
  demonstracaoTitulo.textContent = nomeExercicio(exercicio);
  demonstracaoFoto.hidden = true;
  demonstracaoFoto.alt = t('{exercicio}: começo e fim do movimento', { exercicio: nomeExercicio(exercicio) });
  demonstracaoCarregando.hidden = false;
  demonstracaoCarregando.textContent = t('Carregando...');
  janelaDemonstracao.showModal();

  Promise.all(fotos.map(endereco => new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = resolver;
    imagem.onerror = rejeitar;
    imagem.src = endereco;
  }))).then(() => {
    // A pessoa pode ter fechado ou aberto outro exercício enquanto carregava.
    if (!janelaDemonstracao.open || demonstracaoAtual !== exercicio) {
      return;
    }
    let atual = 0;
    demonstracaoFoto.src = fotos[atual];
    demonstracaoFoto.hidden = false;
    demonstracaoCarregando.hidden = true;
    trocaDeFoto = setInterval(() => {
      // Nem todo navegador avisa quando a janela fecha, então a troca confere sozinha.
      if (!janelaDemonstracao.open) {
        pararDemonstracao();
        return;
      }
      atual = 1 - atual;
      demonstracaoFoto.src = fotos[atual];
    }, 900);
  }).catch(() => {
    if (demonstracaoAtual === exercicio) {
      demonstracaoCarregando.textContent = t('Não foi possível carregar as fotos. Confira sua internet.');
    }
  });
}

function pararDemonstracao() {
  clearInterval(trocaDeFoto);
  trocaDeFoto = null;
}

botaoFecharDemonstracao.addEventListener('click', () => janelaDemonstracao.close());
janelaDemonstracao.addEventListener('close', pararDemonstracao);
// Tocar fora da janela também fecha.
janelaDemonstracao.addEventListener('click', evento => {
  if (evento.target === janelaDemonstracao) {
    janelaDemonstracao.close();
  }
});

// --- Cartão do exercício ---

function criarCartaoTreino(item) {
  const linha = document.createElement('li');
  linha.className = 'item item-coluna';

  const nome = document.createElement('h3');
  nome.className = 'exercicio-nome';
  nome.textContent = nomeExercicio(item.exercicio);
  linha.append(nome);

  // O RIR do admin e, se o exercício tiver fotos e o botão estiver ligado, o botão de ver a execução.
  const temFotos = fotosDaDemonstracao(item.exercicio).length > 0 && lerPreferencia('mostrarExecucao');
  if (item.rir !== null || temFotos) {
    const detalhes = document.createElement('div');
    detalhes.className = 'exercicio-linha';
    if (item.rir !== null) {
      const rir = document.createElement('p');
      rir.className = 'exercicio-rir';
      rir.textContent = `RIR → ${item.rir}`;
      detalhes.append(rir);
    }
    if (temFotos) {
      detalhes.append(criarBotaoDemonstracao(item.exercicio));
    }
    linha.append(detalhes);
  }

  const situacao = document.createElement('p');
  situacao.className = 'salvo';
  situacao.setAttribute('role', 'status');

  const anteriores = buscarSeriesAnteriores(item);
  linha.append(criarTabelaSeries(item, anteriores, situacao));

  const dica = criarDica(anteriores, buscarLembrete(item.exercicio));
  if (dica) {
    linha.append(dica);
  }

  const anotacao = document.createElement('textarea');
  anotacao.maxLength = 500;
  anotacao.value = buscarAnotacaoAtual(item);
  anotacao.setAttribute('aria-label', t('Anotações de {exercicio}', { exercicio: nomeExercicio(item.exercicio) }));
  anotacao.addEventListener('change', () => salvarAnotacao(item, anotacao, situacao));

  const campoAnotacao = criarCampo(t('Anotações'), anotacao);
  campoAnotacao.classList.add('campo-texto');
  linha.append(campoAnotacao, situacao);
  return linha;
}

function desenharTreino() {
  tituloSemana.textContent = t('Semana {n}', { n: perfil?.semana_atual ?? 1 });

  const diasComTreino = DIAS.filter(dia => planilha.some(item => item.dia_semana === dia.numero));
  // Se hoje não for dia de treino, abre no primeiro dia que tiver.
  if (diasComTreino.length > 0 && !diasComTreino.some(dia => dia.numero === diaAtivo)) {
    diaAtivo = diasComTreino[0].numero;
  }

  desenharBarrasDias();
  semanaCartao.hidden = diasComTreino.length === 0;

  const doDia = planilha.filter(item => item.dia_semana === diaAtivo);
  treino.replaceChildren(...doDia.map(criarCartaoTreino));
  totalDia.textContent = doDia.length > 0 ? quantosExercicios(doDia.length) : '';
  tituloDia.textContent = diasComTreino.length > 0
    ? t('Treino de {dia}', { dia: DIAS.find(dia => dia.numero === diaAtivo).completo })
    : t('Treino do dia');
  atualizarResumo();

  treinoVazio.hidden = diasComTreino.length > 0;
  treinoVazio.textContent = perfil?.papel === 'admin'
    ? t('Sua planilha está vazia. Monte em Admin.')
    : t('Seu treino ainda não foi montado. Fale com o admin.');
  botaoConcluirSemana.hidden = diasComTreino.length === 0;
}

botaoConcluirSemana.addEventListener('click', () => umaPorVez(async () => {
  const pergunta = t('Concluir a semana {n} e passar para a próxima?', { n: perfil.semana_atual });
  if (lerPreferencia('confirmarSemana') && !confirm(pergunta)) {
    return;
  }
  const { data, error } = await cliente.rpc('avancar_semana');
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  perfil.semana_atual = data;
  mostrarAviso('');
  desenharTreino();
  window.scrollTo(0, 0);
}));
