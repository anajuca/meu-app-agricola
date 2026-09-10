import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_HISTORICO = '@app_agricola:historico_visitas';

export async function salvarVisita(visita) {
  try {
    const historicoAtual = await obterHistorico();

    const novoRegistro = {
      id: `${Date.now()}`,
      dataRegistro: new Date().toISOString(),
      ...visita,
    };

    const novoHistorico = [novoRegistro, ...historicoAtual];
    await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(novoHistorico));

    return novoRegistro;
  } catch (erro) {
    console.error('Erro ao salvar visita localmente:', erro);
    throw erro;
  }
}

export async function obterHistorico() {
  try {
    const dados = await AsyncStorage.getItem(CHAVE_HISTORICO);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error('Erro ao carregar histórico local:', erro);
    return [];
  }
}

export async function limparHistorico() {
  try {
    await AsyncStorage.removeItem(CHAVE_HISTORICO);
  } catch (erro) {
    console.error('Erro ao limpar histórico:', erro);
  }
}
