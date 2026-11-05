# Plano de Treino

App para cada pessoa criar uma conta e montar o próprio plano de treino, escolhendo exercícios de uma lista. Feito com HTML, CSS e JavaScript, com contas e dados no Supabase.

## Como usar

1. Crie uma conta com nome de usuário e senha.
2. Busque um exercício pelo nome ou filtre por grupo muscular.
3. Toque em **Adicionar** para colocá-lo no plano.
4. Ajuste as séries e as repetições de cada exercício.

O plano fica salvo na sua conta, e você o vê em qualquer aparelho.

## Como configurar

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode os arquivos `supabase/schema.sql`, `supabase/excluir_conta.sql` e `supabase/usuarios.sql`, nessa ordem, no SQL Editor do projeto.
3. Crie a Edge Function `entrar` com o código de `supabase/functions/entrar/index.ts` e desligue a verificação de JWT dela, porque o login acontece antes de existir uma sessão.
4. Coloque o endereço do projeto e a chave publishable em `config.js`.
5. Em **Authentication > URL Configuration**, adicione o endereço do site às URLs de redirecionamento permitidas.
6. Sirva a pasta por um servidor web. O link de confirmação do e-mail não funciona com o arquivo aberto direto.

O e-mail está desligado por enquanto: em **Sign In / Providers**, deixe **Confirm email** desligado e mantenha `USAR_EMAIL = false` em `config.js`. Sem e-mail, não há recuperação de senha pelo app.

Nunca coloque a chave `sb_secret_` nem a senha do banco no código do site.
