import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegistroVisitaScreen from './src/screens/RegistroVisitaScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

const Stack = createNativeStackNavigator();

function TelaMenu({ navigation }) {
  const { width } = useWindowDimensions();
  const duasColunas = width >= 700;

  const opcoes = [
    {
      id: 'nova',
      titulo: 'Nova Visita Técnica',
      sub: 'Georreferenciamento, foto e produtor vinculado',
      rota: 'Registro',
    },
    {
      id: 'historico',
      titulo: 'Histórico de Auditorias',
      sub: 'Consultar visitas salvas',
      rota: 'Historico',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.tituloMenu}>Auditoria Técnica Agrícola</Text>
      <Text style={styles.subtituloMenu}>Selecione uma opção</Text>

      <View style={{ flexDirection: duasColunas ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {opcoes.map((opcao) => (
          <TouchableOpacity
            key={opcao.id}
            style={[styles.card, { width: duasColunas ? '48%' : '100%' }]}
            onPress={() => navigation.navigate(opcao.rota)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardTituloText}>{opcao.titulo}</Text>
            <Text style={styles.cardSubtituloText}>{opcao.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Menu"
          screenOptions={{
            headerStyle: { backgroundColor: '#1C1C1E' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Menu" component={TelaMenu} options={{ title: 'Registro de Visitas Agrícolas' }} />
          <Stack.Screen name="Registro" component={RegistroVisitaScreen} options={{ title: 'Nova Auditoria' }} />
          <Stack.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Histórico de Auditorias' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F9' },
  scrollContainer: { padding: 20, flexGrow: 1 },
  tituloMenu: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginTop: 10, textAlign: 'center' },
  subtituloMenu: { fontSize: 14, color: '#8E8E93', marginBottom: 25, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    elevation: 3,
  },
  cardTituloText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  cardSubtituloText: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
});
