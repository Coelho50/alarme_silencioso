import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';

// TODO: IP
const API_URL = 'http://10.49.54.56:3000/logging/logs'; 

export default function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  // Atualiza automaticamente sempre que o usuário abre a aba de logs
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico do Sistema</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.origem}>Origem: {item.sensor_tipo}</Text>
            <Text style={item.sensor_tipo === 'App' ? styles.eventoApp : styles.eventoAlarme}>
              Ação: {item.evento}
            </Text>
            <Text style={styles.data}>Data: {new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum registro ainda. Puxe para atualizar.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  origem: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  eventoApp: { fontSize: 15, color: '#2980b9', marginVertical: 4, fontWeight: '500' },
  eventoAlarme: { fontSize: 15, color: '#e74c3c', marginVertical: 4, fontWeight: 'bold' },
  data: { fontSize: 12, color: '#7f8c8d' },
  empty: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' }
});