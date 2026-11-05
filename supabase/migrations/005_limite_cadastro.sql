-- Limite de novas contas. Rode uma vez no SQL Editor do Supabase, depois da migração 004.
-- Regra: 5 tentativas de cadastro por hora para cada endereço de internet e 100 por dia no total.

-- 1. A TABELA
-- Guarda só um resumo (hash) do endereço, nunca o endereço em si, e apaga tudo depois de um dia.
create table public.tentativas_cadastro (
  id bigint generated always as identity primary key,
  chave text not null,
  criado_em timestamptz not null default now()
);

create index tentativas_cadastro_chave_criado_em on public.tentativas_cadastro (chave, criado_em);

-- O site não acessa esta tabela: só a função abaixo, chamada pela função "cadastrar".
revoke all on table public.tentativas_cadastro from anon, authenticated;
alter table public.tentativas_cadastro enable row level security;

-- 2. A FUNÇÃO
-- Responde se a tentativa pode continuar e, se puder, conta essa tentativa.
create function public.permitir_cadastro(chave_endereco text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- A trava faz os pedidos simultâneos esperarem a vez, para ninguém passar do limite ao mesmo tempo.
  perform pg_advisory_xact_lock(hashtext('permitir_cadastro'));

  delete from public.tentativas_cadastro where criado_em < now() - interval '1 day';

  if (select count(*) from public.tentativas_cadastro
      where chave = chave_endereco and criado_em > now() - interval '1 hour') >= 5 then
    return false;
  end if;

  if (select count(*) from public.tentativas_cadastro) >= 100 then
    return false;
  end if;

  insert into public.tentativas_cadastro (chave) values (chave_endereco);
  return true;
end;
$$;

-- 3. AS PERMISSÕES
-- Só a chave secreta, que fica no servidor, pode chamar esta função.
revoke all on function public.permitir_cadastro(text) from public, anon, authenticated;
grant execute on function public.permitir_cadastro(text) to service_role;
