-- Planilhas semanais, painel de admin e progresso. Rode uma vez no SQL Editor do Supabase, depois da migração 005.
-- O primeiro admin é definido à mão, depois desta migração:
--   update public.perfis set papel = 'admin' where usuario = 'nome_do_usuario';

-- 1. O PERFIL
-- Toda conta começa como cliente, na semana 1. O site não acessa esta tabela diretamente,
-- então ninguém consegue se promover a admin nem pular de semana alterando o app.
alter table public.perfis
  add column papel text not null default 'cliente' check (papel in ('admin', 'cliente')),
  add column semana_atual integer not null default 1 check (semana_atual >= 1);

create function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where user_id = (select auth.uid()) and papel = 'admin'
  );
$$;

create function public.meu_perfil()
returns table (usuario text, papel text, semana_atual integer)
language sql
stable
security definer
set search_path = ''
as $$
  select usuario, papel, semana_atual from public.perfis
  where user_id = (select auth.uid());
$$;

create function public.listar_usuarios()
returns table (user_id uuid, usuario text, papel text, semana_atual integer)
language sql
stable
security definer
set search_path = ''
as $$
  select user_id, usuario, papel, semana_atual from public.perfis
  where public.eh_admin()
  order by usuario;
$$;

create function public.avancar_semana()
returns integer
language sql
security definer
set search_path = ''
as $$
  update public.perfis set semana_atual = semana_atual + 1
  where user_id = (select auth.uid())
  returning semana_atual;
$$;

-- 2. A PLANILHA
-- Uma linha por exercício em cada dia da semana (0 é domingo). A mesma planilha vale para todas as semanas.
create table public.plano_exercicios (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  exercicio text not null check (char_length(exercicio) between 1 and 100),
  series smallint not null default 3 check (series between 1 and 99),
  -- Aceita um número ("12") ou uma faixa ("8-12").
  repeticoes text not null default '12' check (repeticoes ~ '^[0-9]{1,2}(-[0-9]{1,2})?$'),
  rir smallint check (rir between 0 and 10),
  posicao integer not null default 0,
  unique (user_id, dia_semana, exercicio)
);

revoke all on table public.plano_exercicios from anon, authenticated;
grant select, insert, update, delete on table public.plano_exercicios to authenticated;
alter table public.plano_exercicios enable row level security;

-- O cliente só lê a própria planilha. Só o admin altera.
create policy "Ver a própria planilha ou, se admin, todas"
on public.plano_exercicios for select
to authenticated
using ((select auth.uid()) = user_id or (select public.eh_admin()));

create policy "Admin adiciona exercícios"
on public.plano_exercicios for insert
to authenticated
with check ((select public.eh_admin()));

create policy "Admin edita exercícios"
on public.plano_exercicios for update
to authenticated
using ((select public.eh_admin()))
with check ((select public.eh_admin()));

create policy "Admin remove exercícios"
on public.plano_exercicios for delete
to authenticated
using ((select public.eh_admin()));

-- 3. OS REGISTROS
-- O que a pessoa fez em cada semana. É a base da dica da semana anterior e da tabela de progresso.
-- O nome do exercício é copiado, para o histórico continuar existindo se ele sair da planilha.
create table public.registros_treino (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  semana integer not null check (semana >= 1),
  dia_semana smallint not null check (dia_semana between 0 and 6),
  exercicio text not null check (char_length(exercicio) between 1 and 100),
  carga numeric(6, 2) check (carga between 0 and 9999),
  repeticoes smallint check (repeticoes between 0 and 999),
  anotacao text check (char_length(anotacao) <= 500),
  atualizado_em timestamptz not null default now(),
  unique (user_id, semana, dia_semana, exercicio)
);

revoke all on table public.registros_treino from anon, authenticated;
grant select, insert, update on table public.registros_treino to authenticated;
alter table public.registros_treino enable row level security;

create policy "Ver os próprios registros ou, se admin, todos"
on public.registros_treino for select
to authenticated
using ((select auth.uid()) = user_id or (select public.eh_admin()));

create policy "Adicionar os próprios registros"
on public.registros_treino for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Editar os próprios registros"
on public.registros_treino for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- 4. EXCLUIR CONTA
-- Agora só o admin exclui contas, e não pode excluir a própria, para o app não ficar sem admin.
drop function public.excluir_conta();

create function public.admin_excluir_conta(alvo uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Só o admin pode excluir contas.';
  end if;
  if alvo = auth.uid() then
    raise exception 'O admin não pode excluir a própria conta.';
  end if;

  -- O "on delete cascade" apaga junto a planilha, os registros e o perfil.
  delete from auth.users where id = alvo;
end;
$$;

-- 5. AS PERMISSÕES DAS FUNÇÕES
revoke all on function public.eh_admin() from public, anon;
revoke all on function public.meu_perfil() from public, anon;
revoke all on function public.listar_usuarios() from public, anon;
revoke all on function public.avancar_semana() from public, anon;
revoke all on function public.admin_excluir_conta(uuid) from public, anon;
grant execute on function public.eh_admin() to authenticated;
grant execute on function public.meu_perfil() to authenticated;
grant execute on function public.listar_usuarios() to authenticated;
grant execute on function public.avancar_semana() to authenticated;
grant execute on function public.admin_excluir_conta(uuid) to authenticated;
