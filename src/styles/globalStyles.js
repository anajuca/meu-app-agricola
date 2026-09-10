import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTelaLarga = width >= 700;

export const globalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9', padding: 16 },

  linhaResponsiva: {
    flexDirection: isTelaLarga ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardVisita: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    width: isTelaLarga ? '48%' : '100%',
  },

  tituloSecao: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingBottom: 4,
  },

  textoInformativo: { fontSize: 14, color: '#7F8C8D', marginVertical: 4 },
  textoAlerta: { fontSize: 14, color: '#C0392B', marginVertical: 4, fontWeight: '600' },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
  },

  inputBusca: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },

  itemListaContato: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  itemListaContatoSelecionado: {
    borderColor: '#27AE60',
    borderWidth: 2,
    backgroundColor: '#EAFAF1',
  },
  nomeContatoText: { fontSize: 15, fontWeight: '600', color: '#333333' },
  telefoneContatoText: { fontSize: 13, color: '#666666' },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  badgeTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
