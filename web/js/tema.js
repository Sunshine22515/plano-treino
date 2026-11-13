// Tema claro ou escuro. Carrega no <head>, antes da página aparecer, para não piscar o tema errado.
// Sem escolha salva, segue o celular ("automático"). A escolha fica salva neste aparelho.

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

// "claro", "escuro" ou "auto" (apaga a escolha e volta a seguir o celular).
function salvarTema(tema) {
  try {
    if (tema === 'auto') {
      localStorage.removeItem(CHAVE_TEMA);
    } else {
      localStorage.setItem(CHAVE_TEMA, tema);
    }
  } catch {
    // Sem armazenamento, o tema vale só até fechar o app.
  }
}

function temaDoCelular() {
  return temaDoSistema.matches ? 'escuro' : 'claro';
}

function temaAtual() {
  return document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro';
}

// Este arquivo carrega antes do idioma.js, então lê o idioma direto do aparelho.
function rotuloDoTema(proximo) {
  let ingles = false;
  try {
    ingles = localStorage.getItem('plano-treino:idioma') === 'en';
  } catch {
    // Sem armazenamento, fica em português.
  }
  if (ingles) {
    return proximo === 'escuro' ? 'Use dark theme' : 'Use light theme';
  }
  return `Usar tema ${proximo}`;
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA_DO_CELULAR[tema]);
  document.querySelectorAll('.botao-tema').forEach(botao => {
    const proximo = tema === 'escuro' ? 'claro' : 'escuro';
    botao.setAttribute('aria-label', rotuloDoTema(proximo));
    botao.title = rotuloDoTema(proximo);
  });
}

// Usado pela tela de Configurações.
function escolherTema(escolha) {
  salvarTema(escolha);
  aplicarTema(escolha === 'auto' ? temaDoCelular() : escolha);
}

aplicarTema(lerTemaSalvo() ?? temaDoCelular());

// Se a pessoa nunca escolheu, acompanha quando o celular troca de tema.
temaDoSistema.addEventListener('change', () => {
  if (!lerTemaSalvo()) {
    aplicarTema(temaDoCelular());
  }
});

document.addEventListener('DOMContentLoaded', () => {
  aplicarTema(temaAtual());
  document.querySelectorAll('.botao-tema').forEach(botao => {
    botao.addEventListener('click', () => {
      const novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
      salvarTema(novo);
      aplicarTema(novo);
      // Mantém a tela de Configurações em dia, se ela estiver aberta.
      document.dispatchEvent(new CustomEvent('tema-trocado'));
    });
  });
});
