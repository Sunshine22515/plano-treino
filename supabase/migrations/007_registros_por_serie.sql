-- Registro de carga e repetições por série. Rode uma vez no SQL Editor do Supabase, depois da migração 006.

-- 1. O RIR DO ADMIN
-- Passa a ser um valor por série, separado por hífen, como "0-1-1".
alter table public.plano_exercicios drop constraint plano_exercicios_rir_check;
alter table public.plano_exercicios alter column rir type text using rir::text;
alter table public.plano_exercicios
  add constraint plano_exercicios_rir_check check (rir ~ '^[0-9]{1,2}(-[0-9]{1,2}){0,98}$');

-- 2. AS SÉRIES
-- Uma linha para cada série feita. A anotação continua em registros_treino, uma por exercício.
create table public.registros_series (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  semana integer not null check (semana >= 1),
  dia_semana smallint not null check (dia_semana between 0 and 6),
  exercicio text not null check (char_length(exercicio) between 1 and 100),
  serie smallint not null check (serie between 1 and 99),
  carga numeric(6, 2) check (carga between 0 and 9999),
  repeticoes smallint check (repeticoes between 0 and 999),
  atualizado_em timestamptz not null default now(),
  unique (user_id, semana, dia_semana, exercicio, serie)
);

revoke all on table public.registros_series from anon, authenticated;
grant select, insert, update on table public.registros_series to authenticated;
alter table public.registros_series enable row level security;

create policy "Ver as próprias séries ou, se admin, todas"
on public.registros_series for select
to authenticated
using ((select auth.uid()) = user_id or (select public.eh_admin()));

create policy "Adicionar as próprias séries"
on public.registros_series for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Editar as próprias séries"
on public.registros_series for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- 3. OS REGISTROS ANTIGOS
-- O valor único de cada exercício vira a série 1, e só depois as colunas antigas saem.
insert into public.registros_series (user_id, semana, dia_semana, exercicio, serie, carga, repeticoes)
select user_id, semana, dia_semana, exercicio, 1, carga, repeticoes
from public.registros_treino
where carga is not null or repeticoes is not null;

alter table public.registros_treino
  drop column carga,
  drop column repeticoes;
