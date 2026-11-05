-- Limite de tentativas de senha. Rode uma vez no SQL Editor do Supabase, depois do usuarios.sql.
-- Regra: 5 senhas erradas em sequência bloqueiam o nome de usuário por 15 minutos.

-- 1. A TABELA
-- Conta os erros por nome de usuário, inclusive de nomes que não existem,
-- para a resposta não revelar quais contas são reais.
create table public.tentativas_login (
  usuario text primary key,
  falhas integer not null default 0,
  bloqueado_ate timestamptz,
  atualizado_em timestamptz not null default now()
);

-- O site não acessa esta tabela: só estas funções, chamadas pela função "entrar".
revoke all on table public.tentativas_login from anon, authenticated;
alter table public.tentativas_login enable row level security;

-- 2. AS FUNÇÕES
create function public.login_bloqueado(nome text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tentativas_login
    where usuario = nome and bloqueado_ate > now()
  );
$$;

create function public.registrar_falha_login(nome text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Apaga registros antigos, para a tabela não crescer sem limite.
  delete from public.tentativas_login where atualizado_em < now() - interval '1 day';

  -- Um erro depois de 15 minutos sem tentativas recomeça a contagem.
  insert into public.tentativas_login as t (usuario, falhas)
  values (nome, 1)
  on conflict (usuario) do update set
    falhas = case
      when t.atualizado_em < now() - interval '15 minutes' then 1
      else t.falhas + 1
    end,
    bloqueado_ate = case
      when t.atualizado_em >= now() - interval '15 minutes' and t.falhas + 1 >= 5
        then now() + interval '15 minutes'
    end,
    atualizado_em = now();
end;
$$;

create function public.limpar_tentativas_login(nome text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.tentativas_login where usuario = nome;
$$;

-- 3. AS PERMISSÕES
-- Só a chave secreta, que fica no servidor, pode chamar estas funções.
-- Se o site pudesse, alguém conseguiria limpar os próprios erros ou bloquear outra pessoa.
revoke all on function public.login_bloqueado(text) from public, anon, authenticated;
revoke all on function public.registrar_falha_login(text) from public, anon, authenticated;
revoke all on function public.limpar_tentativas_login(text) from public, anon, authenticated;
grant execute on function public.login_bloqueado(text) to service_role;
grant execute on function public.registrar_falha_login(text) to service_role;
grant execute on function public.limpar_tentativas_login(text) to service_role;
