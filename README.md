# Plano de Treino

App de planilhas de treino semanais. O admin monta a planilha de cada usuário, e cada usuário registra o que fez e acompanha o progresso. Feito com HTML, CSS e JavaScript, com contas e dados no Supabase.

## Como usar

**Cliente**

1. Crie uma conta com nome de usuário e senha.
2. Em **Treino**, escolha o dia e veja o objetivo de séries, repetições e RIR de cada exercício.
3. Preencha a carga, as repetições e as anotações. Tudo é salvo sozinho, e na semana seguinte os valores aparecem como dica.
4. Ao terminar a semana, toque em **Concluir semana**.
5. Em **Perfil**, veja a progressão de carga de cada exercício, da primeira à última semana registrada.

**Admin**

1. Em **Admin**, escolha o usuário e o dia da semana.
2. Adicione exercícios da lista e defina séries, repetições e RIR.
3. Acompanhe o progresso do usuário e, se preciso, exclua a conta dele.

Para definir o primeiro admin, rode no SQL Editor:

```sql
update public.perfis set papel = 'admin' where usuario = 'nome_do_usuario';
```

## Organização dos arquivos

```text
web/                     O app em si (é o que vai para dentro do .apk)
  index.html             Estrutura das telas
  config.js              Endereço do Supabase e opções
  css/
    base.css             Cores, fontes, botões e campos
    login.css            Login, cadastro e senha
    layout.css           Topo, avisos, menu inferior e cartões
    treino.css           Aba Treino
    perfil.css           Aba Perfil
    admin.css            Aba Admin
  js/                    Carregados nesta ordem pelo index.html
    tema.js              Tema claro ou escuro (carrega antes, no <head>)
    constantes.js        Tabelas, padrões, mensagens e dias da semana
    catalogo.js          Lista de exercícios
    elementos.js         Elementos da página
    estado.js            Dados que mudam com o uso
    utilidades.js        Funções usadas por várias telas
    treino.js            Aba Treino
    perfil.js            Aba Perfil
    admin.js             Aba Admin
    conta.js             Login, cadastro, sessão e troca de telas
    iniciar.js           Liga o menu e inicia o app
supabase/
  migrations/            SQL do banco, para rodar na ordem dos números
  functions/             Funções do servidor: entrar e cadastrar
.github/workflows/       Geração do .apk no GitHub
capacitor.config.json    Configuração do app Android
package.json             Versão do app e do Capacitor
```

Os arquivos de `web/js/` não usam módulos: todos dividem o mesmo escopo, e cada um pode usar o que os anteriores definiram. Por isso, a ordem dos `<script>` no `index.html` importa.

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
4. Coloque o endereço do projeto e a chave publishable em `web/config.js`.
5. Em **Authentication > URL Configuration**, adicione o endereço do site às URLs de redirecionamento permitidas.
6. Sirva a pasta `web` por um servidor web. O link de confirmação do e-mail não funciona com o arquivo aberto direto.

O e-mail está desligado por enquanto: em **Sign In / Providers**, deixe **Confirm email** desligado e mantenha `USAR_EMAIL = false` em `web/config.js`. Sem e-mail, não há recuperação de senha pelo app.

Nunca coloque a chave `sb_secret_` nem a senha do banco no código do site.
