# Plano de Treino

App para cada pessoa criar uma conta e montar o próprio plano de treino, escolhendo exercícios de uma lista. Feito com HTML, CSS e JavaScript, com contas e dados no Supabase.

## Como usar

1. Crie uma conta com nome de usuário e senha.
2. Busque um exercício pelo nome ou filtre por grupo muscular.
3. Toque em **Adicionar** para colocá-lo no plano.
4. Ajuste as séries e as repetições de cada exercício.

O plano fica salvo na sua conta, e você o vê em qualquer aparelho.

## Como gerar o app Android

O workflow `.github/workflows/build-android.yml` usa o Capacitor para gerar um `.apk` de teste no GitHub, sem instalar nada no computador.

Ao publicar uma release, o arquivo `plano-treino-<versão>.apk` é gerado e anexado a ela em alguns minutos. A etiqueta da release precisa apontar para um commit que já tenha este workflow.

Para gerar sem criar uma release:

1. No GitHub, abra **Actions > Build Android > Run workflow**.
2. Quando terminar, baixe `plano-treino-apk` na página da execução e extraia o `.apk` do zip.
3. Instale no celular Android, permitindo a instalação de apps de fora da Play Store.

Este `.apk` é de teste. Para distribuir, ele precisa de uma assinatura própria.

## Como configurar

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode os arquivos de `supabase/migrations/`, na ordem dos números, no SQL Editor do projeto.
3. Crie as Edge Functions `entrar` e `cadastrar` com o código de `supabase/functions/` e desligue a verificação de JWT das duas, porque elas rodam antes de existir uma sessão. Depois, em **Sign In / Providers**, desligue **Allow new users to sign up**, para a função `cadastrar` ser o único caminho de cadastro.
4. Coloque o endereço do projeto e a chave publishable em `config.js`.
5. Em **Authentication > URL Configuration**, adicione o endereço do site às URLs de redirecionamento permitidas.
6. Sirva a pasta por um servidor web. O link de confirmação do e-mail não funciona com o arquivo aberto direto.

O e-mail está desligado por enquanto: em **Sign In / Providers**, deixe **Confirm email** desligado e mantenha `USAR_EMAIL = false` em `config.js`. Sem e-mail, não há recuperação de senha pelo app.

Nunca coloque a chave `sb_secret_` nem a senha do banco no código do site.
