import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { saveEntry, generateId } from '../utils/storage';
import { sendEntrySavedNotification, setupNotifications } from '../utils/notifications';
import { TravelEntry, RootStackParamList } from '../types';
import { styles } from '../styles/AddEntryScreen.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;

const TITLE_MAX = 80;
const DESC_MAX = 1000;

interface Draft {
  imageUri: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  title: string;
  description: string;
  capturedAt: string; // Actual photo capture time from EXIF or fallback to now
}

const EMPTY_DRAFT: Draft = {
  imageUri: null, address: null,
  latitude: null, longitude: null,
  title: '', description: '',
  capturedAt: new Date().toISOString(),
};

// ─── Film strip bar ───────────────────────────────────────────────────────────
const FilmBar: React.FC<{ bg: string; hole: string }> = ({ bg, hole }) => (
  <View style={[styles.filmBar, { backgroundColor: bg }]}>
    {[...Array(20)].map((_, i) => (
      <View key={i} style={[styles.filmHole, { backgroundColor: hole }]} />
    ))}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  // Track committed values so ✕ can revert
  const [committedTitle, setCommittedTitle] = useState('');
  const [committedDesc, setCommittedDesc] = useState('');

  useFocusEffect(useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setFetchingLocation(false);
    setSaving(false);
    setTitleFocused(false);
    setDescFocused(false);
    setCommittedTitle('');
    setCommittedDesc('');
  }, []));

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera Permission Required', 'Please allow camera access in Settings.'); return false; }
    return true;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Location Permission Required', 'Please allow location access in Settings.'); return false; }
    return true;
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const r = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (!r?.length) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      const p = r[0];
      const parts: string[] = [];
      if (p.name) parts.push(p.name);
      if (p.street && p.street !== p.name) parts.push(p.street);
      if (p.city) parts.push(p.city);
      if (p.region) parts.push(p.region);
      if (p.country) parts.push(p.country);
      return parts.length ? parts.join(', ') : `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lon.toFixed(5)}`; }
  };

  // ─── Parse EXIF GPS coords (handles ref direction N/S/E/W) ───────────────
  const parseExifGps = (value: number | number[], ref: string): number => {
    // EXIF GPS can be a decimal or [degrees, minutes, seconds]
    let decimal = 0;
    if (Array.isArray(value)) {
      decimal = value[0] + value[1] / 60 + value[2] / 3600;
    } else {
      decimal = value;
    }
    return (ref === 'S' || ref === 'W') ? -decimal : decimal;
  };

  // ─── Parse EXIF date string → ISO string ──────────────────────────────────
  const parseExifDate = (exifDate: string): string | null => {
    try {
      // EXIF format: "YYYY:MM:DD HH:MM:SS"
      const cleaned = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
    return null;
  };

  // ─── Fetch location — from EXIF GPS first, then device GPS ───────────────
  const fetchLocation = async (imageUri: string, exif?: any) => {
    // Try to get GPS from EXIF first (actual photo location)
    if (exif?.GPSLatitude && exif?.GPSLongitude) {
      try {
        const lat = parseExifGps(exif.GPSLatitude, exif.GPSLatitudeRef ?? 'N');
        const lon = parseExifGps(exif.GPSLongitude, exif.GPSLongitudeRef ?? 'E');
        if (lat !== 0 || lon !== 0) {
          setFetchingLocation(true);
          const address = await reverseGeocode(lat, lon);
          setDraft((p) => ({ ...p, imageUri, address, latitude: lat, longitude: lon }));
          setFetchingLocation(false);
          return;
        }
      } catch {}
    }

    // Fall back to current device location
    const locOk = await requestLocationPermission();
    if (!locOk) {
      setDraft((p) => ({ ...p, imageUri, address: 'Address unavailable', latitude: 0, longitude: 0 }));
      return;
    }
    setFetchingLocation(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const address = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      setDraft((p) => ({ ...p, imageUri, address, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
    } catch {
      Alert.alert('Location Error', 'Could not get location. Entry will save without an address.');
      setDraft((p) => ({ ...p, imageUri, address: 'Address unavailable', latitude: 0, longitude: 0 }));
    } finally {
      setFetchingLocation(false);
    }
  };

  // ─── Camera ───────────────────────────────────────────────────────────────
  const handleCamera = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: true, // Request EXIF metadata
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) { Alert.alert('Error', 'Could not retrieve photo.'); return; }

    // Use EXIF date as the capture timestamp if available
    const exifDate = asset.exif?.DateTimeOriginal ?? asset.exif?.DateTime;
    const capturedAt = exifDate ? (parseExifDate(exifDate) ?? new Date().toISOString()) : new Date().toISOString();

    setDraft((p) => ({ ...p, imageUri: asset.uri, capturedAt }));
    await fetchLocation(asset.uri, asset.exif);
  };

  // ─── Gallery ──────────────────────────────────────────────────────────────
  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Library Permission Required', 'Please allow photo library access in Settings.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: true, // Request EXIF metadata
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) { Alert.alert('Error', 'Could not retrieve photo.'); return; }

    // Use EXIF date as the capture timestamp if available
    const exifDate = asset.exif?.DateTimeOriginal ?? asset.exif?.DateTime;
    const capturedAt = exifDate ? (parseExifDate(exifDate) ?? new Date().toISOString()) : new Date().toISOString();

    setDraft((p) => ({ ...p, imageUri: asset.uri, capturedAt }));
    await fetchLocation(asset.uri, asset.exif);
  };

  const validate = (): string | null => {
    if (!draft.imageUri) return 'Please take or select a photo first.';
    if (fetchingLocation) return 'Still fetching your location, please wait.';
    if (!draft.address) return 'Location is still loading.';
    if (!draft.title.trim()) return 'Please enter a title for this entry.';
    if (draft.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (draft.title.length > TITLE_MAX) return `Title must be ${TITLE_MAX} characters or less.`;
    if (draft.description.length > DESC_MAX) return `Description must be ${DESC_MAX} characters or less.`;
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { Alert.alert('Cannot Save', error); return; }
    setSaving(true);
    try {
      await setupNotifications();
      const entry: TravelEntry = {
        id: generateId(),
        imageUri: draft.imageUri!,
        address: draft.address!,
        latitude: draft.latitude!,
        longitude: draft.longitude!,
        createdAt: draft.capturedAt,
        title: draft.title.trim(),
        description: draft.description.trim(),
        photos: [],
        textAlign: 'left',
      };
      await saveEntry(entry);
      await sendEntrySavedNotification(entry.address);
      Alert.alert('✈️ Memory Captured!', `"${entry.title}" has been added to your diary.`, [
        { text: 'View Diary', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const titleCharsLeft = TITLE_MAX - draft.title.length;
  const descCharsLeft = DESC_MAX - draft.description.length;
  const photoOk = !!draft.imageUri;
  const formVisible = photoOk && !fetchingLocation && !!draft.address;

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={120}
      extraHeight={120}
    >
      {/* ── Hero photo zone ────────────────────────────────────────────── */}
      <View style={[styles.photoZone, { backgroundColor: photoOk ? '#000' : '#1a1208' }]}>
        {photoOk ? (
          <>
            <Image source={{ uri: draft.imageUri! }} style={styles.photo} resizeMode="cover" />
            {/* Retake / change source buttons */}
            <View style={styles.retakeStrip}>
              <Pressable onPress={handleCamera} style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.7 }]}>
                <Text style={{ fontSize: 12 }}>📷</Text>
                <Text style={styles.retakeBtnText}>Retake</Text>
              </Pressable>
              <Pressable onPress={handleGallery} style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.7 }]}>
                <Text style={{ fontSize: 12 }}>🖼</Text>
                <Text style={styles.retakeBtnText}>Gallery</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* Simple camera prompt */}
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoPlaceholderIcon}>
                <Text style={styles.photoPlaceholderEmoji}>📷</Text>
              </View>
              <Text style={styles.photoPlaceholderTitle}>Add a Photo</Text>
              <Text style={styles.photoPlaceholderSub}>Camera or gallery — your choice</Text>
            </View>

            {/* Camera + Gallery buttons */}
            <View style={styles.photoActions}>
              <Pressable
                onPress={handleCamera}
                disabled={fetchingLocation}
                style={({ pressed }) => [
                  styles.photoActionBtn,
                  { backgroundColor: theme.primary, borderColor: theme.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.photoActionIcon}>📷</Text>
                <Text style={[styles.photoActionText, { color: '#fff' }]}>Camera</Text>
              </Pressable>
              <Pressable
                onPress={handleGallery}
                disabled={fetchingLocation}
                style={({ pressed }) => [
                  styles.photoActionBtn,
                  { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.photoActionIcon}>🖼</Text>
                <Text style={[styles.photoActionText, { color: '#fff' }]}>Gallery</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Film strip accent */}
      <FilmBar bg={theme.text + '12'} hole={theme.text + '22'} />

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* Metadata card — location + timestamp */}
        <View style={[styles.metaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Location row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Text style={styles.metaIconText}>📍</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={[styles.metaLabel, { color: theme.subtext }]}>Location</Text>
              {fetchingLocation ? (
                <View style={styles.fetchingRow}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.fetchingText, { color: theme.subtext }]}>Locating you...</Text>
                </View>
              ) : draft.address ? (
                <Text style={[styles.metaValue, { color: theme.text }]} numberOfLines={2}>{draft.address}</Text>
              ) : (
                <Text style={[styles.metaEmpty, { color: theme.placeholder }]}>Captured after photo</Text>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.metaRowDivider, { backgroundColor: theme.border }]} />

          {/* Timestamp row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaIconCircle, { backgroundColor: theme.inputBg }]}>
              <Text style={styles.metaIconText}>🕐</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={[styles.metaLabel, { color: theme.subtext }]}>
                Timestamp{draft.imageUri ? ' · from photo' : ''}
              </Text>
              <Text style={[styles.metaValue, { color: draft.imageUri ? theme.text : theme.placeholder }]}>
                {draft.imageUri
                  ? new Date(draft.capturedAt).toLocaleString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : 'Recorded after photo'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Form — slides in after photo */}
        {formVisible && (
          <View style={styles.formSection}>
            <Text style={[styles.formEyebrow, { color: theme.primary }]}>✦ Tell the Story</Text>

            {/* Title */}
            <View style={styles.titleInputWrap}>
              <View style={styles.titleFieldHeader}>
                <Text style={[styles.titleLabel, { color: theme.subtext }]}>
                  Title <Text style={{ color: theme.danger }}>*</Text>
                </Text>
                <Text style={[styles.charCount, { color: titleCharsLeft < 10 ? theme.danger : theme.subtext }]}>
                  {titleCharsLeft} left
                </Text>
              </View>
              <TextInput
                value={draft.title}
                onChangeText={(t) => { if (t.length <= TITLE_MAX) setDraft((p) => ({ ...p, title: t })); }}
                onFocus={() => { setCommittedTitle(draft.title); setTitleFocused(true); }}
                placeholder="e.g. Sunset in Santorini"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.titleInput,
                  { color: theme.text, borderBottomColor: titleFocused ? theme.primary : (draft.title.trim().length > 0 ? theme.primary : theme.border) },
                ]}
                maxLength={TITLE_MAX}
                returnKeyType="done"
                onSubmitEditing={() => { setTitleFocused(false); Keyboard.dismiss(); }}
              />
              {/* Inline ✓ / ✕ — only when focused */}
              {titleFocused && (
                <View style={styles.inlineActionsRow}>
                  <Pressable
                    onPress={() => { setDraft((p) => ({ ...p, title: committedTitle })); setTitleFocused(false); Keyboard.dismiss(); }}
                    style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.danger, backgroundColor: theme.dangerLight }, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={[styles.inlineBtnText, { color: theme.danger }]}>✕</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setTitleFocused(false); Keyboard.dismiss(); }}
                    style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.primary, backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={[styles.inlineBtnText, { color: '#fff' }]}>✓</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.descWrap}>
              <View style={styles.descFieldHeader}>
                <Text style={[styles.descLabel, { color: theme.subtext }]}>Notes</Text>
                <View style={[styles.optionalBadge, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.optionalText, { color: theme.subtext }]}>OPTIONAL</Text>
                </View>
              </View>
              <TextInput
                value={draft.description}
                onChangeText={(t) => { if (t.length <= DESC_MAX) setDraft((p) => ({ ...p, description: t })); }}
                onFocus={() => { setCommittedDesc(draft.description); setDescFocused(true); }}
                placeholder="Write about this travel memory..."
                placeholderTextColor={theme.placeholder}
                multiline
                textAlignVertical="top"
                style={[
                  styles.descInput,
                  {
                    color: theme.text,
                    borderColor: descFocused ? theme.primary : (draft.description.length > 0 ? theme.primary : theme.border),
                    backgroundColor: theme.inputBg,
                  },
                ]}
                maxLength={DESC_MAX}
              />
              {draft.description.length > 0 && (
                <Text style={[styles.charCount, { color: descCharsLeft < 50 ? theme.danger : theme.subtext }]}>
                  {descCharsLeft} left
                </Text>
              )}
              {/* Inline ✓ / ✕ — only when focused */}
              {descFocused && (
                <View style={styles.inlineActionsRow}>
                  <Pressable
                    onPress={() => { setDraft((p) => ({ ...p, description: committedDesc })); setDescFocused(false); Keyboard.dismiss(); }}
                    style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.danger, backgroundColor: theme.dangerLight }, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={[styles.inlineBtnText, { color: theme.danger }]}>✕</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setDescFocused(false); Keyboard.dismiss(); }}
                    style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.primary, backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={[styles.inlineBtnText, { color: '#fff' }]}>✓</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Save button */}
        <View style={styles.saveWrap}>
          <Pressable
            onPress={handleSave}
            disabled={!draft.imageUri || fetchingLocation || saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
              (!draft.imageUri || fetchingLocation || saving) && styles.disabled,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <View style={styles.saveBtnIconWrap}>
                  <Text style={styles.saveBtnIcon}>✈️</Text>
                </View>
                <Text style={styles.saveBtnText}>Save Memory</Text>
              </>
            )}
          </Pressable>
          <Text style={[styles.hint, { color: theme.subtext }]}>
            Going back without saving will discard this entry.
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default AddEntryScreen;