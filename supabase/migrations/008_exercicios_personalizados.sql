-- Exercícios cadastrados pelo admin, além da lista fixa do app. Rode uma vez no SQL Editor do Supabase, depois da migração 007.

create table public.exercicios_personalizados (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(btrim(nome)) between 2 and 60),
  grupo text not null check (char_length(grupo) between 1 and 30),
  criado_em timestamptz not null default now()
);

-- O mesmo nome não pode ser cadastrado duas vezes, nem com maiúsculas diferentes.
create unique index exercicios_personalizados_nome_unico on public.exercicios_personalizados (lower(btrim(nome)));

revoke all on table public.exercicios_personalizados from anon, authenticated;
grant select, insert, delete on table public.exercicios_personalizados to authenticated;
alter table public.exercicios_personalizados enable row level security;

-- Só o admin monta planilhas, então só ele precisa ver e mudar esta lista.
create policy "Admin vê os exercícios próprios"
on public.exercicios_personalizados for select
to authenticated
using ((select public.eh_admin()));

create policy "Admin cadastra exercícios próprios"
on public.exercicios_personalizados for insert
to authenticated
with check ((select public.eh_admin()));

create policy "Admin remove exercícios próprios"
on public.exercicios_personalizados for delete
to authenticated
using ((select public.eh_admin()));
