import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function BotaoCustomizado({ titulo, onPress, tipo = 'primary', disabled = false, carregando = false }) {
  const obterCorFundo = () => {
    if (disabled || carregando) return '#B0B0B0';
    switch (tipo) {
      case 'success': return '#2ECC71';
      case 'warning': return '#E67E22';
      case 'danger': return '#E74C3C';
      default: return '#2980B9';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.botao, { backgroundColor: obterCorFundo() }]}
      onPress={disabled || carregando ? undefined : onPress}
      activeOpacity={disabled || carregando ? 1 : 0.8}
      disabled={disabled || carregando}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.textoBotao}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    width: '100%',
  },
  textoBotao: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
