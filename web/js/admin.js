// Aba Admin: planilhas dos usuários, catálogo de exercícios e exclusão de contas.

// --- Painel de admin ---

function buscarAlvo() {
  return usuariosAdmin.find(pessoa => pessoa.user_id === alvoId) ?? null;
}

function criarCamposAdmin(item) {
  const numeros = document.createElement('div');
  numeros.className = 'item-numeros';

  const series = criarEntrada(item.series, 'numeric', `Séries de ${item.exercicio}`);
  const repeticoes = criarEntrada(item.repeticoes, 'text', `Faixa de repetições de ${item.exercicio}`);
  repeticoes.placeholder = '6-8';
  const rir = criarEntrada(item.rir, 'text', `RIR por série de ${item.exercicio}`);
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
      mostrarAviso('Use uma faixa de repetições, do menor para o maior, como 6-8.');
      return;
    }
    salvar('repeticoes', valor, repeticoes, item.repeticoes);
  });
  rir.addEventListener('change', () => {
    const texto = rir.value.trim();
    const valido = /^\d{1,2}(-\d{1,2})*$/.test(texto) && texto.split('-').every(parte => Number(parte) <= 10);
    if (texto !== '' && !valido) {
      rir.value = item.rir === null ? '' : item.rir;
      mostrarAviso('Use um RIR de 0 a 10 para cada série, separado por hífen, como 0-1-1. Também pode ficar vazio.');
      return;
    }
    salvar('rir', texto === '' ? null : texto, rir, item.rir);
  });

  numeros.append(criarCampo('Séries', series), criarCampo('Reps', repeticoes), criarCampo('RIR', rir));
  return numeros;
}

function desenharPlanilhaAdmin() {
  const alvo = buscarAlvo();
  adminSemana.textContent = alvo ? `Está na semana ${alvo.semana_atual}.` : 'Nenhum usuário encontrado.';
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
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', `Remover ${item.exercicio} da planilha`);
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
  botao.textContent = noDia ? 'Remover' : 'Adicionar';
  botao.setAttribute('aria-pressed', String(noDia));
  botao.disabled = !alvoId;
}

function atualizarBotoesCatalogo() {
  // Atualiza os botões no lugar, para o foco do teclado não se perder.
  catalogo.querySelectorAll('.adicionar').forEach(botao => atualizarBotao(botao, botao.dataset.nome));
}

function desenharCatalogo() {
  const termo = normalizar(busca.value);
  const visiveis = EXERCICIOS.filter(exercicio =>
    (grupoAtivo === TODOS || exercicio.grupo === grupoAtivo) &&
    normalizar(exercicio.nome).includes(termo)
  );

  catalogo.replaceChildren(...visiveis.map(exercicio => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'adicionar';
    botao.dataset.nome = exercicio.nome;
    botao.setAttribute('aria-label', exercicio.nome);
    atualizarBotao(botao, exercicio.nome);
    botao.addEventListener('click', () => alternarExercicio(exercicio.nome));

    linha.append(criarInfo(exercicio), botao);
    return linha;
  }));

  catalogoVazio.hidden = visiveis.length > 0;
  totalCatalogo.textContent = plural(visiveis.length, 'exercício', 'exercícios');
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
          series: SERIES_PADRAO,
          repeticoes: REPETICOES_PADRAO,
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
    botao.textContent = nome;
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

async function carregarAdmin() {
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
    opcao.textContent = pessoa.user_id === usuario.id ? `${pessoa.usuario} (você)` : pessoa.usuario;
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
  if (!alvo || !confirm(`Excluir a conta de ${alvo.usuario}, com a planilha e todo o progresso? Isso não pode ser desfeito.`)) {
    return;
  }
  const { error } = await cliente.rpc('admin_excluir_conta', { alvo: alvo.user_id });
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  alvoId = null;
  await carregarAdmin();
  mostrarAviso(`A conta de ${alvo.usuario} foi excluída.`);
}));

busca.addEventListener('input', desenharCatalogo);
