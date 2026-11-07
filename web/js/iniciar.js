// Liga o menu inferior e inicia o app. Precisa ser o último script da página.

document.querySelectorAll('[data-aba]').forEach(botao => {
  botao.addEventListener('click', () => {
    mostrarAviso('');
    mostrarAba(botao.dataset.aba);
    if (botao.dataset.aba === 'admin') {
      umaPorVez(carregarAdmin);
    }
  });
});

dataHoje.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
mostrarAba('treino');
desenharGrupos();
desenharCatalogo();
iniciar();
