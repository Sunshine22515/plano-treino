// Dados que mudam enquanto o app está aberto: sessão, planilhas, registros e telas escolhidas.

let cliente = null;
let usuario = null;
let perfil = null;
let planilha = [];
let registros = [];
let series = [];
let notas = [];
let notasAlvo = [];
let abaAtiva = 'treino';
// Para onde o botão voltar leva ao sair das Configurações.
let abaAntesDaConfig = 'treino';
// Nenhum dia aberto ao entrar: o aluno escolhe o dia na lista.
let diaAtivo = null;
let usuariosAdmin = [];
let alvoId = null;
let planilhaAlvo = [];
let seriesAlvo = [];
let exerciciosPersonalizados = [];
let diaAdmin = 1;
let grupoAtivo = TODOS;
let ocupado = false;
let modoRecuperacao = false;
let telaContaAtiva = 'entrar';
let confirmandoCadastro = false;
let encerrandoConfirmacao = false;
