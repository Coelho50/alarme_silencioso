import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, View, Alert } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const destinationNames: Record<string, string> = {
  beauclair: 'Beauclair',
  kaer_trolde: 'Kaer Trolde',
  novigrad: 'Novigrad',
  oxenfurt: 'Oxenfurt',
  vizima: 'Vizima',
};

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'R$89',
    attractions: 3,
    days: 3,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 'R$149',
    attractions: 5,
    days: 5,
  },
  {
    id: 'top',
    name: 'Top',
    price: 'R$199',
    attractions: 7,
    days: 7,
  },
];

const PASSES_KEY = 'passes';
export default function BuyPassesScreen() {
  const router = useRouter();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    setPurchasingId(plan.id);

    try {
      let passes: any[] = [];
      const passesJson = await AsyncStorage.getItem(PASSES_KEY);
      if (passesJson) {
        passes = JSON.parse(passesJson);
      }

      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + plan.days);

      const newPass = {
        id: `pass-${Date.now()}`,
        planName: plan.name,
        price: plan.price,
        attractions: plan.attractions,
        days: plan.days,
        purchaseDate: purchaseDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      };

      passes.push(newPass);
      await AsyncStorage.setItem(PASSES_KEY, JSON.stringify(passes));

      setTimeout(() => {
        setPurchasingId(null);
        Alert.alert('Success', `${plan.name} pass purchased!`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }, 500);
    } catch (error) {
      setPurchasingId(null);
      Alert.alert('Error', 'Failed to purchase pass');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </Pressable>
        <ThemedText type="title">Buy Pass</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle">
          Northern Kingdoms Explorer Pass
        </ThemedText>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              style={({ pressed }) => [
                styles.planButton,
                purchasingId === plan.id && styles.planButtonPurchasing,
                pressed && styles.planButtonPressed,
              ]}
              onPress={() => handlePlanSelect(plan)}
              disabled={purchasingId !== null}
            >
              <ThemedText style={styles.planName}>{plan.name}</ThemedText>
              <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.descriptionContainer}>
          {plans.map((plan) => (
            <View key={plan.id} style={styles.planDescription}>
              <ThemedText style={styles.planDescriptionTitle}>
                {plan.name}:
              </ThemedText>
              <ThemedText style={styles.planDescriptionText}>
                Access to {plan.attractions} attractions, valid for {plan.days} consecutive days, cost {plan.price}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  planButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonPurchasing: {
    backgroundColor: '#cccccc',
  },
  planButtonPressed: {
    opacity: 0.8,
  },
  planName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  planPrice: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  planDescription: {
    gap: 8,
  },
  planDescriptionTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  planDescriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
});