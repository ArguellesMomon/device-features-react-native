import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { saveEntry, generateId } from '../utils/storage';
import { sendEntrySavedNotification, setupNotifications } from '../utils/notifications';
import { TravelEntry, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;

// Draft state shape — null means not yet captured
interface Draft {
  imageUri: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY_DRAFT: Draft = {
  imageUri: null,
  address: null,
  latitude: null,
  longitude: null,
};

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Clear draft every time the screen gains focus ────────────────────────
  // This ensures going back without saving and returning starts fresh
  useFocusEffect(
    useCallback(() => {
      setDraft(EMPTY_DRAFT);
      setFetchingLocation(false);
      setSaving(false);
    }, [])
  );

  // ─── Permission helpers ───────────────────────────────────────────────────
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in Settings to take travel photos.'
      );
      return false;
    }
    return true;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please allow location access so we can tag your photo with an address.'
      );
      return false;
    }
    return true;
  };

  // ─── Reverse geocode: GPS coords → readable address ───────────────────────
  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!results || results.length === 0) {
        return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }

      const p = results[0];
      const parts: string[] = [];
      if (p.name) parts.push(p.name);
      if (p.street && p.street !== p.name) parts.push(p.street);
      if (p.city) parts.push(p.city);
      if (p.region) parts.push(p.region);
      if (p.country) parts.push(p.country);

      return parts.length > 0
        ? parts.join(', ')
        : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  };

  // ─── Take photo then auto-fetch location ──────────────────────────────────
  const handleTakePhoto = async () => {
    // 1. Camera permission
    const camOk = await requestCameraPermission();
    if (!camOk) return;

    // 2. Open camera — user shoots AND confirms the photo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // crop/select step after shooting
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) {
      Alert.alert('Error', 'Could not retrieve the photo. Please try again.');
      return;
    }

    // Show preview immediately
    setDraft((prev) => ({ ...prev, imageUri: asset.uri }));

    // 3. Location permission
    const locOk = await requestLocationPermission();
    if (!locOk) {
      // Keep photo but mark address as unavailable
      setDraft({
        imageUri: asset.uri,
        address: 'Address unavailable',
        latitude: 0,
        longitude: 0,
      });
      return;
    }

    // 4. Get GPS position
    setFetchingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      // 5. Reverse geocode to human-readable address
      const address = await reverseGeocode(latitude, longitude);

      setDraft({ imageUri: asset.uri, address, latitude, longitude });
    } catch {
      Alert.alert(
        'Location Error',
        'Could not get your current location. Entry will be saved without an address.'
      );
      setDraft({
        imageUri: asset.uri,
        address: 'Address unavailable',
        latitude: 0,
        longitude: 0,
      });
    } finally {
      setFetchingLocation(false);
    }
  };

  // ─── Validate before saving ───────────────────────────────────────────────
  const validate = (): string | null => {
    if (!draft.imageUri) return 'Please take a photo first.';
    if (fetchingLocation) return 'Still fetching your location, please wait.';
    if (!draft.address) return 'Address is missing. Please retake the photo.';
    return null;
  };

  // ─── Save entry ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Cannot Save', error);
      return;
    }

    setSaving(true);
    try {
      // Ensure notification permission
      await setupNotifications();

      const entry: TravelEntry = {
        id: generateId(),
        imageUri: draft.imageUri!,
        address: draft.address!,
        latitude: draft.latitude!,
        longitude: draft.longitude!,
        createdAt: new Date().toISOString(),
      };

      await saveEntry(entry);
      await sendEntrySavedNotification(entry.address);

      Alert.alert(
        '✈️ Entry Saved!',
        `Your memory at "${entry.address}" has been added to your diary.`,
        [{ text: 'View Diary', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert(
        'Save Failed',
        e?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Photo preview */}
      <View
        style={[
          styles.photoBox,
          {
            backgroundColor: theme.inputBg,
            borderColor: draft.imageUri ? theme.primary : theme.border,
          },
        ]}
      >
        {draft.imageUri ? (
          <Image
            source={{ uri: draft.imageUri }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.cameraEmoji}>📷</Text>
            <Text style={[styles.placeholderText, { color: theme.placeholder }]}>
              No photo taken yet
            </Text>
          </View>
        )}
      </View>

      {/* Take photo button */}
      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: theme.primary },
          (saving || fetchingLocation) && styles.disabled,
        ]}
        onPress={handleTakePhoto}
        disabled={saving || fetchingLocation}
        accessibilityRole="button"
        accessibilityLabel="Take a photo"
      >
        <Text style={styles.btnText}>
          {draft.imageUri ? '🔄 Retake Photo' : '📷 Take Photo'}
        </Text>
      </TouchableOpacity>

      {/* Address display */}
      <View
        style={[
          styles.infoBox,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.label, { color: theme.subtext }]}>
          📍 Location
        </Text>
        {fetchingLocation ? (
          <View style={styles.fetchingRow}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.fetchingText, { color: theme.subtext }]}>
              Getting your address...
            </Text>
          </View>
        ) : draft.address ? (
          <Text style={[styles.value, { color: theme.text }]}>
            {draft.address}
          </Text>
        ) : (
          <Text style={[styles.empty, { color: theme.placeholder }]}>
            Address will appear after taking a photo
          </Text>
        )}
      </View>

      {/* Timestamp preview */}
      {draft.imageUri && (
        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.subtext }]}>
            🕐 Timestamp
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {/* Save button */}
      <TouchableOpacity
        style={[
          styles.btn,
          styles.saveBtn,
          { backgroundColor: theme.card, borderColor: theme.primary },
          (!draft.imageUri || fetchingLocation || saving) && styles.disabled,
        ]}
        onPress={handleSave}
        disabled={!draft.imageUri || fetchingLocation || saving}
        accessibilityRole="button"
        accessibilityLabel="Save travel entry"
      >
        {saving ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <Text style={[styles.saveBtnText, { color: theme.primary }]}>
            💾 Save Entry
          </Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.hint, { color: theme.subtext }]}>
        Going back without saving will discard this entry.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  photoBox: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 10 },
  cameraEmoji: { fontSize: 48 },
  placeholderText: { fontSize: 14 },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  empty: { fontSize: 14, fontStyle: 'italic' },
  fetchingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fetchingText: { fontSize: 14 },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { borderWidth: 2 },
  disabled: { opacity: 0.45 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});

export default AddEntryScreen;