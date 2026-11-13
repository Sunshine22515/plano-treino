// Valores fixos usados em todo o app: tabelas do banco, padrões, mensagens de erro e dias da semana.

const TABELA_PLANO = 'plano_exercicios';
const TABELA_REGISTROS = 'registros_treino';
const TABELA_SERIES = 'registros_series';
const TABELA_PERSONALIZADOS = 'exercicios_personalizados';
const SERIES_PADRAO = 3;
const REPETICOES_PADRAO = '8-12';
const TODOS = 'Todos';
const TEMPO_LIMITE_MS = 25000;
const TAMANHO_MINIMO_SENHA = 8;
const TEMPO_SALVO_MS = 2000;

// As mensagens já saem no idioma escolhido, porque o idioma.js carrega antes deste arquivo.
const MENSAGENS_ERRO = {
  invalid_credentials: t('Usuário ou senha incorretos.'),
  email_not_confirmed: t('Confirme seu e-mail pelo link que enviamos antes de entrar.'),
  weak_password: t('Essa senha é fraca. Escolha uma senha mais forte.'),
  over_email_send_rate_limit: t('Muitos e-mails enviados. Espere alguns minutos e tente de novo.'),
  over_request_rate_limit: t('Muitas tentativas. Espere alguns minutos e tente de novo.'),
  user_already_exists: t('Esse nome de usuário já está em uso.'),
  muitas_tentativas: t('Muitas tentativas com esse usuário. Espere 15 minutos e tente de novo.'),
  muitos_cadastros: t('Muitas contas criadas em pouco tempo. Tente de novo mais tarde.'),
  usuario_invalido: t('O nome de usuário precisa ter de 3 a 20 letras sem acento, números ou _, sem espaços.'),
  senha_invalida: t('A senha precisa ter pelo menos 8 caracteres e não pode ser longa demais.'),
  // Código do Postgres para valor repetido, como um exercício próprio com nome já cadastrado.
  23505: t('Já existe um exercício com esse nome.'),
  // Código do Postgres para "permissão negada": a conta tentou mexer no que não é dela.
  42501: t('Sua conta não tem permissão para isso.')
};

// A semana começa na segunda. O número é o de Date.getDay(), em que 0 é domingo.
const DIAS = [
  { numero: 1, nome: t('Seg'), completo: t('Segunda') },
  { numero: 2, nome: t('Ter'), completo: t('Terça') },
  { numero: 3, nome: t('Qua'), completo: t('Quarta') },
  { numero: 4, nome: t('Qui'), completo: t('Quinta') },
  { numero: 5, nome: t('Sex'), completo: t('Sexta') },
  { numero: 6, nome: t('Sáb'), completo: t('Sábado') },
  { numero: 0, nome: t('Dom'), completo: t('Domingo') }
];
