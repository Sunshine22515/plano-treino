// Timer de descanso entre os sets. O admin define o tempo de cada exercício; o aluno vê a contagem
// numa faixa presa acima do menu, que continua visível enquanto ele rola o treino.
// A contagem guarda a hora de terminar, e não um contador, para continuar certa se o celular apagar a tela.

let fimDoDescanso = null;
let relogioDescanso = null;
let somDescanso = null;

function iniciarDescanso(item) {
  if (!item.descanso) {
    return;
  }
  descansoExercicio.textContent = nomeExercicio(item.exercicio);
  fimDoDescanso = Date.now() + item.descanso * 1000;
  barraDescanso.hidden = false;
  barraDescanso.classList.remove('terminou');
  document.body.classList.add('com-descanso');
  clearInterval(relogioDescanso);
  relogioDescanso = setInterval(atualizarDescanso, 250);
  atualizarDescanso();
}

function atualizarDescanso() {
  if (fimDoDescanso === null) {
    return;
  }
  const restante = Math.max(0, Math.ceil((fimDoDescanso - Date.now()) / 1000));
  descansoTempo.textContent = formatarTempo(restante);
  if (restante === 0) {
    terminarDescanso();
  }
}

function terminarDescanso() {
  clearInterval(relogioDescanso);
  relogioDescanso = null;
  fimDoDescanso = null;
  barraDescanso.classList.add('terminou');
  descansoTempo.textContent = t('Hora do próximo set!');
  // Vibra no celular e toca um bipe curto. Os dois são opcionais: se o aparelho não deixar, nada quebra.
  navigator.vibrate?.([300, 150, 300]);
  tocarBipe();
}

function fecharDescanso() {
  clearInterval(relogioDescanso);
  relogioDescanso = null;
  fimDoDescanso = null;
  barraDescanso.hidden = true;
  document.body.classList.remove('com-descanso');
}

function tocarBipe() {
  try {
    somDescanso ??= new AudioContext();
    [0, 0.25].forEach(atraso => {
      const nota = somDescanso.createOscillator();
      const volume = somDescanso.createGain();
      nota.frequency.value = 880;
      volume.gain.setValueAtTime(0.2, somDescanso.currentTime + atraso);
      volume.gain.exponentialRampToValueAtTime(0.001, somDescanso.currentTime + atraso + 0.2);
      nota.connect(volume).connect(somDescanso.destination);
      nota.start(somDescanso.currentTime + atraso);
      nota.stop(somDescanso.currentTime + atraso + 0.2);
    });
  } catch {
    // Sem som disponível, a vibração e o aviso na tela bastam.
  }
}

function criarBotaoDescanso(item) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-demonstracao';
  botao.setAttribute('aria-label', t('Começar o descanso de {tempo} de {exercicio}', {
    tempo: formatarTempo(item.descanso),
    exercicio: nomeExercicio(item.exercicio)
  }));
  botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2h6v2H9zM12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 8.6-3.5 2-1-1.7 2.5-1.5V9h2z" fill="currentColor"/></svg>';
  botao.append(formatarTempo(item.descanso));
  botao.addEventListener('click', () => iniciarDescanso(item));
  return botao;
}

botaoMaisDescanso.addEventListener('click', () => {
  if (fimDoDescanso !== null) {
    fimDoDescanso += 15000;
    atualizarDescanso();
  }
});

botaoPularDescanso.addEventListener('click', fecharDescanso);

// Ao voltar para o app, a contagem é corrigida na hora, sem esperar o próximo tique.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    atualizarDescanso();
  }
});
