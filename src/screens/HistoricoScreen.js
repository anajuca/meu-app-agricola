import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { obterHistorico } from '../utils/storage';
import { globalStyles } from '../styles/globalStyles';
import IndicadorPrecisaoGPS from '../components/IndicadorPrecisaoGPS';

export default function HistoricoScreen() {
  const [visitas, setVisitas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarHistorico = async () => {
    setCarregando(true);
    const dados = await obterHistorico();
    setVisitas(dados);
    setCarregando(false);
  };

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [])
  );

  const renderizarItem = ({ item }) => (
    <View style={globalStyles.cardVisita}>
      <Text style={globalStyles.tituloSecao}>
        {new Date(item.dataRegistro).toLocaleString('pt-BR')}
      </Text>

      <Text style={globalStyles.textoInformativo}>
        Produtor: {item.contato?.name || 'Não informado'}
      </Text>

      {item.localizacao && (
        <>
          <Text style={globalStyles.textoInformativo}>
            Lat: {item.localizacao.latitude?.toFixed(6)} · Long: {item.localizacao.longitude?.toFixed(6)}
          </Text>
          <IndicadorPrecisaoGPS precisaoMetros={item.localizacao.accuracy} />
        </>
      )}

      {item.imagemEvidencia && <Image source={{ uri: item.imagemEvidencia }} style={globalStyles.imagePreview} />}
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {visitas.length === 0 && !carregando && (
        <Text style={globalStyles.textoInformativo}>
          Nenhuma visita registrada ainda. As auditorias concluídas aparecerão aqui, mesmo offline.
        </Text>
      )}

      <FlatList
        data={visitas}
        keyExtractor={(item) => item.id}
        renderItem={renderizarItem}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregarHistorico} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
