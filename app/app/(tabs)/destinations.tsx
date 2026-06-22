import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';

const destinations = [
  {
    name: 'Beauclair',
    image: require('@/assets/images/beauclair/beauclair.webp'),
    id: 'beauclair',
  },
  {
    name: 'Kaer Trolde',
    image: require('@/assets/images/kaer_trolde/kaer_trolde.webp'),
    id: 'kaer_trolde',
  },
  {
    name: 'Novigrad',
    image: require('@/assets/images/novigrad/novigrad.webp'),
    id: 'novigrad',
  },
  {
    name: 'Oxenfurt',
    image: require('@/assets/images/oxenfurt/oxenfurt.webp'),
    id: 'oxenfurt',
  },
  {
    name: 'Vizima',
    image: require('@/assets/images/vizima/vizima.webp'),
    id: 'vizima',
  },
];

export default function DestinationsScreen() {
  const router = useRouter();

  const handleDestinationPress = (destinationId: string) => {
    router.push(`/(tabs)/destination-details/${destinationId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Destinations</ThemedText>
      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {destinations.map((destination, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.destinationCard,
                pressed && styles.destinationCardPressed,
              ]}
              onPress={() => handleDestinationPress(destination.id)}
            >
              <Image
                source={destination.image}
                style={styles.destinationImage}
              />
              <ThemedText style={styles.destinationName}>{destination.name}</ThemedText>
            </Pressable>
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
  gridContainer: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30,
  },
  destinationCard: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  destinationCardPressed: {
    opacity: 0.7,
  },
  destinationImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 2,
    borderRadius: 12,
  },
  destinationName: {
    fontSize: 22,
    fontWeight: '600',
  },
});