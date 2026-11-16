-- Nota fixa do aluno em cada exercício da planilha, como "pegada mais fechada" ou "banco no 3º furo".
-- Rode uma vez no SQL Editor do Supabase, depois da 009.
-- A nota pertence à linha da planilha: se o admin tirar o exercício, a nota some junto (on delete cascade).
-- Ela não muda de semana. As anotações por semana continuam em registros_treino.

create table public.notas_exercicio (
  plano_id bigint primary key references public.plano_exercicios (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 1 and 500),
  atualizado_em timestamptz not null default now()
);

revoke all on table public.notas_exercicio from anon, authenticated;
grant select, insert, update, delete on table public.notas_exercicio to authenticated;
alter table public.notas_exercicio enable row level security;

-- O aluno vê as próprias notas. O admin vê todas, para acompanhar o que o aluno anotou.
create policy "Ver as próprias notas ou, se admin, todas"
on public.notas_exercicio for select
to authenticated
using ((select auth.uid()) = user_id or (select public.eh_admin()));

-- Só dá para anotar num exercício da própria planilha.
create policy "Anotar nos próprios exercícios"
on public.notas_exercicio for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.plano_exercicios plano
    where plano.id = plano_id and plano.user_id = (select auth.uid())
  )
);

create policy "Editar as próprias notas"
on public.notas_exercicio for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.plano_exercicios plano
    where plano.id = plano_id and plano.user_id = (select auth.uid())
  )
);

create policy "Apagar as próprias notas"
on public.notas_exercicio for delete
to authenticated
using ((select auth.uid()) = user_id);
