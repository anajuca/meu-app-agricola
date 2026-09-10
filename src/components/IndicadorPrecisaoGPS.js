import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IndicadorPrecisaoGPS({ precisaoMetros }) {
  if (precisaoMetros === null || precisaoMetros === undefined || Number.isNaN(precisaoMetros)) {
    return null;
  }

  const obterConfiguracao = () => {
    if (precisaoMetros < 10) return { cor: '#2ECC71', legenda: 'Alta precisão' };
    if (precisaoMetros <= 30) return { cor: '#F1C40F', legenda: 'Média precisão' };
    return { cor: '#E74C3C', legenda: 'Baixa precisão' };
  };

  const { cor, legenda } = obterConfiguracao();

  return (
    <View style={[styles.badge, { backgroundColor: cor }]}>
      <Text style={styles.texto}>
        {legenda} · {precisaoMetros.toFixed(1)}m
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  texto: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
