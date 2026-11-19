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

// Cargas e reps da semana passada, numa linha embaixo da tabela. Pode ser escondida nas Configurações.
function criarDica(anteriores) {
  if (anteriores.length === 0 || !lerPreferencia('mostrarAnterior')) {
    return null;
  }
  const dica = document.createElement('p');
  dica.className = 'dica';
  dica.textContent = `${t('Semana {n}', { n: anteriores[0].semana })}: ${anteriores.map(formatarCarga).join(', ')}`;
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
  // O timer de descanso não começa sozinho: só quando o aluno toca no botão do tempo.
}

// --- Dias da semana ---

// Os dias que têm treino na planilha, na ordem da semana (segunda primeiro).
function diasComTreino() {
  return DIAS.filter(dia => planilha.some(item => item.dia_semana === dia.numero));
}

// Quantos exercícios do dia já têm carga ou reps anotadas nesta semana.
function exerciciosFeitos(numeroDoDia) {
  const doDia = planilha.filter(item => item.dia_semana === numeroDoDia);
  const feitos = doDia.filter(item =>
    series.some(serie =>
      serie.semana === perfil?.semana_atual &&
      serie.dia_semana === item.dia_semana &&
      serie.exercicio === item.exercicio &&
      temValores(serie)
    )
  );
  return { feitos: feitos.length, total: doDia.length };
}

// Embaixo do "Semana 3": uma frase ("2 de 4 dias feitos") e uma bolinha por dia de treino, cheia quando o dia acabou.
function atualizarResumo() {
  const dias = diasComTreino();
  const completos = dias.map(dia => {
    const { feitos, total } = exerciciosFeitos(dia.numero);
    return feitos === total;
  });
  const quantos = completos.filter(Boolean).length;
  resumoFeitos.textContent = quantos === dias.length && dias.length > 0
    ? t('Todos os dias feitos. Pode concluir a semana.')
    : t('{feitos} de {total} dias feitos', { feitos: quantos, total: dias.length });
  pontosSemana.replaceChildren(...completos.map(completo => {
    const ponto = document.createElement('span');
    ponto.className = completo ? 'ponto cheio' : 'ponto';
    return ponto;
  }));
}

// Os 7 dias da semana. Dia de treino é um botão forte que abre o treino; dia sem treino é uma linha apagada.
function desenharListaDias() {
  diasTreino.replaceChildren(...DIAS.map(dia => {
    const { feitos, total } = exerciciosFeitos(dia.numero);
    const linha = document.createElement('li');

    if (total === 0) {
      const descanso = document.createElement('div');
      descanso.className = 'dia-descanso';
      const nome = document.createElement('span');
      nome.className = 'dia-nome';
      nome.textContent = dia.completo;
      const detalhe = document.createElement('span');
      detalhe.className = 'dia-detalhe';
      detalhe.textContent = t('descanso');
      descanso.append(nome, detalhe);
      linha.append(descanso);
      return linha;
    }

    const completo = feitos === total;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'dia-botao';
    botao.classList.toggle('completo', completo);
    botao.setAttribute('aria-label', `${dia.completo}: ${quantosExercicios(total)}, ${feitos}/${total}`);
    botao.addEventListener('click', () => abrirDia(dia.numero));

    const nome = document.createElement('span');
    nome.className = 'dia-nome';
    nome.textContent = dia.completo;
    const detalhe = document.createElement('span');
    detalhe.className = 'dia-detalhe';
    // Feito: um visto. Em andamento: "1 de 3", e o número de exercícios embaixo do nome.
    detalhe.textContent = completo ? '✓' : t('{feitos} de {total}', { feitos, total });
    const quantos = document.createElement('span');
    quantos.className = 'dia-quantos';
    quantos.textContent = quantosExercicios(total);
    nome.append(quantos);
    botao.append(nome, detalhe);
    linha.append(botao);
    return linha;
  }));
}

function abrirDia(numero) {
  diaAtivo = numero;
  desenharTreino();
  window.scrollTo(0, 0);
}

botaoVoltarDias.addEventListener('click', () => {
  const dia = diaAtivo;
  diaAtivo = null;
  desenharTreino();
  window.scrollTo(0, 0);
  // O foco volta para o dia que estava aberto, para quem navega pelo teclado.
  const nome = DIAS.find(item => item.numero === dia)?.completo;
  [...diasTreino.querySelectorAll('.dia-botao')].find(botao => botao.querySelector('.dia-nome').textContent === nome)?.focus();
});

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

// --- Nota fixa do exercício ---
// Uma nota do aluno presa àquele exercício da planilha. Não muda de semana; some se o admin tirar o exercício.

function buscarNota(item) {
  return notas.find(nota => nota.plano_id === item.id)?.texto ?? '';
}

async function salvarNota(item, campo, botao, situacao) {
  const texto = campo.value.trim();
  situacao.textContent = t('Salvando...');
  // Nota apagada some do banco; nota escrita é criada ou atualizada.
  const { error } = texto === ''
    ? await cliente.from(TABELA_NOTAS).delete().eq('plano_id', item.id)
    : await cliente.from(TABELA_NOTAS).upsert({
      plano_id: item.id,
      user_id: usuario.id,
      texto,
      atualizado_em: new Date().toISOString()
    }, { onConflict: 'plano_id' });
  if (error) {
    situacao.textContent = '';
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  notas = notas.filter(nota => nota.plano_id !== item.id);
  if (texto !== '') {
    notas.push({ plano_id: item.id, user_id: usuario.id, texto });
  }
  campo.value = texto;
  botao.classList.toggle('tem-nota', texto !== '');
  mostrarAviso('');
  mostrarSalvo(situacao);
}

// O botão abre e fecha a caixa da nota. Se já tem nota, a caixa começa aberta, para o aluno ler antes de treinar.
function criarNotaDoExercicio(item, situacao) {
  const texto = buscarNota(item);

  const caixa = document.createElement('div');
  caixa.className = 'nota-exercicio';
  caixa.id = `nota-${item.id}`;
  caixa.hidden = texto === '';

  const campo = document.createElement('textarea');
  campo.maxLength = 500;
  campo.rows = 2;
  campo.value = texto;
  campo.placeholder = t('Ex.: pegada mais fechada, banco no 3º furo');
  campo.setAttribute('aria-label', t('Nota de {exercicio}', { exercicio: nomeExercicio(item.exercicio) }));
  const explicacao = document.createElement('p');
  explicacao.className = 'nota-explicacao';
  explicacao.textContent = t('Fica neste exercício em todas as semanas.');
  caixa.append(campo, explicacao);

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-demonstracao botao-nota';
  botao.classList.toggle('tem-nota', texto !== '');
  botao.setAttribute('aria-controls', caixa.id);
  botao.setAttribute('aria-expanded', String(!caixa.hidden));
  botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v11l-5 5H4zm11 15.2L19.2 15H15zM7 8v2h10V8zm0 4v2h6v-2z" fill="currentColor"/></svg>';
  botao.append(t('Nota'));
  botao.addEventListener('click', () => {
    caixa.hidden = !caixa.hidden;
    botao.setAttribute('aria-expanded', String(!caixa.hidden));
    if (!caixa.hidden) {
      campo.focus();
    }
  });

  campo.addEventListener('change', () => salvarNota(item, campo, botao, situacao));
  return { botao, caixa };
}

// --- Cartão do exercício ---

function criarCartaoTreino(item) {
  const linha = document.createElement('li');
  linha.className = 'item item-coluna';

  const nome = document.createElement('h3');
  nome.className = 'exercicio-nome';
  nome.textContent = nomeExercicio(item.exercicio);
  linha.append(nome);

  // O RIR do admin e, se o exercício tiver fotos e o botão estiver ligado, o botão de ver a execução.
  const situacao = document.createElement('p');
  situacao.className = 'salvo';
  situacao.setAttribute('role', 'status');

  // Linha do RIR com os botões do exercício: nota, timer (se o admin definiu descanso) e execução (se tem fotos).
  const temFotos = fotosDaDemonstracao(item.exercicio).length > 0 && lerPreferencia('mostrarExecucao');
  const nota = criarNotaDoExercicio(item, situacao);
  const detalhes = document.createElement('div');
  detalhes.className = 'exercicio-linha';
  if (item.rir !== null) {
    const rir = document.createElement('p');
    rir.className = 'exercicio-rir';
    rir.textContent = `RIR → ${item.rir}`;
    detalhes.append(rir);
  }
  const botoes = document.createElement('div');
  botoes.className = 'exercicio-botoes';
  botoes.append(nota.botao);
  if (item.descanso) {
    botoes.append(criarBotaoDescanso(item));
  }
  if (temFotos) {
    botoes.append(criarBotaoDemonstracao(item.exercicio));
  }
  detalhes.append(botoes);
  linha.append(detalhes, nota.caixa);

  const anteriores = buscarSeriesAnteriores(item);
  linha.append(criarTabelaSeries(item, anteriores, situacao));

  // As anotações por semana saíram: o que o aluno quer lembrar vai na Nota, que fica no exercício.
  const dica = criarDica(anteriores);
  if (dica) {
    linha.append(dica);
  }
  linha.append(situacao);
  return linha;
}

// Duas telas: a lista de dias (nenhum dia aberto) ou o treino completo do dia escolhido.
function desenharTreino() {
  tituloSemana.textContent = t('Semana {n}', { n: perfil?.semana_atual ?? 1 });

  const dias = diasComTreino();
  // Se o dia aberto saiu da planilha, volta para a lista.
  if (!dias.some(dia => dia.numero === diaAtivo)) {
    diaAtivo = null;
  }
  const comDiaAberto = diaAtivo !== null;

  desenharListaDias();
  atualizarResumo();
  semanaCartao.hidden = dias.length === 0 || comDiaAberto;
  botaoConcluirSemana.hidden = dias.length === 0;
  diaAberto.hidden = !comDiaAberto;

  const doDia = comDiaAberto ? planilha.filter(item => item.dia_semana === diaAtivo) : [];
  treino.replaceChildren(...doDia.map(criarCartaoTreino));
  totalDia.textContent = comDiaAberto ? quantosExercicios(doDia.length) : '';
  tituloDia.textContent = comDiaAberto
    ? t('Treino de {dia}', { dia: DIAS.find(dia => dia.numero === diaAtivo).completo })
    : '';

  treinoVazio.hidden = dias.length > 0;
  treinoVazio.textContent = perfil?.papel === 'admin'
    ? t('Sua planilha está vazia. Monte em Admin.')
    : t('Seu treino ainda não foi montado. Fale com o admin.');
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
