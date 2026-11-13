// Tela de Configurações: aparência, opções do treino, padrões do admin, conta e informações do app.

function preencherConfiguracoes() {
  configTema.value = lerTemaSalvo() ?? 'auto';
  configIdioma.value = IDIOMA;
  configAnterior.checked = lerPreferencia('mostrarAnterior');
  configExecucao.checked = lerPreferencia('mostrarExecucao');
  configConfirmar.checked = lerPreferencia('confirmarSemana');
  configAdmin.hidden = perfil?.papel !== 'admin';
  configSeries.value = String(lerPreferencia('seriesPadrao'));
  configReps.value = lerPreferencia('repeticoesPadrao');
}

botaoAbrirConfig.addEventListener('click', () => {
  mostrarAviso('');
  preencherConfiguracoes();
  mostrarAba('config');
  window.scrollTo(0, 0);
});

// --- Aparência ---

configTema.addEventListener('change', () => escolherTema(configTema.value));
document.addEventListener('tema-trocado', () => {
  configTema.value = lerTemaSalvo() ?? 'auto';
});

// Trocar o idioma recarrega a página, para todos os textos saírem já traduzidos.
configIdioma.addEventListener('change', () => {
  try {
    localStorage.setItem(CHAVE_IDIOMA, configIdioma.value);
  } catch {
    return;
  }
  location.reload();
});

// --- Treino ---

[
  [configAnterior, 'mostrarAnterior'],
  [configExecucao, 'mostrarExecucao'],
  [configConfirmar, 'confirmarSemana']
].forEach(([caixa, chave]) => {
  caixa.addEventListener('change', () => {
    salvarPreferencia(chave, caixa.checked);
    // O treino é redesenhado agora, para a mudança já aparecer ao voltar para ele.
    if (perfil) {
      desenharTreino();
    }
  });
});

// --- Padrões do admin ---

configSeries.addEventListener('change', () => {
  const series = limitar(configSeries.value, lerPreferencia('seriesPadrao'));
  salvarPreferencia('seriesPadrao', series);
  configSeries.value = String(series);
});

configReps.addEventListener('change', () => {
  const valor = configReps.value.trim();
  const faixa = valor.match(/^(\d{1,2})-(\d{1,2})$/);
  if (!faixa || Number(faixa[1]) < 1 || Number(faixa[1]) >= Number(faixa[2])) {
    configReps.value = lerPreferencia('repeticoesPadrao');
    mostrarAviso(t('Use uma faixa de repetições, do menor para o maior, como 6-8.'));
    return;
  }
  salvarPreferencia('repeticoesPadrao', valor);
  mostrarAviso('');
});

// --- Conta ---

aoEnviar(formTrocarSenha, async () => {
  if (configNovaSenha.value.length < TAMANHO_MINIMO_SENHA) {
    mostrarAviso(t('A senha precisa ter pelo menos {n} caracteres.', { n: TAMANHO_MINIMO_SENHA }));
    return;
  }
  if (configNovaSenha.value !== configConfirmarSenha.value) {
    mostrarAviso(t('As senhas não são iguais.'));
    return;
  }
  const { error } = await cliente.auth.updateUser({ password: configNovaSenha.value });
  if (error) {
    mostrarAviso(mensagemDoErro(error));
    return;
  }
  formTrocarSenha.reset();
  mostrarAviso(t('Senha alterada.'));
});

// Cada valor vai entre aspas, para vírgulas e ponto e vírgulas dentro do texto não quebrarem a planilha.
function celulaCsv(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

// Uma linha por série. A anotação do exercício entra na primeira série daquele dia.
function montarHistoricoCsv() {
  const nomeDoDia = numero => DIAS.find(dia => dia.numero === numero)?.completo ?? '';
  const chave = item => `${item.semana}|${item.dia_semana}|${item.exercicio}`;
  const anotacoes = new Map(registros.filter(registro => registro.anotacao).map(registro => [chave(registro), registro.anotacao]));
  const usadas = new Set();

  const linhas = [...series]
    .filter(temValores)
    .sort((a, b) => a.semana - b.semana || a.dia_semana - b.dia_semana || a.exercicio.localeCompare(b.exercicio) || a.serie - b.serie)
    .map(serie => {
      const anotacao = usadas.has(chave(serie)) ? '' : anotacoes.get(chave(serie)) ?? '';
      usadas.add(chave(serie));
      return [serie.semana, nomeDoDia(serie.dia_semana), nomeExercicio(serie.exercicio), serie.serie,
        formatarCargaCampo(serie.carga), serie.repeticoes, anotacao];
    });

  // Anotações de exercícios sem nenhuma série registrada também entram.
  registros
    .filter(registro => registro.anotacao && !usadas.has(chave(registro)))
    .forEach(registro => {
      linhas.push([registro.semana, nomeDoDia(registro.dia_semana), nomeExercicio(registro.exercicio), '', '', '', registro.anotacao]);
    });

  if (linhas.length === 0) {
    return null;
  }
  // Em português o Excel espera ponto e vírgula, porque a vírgula é a casa decimal.
  const separador = IDIOMA === 'en' ? ',' : ';';
  const cabecalho = [t('semana'), t('dia'), t('Exercício'), t('serie'), t('carga_kg'), t('repeticoes'), t('anotacao')];
  return [cabecalho, ...linhas].map(linha => linha.map(celulaCsv).join(separador)).join('\r\n');
}

botaoExportar.addEventListener('click', async () => {
  const csv = montarHistoricoCsv();
  if (!csv) {
    mostrarAviso(t('Ainda não há nada para exportar.'));
    return;
  }

  // O app do celular não baixa arquivos, então lá o histórico vai para a área de transferência.
  if (window.Capacitor?.isNativePlatform?.()) {
    try {
      await navigator.clipboard.writeText(csv);
      mostrarAviso(t('Histórico copiado. Cole numa planilha ou numa mensagem para guardar.'));
    } catch {
      mostrarAviso(t('Não foi possível exportar neste aparelho.'));
    }
    return;
  }

  // O ﻿ no começo avisa ao Excel que o arquivo usa acentos em UTF-8.
  const arquivo = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(arquivo);
  link.download = IDIOMA === 'en' ? 'workout-history.csv' : 'historico-de-treino.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  mostrarAviso(t('Histórico baixado.'));
});

botaoSairDeTudo.addEventListener('click', () => umaPorVez(async () => {
  if (!confirm(t('Sair da conta neste e em todos os outros aparelhos?'))) {
    return;
  }
  const { error } = await cliente.auth.signOut({ scope: 'global' });
  mostrarAviso(error ? mensagemDoErro(error) : '');
}));
