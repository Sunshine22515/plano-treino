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

// Primeiro os textos fixos da página saem no idioma escolhido. Os criados depois já usam t().
traduzirPagina();
dataHoje.textContent = new Date().toLocaleDateString(LOCALIDADE, { weekday: 'long', day: 'numeric', month: 'long' });
mostrarAba('treino');
desenharGrupos();
desenharCatalogo();
iniciar();
