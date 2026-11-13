// Funções usadas por várias telas: avisos, formulários, formatação e criação de campos.

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = !texto;
  // No celular, o botão pode estar longe do topo, onde o aviso aparece.
  if (texto) {
    aviso.scrollIntoView({ block: 'center' });
  }
}

// Em todo formulário: o botão mostra que está esperando, e nenhum erro passa sem aviso.
function aoEnviar(form, acao) {
  form.addEventListener('submit', async evento => {
    evento.preventDefault();
    const botao = form.querySelector('[type="submit"]');
    if (botao.disabled) {
      return;
    }
    const texto = botao.textContent;
    botao.disabled = true;
    botao.textContent = t('Aguarde...');
    let limite;
    const tempoEsgotado = new Promise((_resolver, rejeitar) => {
      limite = setTimeout(() => rejeitar(new Error('Tempo esgotado')), TEMPO_LIMITE_MS);
    });
    try {
      await Promise.race([acao(), tempoEsgotado]);
    } catch (erro) {
      confirmandoCadastro = false;
      mostrarAviso(mensagemDoErro(erro));
    } finally {
      clearTimeout(limite);
      botao.disabled = false;
      botao.textContent = texto;
    }
  });
}

// Impede duas alterações ao mesmo tempo na mesma tela, como dois toques seguidos no mesmo botão.
async function umaPorVez(acao) {
  if (ocupado) {
    return;
  }
  ocupado = true;
  try {
    await acao();
  } catch (erro) {
    mostrarAviso(mensagemDoErro(erro));
  } finally {
    ocupado = false;
  }
}

function mensagemDoErro(erro) {
  console.error(erro);
  // O código ajuda a identificar o problema no celular, onde não há console para ler.
  return MENSAGENS_ERRO[erro.code] ||
    t('Algo deu errado ({codigo}). Confira sua conexão e tente de novo.', { codigo: erro.code || erro.message });
}

// Em respostas de erro de uma função do servidor, o motivo vem no corpo da resposta.
async function mensagemDaFuncao(erro) {
  const corpo = await erro.context?.json?.()?.catch(() => null);
  return mensagemDoErro(corpo?.code ? corpo : erro);
}

// A lista fixa do app mais os exercícios que o admin cadastrou.
function todosExercicios() {
  return [...EXERCICIOS, ...exerciciosPersonalizados.map(({ nome, grupo }) => ({ nome, grupo, personalizado: true }))];
}

function buscarExercicio(nome) {
  return todosExercicios().find(exercicio => exercicio.nome === nome) || { nome, grupo: 'Outros' };
}

// Quantos exercícios, já no idioma escolhido: "3 exercícios" ou "3 exercises".
function quantosExercicios(quantidade) {
  return plural(quantidade, t('exercício'), t('exercícios'));
}

function limitar(valor, padrao) {
  const numero = Math.round(Number(valor));
  return numero >= 1 ? Math.min(numero, 99) : padrao;
}

// Campo vazio ou inválido vira null. Aceita vírgula, como em "42,5".
function lerNumero(texto, maximo) {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') {
    return null;
  }
  const numero = Number(limpo);
  return Number.isFinite(numero) && numero >= 0 && numero <= maximo ? numero : null;
}

// Ignora acentos e maiúsculas, para "triceps" encontrar "Tríceps".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

function formatarCarga(registro) {
  const partes = [];
  if (registro.carga !== null) {
    partes.push(`${formatarCargaCampo(registro.carga)} kg`);
  }
  if (registro.repeticoes !== null) {
    partes.push(`${registro.repeticoes} reps`);
  }
  return partes.join(' × ');
}

function temValores(serie) {
  return serie.carga !== null || serie.repeticoes !== null;
}

// Em português a casa decimal é vírgula (42,5); em inglês, ponto (42.5).
function formatarCargaCampo(carga) {
  if (carga === null || carga === undefined) {
    return '';
  }
  return IDIOMA === 'en' ? String(carga) : String(carga).replace('.', ',');
}

function criarInfo(exercicio) {
  const info = document.createElement('div');
  info.className = 'item-info';
  const nome = document.createElement('span');
  nome.className = 'item-nome';
  nome.textContent = nomeExercicio(exercicio.nome);
  const grupo = document.createElement('span');
  grupo.className = 'item-grupo';
  grupo.textContent = t(exercicio.grupo);
  info.append(nome, grupo);
  return info;
}

function criarCampo(rotulo, entrada) {
  const campo = document.createElement('label');
  campo.className = 'campo';
  campo.textContent = rotulo;
  campo.append(entrada);
  return campo;
}

function criarEntrada(valor, modoTeclado, descricao) {
  const entrada = document.createElement('input');
  entrada.type = 'text';
  entrada.inputMode = modoTeclado;
  entrada.autocomplete = 'off';
  entrada.value = valor === null || valor === undefined ? '' : String(valor);
  entrada.setAttribute('aria-label', descricao);
  return entrada;
}

function criarBotoesDias(recipiente, diaSelecionado, diasVisiveis, aoEscolher, descricao) {
  recipiente.replaceChildren(...diasVisiveis.map(dia => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'grupo';
    botao.textContent = descricao ? descricao(dia) : dia.nome;
    botao.setAttribute('aria-pressed', String(dia.numero === diaSelecionado));
    botao.addEventListener('click', () => aoEscolher(dia.numero));
    return botao;
  }));
}
