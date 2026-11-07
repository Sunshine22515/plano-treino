// Valores fixos usados em todo o app: tabelas do banco, padrões, mensagens de erro e dias da semana.

const TABELA_PLANO = 'plano_exercicios';
const TABELA_REGISTROS = 'registros_treino';
const TABELA_SERIES = 'registros_series';
const SERIES_PADRAO = 3;
const REPETICOES_PADRAO = '8-12';
const TODOS = 'Todos';
const TEMPO_LIMITE_MS = 25000;
const TAMANHO_MINIMO_SENHA = 8;
const TEMPO_SALVO_MS = 2000;

const MENSAGENS_ERRO = {
  invalid_credentials: 'Usuário ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  weak_password: 'Essa senha é fraca. Escolha uma senha mais forte.',
  over_email_send_rate_limit: 'Muitos e-mails enviados. Espere alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  user_already_exists: 'Esse nome de usuário já está em uso.',
  muitas_tentativas: 'Muitas tentativas com esse usuário. Espere 15 minutos e tente de novo.',
  muitos_cadastros: 'Muitas contas criadas em pouco tempo. Tente de novo mais tarde.',
  usuario_invalido: 'O nome de usuário precisa ter de 3 a 20 letras sem acento, números ou _, sem espaços.',
  senha_invalida: 'A senha precisa ter pelo menos 8 caracteres e não pode ser longa demais.'
};

// A semana começa na segunda. O número é o de Date.getDay(), em que 0 é domingo.
const DIAS = [
  { numero: 1, nome: 'Seg', completo: 'Segunda' },
  { numero: 2, nome: 'Ter', completo: 'Terça' },
  { numero: 3, nome: 'Qua', completo: 'Quarta' },
  { numero: 4, nome: 'Qui', completo: 'Quinta' },
  { numero: 5, nome: 'Sex', completo: 'Sexta' },
  { numero: 6, nome: 'Sáb', completo: 'Sábado' },
  { numero: 0, nome: 'Dom', completo: 'Domingo' }
];
