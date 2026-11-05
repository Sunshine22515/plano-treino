// Dados públicos do projeto Supabase. A proteção dos dados vem das regras do banco (RLS).
// Nunca coloque aqui a chave sb_secret_ nem a senha do banco.
const SUPABASE_URL = 'https://pjdyfbitdthajnferixp.supabase.co';
const SUPABASE_CHAVE_PUBLICA = 'sb_publishable_ZDBgAEiYk-n-J2lwFAfKtQ_I1nHIrD0';

// Desligado: o cadastro pede só usuário e senha, e não há recuperação de senha por e-mail.
// Para religar, mude para true e ligue "Confirm email" no painel do Supabase.
const USAR_EMAIL = false;
