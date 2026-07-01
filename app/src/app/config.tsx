import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Switch, Alert } from 'react-native';

// TODO: IP
const API_LOGGING = 'http://10.49.54.56:3000/logging/logs';
const API_CONTROLE = 'http://10.49.54.56:3000/controle/configuracoes';

export default function ConfigScreen() {
  const [isArmado, setIsArmado] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await fetch(API_CONTROLE);
      const data = await response.json();
      if (data) {
        setIsArmado(data.estado_alarme === 'ligado');
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  const salvarConfig = async () => {
    try {
      const estadoNovo = isArmado ? 'ligado' : 'desligado';

      // 1. Envia a alteração para o Backend (Microservice de Controle)
      const responseControle = await fetch(API_CONTROLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado_alarme: estadoNovo,
          sensibilidade_pir: 5000, // Mantido apenas para não quebrar a tabela do BD
          tag_autorizada: 'N/A'
        })
      });

      if (responseControle.ok) {
        // 2. Registra o evento de ativação/desativação no Microservice de Logging
        await fetch(API_LOGGING, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sensor_tipo: 'App',
              evento: `Alarme ${estadoNovo} pelo usuário`
            })
        });
        
        Alert.alert("Sucesso", `Alarme ${estadoNovo} e registrado no log!`);
      } else {
        Alert.alert("Erro", "Falha ao atualizar.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel de Controle</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Estado do Alarme: {isArmado ? "LIGADO" : "DESLIGADO"}</Text>
        <Switch value={isArmado} onValueChange={setIsArmado} />
      </View>

      <Button title="Salvar Configuração" onPress={salvarConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, fontWeight: '500' }
});