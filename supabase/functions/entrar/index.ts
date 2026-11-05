// Login por nome de usuário. Roda no servidor do Supabase, nunca no navegador.
// O site envia usuário e senha; a função descobre o e-mail, faz o login e devolve só a sessão.
// Assim, o e-mail de uma pessoa nunca chega ao navegador de outra.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.118.0/cors';

const url = Deno.env.get('SUPABASE_URL')!;
const chaveSecreta = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!).default;
const chavePublica = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')!).default;
const opcoes = { auth: { persistSession: false, autoRefreshToken: false } };

function responder(status: number, corpo: unknown) {
  return Response.json(corpo, { status, headers: corsHeaders });
}

// A resposta é a mesma para usuário inexistente e senha errada.
const credenciaisInvalidas = () => responder(400, { code: 'invalid_credentials' });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return responder(405, { code: 'method_not_allowed' });
  }

  const corpo = await req.json().catch(() => null);
  const usuario = typeof corpo?.usuario === 'string' ? corpo.usuario.trim().toLowerCase() : '';
  const senha = typeof corpo?.senha === 'string' ? corpo.senha : '';
  if (!/^[a-z0-9_]{3,20}$/.test(usuario) || !senha) {
    return credenciaisInvalidas();
  }

  // A chave secreta fica só aqui, no servidor. Ela é o que permite ler perfis e e-mails.
  const admin = createClient(url, chaveSecreta, opcoes);
  const { data: perfil, error: erroPerfil } = await admin
    .from('perfis')
    .select('user_id')
    .eq('usuario', usuario)
    .maybeSingle();
  if (erroPerfil) {
    console.error(erroPerfil);
    return responder(500, { code: 'erro_interno' });
  }
  if (!perfil) {
    return credenciaisInvalidas();
  }

  const { data: conta, error: erroConta } = await admin.auth.admin.getUserById(perfil.user_id);
  if (erroConta || !conta.user?.email) {
    console.error(erroConta);
    return responder(500, { code: 'erro_interno' });
  }

  const publico = createClient(url, chavePublica, opcoes);
  const { data: login, error: erroLogin } = await publico.auth.signInWithPassword({
    email: conta.user.email,
    password: senha
  });
  if (erroLogin) {
    if (erroLogin.code === 'email_not_confirmed' || erroLogin.code === 'over_request_rate_limit') {
      return responder(400, { code: erroLogin.code });
    }
    return credenciaisInvalidas();
  }

  return responder(200, {
    access_token: login.session.access_token,
    refresh_token: login.session.refresh_token
  });
});
