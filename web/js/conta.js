// Contas e sessão: login, cadastro, senha, troca de telas e carregamento dos dados.

// --- Telas ---

function mostrarAba(nome) {
  abaAtiva = nome;
  Object.entries(abas).forEach(([chave, elemento]) => {
    elemento.hidden = chave !== nome;
  });
  document.querySelectorAll('[data-aba]').forEach(botao => {
    if (botao.dataset.aba === nome) {
      botao.setAttribute('aria-current', 'page');
    } else {
      botao.removeAttribute('aria-current');
    }
  });
}

async function carregarDados(idUsuario) {
  const [dadosPerfil, plano, historico, seriesFeitas] = await Promise.all([
    cliente.rpc('meu_perfil').maybeSingle(),
    cliente.from(TABELA_PLANO).select('*').eq('user_id', idUsuario).order('posicao'),
    cliente.from(TABELA_REGISTROS).select('*').eq('user_id', idUsuario),
    cliente.from(TABELA_SERIES).select('*').eq('user_id', idUsuario)
  ]);

  // A pessoa pode ter saído enquanto os dados vinham do servidor.
  if (usuario?.id !== idUsuario) {
    return;
  }
  const erro = dadosPerfil.error || plano.error || historico.error || seriesFeitas.error;
  if (erro) {
    mostrarAviso(mensagemDoErro(erro));
    return;
  }
  if (!dadosPerfil.data) {
    mostrarAviso('Esta conta não tem nome de usuário. Fale com o admin.');
    return;
  }

  perfil = dadosPerfil.data;
  planilha = plano.data;
  registros = historico.data;
  series = seriesFeitas.data;
  nomeUsuario.textContent = `Olá, ${perfil.usuario}.`;
  botaoAbaAdmin.hidden = perfil.papel !== 'admin';
  mostrarAba('treino');
  desenharTreino();
  desenharProgresso();
}

function mostrarTelas() {
  Object.entries(telasConta).forEach(([nome, tela]) => {
    tela.hidden = Boolean(usuario) || nome !== telaContaAtiva;
  });
  telaNovaSenha.hidden = !usuario || !modoRecuperacao;
  telaApp.hidden = !usuario || modoRecuperacao;
  sessao.hidden = !usuario;
  document.body.classList.toggle('modo-login', !usuario);
}

function limparDados() {
  perfil = null;
  planilha = [];
  registros = [];
  series = [];
  usuariosAdmin = [];
  alvoId = null;
  planilhaAlvo = [];
  seriesAlvo = [];
  botaoAbaAdmin.hidden = true;
  nomeUsuario.textContent = '';
  mostrarAba('treino');
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
    limparDados();
  } else if (mudou) {
    mostrarAviso('');
    limparDados();
    carregarDados(usuario.id);
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
    mostrarAviso(await mensagemDaFuncao(error));
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

  // Sem e-mail, o cadastro passa pela função "cadastrar", que aplica o limite de novas contas.
  if (!USAR_EMAIL) {
    const { error } = await cliente.functions.invoke('cadastrar', {
      body: { usuario: nome, senha }
    });
    if (error) {
      mostrarAviso(await mensagemDaFuncao(error));
      return;
    }
    formCadastro.reset();
    telaContaAtiva = 'entrar';
    mostrarTelas();
    mostrarAviso('Sua conta está pronta! Entre com seu usuário e senha.');
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

  // Se a confirmação de e-mail estiver desligada, o cadastro já devolve uma sessão, que precisa ser encerrada.
  confirmandoCadastro = true;
  // O gatilho do banco lê o nome enviado em "data" e cria o perfil junto com a conta.
  const { data, error } = await cliente.auth.signUp({
    email: document.getElementById('cadastro-email').value.trim(),
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

botaoSair.addEventListener('click', async () => {
  const { error } = await cliente.auth.signOut();
  mostrarAviso(error ? mensagemDoErro(error) : '');
});
