import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { TravelEntry, RootStackParamList } from '../types';
import { styles, SCREEN_WIDTH, SCREEN_HEIGHT } from '../styles/TravelEntryCard.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  entry: TravelEntry;
  onRemove: (id: string) => Promise<void>;
  index?: number;
}

const TravelEntryCard: React.FC<Props> = ({ entry, onRemove, index = 0 }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const [removing, setRemoving] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const indexLabel = String(index + 1).padStart(2, '0');
  const totalPhotos = 1 + (entry.photos?.length ?? 0);

  const formattedDate = (() => {
    try {
      return new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return ''; }
  })();

  const handleRemove = () => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this travel memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try { await onRemove(entry.id); }
            catch { Alert.alert('Error', 'Failed to remove entry.'); }
            finally { setRemoving(false); }
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Fullscreen modal */}
      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.modalOverlay}>
          <Image source={{ uri: entry.imageUri }} style={styles.fullscreenPhoto} resizeMode="contain" />
          <View style={styles.modalBar}>
            <Text style={styles.modalTitle}>{entry.title || 'Untitled Entry'}</Text>
            <Text style={styles.modalAddress}>📍 {entry.address}</Text>
          </View>
          <Pressable
            onPress={() => setFullscreen(false)}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Card */}
      <Pressable
        onPress={() => navigation.navigate('EntryDetail', { entryId: entry.id })}
        style={({ pressed }) => [
          styles.card,
          { shadowColor: theme.shadow },
          pressed && { opacity: 0.93, transform: [{ scale: 0.983 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${entry.title}`}
      >
        {/* ── Photo section ── */}
        <View style={styles.photoSection}>
          <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />

          {/* Top bar overlaid on photo */}
          <View style={styles.topBar}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{indexLabel}</Text>
            </View>
            <View style={styles.actions}>
              <View onStartShouldSetResponder={() => true}>
                <Pressable
                  onPress={() => setFullscreen(true)}
                  style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.iconBtnText}>🔍</Text>
                </Pressable>
              </View>
              <View onStartShouldSetResponder={() => true}>
                <Pressable
                  onPress={handleRemove}
                  disabled={removing}
                  style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                >
                  {removing
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.iconBtnText}>🗑</Text>
                  }
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ── Solid info section ── */}
        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          {/* Location row */}
          <View style={styles.infoTop}>
            <View style={styles.locationDot} />
            <Text style={[styles.locationText, { color: theme.subtext }]} numberOfLines={1}>
              {entry.address}
            </Text>
            {totalPhotos > 1 && (
              <View style={[styles.photoCountBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.photoCountText, { color: theme.primary }]}>
                  🖼 {totalPhotos}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {entry.title || 'Untitled Entry'}
          </Text>

          {/* Bottom row */}
          <View style={styles.infoBottom}>
            {entry.description ? (
              <Text style={[styles.descPreview, { color: theme.subtext }]} numberOfLines={1}>
                {entry.description}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Text style={[styles.dateText, { color: theme.subtext }]}>{formattedDate}</Text>
          </View>
        </View>
      </Pressable>
    </>
  );
};

export default TravelEntryCard;