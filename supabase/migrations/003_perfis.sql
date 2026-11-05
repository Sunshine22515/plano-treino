-- Nomes de usuário. Rode uma vez no SQL Editor do Supabase, depois da migração 002.
-- Contas criadas antes deste arquivo não ganham nome de usuário.

-- 1. A TABELA
-- Liga cada nome de usuário a uma conta. O e-mail continua só em auth.users.
create table public.perfis (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- "unique" impede dois usuários com o mesmo nome.
  -- A regra aceita de 3 a 20 letras minúsculas, números ou "_".
  usuario text not null unique check (usuario ~ '^[a-z0-9_]{3,20}$'),
  criado_em timestamptz not null default now()
);

-- 2. AS PERMISSÕES
-- O site não acessa esta tabela. Só a função "entrar", no servidor, consegue ler.
revoke all on table public.perfis from anon, authenticated;
grant select on table public.perfis to service_role;

-- RLS ligado e sem políticas: pela API pública, ninguém alcança nenhuma linha.
alter table public.perfis enable row level security;

-- 3. O GATILHO (trigger): roda sozinho sempre que uma conta nova é criada.
-- O nome vem dos dados enviados no cadastro. Se for inválido ou repetido, o insert
-- falha e a conta não é criada, então não existe conta nova sem nome de usuário.
create function public.criar_perfil_da_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (user_id, usuario)
  values (new.id, new.raw_user_meta_data ->> 'usuario');
  return new;
end;
$$;

create trigger ao_criar_conta
after insert on auth.users
for each row execute function public.criar_perfil_da_conta();

-- 4. A VERIFICAÇÃO DE DISPONIBILIDADE
-- Responde só sim ou não, para o cadastro avisar quando o nome já estiver em uso.
create function public.usuario_disponivel(nome text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.perfis where usuario = nome);
$$;

revoke all on function public.usuario_disponivel(text) from public;
grant execute on function public.usuario_disponivel(text) to anon, authenticated;
