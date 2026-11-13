// Idioma do app: português ou inglês. O português é a língua do código; o inglês vem deste dicionário.
// A escolha fica salva neste aparelho. Trocar de idioma recarrega a página, então cada texto é traduzido uma vez só.

const CHAVE_IDIOMA = 'plano-treino:idioma';

function lerIdiomaSalvo() {
  try {
    return localStorage.getItem(CHAVE_IDIOMA) === 'en' ? 'en' : 'pt';
  } catch {
    return 'pt';
  }
}

const IDIOMA = lerIdiomaSalvo();
const LOCALIDADE = IDIOMA === 'en' ? 'en-US' : 'pt-BR';
document.documentElement.lang = IDIOMA === 'en' ? 'en' : 'pt-BR';

// Texto em português → texto em inglês. {nome} marca um valor que entra no meio da frase.
const INGLES = {
  // Login e conta
  'Plano de Treino': 'Workout Plan',
  'Seu caderno de treino, semana a semana.': 'Your training notebook, week by week.',
  'Entre na sua conta': 'Sign in to your account',
  'Nome de usuário': 'Username',
  'Senha': 'Password',
  'Entrar': 'Sign in',
  'Criar conta': 'Create account',
  'Esqueci minha senha': 'I forgot my password',
  'Crie sua conta': 'Create your account',
  'Nome de usuário (3 a 20 letras, números ou _)': 'Username (3 to 20 letters, numbers or _)',
  'E-mail (só para confirmações)': 'Email (only for confirmations)',
  'Senha (mínimo de 8 caracteres)': 'Password (at least 8 characters)',
  'Confirme a senha': 'Confirm password',
  'Já tenho conta': 'I already have an account',
  'Recupere sua senha': 'Recover your password',
  'E-mail da conta': 'Account email',
  'Enviar link': 'Send link',
  'Voltar para o login': 'Back to sign in',
  'Crie uma nova senha': 'Create a new password',
  'Nova senha (mínimo de 8 caracteres)': 'New password (at least 8 characters)',
  'Salvar nova senha': 'Save new password',
  'Sair': 'Sign out',
  'Sair da sua conta? Para voltar, você vai precisar do usuário e da senha.': 'Sign out of your account? To come back, you will need your username and password.',
  'Esta conta não tem nome de usuário. Fale com o admin.': 'This account has no username. Talk to the admin.',
  'Sua conta está pronta! Entre com seu usuário e senha.': 'Your account is ready! Sign in with your username and password.',
  'Não foi possível carregar o app. Confira sua conexão e recarregue a página.': 'The app could not load. Check your connection and reload the page.',
  'Falta configurar o Supabase no arquivo config.js.': 'Supabase is not set up in config.js yet.',
  'Preencha o nome de usuário e a senha.': 'Enter your username and password.',
  'O nome de usuário precisa ter de 3 a 20 letras sem acento, números ou _, sem espaços.': 'The username needs 3 to 20 letters without accents, numbers or _, with no spaces.',
  'Digite um e-mail válido.': 'Enter a valid email.',
  'A senha precisa ter pelo menos {n} caracteres.': 'The password needs at least {n} characters.',
  'As senhas não são iguais.': 'The passwords do not match.',
  'Esse nome de usuário já está em uso.': 'That username is already taken.',
  'Enviamos um link de confirmação para o seu e-mail. Se esse e-mail já tiver conta, entre com o seu usuário.': 'We sent a confirmation link to your email. If that email already has an account, sign in with your username.',
  'Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.': 'If that email has an account, we sent a link to create a new password.',
  'Senha alterada.': 'Password changed.',

  // Erros
  'Aguarde...': 'Please wait...',
  'Algo deu errado ({codigo}). Confira sua conexão e tente de novo.': 'Something went wrong ({codigo}). Check your connection and try again.',
  'Usuário ou senha incorretos.': 'Wrong username or password.',
  'Confirme seu e-mail pelo link que enviamos antes de entrar.': 'Confirm your email with the link we sent before signing in.',
  'Essa senha é fraca. Escolha uma senha mais forte.': 'That password is weak. Choose a stronger one.',
  'Muitos e-mails enviados. Espere alguns minutos e tente de novo.': 'Too many emails sent. Wait a few minutes and try again.',
  'Muitas tentativas. Espere alguns minutos e tente de novo.': 'Too many attempts. Wait a few minutes and try again.',
  'Muitas tentativas com esse usuário. Espere 15 minutos e tente de novo.': 'Too many attempts with that username. Wait 15 minutes and try again.',
  'Muitas contas criadas em pouco tempo. Tente de novo mais tarde.': 'Too many accounts created in a short time. Try again later.',
  'A senha precisa ter pelo menos 8 caracteres e não pode ser longa demais.': 'The password needs at least 8 characters and cannot be too long.',
  'Já existe um exercício com esse nome.': 'An exercise with that name already exists.',
  'Sua conta não tem permissão para isso.': 'Your account is not allowed to do that.',

  // Dias
  'Seg': 'Mon', 'Ter': 'Tue', 'Qua': 'Wed', 'Qui': 'Thu', 'Sex': 'Fri', 'Sáb': 'Sat', 'Dom': 'Sun',
  'Segunda': 'Monday', 'Terça': 'Tuesday', 'Quarta': 'Wednesday', 'Quinta': 'Thursday',
  'Sexta': 'Friday', 'Sábado': 'Saturday', 'Domingo': 'Sunday',

  // Treino
  'Semana': 'Week',
  'Semana {n}': 'Week {n}',
  'Exercícios no dia': 'Exercises today',
  'Registrados': 'Logged',
  'Exercícios por dia': 'Exercises per day',
  'Dia da semana': 'Day of the week',
  'Treino do dia': "Today's workout",
  'Treino de {dia}': '{dia} workout',
  'Concluir semana': 'Finish week',
  'Concluir a semana {n} e passar para a próxima?': 'Finish week {n} and move to the next one?',
  'Sua planilha está vazia. Monte em Admin.': 'Your plan is empty. Build it in Admin.',
  'Seu treino ainda não foi montado. Fale com o admin.': 'Your workout has not been set up yet. Talk to the admin.',
  'exercício': 'exercise',
  'exercícios': 'exercises',
  'Set': 'Set',
  'Carga (kg)': 'Load (kg)',
  'Reps ({faixa})': 'Reps ({faixa})',
  'Carga do set {n} de {exercicio}': 'Load for set {n} of {exercicio}',
  'Repetições do set {n} de {exercicio}': 'Reps for set {n} of {exercicio}',
  'Lembrete': 'Reminder',
  'Anotações': 'Notes',
  'Anotações de {exercicio}': 'Notes for {exercicio}',
  'Salvando...': 'Saving...',
  'Salvo': 'Saved',
  'Use só números na carga e nas repetições.': 'Use only numbers for load and reps.',
  'Execução': 'Demo',
  'Ver a execução de {exercicio}': 'See how to do {exercicio}',
  '{exercicio}: começo e fim do movimento': '{exercicio}: start and end of the movement',
  'Carregando...': 'Loading...',
  'Não foi possível carregar as fotos. Confira sua internet.': 'The photos could not load. Check your internet.',
  'Fotos: Free Exercise DB, domínio público.': 'Photos: Free Exercise DB, public domain.',
  'Fechar': 'Close',
  'Seções do app': 'App sections',
  'Treino': 'Workout',

  // Perfil
  'Perfil': 'Profile',
  'Ainda não há cargas registradas. Seu progresso aparece aqui conforme você treina.': 'No loads logged yet. Your progress shows up here as you train.',
  'Progresso semanal': 'Weekly progress',
  'Progressão de carga por exercício': 'Load progression by exercise',
  'Compara a maior carga da primeira e da última semana registradas.': 'Compares the heaviest load of the first and last logged weeks.',
  'Exercício': 'Exercise',
  'Progressão': 'Progression',
  'Semana {a}: {carga} kg': 'Week {a}: {carga} kg',
  'Semana {a} a {b}: {inicial} → {final} kg': 'Week {a} to {b}: {inicial} → {final} kg',
  'Da semana {a} à semana {b}': 'From week {a} to week {b}',
  'de progressão de carga, em média de {exercicios}': 'load progression, averaged over {exercicios}',

  // Admin
  'Planilha do usuário': "User's plan",
  'Usuário': 'User',
  'Dia da semana da planilha': 'Plan day of the week',
  'Nenhum exercício neste dia. Adicione da lista.': 'No exercises on this day. Add some from the list.',
  'Progresso': 'Progress',
  'Este usuário ainda não tem registros.': 'This user has no logs yet.',
  'Progresso do usuário': "User's progress",
  'Excluir esta conta': 'Delete this account',
  'Exercícios': 'Exercises',
  'Buscar exercício': 'Search exercises',
  'Ex.: agachamento': 'E.g.: squat',
  'Filtrar por grupo muscular': 'Filter by muscle group',
  'Nenhum exercício encontrado.': 'No exercises found.',
  'Cadastrar exercício': 'Add an exercise',
  'Ele entra na lista acima e pode ser usado em qualquer planilha.': 'It joins the list above and can be used in any plan.',
  'Nome': 'Name',
  'Grupo muscular': 'Muscle group',
  'Cadastrar': 'Add',
  'Séries': 'Sets',
  'Reps': 'Reps',
  'RIR': 'RIR',
  'Séries de {exercicio}': 'Sets for {exercicio}',
  'Faixa de repetições de {exercicio}': 'Rep range for {exercicio}',
  'RIR por série de {exercicio}': 'RIR per set for {exercicio}',
  'Use uma faixa de repetições, do menor para o maior, como 6-8.': 'Use a rep range from low to high, like 6-8.',
  'Use um RIR de 0 a 10 para cada série, separado por hífen, como 0-1-1. Também pode ficar vazio.': 'Use an RIR from 0 to 10 for each set, separated by hyphens, like 0-1-1. It can also be empty.',
  'Está na semana {n}.': 'On week {n}.',
  'Nenhum usuário encontrado.': 'No users found.',
  'Remover': 'Remove',
  'Remover {exercicio} da planilha': 'Remove {exercicio} from the plan',
  'Adicionar': 'Add',
  '{grupo} · cadastrado': '{grupo} · custom',
  'Tirar da lista': 'Remove from list',
  'Tirar {exercicio} da lista': 'Remove {exercicio} from the list',
  'Tirar "{exercicio}" da lista? Quem já tem esse exercício na planilha continua com ele.': 'Remove "{exercicio}" from the list? People who already have it in their plan keep it.',
  '"{exercicio}" saiu da lista.': '"{exercicio}" was removed from the list.',
  '{nome} (você)': '{nome} (you)',
  'Excluir a conta de {nome}, com a planilha e todo o progresso? Isso não pode ser desfeito.': "Delete {nome}'s account, with the plan and all progress? This can't be undone.",
  'A conta de {nome} foi excluída.': "{nome}'s account was deleted.",
  'Digite o nome do exercício, com pelo menos 2 letras.': 'Enter the exercise name, with at least 2 letters.',
  'Esse exercício já está na lista.': 'That exercise is already on the list.',
  '"{exercicio}" foi cadastrado e já está na lista.': '"{exercicio}" was added and is already on the list.',

  // Grupos musculares
  'Todos': 'All', 'Outros': 'Other', 'Peito': 'Chest', 'Costas': 'Back', 'Pernas': 'Legs',
  'Glúteos': 'Glutes', 'Ombros': 'Shoulders', 'Bíceps': 'Biceps', 'Tríceps': 'Triceps',
  'Antebraço': 'Forearms', 'Abdômen': 'Abs',

  // Configurações
  'Configurações': 'Settings',
  'Aparência': 'Appearance',
  'Tema': 'Theme',
  'Automático (igual ao celular)': 'Automatic (same as the phone)',
  'Claro': 'Light',
  'Escuro': 'Dark',
  'Idioma': 'Language',
  'O app recarrega para trocar o idioma.': 'The app reloads to change the language.',
  'Mostrar a semana passada nos campos': "Show last week's numbers in the fields",
  'Mostrar o botão de execução': 'Show the demo button',
  'Pedir confirmação ao concluir a semana': 'Ask before finishing the week',
  'Planilha (admin)': 'Plan (admin)',
  'Séries ao adicionar um exercício': 'Sets when adding an exercise',
  'Reps ao adicionar um exercício': 'Reps when adding an exercise',
  'Valem para os próximos exercícios adicionados neste aparelho.': 'They apply to the next exercises added on this device.',
  'Conta': 'Account',
  'Trocar senha': 'Change password',
  'Nova senha': 'New password',
  'Confirme a nova senha': 'Confirm the new password',
  'Salvar senha': 'Save password',
  'Exportar meu histórico': 'Export my history',
  'Baixa uma planilha com todas as suas cargas e repetições.': 'Downloads a spreadsheet with all your loads and reps.',
  'Sair de todos os aparelhos': 'Sign out on every device',
  'Sair da conta neste e em todos os outros aparelhos?': 'Sign out on this device and on every other device?',
  'Ainda não há nada para exportar.': 'There is nothing to export yet.',
  'Histórico baixado.': 'History downloaded.',
  'Histórico copiado. Cole numa planilha ou numa mensagem para guardar.': 'History copied. Paste it into a spreadsheet or a message to keep it.',
  'Não foi possível exportar neste aparelho.': 'Export is not available on this device.',
  'Configurações salvas.': 'Settings saved.',
  'Sobre': 'About',
  'Versão': 'Version',
  'Fotos de execução': 'Demo photos',
  'Free Exercise DB, domínio público': 'Free Exercise DB, public domain',
  'Código': 'Source code',
  'Abrir configurações': 'Open settings',
  'Usar tema claro': 'Use light theme',
  'Usar tema escuro': 'Use dark theme',
  'dia': 'day',
  'semana': 'week',
  'serie': 'set',
  'carga_kg': 'load_kg',
  'repeticoes': 'reps',
  'anotacao': 'note'
};

// Nomes dos exercícios do catálogo em inglês. No banco, eles continuam salvos em português.
const EXERCICIOS_EM_INGLES = {
  'Supino reto': 'Barbell bench press', 'Supino inclinado': 'Incline barbell bench press',
  'Supino declinado': 'Decline barbell bench press', 'Supino reto com halteres': 'Dumbbell bench press',
  'Supino inclinado com halteres': 'Incline dumbbell press', 'Supino na máquina': 'Machine chest press',
  'Crucifixo com halteres': 'Dumbbell fly', 'Crucifixo inclinado': 'Incline dumbbell fly',
  'Crossover': 'Cable crossover', 'Crossover baixo': 'Low cable crossover', 'Peck deck': 'Pec deck',
  'Flexão de braço': 'Push-up', 'Mergulho nas paralelas': 'Chest dip',
  'Puxada frontal': 'Lat pulldown', 'Puxada com triângulo': 'V-bar pulldown',
  'Puxada supinada': 'Underhand pulldown', 'Barra fixa': 'Pull-up', 'Pulldown': 'Straight-arm pulldown',
  'Remada curvada': 'Barbell row', 'Remada cavalinho': 'T-bar row', 'Remada baixa': 'Seated cable row',
  'Remada unilateral': 'One-arm dumbbell row', 'Remada na máquina': 'Machine row',
  'Pullover na polia': 'Cable pullover', 'Levantamento terra': 'Deadlift',
  'Hiperextensão lombar': 'Back extension',
  'Agachamento livre': 'Barbell squat', 'Agachamento no Smith': 'Smith machine squat',
  'Agachamento hack': 'Hack squat', 'Agachamento goblet': 'Goblet squat',
  'Agachamento búlgaro': 'Bulgarian split squat', 'Leg press': 'Leg press',
  'Cadeira extensora': 'Leg extension', 'Mesa flexora': 'Lying leg curl',
  'Cadeira flexora': 'Seated leg curl', 'Afundo': 'Lunge', 'Passada': 'Walking lunge',
  'Cadeira adutora': 'Hip adduction machine', 'Panturrilha em pé': 'Standing calf raise',
  'Panturrilha sentada': 'Seated calf raise', 'Panturrilha no leg press': 'Leg press calf raise',
  'Elevação pélvica': 'Hip thrust', 'Ponte de glúteo': 'Glute bridge', 'Agachamento sumô': 'Sumo squat',
  'Cadeira abdutora': 'Hip abduction machine', 'Coice na polia': 'Cable kickback',
  'Glúteo na máquina': 'Glute kickback machine', 'Stiff': 'Stiff-leg deadlift',
  'Levantamento terra romeno': 'Romanian deadlift', 'Subida no banco': 'Step-up',
  'Desenvolvimento com halteres': 'Dumbbell shoulder press',
  'Desenvolvimento com barra': 'Barbell overhead press',
  'Desenvolvimento na máquina': 'Machine shoulder press', 'Desenvolvimento Arnold': 'Arnold press',
  'Elevação lateral': 'Lateral raise', 'Elevação lateral na polia': 'Cable lateral raise',
  'Elevação frontal': 'Front raise', 'Crucifixo inverso': 'Reverse fly', 'Face pull': 'Face pull',
  'Remada alta': 'Upright row', 'Encolhimento': 'Shrug',
  'Rosca direta': 'Barbell curl', 'Rosca com barra W': 'EZ-bar curl',
  'Rosca alternada': 'Alternating dumbbell curl', 'Rosca martelo': 'Hammer curl',
  'Rosca scott': 'Preacher curl', 'Rosca concentrada': 'Concentration curl',
  'Rosca inclinada': 'Incline dumbbell curl', 'Rosca na polia': 'Cable curl',
  'Tríceps na polia': 'Triceps pushdown', 'Tríceps corda': 'Rope pushdown',
  'Tríceps unilateral na polia': 'One-arm cable pushdown', 'Tríceps testa': 'Skull crusher',
  'Tríceps francês': 'Overhead triceps extension', 'Tríceps coice': 'Triceps kickback',
  'Mergulho no banco': 'Bench dip', 'Supino fechado': 'Close-grip bench press',
  'Rosca punho': 'Wrist curl', 'Rosca punho inversa': 'Reverse wrist curl',
  'Rosca inversa': 'Reverse curl', 'Caminhada do fazendeiro': "Farmer's walk",
  'Abdominal supra': 'Crunch', 'Abdominal infra': 'Reverse crunch',
  'Abdominal bicicleta': 'Bicycle crunch', 'Abdominal oblíquo': 'Oblique crunch',
  'Abdominal na polia': 'Cable crunch', 'Prancha': 'Plank', 'Prancha lateral': 'Side plank',
  'Elevação de pernas': 'Lying leg raise', 'Elevação de pernas na barra': 'Hanging leg raise',
  'Roda abdominal': 'Ab wheel rollout', 'Giro russo': 'Russian twist'
};

// Traduz um texto e troca cada {nome} pelo valor. Sem tradução, fica o português.
function t(texto, valores = {}) {
  const base = IDIOMA === 'en' ? INGLES[texto] ?? texto : texto;
  return base.replace(/\{(\w+)\}/g, (marca, chave) => (chave in valores ? String(valores[chave]) : marca));
}

// Nome do exercício para mostrar na tela. Os cadastrados pelo admin ficam como foram escritos.
function nomeExercicio(nome) {
  return IDIOMA === 'en' ? EXERCICIOS_EM_INGLES[nome] ?? nome : nome;
}

// Traduz os textos fixos da página (os que estão no index.html). Os criados pelo JS já passam por t().
function traduzirPagina() {
  if (IDIOMA !== 'en') {
    return;
  }
  document.title = t(document.title);
  const textos = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (textos.nextNode()) {
    const no = textos.currentNode;
    const limpo = no.nodeValue.trim();
    if (limpo && INGLES[limpo]) {
      no.nodeValue = no.nodeValue.replace(limpo, INGLES[limpo]);
    }
  }
  document.querySelectorAll('[placeholder], [aria-label], [title], [alt]').forEach(elemento => {
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(atributo => {
      const valor = elemento.getAttribute(atributo);
      if (valor && INGLES[valor]) {
        elemento.setAttribute(atributo, INGLES[valor]);
      }
    });
  });
}
