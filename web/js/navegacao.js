// Botão voltar do celular: volta uma tela por vez e só sai do app na tela inicial.
// No .apk, quem avisa do botão é o plugin @capacitor/app. No navegador, é o histórico da página.

// O que o voltar faz agora, ou null se já está na tela inicial.
function proximoVoltar() {
  if (janelaDemonstracao.open) {
    return () => janelaDemonstracao.close();
  }
  if (!usuario) {
    return telaContaAtiva === 'entrar' ? null : () => {
      telaContaAtiva = 'entrar';
      mostrarAviso('');
      mostrarTelas();
    };
  }
  if (modoRecuperacao) {
    return null;
  }
  if (abaAtiva === 'config') {
    return () => mostrarAba(abaAntesDaConfig);
  }
  if (abaAtiva !== 'treino') {
    return () => mostrarAba('treino');
  }
  return diaAtivo === null ? null : () => botaoVoltarDias.click();
}

function voltarUmaTela() {
  const voltar = proximoVoltar();
  if (!voltar) {
    return false;
  }
  // Sair do campo salva o que estava sendo digitado antes de a tela mudar.
  document.activeElement?.blur();
  voltar();
  return true;
}

const pluginApp = window.Capacitor?.Plugins?.App;

if (pluginApp) {
  pluginApp.addListener('backButton', () => {
    if (!voltarUmaTela()) {
      pluginApp.exitApp();
    }
  });
} else {
  // Fora da tela inicial, existe sempre uma entrada extra no histórico para o voltar gastar.
  let entradaExtra = history.state?.voltar === true;
  const garantirEntrada = () => {
    if (!entradaExtra && proximoVoltar()) {
      history.pushState({ voltar: true }, '');
      entradaExtra = true;
    }
  };

  // Toda tela abre por um toque; a conferência roda depois que o botão tocado já fez a parte dele.
  document.addEventListener('click', garantirEntrada);

  window.addEventListener('popstate', () => {
    entradaExtra = history.state?.voltar === true;
    if (voltarUmaTela()) {
      garantirEntrada();
    } else if (!entradaExtra) {
      history.back();
    }
  });
}
