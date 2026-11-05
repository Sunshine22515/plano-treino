const CHAVE_PLANO = 'plano-treino:itens';
const SERIES_PADRAO = 3;
const REPETICOES_PADRAO = 12;
const TODOS = 'Todos';

const CATALOGO = {
  Peito: ['Supino reto', 'Supino inclinado', 'Supino declinado', 'Crucifixo com halteres', 'Crossover', 'Flexão de braço', 'Peck deck'],
  Costas: ['Puxada frontal', 'Barra fixa', 'Remada curvada', 'Remada baixa', 'Remada unilateral', 'Pulldown', 'Levantamento terra'],
  Pernas: ['Agachamento livre', 'Agachamento no Smith', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Afundo', 'Passada', 'Panturrilha em pé'],
  'Glúteos': ['Elevação pélvica', 'Agachamento sumô', 'Cadeira abdutora', 'Coice na polia', 'Stiff'],
  Ombros: ['Desenvolvimento com halteres', 'Elevação lateral', 'Elevação frontal', 'Crucifixo inverso', 'Encolhimento'],
  'Bíceps': ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca scott', 'Rosca concentrada'],
  'Tríceps': ['Tríceps na polia', 'Tríceps testa', 'Tríceps francês', 'Mergulho no banco', 'Supino fechado'],
  'Abdômen': ['Abdominal supra', 'Abdominal infra', 'Prancha', 'Prancha lateral', 'Elevação de pernas', 'Abdominal na polia']
};

const EXERCICIOS = Object.entries(CATALOGO).flatMap(([grupo, nomes]) =>
  nomes.map(nome => ({ nome, grupo }))
);

const plano = document.getElementById('plano');
const planoVazio = document.getElementById('plano-vazio');
const totalPlano = document.getElementById('total-plano');
const limparPlano = document.getElementById('limpar-plano');
const catalogo = document.getElementById('catalogo');
const catalogoVazio = document.getElementById('catalogo-vazio');
const totalCatalogo = document.getElementById('total-catalogo');
const busca = document.getElementById('busca');
const grupos = document.getElementById('grupos');

let itens = lerPlano();
let grupoAtivo = TODOS;

function buscarExercicio(nome) {
  return EXERCICIOS.find(exercicio => exercicio.nome === nome);
}

function limitar(valor, padrao) {
  const numero = Math.round(Number(valor));
  return numero >= 1 ? Math.min(numero, 99) : padrao;
}

function lerPlano() {
  try {
    const salvos = JSON.parse(localStorage.getItem(CHAVE_PLANO));
    if (!Array.isArray(salvos)) {
      return [];
    }
    return salvos
      .filter(item => item && buscarExercicio(item.nome))
      .map(item => ({
        nome: item.nome,
        series: limitar(item.series, SERIES_PADRAO),
        repeticoes: limitar(item.repeticoes, REPETICOES_PADRAO)
      }));
  } catch {
    return [];
  }
}

function salvarPlano() {
  try {
    localStorage.setItem(CHAVE_PLANO, JSON.stringify(itens));
  } catch {
    // Sem armazenamento, o plano continua funcionando até fechar a página.
  }
}

function estaNoPlano(nome) {
  return itens.some(item => item.nome === nome);
}

// Ignora acentos e maiúsculas, para "triceps" encontrar "Tríceps".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

function criarInfo(exercicio) {
  const info = document.createElement('div');
  info.className = 'item-info';
  const nome = document.createElement('span');
  nome.className = 'item-nome';
  nome.textContent = exercicio.nome;
  const grupo = document.createElement('span');
  grupo.className = 'item-grupo';
  grupo.textContent = exercicio.grupo;
  info.append(nome, grupo);
  return info;
}

function criarCampo(rotulo, item, chave, padrao) {
  const campo = document.createElement('label');
  campo.className = 'campo';
  campo.textContent = rotulo;
  const entrada = document.createElement('input');
  entrada.type = 'number';
  entrada.inputMode = 'numeric';
  entrada.min = '1';
  entrada.max = '99';
  entrada.value = String(item[chave]);
  entrada.setAttribute('aria-label', `${rotulo} de ${item.nome}`);
  entrada.addEventListener('change', () => {
    item[chave] = limitar(entrada.value, padrao);
    entrada.value = String(item[chave]);
    salvarPlano();
  });
  campo.append(entrada);
  return campo;
}

function desenharPlano() {
  plano.replaceChildren(...itens.map(item => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const numeros = document.createElement('div');
    numeros.className = 'item-numeros';
    numeros.append(
      criarCampo('Séries', item, 'series', SERIES_PADRAO),
      criarCampo('Repetições', item, 'repeticoes', REPETICOES_PADRAO)
    );

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', `Remover ${item.nome} do plano`);
    remover.addEventListener('click', () => alternarExercicio(item.nome));

    linha.append(criarInfo(buscarExercicio(item.nome)), numeros, remover);
    return linha;
  }));

  planoVazio.hidden = itens.length > 0;
  limparPlano.hidden = itens.length === 0;
  totalPlano.textContent = plural(itens.length, 'exercício', 'exercícios');
}

function atualizarBotao(botao, nome) {
  const noPlano = estaNoPlano(nome);
  botao.textContent = noPlano ? 'Remover' : 'Adicionar';
  botao.setAttribute('aria-pressed', String(noPlano));
}

function desenharCatalogo() {
  const termo = normalizar(busca.value);
  const visiveis = EXERCICIOS.filter(exercicio =>
    (grupoAtivo === TODOS || exercicio.grupo === grupoAtivo) &&
    normalizar(exercicio.nome).includes(termo)
  );

  catalogo.replaceChildren(...visiveis.map(exercicio => {
    const linha = document.createElement('li');
    linha.className = 'item';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'adicionar';
    botao.dataset.nome = exercicio.nome;
    botao.setAttribute('aria-label', exercicio.nome);
    atualizarBotao(botao, exercicio.nome);
    botao.addEventListener('click', () => alternarExercicio(exercicio.nome));

    linha.append(criarInfo(exercicio), botao);
    return linha;
  }));

  catalogoVazio.hidden = visiveis.length > 0;
  totalCatalogo.textContent = plural(visiveis.length, 'exercício', 'exercícios');
}

function alternarExercicio(nome) {
  if (estaNoPlano(nome)) {
    itens = itens.filter(item => item.nome !== nome);
  } else {
    itens.push({ nome, series: SERIES_PADRAO, repeticoes: REPETICOES_PADRAO });
  }
  salvarPlano();
  desenharPlano();
  // Atualiza os botões no lugar, para o foco do teclado não se perder.
  catalogo.querySelectorAll('.adicionar').forEach(botao => atualizarBotao(botao, botao.dataset.nome));
}

function desenharGrupos() {
  grupos.replaceChildren(...[TODOS, ...Object.keys(CATALOGO)].map(nome => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'grupo';
    botao.textContent = nome;
    botao.setAttribute('aria-pressed', String(nome === grupoAtivo));
    botao.addEventListener('click', () => {
      grupoAtivo = nome;
      grupos.querySelectorAll('.grupo').forEach(outro => {
        outro.setAttribute('aria-pressed', String(outro === botao));
      });
      desenharCatalogo();
    });
    return botao;
  }));
}

busca.addEventListener('input', desenharCatalogo);

limparPlano.addEventListener('click', () => {
  if (!confirm('Remover todos os exercícios do plano?')) {
    return;
  }
  itens = [];
  salvarPlano();
  desenharPlano();
  desenharCatalogo();
});

desenharGrupos();
desenharPlano();
desenharCatalogo();
