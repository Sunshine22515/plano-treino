// Escolhas da tela de Configurações. Ficam salvas neste aparelho, como o tema e o idioma.

const PREFERENCIAS_PADRAO = {
  mostrarAnterior: true,
  mostrarExecucao: true,
  confirmarSemana: true,
  seriesPadrao: SERIES_PADRAO,
  repeticoesPadrao: REPETICOES_PADRAO
};

function lerPreferencia(chave) {
  try {
    const salvo = localStorage.getItem(`plano-treino:${chave}`);
    return salvo === null ? PREFERENCIAS_PADRAO[chave] : JSON.parse(salvo);
  } catch {
    return PREFERENCIAS_PADRAO[chave];
  }
}

function salvarPreferencia(chave, valor) {
  try {
    localStorage.setItem(`plano-treino:${chave}`, JSON.stringify(valor));
  } catch {
    // Sem armazenamento, a escolha vale só até fechar o app.
  }
}
