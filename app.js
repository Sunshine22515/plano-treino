const TABELA = 'plano_itens';
const CHAVE_PLANO_LOCAL = 'plano-treino:itens';
// O Supabase exige um e-mail em toda conta. ".invalid" é reservado e nunca recebe mensagens.
// A parte antes do @ é aleatória: se viesse do usuário, daria para pular o limite de tentativas da função "entrar".
const DOMINIO_EMAIL_INTERNO = 'plano-treino.invalid';
const SERIES_PADRAO = 3;
const REPETICOES_PADRAO = 12;
const TODOS = 'Todos';
const TEMPO_LIMITE_MS = 25000;
const TAMANHO_MINIMO_SENHA = 8;

const MENSAGENS_ERRO = {
  invalid_credentials: 'Usuário ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  weak_password: 'Essa senha é fraca. Escolha uma senha mais forte.',
  over_email_send_rate_limit: 'Muitos e-mails enviados. Espere alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  user_already_exists: 'Esse nome de usuário já está em uso.',
  muitas_tentativas: 'Muitas tentativas com esse usuário. Espere 15 minutos e tente de novo.'
};

const CATALOGO = {
  Peito: ['Supino reto', 'Supino inclinado', 'Supino declinado', 'Crucifixo com halteres', 'Crossover', 'Flexão de braço', 'Peck deck'],
  Costas: ['Puxada frontal', 'Barra fixa', 'Remada curvada', 'Remada baixa', 'Remada unilateral', 'Pulldown', 'Levantamento terra'],
  Pernas: ['Agachamento livre', 'Agachamento no Smith', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Afundo', 'Passada', 'Panturrilha em pé'],
  'Glúteos': ['Elevação pélvica', 'Agachamento sumô', 'Cadeira abdutora', 'Coice na polia', 'Stiff'],
  Ombros: ['Desenvolvimento com halteres', 'Elevação lateral', 'Elevação frontal', 'Crucifixo inverso', 'Encolhimento'],
  'Bíceps': ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca scott', 'Rosca concentrada'],
  'Tríceps': ['Tríceps na polia', 'Tríceps testa', 'Tríceps francês', 'Mergulho no banco', 'Supino fechado'],
  'Abdômen': ['Abdominal supra', 'Abdominal infra', 'Prancha', 'Prancha lateral', 'Elevação de pernas', 'Abdominal na polia']
};

const EXERCICIOS = Object.entries(CATALOGO).flatMap(([grupo, nomes]) =>
  nomes.map(nome => ({ nome, grupo }))
);

const aviso = document.getElementById('aviso');
const telasConta = {
  entrar: document.getElementById('tela-entrar'),
  cadastro: document.getElementById('tela-cadastro'),
  recuperar: document.getElementById('tela-recuperar')
};
const telaApp = document.getElementById('tela-app');
const formEntrar = document.getElementById('form-entrar');
const formCadastro = document.getElementById('form-cadastro');
const formRecuperar = document.getElementById('form-recuperar');
const telaNovaSenha = document.getElementById('tela-nova-senha');
const formNovaSenha = document.getElementById('form-nova-senha');
const campoNovaSenha = document.getElementById('nova-senha');
const botaoExcluirConta = document.getElementById('excluir-conta');
const sessao = document.getElementById('sessao');
const nomeUsuario = document.getElementById('nome-usuario');
const botaoSair = document.getElementById('sair');
const plano = document.getElementById('plano');
const planoVazio = document.getElementById('plano-vazio');
const totalPlano = document.getElementById('total-plano');
const limparPlano = document.getElementById('limpar-plano');
const catalogo = document.getElementById('catalogo');
const catalogoVazio = document.getElementById('catalogo-vazio');
const totalCatalogo = document.getElementById('total-catalogo');
const busca = document.getElementById('busca');
const grupos = document.getElementById('grupos');

let cliente = null;
let usuario = null;
let itens = [];
let grupoAtivo = TODOS;
let ocupado = false;
let modoRecuperacao = false;
let telaContaAtiva = 'entrar';
let confirmandoCadastro = false;
let encerrandoConfirmacao = false;

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
    botao.textContent = 'Aguarde...';
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

function mensagemDoErro(erro) {
  console.error(erro);
  // O código ajuda a identificar o problema no celular, onde não há console para ler.
  return MENSAGENS_ERRO[erro.code] || `Algo deu errado (${erro.code || erro.message}). Confira sua conexão e tente de novo.`;
}

// Usa getRandomValues porque crypto.randomUUID não existe em todos os navegadores de apps Android.
function gerarIdAleatorio() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function buscarExercicio(nome) {
  return EXERCICIOS.find(exercicio => exercicio.nome === nome) || { nome, grupo: 'Outros' };
}

function limitar(valor, padrao) {
  const numero = Math.round(Number(valor));
  return numero >= 1 ? Math.min(numero, 99) : padrao;
}

// Plano antigo, salvo só no navegador. É usado uma vez, para levar os dados para a conta.
function lerPlanoLocal() {
  try {
    const salvos = JSON.parse(localStorage.getItem(CHAVE_PLANO_LOCAL));
    if (!Array.isArray(salvos)) {
      return [];
    }
    return salvos
      .filter(item => item && EXERCICIOS.some(exercicio => exercicio.nome === item.nome))
      .map((item, indice) => ({
        exercicio: item.nome,
        series: limitar(item.series, SERIES_PADRAO),
        repeticoes: limitar(item.repeticoes, REPETICOES_PADRAO),
        posicao: indice
      }));
  } catch {
    return [];
  }
}

function apagarPlanoLocal() {
  try {
    localStorage.removeItem(CHAVE_PLANO_LOCAL);
  } catch {
    // Sem armazenamento, não há plano local para apagar.
  }
}

function estaNoPlano(nome) {
  return itens.some(item => item.exercicio === nome);
}

// Ignora acentos e maiúsculas, para "triceps" encontrar "Tríceps".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

function criarInfo(exercicio) {
  const info = document.createElement('div');
  info.className = 'item-info';
  const nome = document.createElement('span');
  nome.className = 'item-nome';
  nome.textContent = exercicio.nome;
  const grupo = document.createElement('span');
  grupo.className = 'item-grupo';
  grupo.textContent = exercicio.grupo;
  info.append(nome, grupo);
  return info;
}

function criarCampo(rotulo, item, coluna, padrao) {
  const campo = document.createElement('label');
  campo.className = 'campo';
  campo.textContent = rotulo;
  const entrada = document.createElement('input');
  entrada.type = 'number';
  entrada.inputMode = 'numeric';
  entrada.min = '1';
  entrada.max = '99';
  entrada.value = String(item[coluna]);
  entrada.setAttribute('aria-label', `${rotulo} de ${item.exercicio}`);
  entrada.addEventListener('change', async () => {
    const anterior = item[coluna];
    const valor = limitar(entrada.value, padrao);
    entrada.value = String(valor);
    const { error } = await cliente
      .from(TABELA)
      .update({ [coluna]: valor })
      .eq('user_id', usuario.id)
      .eq('exercicio', item.exercicio);
    if (error) {
      entrada.value = String(anterior);
      mostrarAviso(mensagemDoErro(error));
      return;
    }
    item[coluna] = valor;
    mostrarAviso('');
  });
  campo.append(entrada);
  return campo;
}

function desenharPlano() {
  plano.replaceChildren(...itens.map(item => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const numeros = document.createElement('div');
    numeros.className = 'item-numeros';
    numeros.append(
      criarCampo('Séries', item, 'series', SERIES_PADRAO),
      criarCampo('Repetições', item, 'repeticoes', REPETICOES_PADRAO)
    );

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', `Remover ${item.exercicio} do plano`);
    remover.addEventListener('click', () => alternarExercicio(item.exercicio));

    linha.append(criarInfo(buscarExercicio(item.exercicio)), numeros, remover);
    return linha;
  }));

  planoVazio.hidden = itens.length > 0;
  limparPlano.hidden = itens.length === 0;
  totalPlano.textContent = plural(itens.length, 'exercício', 'exercícios');
}

function atualizarBotao(botao, nome) {
  const noPlano = estaNoPlano(nome);
  botao.textContent = noPlano ? 'Remover' : 'Adicionar';
  botao.setAttribute('aria-pressed', String(noPlano));
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

async function alternarExercicio(nome) {
  if (ocupado) {
    return;
  }
  ocupado = true;
  // O user_id não é enviado: o banco preenche com auth.uid() e o RLS confere o dono.
  const { error } = estaNoPlano(nome)
    ? await cliente.from(TABELA).delete().eq('user_id', usuario.id).eq('exercicio', nome)
    : await cliente.from(TABELA).insert(novoItem(nome));
  ocupado = false;

  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  itens = estaNoPlano(nome)
    ? itens.filter(item => item.exercicio !== nome)
    : [...itens, novoItem(nome)];
  mostrarAviso('');
  desenharPlano();
  atualizarBotoesCatalogo();
}

function novoItem(exercicio) {
  const posicao = itens.reduce((maior, item) => Math.max(maior, item.posicao + 1), 0);
  return { exercicio, series: SERIES_PADRAO, repeticoes: REPETICOES_PADRAO, posicao };
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

async function carregarPlano(idUsuario) {
  const { data, error } = await cliente
    .from(TABELA)
    .select('exercicio, series, repeticoes, posicao')
    .order('posicao');

  // A pessoa pode ter saído enquanto os dados vinham do servidor.
  if (usuario?.id !== idUsuario) {
    return;
  }
  if (error) {
    itens = [];
    mostrarAviso(mensagemDoErro(error));
  } else {
    itens = data;
    const local = lerPlanoLocal();
    if (itens.length === 0 && local.length > 0) {
      const { error: erroLocal } = await cliente.from(TABELA).insert(local);
      if (erroLocal) {
        mostrarAviso(mensagemDoErro(erroLocal));
      } else {
        itens = local;
        apagarPlanoLocal();
      }
    }
  }
  desenharPlano();
  desenharCatalogo();
}

function mostrarTelas() {
  Object.entries(telasConta).forEach(([nome, tela]) => {
    tela.hidden = Boolean(usuario) || nome !== telaContaAtiva;
  });
  telaNovaSenha.hidden = !usuario || !modoRecuperacao;
  telaApp.hidden = !usuario || modoRecuperacao;
  sessao.hidden = !usuario;
  nomeUsuario.textContent = usuario?.user_metadata?.usuario ?? '';
}

// O cadastro e o link de confirmação já chegam logados. Encerramos essa sessão para a pessoa entrar pelo login.
async function encerrarSessaoDaConfirmacao() {
  if (encerrandoConfirmacao) {
    return;
  }
  encerrandoConfirmacao = true;
  await cliente.auth.signOut({ scope: 'local' });
  confirmandoCadastro = false;
  encerrandoConfirmacao = false;
  telaContaAtiva = 'entrar';
  aplicarSessao(null);
  mostrarAviso('Sua conta está pronta! Entre com seu usuário e senha.');
}

function aplicarSessao(novaSessao) {
  if (confirmandoCadastro && novaSessao) {
    encerrarSessaoDaConfirmacao();
    return;
  }
  // Link inválido não traz sessão, e o próximo login precisa funcionar normalmente.
  confirmandoCadastro = false;

  const novoUsuario = novaSessao?.user ?? null;
  const mudou = novoUsuario?.id !== usuario?.id;
  usuario = novoUsuario;
  if (!usuario) {
    modoRecuperacao = false;
  }
  mostrarTelas();

  if (!usuario) {
    itens = [];
  } else if (mudou) {
    mostrarAviso('');
    carregarPlano(usuario.id);
  }
}

function iniciar() {
  if (!USAR_EMAIL) {
    document.getElementById('campo-email').remove();
    document.getElementById('esqueci-senha').remove();
  }
  if (!window.supabase) {
    mostrarAviso('Não foi possível carregar o app. Confira sua conexão e recarregue a página.');
    return;
  }
  if (!SUPABASE_URL.startsWith('https://')) {
    mostrarAviso('Falta configurar o Supabase no arquivo config.js.');
    return;
  }
  // Lido antes de criar o cliente, porque ele limpa esse trecho do endereço.
  confirmandoCadastro = new URLSearchParams(location.hash.slice(1)).get('type') === 'signup';
  cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
  // O setTimeout evita chamar o Supabase de dentro deste aviso, o que pode travar o login.
  cliente.auth.onAuthStateChange((evento, novaSessao) => {
    // Este evento avisa que a pessoa chegou pelo link de recuperação de senha.
    if (evento === 'PASSWORD_RECOVERY') {
      modoRecuperacao = true;
    }
    setTimeout(() => aplicarSessao(novaSessao));
  });
}

document.querySelectorAll('[data-ir-para]').forEach(botao => {
  botao.addEventListener('click', () => {
    telaContaAtiva = botao.dataset.irPara;
    mostrarAviso('');
    mostrarTelas();
  });
});

// O login passa pela função "entrar", no servidor, porque só ela pode descobrir o e-mail.
aoEnviar(formEntrar, async () => {
  const nome = document.getElementById('entrar-usuario').value.trim();
  const senha = document.getElementById('entrar-senha').value;
  if (!nome || !senha) {
    mostrarAviso('Preencha o nome de usuário e a senha.');
    return;
  }
  const { data, error } = await cliente.functions.invoke('entrar', {
    body: { usuario: nome, senha }
  });
  if (error) {
    // Em respostas de erro, o motivo vem no corpo da resposta da função.
    const corpo = await error.context?.json?.()?.catch(() => null);
    mostrarAviso(mensagemDoErro(corpo?.code ? corpo : error));
    return;
  }
  const { error: erroSessao } = await cliente.auth.setSession(data);
  if (erroSessao) {
    mostrarAviso(mensagemDoErro(erroSessao));
    return;
  }
  formEntrar.reset();
  mostrarAviso('');
});

aoEnviar(formCadastro, async () => {
  const nome = document.getElementById('cadastro-usuario').value.trim().toLowerCase();
  const senha = document.getElementById('cadastro-senha').value;
  if (!/^[a-z0-9_]{3,20}$/.test(nome)) {
    mostrarAviso('O nome de usuário precisa ter de 3 a 20 letras sem acento, números ou _, sem espaços.');
    return;
  }
  if (USAR_EMAIL && !document.getElementById('cadastro-email').checkValidity()) {
    mostrarAviso('Digite um e-mail válido.');
    return;
  }
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    mostrarAviso(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
    return;
  }
  if (senha !== document.getElementById('cadastro-confirmar').value) {
    mostrarAviso('As senhas não são iguais.');
    return;
  }

  const { data: disponivel, error: erroNome } = await cliente.rpc('usuario_disponivel', { nome });
  if (erroNome) {
    mostrarAviso(mensagemDoErro(erroNome));
    return;
  }
  if (!disponivel) {
    mostrarAviso('Esse nome de usuário já está em uso.');
    return;
  }

  // Sem confirmação de e-mail, o cadastro já devolve uma sessão, que precisa ser encerrada.
  confirmandoCadastro = true;
  // O gatilho do banco lê o nome enviado em "data" e cria o perfil junto com a conta.
  const { data, error } = await cliente.auth.signUp({
    email: USAR_EMAIL ? document.getElementById('cadastro-email').value.trim() : `${gerarIdAleatorio()}@${DOMINIO_EMAIL_INTERNO}`,
    password: senha,
    options: {
      data: { usuario: nome },
      emailRedirectTo: location.origin + location.pathname
    }
  });
  if (error) {
    confirmandoCadastro = false;
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  formCadastro.reset();
  telaContaAtiva = 'entrar';
  mostrarTelas();
  // Sem sessão, o Supabase está esperando a confirmação do e-mail.
  if (!data.session) {
    confirmandoCadastro = false;
    mostrarAviso('Enviamos um link de confirmação para o seu e-mail. Se esse e-mail já tiver conta, entre com o seu usuário.');
  }
});

aoEnviar(formRecuperar, async () => {
  const campo = document.getElementById('recuperar-email');
  if (!campo.checkValidity()) {
    mostrarAviso('Digite um e-mail válido.');
    return;
  }
  const { error } = await cliente.auth.resetPasswordForEmail(campo.value.trim(), {
    redirectTo: location.origin + location.pathname
  });
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  formRecuperar.reset();
  // A mensagem é a mesma com ou sem conta, para não revelar quais e-mails estão cadastrados.
  mostrarAviso('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.');
});

aoEnviar(formNovaSenha, async () => {
  if (campoNovaSenha.value.length < TAMANHO_MINIMO_SENHA) {
    mostrarAviso(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
    return;
  }
  const { error } = await cliente.auth.updateUser({ password: campoNovaSenha.value });
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  formNovaSenha.reset();
  modoRecuperacao = false;
  mostrarTelas();
  mostrarAviso('Senha alterada.');
});

botaoExcluirConta.addEventListener('click', async () => {
  if (!confirm('Excluir sua conta e todo o seu plano? Isso não pode ser desfeito.')) {
    return;
  }
  const { error } = await cliente.rpc('excluir_conta');
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  // A conta já não existe no servidor, então basta limpar a sessão deste navegador.
  await cliente.auth.signOut({ scope: 'local' });
  mostrarAviso('Sua conta foi excluída.');
});

botaoSair.addEventListener('click', async () => {
  const { error } = await cliente.auth.signOut();
  mostrarAviso(error ? mensagemDoErro(error) : '');
});

busca.addEventListener('input', desenharCatalogo);

limparPlano.addEventListener('click', async () => {
  if (!confirm('Remover todos os exercícios do plano?')) {
    return;
  }
  const { error } = await cliente.from(TABELA).delete().eq('user_id', usuario.id);
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  itens = [];
  mostrarAviso('');
  desenharPlano();
  atualizarBotoesCatalogo();
});

desenharGrupos();
desenharPlano();
desenharCatalogo();
iniciar();
