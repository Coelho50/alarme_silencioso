import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Linking, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import destinationsData from '@/assets/data/destinations.json';

const destinationImages: Record<string, any[]> = {
  beauclair: [
    require('@/assets/images/beauclair/beauclair.webp'),
    require('@/assets/images/beauclair/beauclair1.webp'),
  ],
  kaer_trolde: [
    require('@/assets/images/kaer_trolde/kaer_trolde.webp'),
    require('@/assets/images/kaer_trolde/kaer_trolde.jpg'),
  ],
  novigrad: [
    require('@/assets/images/novigrad/novigrad.webp'),
    require('@/assets/images/novigrad/novigrad.webp'),
  ],
  oxenfurt: [
    require('@/assets/images/oxenfurt/oxenfurt.webp'),
    require('@/assets/images/oxenfurt/oxenfurt1.webp'),
  ],
  vizima: [
    require('@/assets/images/vizima/vizima.webp'),
    require('@/assets/images/vizima/vizima.webp'),
  ],
};

const destinationNames: Record<string, string> = {
  beauclair: 'Beauclair',
  kaer_trolde: 'Kaer Trolde',
  novigrad: 'Novigrad',
  oxenfurt: 'Oxenfurt',
  vizima: 'Vizima',
};

const youtubeUrls: Record<string, string> = {
  beauclair: 'https://www.youtube.com/watch?v=FkbFwJNigdA',
  kaer_trolde: 'https://www.youtube.com/watch?v=jiRU0H2AWrU',
  novigrad: 'https://www.youtube.com/watch?v=Xh4BTSmOBXY',
  oxenfurt: 'https://www.youtube.com/watch?v=D-FeXAkRAtM',
  vizima: 'https://www.youtube.com/watch?v=cvn8T2Kjx84',
};

const getYoutubeThumbnail = (videoUrl: string) => {
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
  }
  return 'https://via.placeholder.com/300';
};

const RESERVATIONS_KEY = 'reservations';
const INTERESTS_KEY = 'interests';

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const destinationId = Array.isArray(id) ? id[0] : id;
  const [isReserved, setIsReserved] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const images = destinationImages[destinationId as string] || [];
  const name = destinationNames[destinationId as string] || 'Destination';
  const youtubeUrl = youtubeUrls[destinationId as string] || '';
  const details = destinationsData[destinationId as keyof typeof destinationsData];

  const handleContact = (type: 'email' | 'phone' | 'whatsapp' | 'maps') => {
    if (!details) return;

    let url = '';
    if (type === 'email') url = `mailto:${details.email}`;
    if (type === 'phone') url = `tel:${details.phone}`;
    if (type === 'whatsapp') url = `https://wa.me/${details.whatsapp}`;
    if (type === 'maps') url = details.mapsUrl;

    Linking.openURL(url).catch(() => 
      Alert.alert('Error', 'Could not open this link')
    );
  };

  useEffect(() => {
    checkReservation();
    checkInterest();
  }, [destinationId]);

  const checkReservation = async () => {
    try {
      const reservationsJson = await AsyncStorage.getItem(RESERVATIONS_KEY);
      if (reservationsJson) {
        const reservations = JSON.parse(reservationsJson);
        const reserved = reservations.some((r: any) => r.destinationId === destinationId);
        setIsReserved(reserved);
      }
    } catch (error) {
      console.error('Error checking reservations:', error);
    }
  };

  const checkInterest = async () => {
    try {
      const interestsJson = await AsyncStorage.getItem(INTERESTS_KEY);
      if (interestsJson) {
        const interests = JSON.parse(interestsJson);
        const interested = interests.some((i: any) => i.destinationId === destinationId);
        setIsInterested(interested);
      }
    } catch (error) {
      console.error('Error checking interests:', error);
    }
  };

  const handleReservePass = async () => {
    try {
      let reservations = [];

      const reservationsJson = await AsyncStorage.getItem(RESERVATIONS_KEY);
      if (reservationsJson) {
        reservations = JSON.parse(reservationsJson);
      }

      if (isReserved) {
        reservations = reservations.filter((r: any) => r.destinationId !== destinationId);
        await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
        setIsReserved(false);
        Alert.alert('Cancelled', `Reservation for ${name} cancelled`);
      } else {
        const newReservation = {
          destinationId,
          name,
          date: new Date().toISOString(),
        };

        reservations.push(newReservation);
        await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
        setIsReserved(true);
        Alert.alert('Success', `Reservation for ${name} saved`);
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      Alert.alert('Error', 'Failed to save reservation');
    }
  };

  const handleSaveInterest = async () => {
    try {
      let interests = [];

      const interestsJson = await AsyncStorage.getItem(INTERESTS_KEY);
      if (interestsJson) {
        interests = JSON.parse(interestsJson);
      }

      if (isInterested) {
        interests = interests.filter((i: any) => i.destinationId !== destinationId);
        await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
        setIsInterested(false);
        Alert.alert('Removed', `${name} removed from your interests`);
      } else {
        const newInterest = {
          destinationId,
          name,
          date: new Date().toISOString(),
        };

        interests.push(newInterest);
        await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
        setIsInterested(true);
        Alert.alert('Success', `${name} saved to your interests`);
      }
    } catch (error) {
      console.error('Error saving interest:', error);
      Alert.alert('Error', 'Failed to save interest');
    }
  };

  const handleYoutubePress = async () => {
    if (youtubeUrl.includes('YOUR_VIDEO_ID')) {
      Alert.alert('Video URL not configured', 'Please fill in the YouTube URL for this destination.');
      return;
    }

    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open YouTube link');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push(`/(tabs)/destinations`)}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </Pressable>
        <ThemedText type="title">{name}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
       <View style={styles.buttonsContainer}>
         <Pressable
           style={({ pressed }) => [
             styles.button,
             styles.reserveButton,
             pressed && styles.buttonPressed,
           ]}
           onPress={() => router.push(`/(tabs)/buy-passes/buy-passes`)}
         >
           <ThemedText style={styles.buttonText}>Buy Passes</ThemedText>
         </Pressable>
       
         <Pressable
           style={[
             styles.button,
             styles.reserveButton,
             isInterested && styles.buttonActive,
           ]}
           onPress={handleSaveInterest}
         >
           <ThemedText style={styles.buttonText}>
             {isInterested ? 'Remove Interest' : 'Save Interest'}
           </ThemedText>
         </Pressable>
       </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Gallery
        </ThemedText>
        <View style={styles.imagesContainer}>
          {images.map((image: any, index: number) => (
            <Image
              key={index}
              source={image}
              style={styles.galleryImage}
              contentFit="cover"
            />
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Video
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.youtubeThumbnail,
            pressed && styles.youtubeThumbnailPressed,
          ]}
          onPress={handleYoutubePress}
        >
          <Image
            source={{ uri: getYoutubeThumbnail(youtubeUrl) }}
            style={styles.thumbnailImage}
            contentFit="cover"
          />
          <View style={styles.playButton}>
            <ThemedText style={styles.playButtonText}>▶</ThemedText>
          </View>
        </Pressable>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Information
        </ThemedText>

        <View style={styles.infoBox}>
          <ThemedText type="defaultSemiBold">About</ThemedText>
          <ThemedText style={styles.infoText}>{details?.description}</ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.subLabel}>Opening Hours</ThemedText>
          <ThemedText style={styles.infoText}>{details?.hours}</ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.subLabel}>Address</ThemedText>
          <ThemedText style={styles.infoText}>{details?.address}</ThemedText>
        </View>

        <View style={styles.contactContainer}>
          <Pressable style={styles.contactButton} onPress={() => handleContact('phone')}>
            <ThemedText style={styles.contactButtonText}>Call</ThemedText>
          </Pressable>

          <Pressable style={styles.contactButton} onPress={() => handleContact('email')}>
            <ThemedText style={styles.contactButtonText}>Email</ThemedText>
          </Pressable>

          <Pressable style={styles.contactButton} onPress={() => handleContact('whatsapp')}>
            <ThemedText style={styles.contactButtonText}>WhatsApp</ThemedText>
          </Pressable>

          <Pressable style={styles.contactButton} onPress={() => handleContact('maps')}>
            <ThemedText style={styles.contactButtonText}>Maps</ThemedText>
          </Pressable>
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonActive: {
    backgroundColor: '#FF6B6B',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 16,
  },
  imagesContainer: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    width: '100%',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  youtubeThumbnail: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
    aspectRatio: 16 / 9,
    alignSelf: 'center',
  },
  youtubeThumbnailPressed: {
    opacity: 0.8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoBox: {
      backgroundColor: '#2a2a2a',
      padding: 16,
      borderRadius: 12,
      gap: 8,
      marginBottom: 20,
    },

    infoText: {
      fontSize: 14,
      opacity: 0.8,
      lineHeight: 20,
    },

    subLabel: {
      marginTop: 8,
    },

    contactContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 40,
    },

    contactButton: {
      flex: 1,
      backgroundColor: '#333',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
    },

    contactButtonText: {
      color: '#4CAF50',
      fontSize: 13,
      fontWeight: '700',
    },
});