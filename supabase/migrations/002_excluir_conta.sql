-- Permite que cada pessoa exclua a própria conta.
-- Rode uma vez no SQL Editor do Supabase, depois da migração 001.

-- O site não tem permissão para apagar nada em auth.users, e isso é bom.
-- "security definer" faz esta função rodar com as permissões de quem a criou,
-- então ela precisa ser pequena e só agir sobre a conta de quem a chamou.
-- "search_path = ''" impede que a função use tabelas de outro lugar com o mesmo nome.
create function public.excluir_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'É preciso estar logado para excluir a conta.';
  end if;

  -- O "on delete cascade" da migração 001 apaga junto o plano da pessoa.
  delete from auth.users where id = auth.uid();
end;
$$;

-- Só quem fez login pode chamar a função.
revoke all on function public.excluir_conta() from public, anon;
grant execute on function public.excluir_conta() to authenticated;
