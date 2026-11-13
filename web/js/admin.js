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

  const salvar = async (coluna, valor, entrada, anterior) => {
    const { error } = await cliente.from(TABELA_PLANO).update({ [coluna]: valor }).eq('id', item.id);
    if (error) {
      entrada.value = anterior === null ? '' : String(anterior);
      mostrarAviso(mensagemDoErro(error));
      return;
    }
    item[coluna] = valor;
    entrada.value = valor === null ? '' : String(valor);
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

  numeros.append(criarCampo(t('Séries'), series), criarCampo(t('Reps'), repeticoes), criarCampo(t('RIR'), rir));
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

  const doDia = planilhaAlvo.filter(item => item.dia_semana === diaAdmin);
  adminPlano.replaceChildren(...doDia.map(item => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = t('Remover');
    remover.setAttribute('aria-label', t('Remover {exercicio} da planilha', { exercicio: nomeExercicio(item.exercicio) }));
    remover.addEventListener('click', () => alternarExercicio(item.exercicio));

    linha.append(criarInfo(buscarExercicio(item.exercicio)), criarCamposAdmin(item), remover);
    return linha;
  }));
  adminVazio.hidden = doDia.length > 0 || !alvo;

  desenharTabelaProgresso(adminProgresso, adminProgressoVazio, seriesAlvo);
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
    (grupoAtivo === TODOS || exercicio.grupo === grupoAtivo) &&
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
  const [plano, historico] = await Promise.all([
    cliente.from(TABELA_PLANO).select('*').eq('user_id', id).order('posicao'),
    cliente.from(TABELA_SERIES).select('*').eq('user_id', id)
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
