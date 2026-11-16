-- Tempo de descanso entre os sets, definido pelo admin em cada exercício. Rode uma vez no SQL Editor do Supabase, depois da 008.
-- Fica em segundos, de 0 a 15 minutos. Vazio quer dizer que o exercício não tem timer.
-- As permissões e regras da tabela já valem para a coluna nova: o aluno só lê, o admin edita.

alter table public.plano_exercicios
  add column descanso smallint check (descanso between 0 and 900);
