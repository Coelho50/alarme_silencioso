import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const citiesImages = [
  require('@/assets/images/beauclair/beauclair.webp'),
  require('@/assets/images/kaer_trolde/kaer_trolde.webp'),
  require('@/assets/images/novigrad/novigrad.webp'),
  require('@/assets/images/oxenfurt/oxenfurt.webp'),
  require('@/assets/images/vizima/vizima.webp'),
]


export default function HomeScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) %citiesImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.citiesImages}> 
          <Image 
            source={citiesImages[index]} 
            style={styles.citiesImages} 
          />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the Northern Kingdoms!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">To discover places to visit, try the "Destinations" button below</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  citiesImages: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
