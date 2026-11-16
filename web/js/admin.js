// Aba Admin: planilhas dos usuários, catálogo de exercícios e exclusão de contas.

// --- Painel de admin ---

function buscarAlvo() {
  return usuariosAdmin.find(pessoa => pessoa.user_id === alvoId) ?? null;
}

function criarCamposAdmin(item) {
  const numeros = document.createElement('div');
  numeros.className = 'item-numeros';

  const nome = { exercicio: nomeExercicio(item.exercicio) };
  const series = criarEntrada(item.series, 'numeric', t('Séries de {exercicio}', nome));
  const repeticoes = criarEntrada(item.repeticoes, 'text', t('Faixa de repetições de {exercicio}', nome));
  repeticoes.placeholder = '6-8';
  const rir = criarEntrada(item.rir, 'text', t('RIR por série de {exercicio}', nome));
  rir.placeholder = '0-1-1';
  const descanso = criarEntrada(formatarTempo(item.descanso), 'text', t('Descanso entre os sets de {exercicio}', nome));
  descanso.placeholder = '1:30';

  // O descanso aparece como "1:30"; os outros campos, como foram salvos.
  const mostrar = (coluna, valor) => {
    if (coluna === 'descanso') {
      return formatarTempo(valor);
    }
    return valor === null || valor === undefined ? '' : String(valor);
  };

  const salvar = async (coluna, valor, entrada, anterior) => {
    const { error } = await cliente.from(TABELA_PLANO).update({ [coluna]: valor }).eq('id', item.id);
    if (error) {
      entrada.value = mostrar(coluna, anterior);
      mostrarAviso(mensagemDoErro(error));
      return;
    }
    item[coluna] = valor;
    entrada.value = mostrar(coluna, valor);
    mostrarAviso('');
  };

  series.addEventListener('change', () => {
    salvar('series', limitar(series.value, item.series), series, item.series);
  });
  repeticoes.addEventListener('change', () => {
    const valor = repeticoes.value.trim();
    const faixa = valor.match(/^(\d{1,2})-(\d{1,2})$/);
    if (!faixa || Number(faixa[1]) < 1 || Number(faixa[1]) >= Number(faixa[2])) {
      repeticoes.value = item.repeticoes;
      mostrarAviso(t('Use uma faixa de repetições, do menor para o maior, como 6-8.'));
      return;
    }
    salvar('repeticoes', valor, repeticoes, item.repeticoes);
  });
  rir.addEventListener('change', () => {
    const texto = rir.value.trim();
    const valido = /^\d{1,2}(-\d{1,2})*$/.test(texto) && texto.split('-').every(parte => Number(parte) <= 10);
    if (texto !== '' && !valido) {
      rir.value = item.rir === null ? '' : item.rir;
      mostrarAviso(t('Use um RIR de 0 a 10 para cada série, separado por hífen, como 0-1-1. Também pode ficar vazio.'));
      return;
    }
    salvar('rir', texto === '' ? null : texto, rir, item.rir);
  });

  descanso.addEventListener('change', () => {
    const segundos = lerTempo(descanso.value);
    if (segundos === undefined) {
      descanso.value = formatarTempo(item.descanso);
      mostrarAviso(t('Use o descanso em segundos (90) ou em minutos e segundos (1:30), até 15:00. Também pode ficar vazio.'));
      return;
    }
    salvar('descanso', segundos, descanso, item.descanso ?? null);
  });

  numeros.append(
    criarCampo(t('Séries'), series),
    criarCampo(t('Reps'), repeticoes),
    criarCampo(t('RIR'), rir),
    criarCampo(t('Descanso'), descanso)
  );
  return numeros;
}

function desenharPlanilhaAdmin() {
  const alvo = buscarAlvo();
  adminSemana.textContent = alvo ? t('Está na semana {n}.', { n: alvo.semana_atual }) : t('Nenhum usuário encontrado.');
  botaoExcluirConta.hidden = !alvo || alvo.user_id === usuario?.id;

  criarBotoesDias(diasAdmin, diaAdmin, DIAS, dia => {
    diaAdmin = dia;
    desenharPlanilhaAdmin();
    atualizarBotoesCatalogo();
  }, dia => {
    const quantidade = planilhaAlvo.filter(item => item.dia_semana === dia.numero).length;
    return quantidade > 0 ? `${dia.nome} (${quantidade})` : dia.nome;
  });

  const doDia = exerciciosDoDiaAdmin();
  adminPlano.replaceChildren(...doDia.map((item, indice) => {
    const linha = document.createElement('li');
    linha.className = 'item';
    const nome = { exercicio: nomeExercicio(item.exercicio) };

    // Setas para mudar a ordem em que o aluno vê os exercícios do dia.
    const subir = document.createElement('button');
    subir.type = 'button';
    subir.className = 'botao-ordem';
    subir.textContent = '↑';
    subir.dataset.ordem = `${item.id}:subir`;
    subir.disabled = indice === 0;
    subir.setAttribute('aria-label', t('Subir {exercicio}', nome));
    subir.addEventListener('click', () => moverExercicio(item, -1));

    const descer = document.createElement('button');
    descer.type = 'button';
    descer.className = 'botao-ordem';
    descer.textContent = '↓';
    descer.dataset.ordem = `${item.id}:descer`;
    descer.disabled = indice === doDia.length - 1;
    descer.setAttribute('aria-label', t('Descer {exercicio}', nome));
    descer.addEventListener('click', () => moverExercicio(item, 1));

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = t('Remover');
    remover.setAttribute('aria-label', t('Remover {exercicio} da planilha', nome));
    remover.addEventListener('click', () => alternarExercicio(item.exercicio));

    const acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    acoes.append(subir, descer, remover);

    const info = criarInfo(buscarExercicio(item.exercicio));
    // A nota que o aluno deixou neste exercício, para o admin acompanhar mudanças de técnica.
    const notaDoAluno = notasAlvo.find(nota => nota.plano_id === item.id)?.texto;
    if (notaDoAluno) {
      const nota = document.createElement('span');
      nota.className = 'item-nota';
      nota.textContent = t('Nota do aluno: {texto}', { texto: notaDoAluno });
      info.append(nota);
    }

    linha.append(info, criarCamposAdmin(item), acoes);
    return linha;
  }));
  adminVazio.hidden = doDia.length > 0 || !alvo;

  desenharTabelaProgresso(adminProgresso, adminProgressoVazio, seriesAlvo);
}

// Os exercícios do dia escolhido, na ordem em que o aluno vê.
function exerciciosDoDiaAdmin() {
  return planilhaAlvo
    .filter(item => item.dia_semana === diaAdmin)
    .sort((a, b) => a.posicao - b.posicao || a.id - b.id);
}

// Troca o exercício de lugar com o vizinho (direcao -1 sobe, 1 desce) e salva as posições que mudaram.
function moverExercicio(item, direcao) {
  return umaPorVez(async () => {
    const ordem = exerciciosDoDiaAdmin();
    const de = ordem.findIndex(outro => outro.id === item.id);
    const para = de + direcao;
    if (de < 0 || para < 0 || para >= ordem.length) {
      return;
    }
    [ordem[de], ordem[para]] = [ordem[para], ordem[de]];

    // A posição de cada um vira o lugar dele na lista (0, 1, 2...). Só vai ao banco quem mudou.
    const mudaram = ordem
      .map((outro, posicao) => ({ outro, posicao }))
      .filter(({ outro, posicao }) => outro.posicao !== posicao);
    const respostas = await Promise.all(mudaram.map(({ outro, posicao }) =>
      cliente.from(TABELA_PLANO).update({ posicao }).eq('id', outro.id)
    ));
    const erro = respostas.find(resposta => resposta.error)?.error;
    if (erro) {
      mostrarAviso(mensagemDoErro(erro));
      // Recarrega do banco, para a tela não mostrar uma ordem que não foi salva.
      await carregarAlvo(alvoId);
      return;
    }
    mudaram.forEach(({ outro, posicao }) => {
      outro.posicao = posicao;
    });
    mostrarAviso('');
    desenharPlanilhaAdmin();
    // O foco continua na seta do exercício que mudou de lugar, para dar vários toques seguidos.
    const lado = direcao < 0 ? 'subir' : 'descer';
    const seta = adminPlano.querySelector(`[data-ordem="${item.id}:${lado}"]`);
    (seta && !seta.disabled ? seta : adminPlano.querySelector(`[data-ordem^="${item.id}:"]:not(:disabled)`))?.focus();
  });
}

function estaNoDia(nome) {
  return planilhaAlvo.some(item => item.dia_semana === diaAdmin && item.exercicio === nome);
}

function atualizarBotao(botao, nome) {
  const noDia = estaNoDia(nome);
  botao.textContent = noDia ? t('Remover') : t('Adicionar');
  botao.setAttribute('aria-pressed', String(noDia));
  botao.disabled = !alvoId;
}

function atualizarBotoesCatalogo() {
  // Atualiza os botões no lugar, para o foco do teclado não se perder.
  catalogo.querySelectorAll('.adicionar').forEach(botao => atualizarBotao(botao, botao.dataset.nome));
}

function desenharCatalogo() {
  const termo = normalizar(busca.value);
  // A busca acha o exercício pelo nome em português e também pelo nome em inglês.
  const visiveis = todosExercicios().filter(exercicio =>
    (grupoAtivo === TODOS || exercicio.grupos.includes(grupoAtivo)) &&
    (normalizar(exercicio.nome).includes(termo) || normalizar(nomeExercicio(exercicio.nome)).includes(termo))
  );

  catalogo.replaceChildren(...visiveis.map(exercicio => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'adicionar';
    botao.dataset.nome = exercicio.nome;
    botao.setAttribute('aria-label', nomeExercicio(exercicio.nome));
    atualizarBotao(botao, exercicio.nome);
    botao.addEventListener('click', () => alternarExercicio(exercicio.nome));

    const info = criarInfo(exercicio);
    if (!exercicio.personalizado) {
      linha.append(info, botao);
      return linha;
    }

    info.querySelector('.item-grupo').textContent = t('{grupo} · cadastrado', { grupo: t(exercicio.grupo) });
    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'botao-discreto';
    excluir.textContent = t('Tirar da lista');
    excluir.setAttribute('aria-label', t('Tirar {exercicio} da lista', { exercicio: exercicio.nome }));
    excluir.addEventListener('click', () => excluirPersonalizado(exercicio.nome));

    const acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    acoes.append(excluir, botao);
    linha.append(info, acoes);
    return linha;
  }));

  catalogoVazio.hidden = visiveis.length > 0;
  totalCatalogo.textContent = quantosExercicios(visiveis.length);
}

function alternarExercicio(nome) {
  return umaPorVez(async () => {
    const existente = planilhaAlvo.find(item => item.dia_semana === diaAdmin && item.exercicio === nome);
    if (existente) {
      const { error } = await cliente.from(TABELA_PLANO).delete().eq('id', existente.id);
      if (error) {
        mostrarAviso(mensagemDoErro(error));
        return;
      }
      planilhaAlvo = planilhaAlvo.filter(item => item.id !== existente.id);
    } else {
      const posicao = planilhaAlvo
        .filter(item => item.dia_semana === diaAdmin)
        .reduce((maior, item) => Math.max(maior, item.posicao + 1), 0);
      const { data, error } = await cliente
        .from(TABELA_PLANO)
        .insert({
          user_id: alvoId,
          dia_semana: diaAdmin,
          exercicio: nome,
          // O admin escolhe esses padrões nas Configurações.
          series: lerPreferencia('seriesPadrao'),
          repeticoes: lerPreferencia('repeticoesPadrao'),
          posicao
        })
        .select()
        .single();
      if (error) {
        mostrarAviso(mensagemDoErro(error));
        return;
      }
      planilhaAlvo = [...planilhaAlvo, data];
    }
    mostrarAviso('');
    desenharPlanilhaAdmin();
    atualizarBotoesCatalogo();
  });
}

function desenharGrupos() {
  grupos.replaceChildren(...[TODOS, ...Object.keys(CATALOGO)].map(nome => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'grupo';
    botao.textContent = t(nome);
    botao.setAttribute('aria-pressed', String(nome === grupoAtivo));
    botao.addEventListener('click', () => {
      grupoAtivo = nome;
      grupos.querySelectorAll('.grupo').forEach(outro => {
        outro.setAttribute('aria-pressed', String(outro === botao));
      });
      desenharCatalogo();
    });
    return botao;
  }));
}

async function carregarAlvo(id) {
  alvoId = id;
  const [plano, historico, notasDoAluno] = await Promise.all([
    cliente.from(TABELA_PLANO).select('*').eq('user_id', id).order('posicao'),
    cliente.from(TABELA_SERIES).select('*').eq('user_id', id),
    cliente.from(TABELA_NOTAS).select('*').eq('user_id', id)
  ]);
  // O admin pode ter escolhido outro usuário enquanto os dados vinham do servidor.
  if (alvoId !== id) {
    return;
  }
  const erro = plano.error || historico.error;
  if (erro) {
    planilhaAlvo = [];
    seriesAlvo = [];
    mostrarAviso(mensagemDoErro(erro));
  } else {
    planilhaAlvo = plano.data;
    seriesAlvo = historico.data;
  }
  // As notas são só para o admin ler; se não carregarem, a planilha abre do mesmo jeito.
  notasAlvo = notasDoAluno.error ? [] : notasDoAluno.data;
  desenharPlanilhaAdmin();
  atualizarBotoesCatalogo();
}

async function carregarPersonalizados() {
  const { data, error } = await cliente.from(TABELA_PERSONALIZADOS).select('id, nome, grupo').order('nome');
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  exerciciosPersonalizados = data;
  desenharCatalogo();
}

function excluirPersonalizado(nome) {
  return umaPorVez(async () => {
    const exercicio = exerciciosPersonalizados.find(item => item.nome === nome);
    // As planilhas guardam o nome, então quem já tem o exercício continua com ele.
    const pergunta = t('Tirar "{exercicio}" da lista? Quem já tem esse exercício na planilha continua com ele.', { exercicio: nome });
    if (!exercicio || !confirm(pergunta)) {
      return;
    }
    const { error } = await cliente.from(TABELA_PERSONALIZADOS).delete().eq('id', exercicio.id);
    if (error) {
      mostrarAviso(mensagemDoErro(error));
      return;
    }
    exerciciosPersonalizados = exerciciosPersonalizados.filter(item => item.id !== exercicio.id);
    desenharCatalogo();
    mostrarAviso(t('"{exercicio}" saiu da lista.', { exercicio: nome }));
  });
}

function preencherGruposDoCadastro() {
  novoExercicioGrupo.replaceChildren(...Object.keys(CATALOGO).map(grupo => {
    const opcao = document.createElement('option');
    opcao.value = grupo;
    opcao.textContent = t(grupo);
    return opcao;
  }));
}

async function carregarAdmin() {
  await carregarPersonalizados();
  const { data, error } = await cliente.rpc('listar_usuarios');
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  usuariosAdmin = data;
  const manterAlvo = usuariosAdmin.some(pessoa => pessoa.user_id === alvoId);
  adminUsuario.replaceChildren(...usuariosAdmin.map(pessoa => {
    const opcao = document.createElement('option');
    opcao.value = pessoa.user_id;
    opcao.textContent = pessoa.user_id === usuario.id ? t('{nome} (você)', { nome: pessoa.usuario }) : pessoa.usuario;
    return opcao;
  }));
  const proximo = manterAlvo ? alvoId : usuariosAdmin[0]?.user_id ?? null;
  if (proximo) {
    adminUsuario.value = proximo;
    await carregarAlvo(proximo);
  } else {
    alvoId = null;
    planilhaAlvo = [];
    seriesAlvo = [];
    desenharPlanilhaAdmin();
    atualizarBotoesCatalogo();
  }
}

adminUsuario.addEventListener('change', () => {
  mostrarAviso('');
  carregarAlvo(adminUsuario.value).catch(erro => mostrarAviso(mensagemDoErro(erro)));
});

botaoExcluirConta.addEventListener('click', () => umaPorVez(async () => {
  const alvo = buscarAlvo();
  const pergunta = alvo && t('Excluir a conta de {nome}, com a planilha e todo o progresso? Isso não pode ser desfeito.', { nome: alvo.usuario });
  if (!alvo || !confirm(pergunta)) {
    return;
  }
  const { error } = await cliente.rpc('admin_excluir_conta', { alvo: alvo.user_id });
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  alvoId = null;
  await carregarAdmin();
  mostrarAviso(t('A conta de {nome} foi excluída.', { nome: alvo.usuario }));
}));

busca.addEventListener('input', desenharCatalogo);

aoEnviar(formNovoExercicio, async () => {
  // Espaços repetidos viram um só, para "Remada  baixa" não virar um exercício diferente.
  const nome = novoExercicioNome.value.trim().replace(/\s+/g, ' ');
  if (nome.length < 2) {
    mostrarAviso(t('Digite o nome do exercício, com pelo menos 2 letras.'));
    return;
  }
  if (todosExercicios().some(exercicio => normalizar(exercicio.nome) === normalizar(nome))) {
    mostrarAviso(t('Esse exercício já está na lista.'));
    return;
  }

  const { data, error } = await cliente
    .from(TABELA_PERSONALIZADOS)
    .insert({ nome, grupo: novoExercicioGrupo.value })
    .select('id, nome, grupo')
    .single();
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }

  exerciciosPersonalizados = [...exerciciosPersonalizados, data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  formNovoExercicio.reset();
  busca.value = nome;
  grupoAtivo = TODOS;
  desenharGrupos();
  desenharCatalogo();
  mostrarAviso(t('"{exercicio}" foi cadastrado e já está na lista.', { exercicio: nome }));
});

preencherGruposDoCadastro();
