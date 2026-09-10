import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

function ItemContato({ item, selecionado, onSelecionar }) {
  return (
    <TouchableOpacity
      style={[
        globalStyles.itemListaContato,
        selecionado && globalStyles.itemListaContatoSelecionado,
      ]}
      onPress={() => onSelecionar(item)}
      activeOpacity={0.7}
    >
      <Text style={globalStyles.nomeContatoText}>{item.name || 'Sem nome'}</Text>
      {item.phoneNumbers && item.phoneNumbers.length > 0 && (
        <Text style={globalStyles.telefoneContatoText}>{item.phoneNumbers[0].number}</Text>
      )}
    </TouchableOpacity>
  );
}

export default React.memo(ItemContato, (prev, next) => {
  return prev.item.id === next.item.id && prev.selecionado === next.selecionado;
});
