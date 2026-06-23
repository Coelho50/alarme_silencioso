import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';

// Lembre-se de trocar pelo seu IP local (ex: 192.168.1.15)
const API_URL = 'http://192.168.X.X:3000/logging/logs'; 

export default function LogsScreen() {
  const [logs, setLogs] = useState([]);
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

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimos Disparos</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.sensor}>Sensor: {item.sensor_tipo}</Text>
            <Text style={styles.evento}>Ação: {item.evento}</Text>
            <Text style={styles.data}>Data: {new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum evento registrado ainda. Puxe para baixo para atualizar.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  sensor: { fontSize: 16, fontWeight: 'bold' },
  evento: { fontSize: 14, color: '#e74c3c', marginVertical: 4 },
  data: { fontSize: 12, color: '#7f8c8d' },
  empty: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' }
});