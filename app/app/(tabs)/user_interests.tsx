import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTERESTS_KEY = 'interests';

export default function UserInterestsScreen() {
  const [interests, setInterests] = useState<any[]>([]);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadInterests();
    }, [])
  );

  const loadInterests = async () => {
    try {
      const interestsJson = await AsyncStorage.getItem(INTERESTS_KEY);
      if (interestsJson) {
        setInterests(JSON.parse(interestsJson));
      } else {
        setInterests([]);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const handleInterestPress = (destinationId: string) => {
    router.push(`/(tabs)/destination-details/${destinationId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText type="subtitle" style={styles.emptyText}>
        No saved interests yet
      </ThemedText>
      <ThemedText style={styles.emptySubText}>
        Navigate to destinations and click "Save Interest" to add them here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>My Interests</ThemedText>
      
      {interests.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {interests.map((item) => (
              <Pressable
                key={item.destinationId}
                style={({ pressed }) => [
                  styles.interestItem,
                  pressed && styles.interestItemPressed,
                ]}
                onPress={() => handleInterestPress(item.destinationId)}
              >
                <View style={styles.interestInfo}>
                  <ThemedText type="subtitle">{item.name}</ThemedText>
                  <ThemedText style={styles.savedDate}>
                    Saved: {new Date(item.date).toLocaleDateString()}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
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
  listContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  interestItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  interestItemPressed: {
    opacity: 0.7,
  },
  interestInfo: {
    gap: 4,
  },
  savedDate: {
    fontSize: 12,
    opacity: 0.6,
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