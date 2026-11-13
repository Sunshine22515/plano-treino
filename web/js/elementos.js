// Referências aos elementos da página, buscadas uma vez ao carregar.

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
const sessao = document.getElementById('sessao');
const nomeUsuario = document.getElementById('nome-usuario');
const dataHoje = document.getElementById('data-hoje');
const resumoSemana = document.getElementById('resumo-semana');
const resumoExercicios = document.getElementById('resumo-exercicios');
const resumoFeitos = document.getElementById('resumo-feitos');
const semanaCartao = document.getElementById('semana-cartao');
const tituloDia = document.getElementById('titulo-dia');
const perfilNome = document.getElementById('perfil-nome');
const perfilResumo = document.getElementById('perfil-resumo');
const perfilResumoPeriodo = document.getElementById('perfil-resumo-periodo');
const perfilResumoValor = document.getElementById('perfil-resumo-valor');
const perfilResumoDetalhe = document.getElementById('perfil-resumo-detalhe');
const progressoCartao = document.getElementById('progresso-cartao');
const botaoSair = document.getElementById('sair');
const abas = {
  treino: document.getElementById('aba-treino'),
  perfil: document.getElementById('aba-perfil'),
  admin: document.getElementById('aba-admin'),
  config: document.getElementById('aba-config')
};
const botaoAbrirConfig = document.getElementById('abrir-config');
const configTema = document.getElementById('config-tema');
const configIdioma = document.getElementById('config-idioma');
const configAnterior = document.getElementById('config-anterior');
const configExecucao = document.getElementById('config-execucao');
const configConfirmar = document.getElementById('config-confirmar');
const configAdmin = document.getElementById('config-admin');
const configSeries = document.getElementById('config-series');
const configReps = document.getElementById('config-reps');
const formTrocarSenha = document.getElementById('form-trocar-senha');
const configNovaSenha = document.getElementById('config-nova-senha');
const configConfirmarSenha = document.getElementById('config-confirmar-senha');
const botaoExportar = document.getElementById('exportar-historico');
const botaoSairDeTudo = document.getElementById('sair-de-tudo');
const botaoAbaAdmin = document.getElementById('aba-admin-botao');
const tituloSemana = document.getElementById('titulo-semana');
const totalDia = document.getElementById('total-dia');
const diasTreino = document.getElementById('dias-treino');
const treinoVazio = document.getElementById('treino-vazio');
const treino = document.getElementById('treino');
const botaoConcluirSemana = document.getElementById('concluir-semana');
const progresso = document.getElementById('progresso');
const progressoVazio = document.getElementById('progresso-vazio');
const adminUsuario = document.getElementById('admin-usuario');
const adminSemana = document.getElementById('admin-semana');
const diasAdmin = document.getElementById('dias-admin');
const adminVazio = document.getElementById('admin-vazio');
const adminPlano = document.getElementById('admin-plano');
const adminProgresso = document.getElementById('admin-progresso');
const adminProgressoVazio = document.getElementById('admin-progresso-vazio');
const botaoExcluirConta = document.getElementById('excluir-conta');
const catalogo = document.getElementById('catalogo');
const catalogoVazio = document.getElementById('catalogo-vazio');
const totalCatalogo = document.getElementById('total-catalogo');
const busca = document.getElementById('busca');
const grupos = document.getElementById('grupos');
const formNovoExercicio = document.getElementById('form-novo-exercicio');
const novoExercicioNome = document.getElementById('novo-exercicio-nome');
const novoExercicioGrupo = document.getElementById('novo-exercicio-grupo');
const janelaDemonstracao = document.getElementById('janela-demonstracao');
const demonstracaoTitulo = document.getElementById('demonstracao-titulo');
const demonstracaoFoto = document.getElementById('demonstracao-foto');
const demonstracaoCarregando = document.getElementById('demonstracao-carregando');
const botaoFecharDemonstracao = document.getElementById('fechar-demonstracao');
