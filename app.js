const CHAVE_DURACAO = 'timer-descanso:duracao';

const app = document.querySelector('.app');
const tempo = document.getElementById('tempo');
const status = document.getElementById('status');
const botaoIniciar = document.getElementById('iniciar');
const botaoZerar = document.getElementById('zerar');
const botaoZerarSeries = document.getElementById('zerar-series');
const contador = document.getElementById('contador');
const presets = document.querySelectorAll('.preset');

let duracao = lerDuracaoSalva();
let restante = duracao;
let fimEm = null;
let intervalo = null;
let series = 0;

function lerDuracaoSalva() {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_DURACAO));
    return salvo > 0 ? salvo : 90;
  } catch {
    return 90;
  }
}

function salvarDuracao() {
  try {
    localStorage.setItem(CHAVE_DURACAO, String(duracao));
  } catch {
    // Sem armazenamento, o timer continua funcionando com a duração atual.
  }
}

function formatar(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${resto}`;
}

function desenhar() {
  tempo.textContent = formatar(restante);
  document.title = fimEm ? `${formatar(restante)} · Descanso` : 'Timer de Descanso';
  botaoIniciar.textContent = fimEm ? 'Pausar' : restante < duracao && restante > 0 ? 'Continuar' : 'Iniciar';
  presets.forEach(preset => {
    preset.setAttribute('aria-pressed', String(Number(preset.dataset.segundos) === duracao));
  });
}

function parar() {
  clearInterval(intervalo);
  intervalo = null;
  fimEm = null;
}

// O fim é calculado pelo relógio, porque o navegador atrasa intervalos em abas de fundo.
function atualizar() {
  restante = Math.max(0, Math.ceil((fimEm - Date.now()) / 1000));
  if (restante === 0) {
    terminar();
    return;
  }
  desenhar();
}

function iniciar() {
  if (restante === 0) {
    restante = duracao;
  }
  app.classList.remove('terminou');
  fimEm = Date.now() + restante * 1000;
  intervalo = setInterval(atualizar, 250);
  status.textContent = 'Descansando';
  desenhar();
}

function pausar() {
  parar();
  status.textContent = 'Pausado';
  desenhar();
}

function zerar() {
  parar();
  restante = duracao;
  app.classList.remove('terminou');
  status.textContent = 'Pronto para começar';
  desenhar();
}

function terminar() {
  parar();
  series += 1;
  contador.textContent = String(series);
  app.classList.add('terminou');
  status.textContent = 'Hora da próxima série!';
  tocarAviso();
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  desenhar();
}

function tocarAviso() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }
  const contexto = new AudioCtx();
  const oscilador = contexto.createOscillator();
  const volume = contexto.createGain();
  oscilador.frequency.value = 880;
  volume.gain.value = 0.2;
  oscilador.connect(volume).connect(contexto.destination);
  oscilador.start();
  oscilador.stop(contexto.currentTime + 0.4);
  oscilador.onended = () => contexto.close();
}

botaoIniciar.addEventListener('click', () => {
  if (fimEm) {
    pausar();
  } else {
    iniciar();
  }
});

botaoZerar.addEventListener('click', zerar);

botaoZerarSeries.addEventListener('click', () => {
  series = 0;
  contador.textContent = '0';
});

presets.forEach(preset => {
  preset.addEventListener('click', () => {
    duracao = Number(preset.dataset.segundos);
    salvarDuracao();
    zerar();
  });
});

desenhar();
