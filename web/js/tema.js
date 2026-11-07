// Tema claro ou escuro. Carrega no <head>, antes da página aparecer, para não piscar o tema errado.
// Sem escolha salva, segue o celular. Depois que a pessoa troca, a escolha fica salva neste aparelho.

const CHAVE_TEMA = 'plano-treino:tema';
const COR_BARRA_DO_CELULAR = { claro: '#f1f2f4', escuro: '#0e0f11' };
const temaDoSistema = window.matchMedia('(prefers-color-scheme: dark)');

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA);
  } catch {
    return null;
  }
}

function salvarTema(tema) {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento, o tema vale só até fechar o app.
  }
}

function temaAtual() {
  return document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro';
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA_DO_CELULAR[tema]);
  document.querySelectorAll('.botao-tema').forEach(botao => {
    const proximo = tema === 'escuro' ? 'claro' : 'escuro';
    botao.setAttribute('aria-label', `Usar tema ${proximo}`);
    botao.title = `Usar tema ${proximo}`;
  });
}

aplicarTema(lerTemaSalvo() ?? (temaDoSistema.matches ? 'escuro' : 'claro'));

// Se a pessoa nunca escolheu, acompanha quando o celular troca de tema.
temaDoSistema.addEventListener('change', evento => {
  if (!lerTemaSalvo()) {
    aplicarTema(evento.matches ? 'escuro' : 'claro');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  aplicarTema(temaAtual());
  document.querySelectorAll('.botao-tema').forEach(botao => {
    botao.addEventListener('click', () => {
      const novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
      salvarTema(novo);
      aplicarTema(novo);
    });
  });
});
