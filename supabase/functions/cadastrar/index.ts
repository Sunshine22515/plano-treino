// Cadastro por nome de usuário. Roda no servidor do Supabase, nunca no navegador.
// Com o cadastro público desligado, esta função é o único caminho para criar contas,
// então ninguém consegue pular o limite indo direto ao Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.118.0/cors';

const url = Deno.env.get('SUPABASE_URL')!;
const chaveSecreta = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!).default;
const opcoes = { auth: { persistSession: false, autoRefreshToken: false } };

// O Supabase exige um e-mail em toda conta. ".invalid" é reservado e nunca recebe mensagens.
const DOMINIO_EMAIL_INTERNO = 'plano-treino.invalid';
const TAMANHO_MINIMO_SENHA = 8;
// O sistema de senhas do Supabase só considera os primeiros 72 bytes.
const TAMANHO_MAXIMO_SENHA_BYTES = 72;

function responder(status: number, corpo: unknown) {
  return Response.json(corpo, { status, headers: corsHeaders });
}

// Guarda só um resumo do endereço. A chave secreta impede descobrir o endereço testando todos.
async function resumirEndereco(endereco: string) {
  const dados = new TextEncoder().encode(chaveSecreta + ':' + endereco);
  const resumo = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(resumo), byte => byte.toString(16).padStart(2, '0')).join('');
}

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
  if (!/^[a-z0-9_]{3,20}$/.test(usuario)) {
    return responder(400, { code: 'usuario_invalido' });
  }
  if (senha.length < TAMANHO_MINIMO_SENHA || new TextEncoder().encode(senha).length > TAMANHO_MAXIMO_SENHA_BYTES) {
    return responder(400, { code: 'senha_invalida' });
  }

  const admin = createClient(url, chaveSecreta, opcoes);

  // Sem esse cabeçalho, todos os pedidos dividem o mesmo limite, o que é mais seguro que não ter limite.
  const endereco = req.headers.get('cf-connecting-ip') ?? 'desconhecido';
  const { data: permitido, error: erroLimite } = await admin.rpc('permitir_cadastro', {
    chave_endereco: await resumirEndereco(endereco)
  });
  if (erroLimite) {
    console.error(erroLimite);
    return responder(500, { code: 'erro_interno' });
  }
  if (!permitido) {
    return responder(429, { code: 'muitos_cadastros' });
  }

  const { data: existente, error: erroPerfil } = await admin
    .from('perfis')
    .select('user_id')
    .eq('usuario', usuario)
    .maybeSingle();
  if (erroPerfil) {
    console.error(erroPerfil);
    return responder(500, { code: 'erro_interno' });
  }
  if (existente) {
    return responder(409, { code: 'user_already_exists' });
  }

  // A parte antes do @ é aleatória: se viesse do usuário, daria para pular o limite de tentativas de login.
  const { error: erroConta } = await admin.auth.admin.createUser({
    email: crypto.randomUUID() + '@' + DOMINIO_EMAIL_INTERNO,
    password: senha,
    email_confirm: true,
    user_metadata: { usuario }
  });
  if (erroConta) {
    console.error(erroConta);
    if (erroConta.code === 'weak_password') {
      return responder(400, { code: 'weak_password' });
    }
    return responder(500, { code: 'erro_interno' });
  }

  return responder(201, { ok: true });
});
