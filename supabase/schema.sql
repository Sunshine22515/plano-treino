-- Esquema do Plano de Treino.
-- Rode uma vez no SQL Editor do Supabase. Se rodar de novo, dá erro porque a tabela já existe.

-- 1. A TABELA
-- Cada linha é um exercício no plano de uma pessoa.
-- As contas não precisam de tabela nossa: o Supabase já as guarda em auth.users.
create table public.plano_itens (
  -- De quem é a linha. auth.uid() é o id de quem está logado.
  -- "on delete cascade": se a conta for excluída, as linhas dela são apagadas junto.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercicio text not null check (char_length(exercicio) between 1 and 100),
  series smallint not null default 3 check (series between 1 and 99),
  repeticoes smallint not null default 12 check (repeticoes between 1 and 99),
  -- Guarda a ordem dos exercícios no plano.
  posicao integer not null default 0,
  criado_em timestamptz not null default now(),
  -- A mesma pessoa não pode ter o mesmo exercício duas vezes.
  primary key (user_id, exercicio)
);

-- 2. AS PERMISSÕES (GRANT): o que cada tipo de visitante pode tentar fazer na tabela.
-- "anon" é quem não fez login, e "authenticated" é quem fez.
-- Primeiro tiramos tudo; depois damos só o necessário a quem fez login.
revoke all on table public.plano_itens from anon, authenticated;
grant select, insert, update, delete on table public.plano_itens to authenticated;

-- 3. A SEGURANÇA POR LINHA (RLS): quais linhas cada pessoa alcança.
-- O GRANT libera a tabela, e o RLS limita às linhas da própria pessoa.
-- Com o RLS ligado e sem políticas, ninguém vê nada.
alter table public.plano_itens enable row level security;

-- "using" filtra as linhas existentes que a pessoa pode alcançar.
-- "with check" valida a linha que está sendo gravada, e impede gravar em nome de outra pessoa.
create policy "Ver os próprios itens"
on public.plano_itens for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Adicionar os próprios itens"
on public.plano_itens for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Editar os próprios itens"
on public.plano_itens for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Remover os próprios itens"
on public.plano_itens for delete
to authenticated
using ((select auth.uid()) = user_id);
