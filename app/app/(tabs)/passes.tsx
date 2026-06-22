import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSES_KEY = 'passes';

export default function PassesScreen() {
  const [passes, setPasses] = useState<any[]>([]);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadPasses();
    }, [])
  );

  const loadPasses = async () => {
    try {
      const passesJson = await AsyncStorage.getItem(PASSES_KEY);
      if (passesJson) {
        setPasses(JSON.parse(passesJson));
      } else {
        setPasses([]);
      }
    } catch (error) {
      console.error('Error loading passes:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText type="subtitle" style={styles.emptyText}>
        No passes yet
      </ThemedText>
      <ThemedText style={styles.emptySubText}>
        Visit destinations and buy passes to view them here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>My Passes</ThemedText>
      
      {passes.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.contentWrapper}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          >
            <View style={styles.passesContainer}>
              {passes.map((pass) => (
                <View key={pass.id} style={styles.passCard}>
                  <View style={styles.passHeader}>
                    <ThemedText style={styles.planBadge}>{pass.planName}</ThemedText>
                  </View>
                  
                  <View style={styles.passDetails}>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Attractions:</ThemedText>
                      <ThemedText style={styles.detailValue}>{pass.attractions}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Validity:</ThemedText>
                      <ThemedText style={styles.detailValue}>{pass.days} days</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Price:</ThemedText>
                      <ThemedText style={styles.detailValue}>{pass.price}</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.expiryText}>
                    Expires in: {formatDate(pass.expiryDate)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.buyButton,
              pressed && styles.buyButtonPressed,
            ]}
            onPress={() => router.push('/(tabs)/buy-passes/buy-passes')}
          >
            <ThemedText style={styles.buyButtonText}>Buy Passes</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  passesContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  passCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  passHeader: {
    gap: 8,
  },
  planBadge: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  passDetails: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    opacity: 0.7,
    fontSize: 13,
  },
  detailValue: {
    fontWeight: '600',
    fontSize: 13,
  },
  expiryText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonPressed: {
    opacity: 0.8,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});