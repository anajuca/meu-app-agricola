import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { Accelerometer } from 'expo-sensors';

import { globalStyles } from '../styles/globalStyles';
import BotaoCustomizado from '../components/BotaoCustomizado';
import IndicadorPrecisaoGPS from '../components/IndicadorPrecisaoGPS';
import ItemContato from '../components/ItemContato';
import { salvarVisita } from '../utils/storage';
import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
  TextInput,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';

const TAMANHO_PAGINA = 20;
const ACELERACAO_LIMITE_G = 2.0;

export default function RegistroVisitaScreen() {
  const [localizacao, setLocalizacao] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [imagemEvidencia, setImagemEvidencia] = useState(null);

  const [contatoSelecionado, setContatoSelecionado] = useState(null);

  const [contatos, setContatos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [temMaisContatos, setTemMaisContatos] = useState(true);
  const [buscaIniciada, setBuscaIniciada] = useState(false);
  const [carregandoContatos, setCarregandoContatos] = useState(false);
  const [carregandoMaisContatos, setCarregandoMaisContatos] = useState(false);
  const idBuscaDebounce = useRef(null);

  const [verificandoEstabilidade, setVerificandoEstabilidade] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const capturarCoordenadasGPS = async () => {
    setBuscandoLocalizacao(true);
    try {
      const servicoAtivo = await Location.hasServicesEnabledAsync();
      if (!servicoAtivo) {
        Alert.alert(
          'GPS Desligado',
          'O serviço de localização do aparelho está desativado. Ative-o nas configurações para registrar a auditoria.'
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'O acesso ao GPS é vital para a validação legal da auditoria.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setLocalizacao(posicao.coords);
    } catch (erro) {
      console.error('Erro ao capturar GPS:', erro);
      Alert.alert(
        'Sinal Indisponível',
        'Não foi possível obter as coordenadas neste momento. Verifique o sinal de GPS e tente novamente.'
      );
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const capturarFotoEvidencia = async () => {
    try {
      const permissaoResultado = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissaoResultado.granted) {
        if (permissaoResultado.canAskAgain === false) {
          Alert.alert(
            'Permissão Bloqueada Permanentemente',
            'Você negou o acesso à câmera e marcou "Não perguntar novamente". ' +
              'Para continuar, abra manualmente as Configurações do sistema operacional ' +
              'e habilite a permissão de Câmera para este aplicativo.',
            [
              { text: 'Agora não', style: 'cancel' },
              { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('Permissão Necessária', 'O acesso à câmera é obrigatório para o registro fotodocumental.');
        }
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!resultado.canceled) {
        setImagemEvidencia(resultado.assets[0].uri);
      }
    } catch (erro) {
      console.error('Erro ao acessar a câmera:', erro);
      Alert.alert('Câmera Indisponível', 'Não foi possível acessar a câmera deste dispositivo.');
    }
  };

  const buscarPaginaDeContatos = useCallback(
    async (offsetAlvo, reiniciar = false, termoAtual = termoBusca) => {
      if (Platform.OS === 'web') {
        Alert.alert('Indisponível no Navegador', 'O acesso à agenda de contatos só funciona em um dispositivo físico ou emulador (Expo Go).');
        return;
      }

      if (reiniciar) {
        setCarregandoContatos(true);
      } else {
        setCarregandoMaisContatos(true);
      }

      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Negada', 'Não é possível carregar os representantes locais sem acesso aos contatos.');
          return;
        }

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          pageSize: TAMANHO_PAGINA,
          pageOffset: offsetAlvo,
          name: termoAtual?.trim() || undefined,
        });

        setContatos((atuais) => (reiniciar ? data : [...atuais, ...data]));
        setTemMaisContatos(data.length === TAMANHO_PAGINA);
        setPaginaAtual(offsetAlvo + data.length);
      } catch (erro) {
        console.error('Erro ao carregar contatos:', erro);
        Alert.alert('Agenda Indisponível', 'Não foi possível acessar a lista de contatos do aparelho.');
      } finally {
        setCarregandoContatos(false);
        setCarregandoMaisContatos(false);
      }
    },
    [termoBusca]
  );

  const iniciarBuscaDeContatos = () => {
    setBuscaIniciada(true);
    setPaginaAtual(0);
    setTemMaisContatos(true);
    buscarPaginaDeContatos(0, true, termoBusca);
  };

  const aoDigitarBusca = (texto) => {
    setTermoBusca(texto);
    if (idBuscaDebounce.current) clearTimeout(idBuscaDebounce.current);
    idBuscaDebounce.current = setTimeout(() => {
      setPaginaAtual(0);
      setTemMaisContatos(true);
      buscarPaginaDeContatos(0, true, texto);
    }, 400);
  };

  const carregarMaisContatos = () => {
    if (buscaIniciada && !carregandoMaisContatos && !carregandoContatos && temMaisContatos && contatos.length > 0) {
      buscarPaginaDeContatos(paginaAtual, false, termoBusca);
    }
  };

  const verificarEstabilidadeDispositivo = async () => {
    try {
      const disponivel = await Accelerometer.isAvailableAsync();
      if (!disponivel) return null;

      return await new Promise((resolve) => {
        let picoAceleracao = 0;
        Accelerometer.setUpdateInterval(100);

        const assinatura = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          if (magnitude > picoAceleracao) picoAceleracao = magnitude;
        });

        setTimeout(() => {
          assinatura.remove();
          resolve(picoAceleracao);
        }, 1000);
      });
    } catch (erro) {
      console.error('Erro ao ler o acelerômetro:', erro);
      return null;
    }
  };

  const finalizarRelatorioAuditoria = async () => {
    if (!localizacao || !imagemEvidencia || !contatoSelecionado) {
      Alert.alert(
        'Inconformidade de Dados',
        'Todos os critérios de auditoria (GPS, Evidência Visual e Produtor Vinculado) devem ser preenchidos.'
      );
      return;
    }

    setVerificandoEstabilidade(true);
    const aceleracaoDetectada = await verificarEstabilidadeDispositivo();
    setVerificandoEstabilidade(false);

    if (aceleracaoDetectada !== null && aceleracaoDetectada > ACELERACAO_LIMITE_G) {
      Alert.alert(
        'Instabilidade Física Detectada',
        `Movimentação brusca identificada durante o fechamento (${aceleracaoDetectada.toFixed(2)}g). ` +
          'Mantenha o aparelho estável e tente novamente.'
      );
      return;
    }

    setSalvando(true);
    try {
      await salvarVisita({
        localizacao,
        imagemEvidencia,
        contato: contatoSelecionado,
      });

      Alert.alert('Auditoria Concluída', 'Relatório de Visita Técnica salvo localmente e sincronizado com sucesso.');

      setLocalizacao(null);
      setImagemEvidencia(null);
      setContatoSelecionado(null);
      setContatos([]);
      setTermoBusca('');
      setBuscaIniciada(false);
    } catch (erro) {
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar o registro localmente. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const renderizarCabecalho = () => (
    <View>
      <View style={globalStyles.cardVisita}>
        <Text style={globalStyles.tituloSecao}>1. Georreferenciamento de Lote</Text>
        <BotaoCustomizado
          titulo="Marcar Localização Atual"
          onPress={capturarCoordenadasGPS}
          tipo="primary"
          carregando={buscandoLocalizacao}
        />
        {localizacao && (
          <View style={{ marginTop: 8 }}>
            <Text style={globalStyles.textoInformativo}>Lat: {localizacao.latitude.toFixed(6)}</Text>
            <Text style={globalStyles.textoInformativo}>Long: {localizacao.longitude.toFixed(6)}</Text>
            <IndicadorPrecisaoGPS precisaoMetros={localizacao.accuracy} />
          </View>
        )}
      </View>

      <View style={globalStyles.cardVisita}>
        <Text style={globalStyles.tituloSecao}>2. Evidência de Qualidade de Grãos</Text>
        <BotaoCustomizado titulo="Acionar Câmera de Campo" onPress={capturarFotoEvidencia} tipo="warning" />
        {imagemEvidencia && <Image source={{ uri: imagemEvidencia }} style={globalStyles.imagePreview} />}
      </View>

      <View style={[globalStyles.cardVisita, { paddingBottom: 8 }]}>
        <Text style={globalStyles.tituloSecao}>3. Produtor / Representante Logístico</Text>

        <BotaoCustomizado
          titulo={!buscaIniciada ? 'Buscar Produtores na Agenda' : 'Atualizar Lista'}
          onPress={iniciarBuscaDeContatos}
          tipo="primary"
        />

        {contatoSelecionado && (
          <Text style={[globalStyles.textoInformativo, { color: '#27AE60', fontWeight: 'bold', marginVertical: 6 }]}>
            Vinculado a: {contatoSelecionado.name}
          </Text>
        )}

        {buscaIniciada && (
          <TextInput
            style={globalStyles.inputBusca}
            placeholder="Buscar por nome do produtor..."
            value={termoBusca}
            onChangeText={aoDigitarBusca}
          />
        )}

        {carregandoContatos && contatos.length === 0 && (
          <ActivityIndicator style={{ marginVertical: 12 }} color="#2980B9" />
        )}
      </View>
    </View>
  );

  const renderizarRodape = () => (
    <View>
      {carregandoMaisContatos && <ActivityIndicator style={{ marginVertical: 10 }} color="#2980B9" />}
      <View style={{ paddingHorizontal: 4 }}>
        <BotaoCustomizado
          titulo={verificandoEstabilidade ? 'Verificando Estabilidade...' : 'Finalizar e Assinar Auditoria'}
          onPress={finalizarRelatorioAuditoria}
          tipo="success"
          carregando={salvando || verificandoEstabilidade}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      style={globalStyles.container}
      data={contatos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ItemContato
          item={item}
          selecionado={contatoSelecionado?.id === item.id}
          onSelecionar={setContatoSelecionado}
        />
      )}
      ListHeaderComponent={renderizarCabecalho}
      ListFooterComponent={renderizarRodape}
      ListEmptyComponent={
        buscaIniciada && !carregandoContatos ? (
          <Text style={[globalStyles.textoInformativo, { marginHorizontal: 16 }]}>Nenhum contato encontrado.</Text>
        ) : null
      }
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={8}
      removeClippedSubviews
      onEndReachedThreshold={0.4}
      onEndReached={carregarMaisContatos}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
