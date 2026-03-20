import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import {
  getEntryById,
  updateEntryDescription,
  updateEntryTitle,
  addPhotoToEntry,
  removePhotoFromEntry,
} from '../utils/storage';
import { TravelEntry, RootStackParamList } from '../types';
import { styles, POLAROID_W, POLAROID_IMG_H } from '../styles/EntryDetailScreen.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'EntryDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'EntryDetail'>;

const MAX_DESC = 1000;
const MAX_TITLE = 80;

// ─── Inline ✓ / ✕ ────────────────────────────────────────────────────────────
const InlineActions: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
}> = ({ onConfirm, onCancel, theme }) => (
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
    <Pressable
      onPress={() => { Keyboard.dismiss(); onCancel(); }}
      style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.inlineBtnText, { color: theme.danger }]}>✕</Text>
    </Pressable>
    <Pressable
      onPress={() => { Keyboard.dismiss(); onConfirm(); }}
      style={({ pressed }) => [styles.inlineBtn, { borderColor: theme.primary, backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.inlineBtnText, { color: '#ffffff' }]}>✓</Text>
    </Pressable>
  </View>
);

// ─── Film strip perforations ──────────────────────────────────────────────────
const FilmStrip: React.FC = () => (
  <View style={styles.filmStrip}>
    {[...Array(8)].map((_, i) => (
      <View key={i} style={styles.filmHole} />
    ))}
  </View>
);

// ─── Rule line divider ────────────────────────────────────────────────────────
const RuleLine: React.FC<{ color: string; accent: string }> = ({ color, accent }) => (
  <View style={styles.ruleLine}>
    <View style={[styles.ruleLineBar, { backgroundColor: color }]} />
    <View style={[styles.ruleLineDot, { backgroundColor: accent }]} />
    <View style={[styles.ruleLineBar, { backgroundColor: color, flex: 0.15 }]} />
  </View>
);

// ─── Polaroid photo component ─────────────────────────────────────────────────
const Polaroid: React.FC<{
  uri: string;
  isEditing: boolean;
  onPress: () => void;
  onRemove: () => void;
  rotate?: string;
}> = ({ uri, isEditing, onPress, onRemove, rotate = '0deg' }) => (
  <View style={[styles.polaroid, { transform: [{ rotate }] }]}>
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
      <Image source={{ uri }} style={styles.polaroidImage} resizeMode="cover" />
    </Pressable>
    <View style={styles.polaroidCaption}>
      <View style={[styles.polaroidCaptionLine, { backgroundColor: '#000' }]} />
    </View>
    {isEditing && (
      <Pressable onPress={onRemove} style={({ pressed }) => [styles.polaroidRemove, pressed && { opacity: 0.7 }]}>
        <Text style={styles.polaroidRemoveText}>✕</Text>
      </Pressable>
    )}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const EntryDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { theme, isDark } = useTheme();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<TravelEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [origTitle, setOrigTitle] = useState('');
  const [origDesc, setOrigDesc] = useState('');
  const [origPhotos, setOrigPhotos] = useState<string[]>([]);

  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const titleRef = useRef<TextInput>(null);

  // Slight rotations for polaroid gallery
  const rotations = ['-1.5deg', '1.2deg', '-0.8deg', '1.8deg', '-1.2deg', '0.6deg'];

  useEffect(() => {
    const load = async () => {
      try {
        if (!entryId) { Alert.alert('Error', 'No entry ID.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]); return; }
        const found = await getEntryById(entryId);
        if (!found) { Alert.alert('Not Found', 'Entry no longer exists.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]); return; }
        setEntry(found);
        setTitle(found.title ?? '');            setOrigTitle(found.title ?? '');
        setDescription(found.description ?? ''); setOrigDesc(found.description ?? '');
        setPhotos(found.photos ?? []);           setOrigPhotos(found.photos ?? []);
      } catch { Alert.alert('Error', 'Failed to load entry.'); }
      finally { setLoading(false); }
    };
    load();
  }, [entryId]);

  const startEdit = () => { setIsEditing(true); setTimeout(() => { titleRef.current?.focus(); setTitleFocused(true); }, 200); };
  const cancelEdit = () => {
    Keyboard.dismiss();
    setTitle(origTitle); setDescription(origDesc); setPhotos(origPhotos);
    setTitleFocused(false); setDescFocused(false); setIsEditing(false);
  };

  const confirmTitle = () => {
    if (!title.trim() || title.trim().length < 3) { Alert.alert('Invalid', 'Title must be at least 3 characters.'); return; }
    setTitleFocused(false); Keyboard.dismiss();
  };
  const cancelTitle = () => { setTitle(origTitle); setTitleFocused(false); Keyboard.dismiss(); };

  const confirmDesc = () => {
    if (description.length > MAX_DESC) { Alert.alert('Too Long', `Max ${MAX_DESC} characters.`); return; }
    setDescFocused(false); Keyboard.dismiss();
  };
  const cancelDesc = () => { setDescription(origDesc); setDescFocused(false); Keyboard.dismiss(); };

  const saveAll = async () => {
    if (!title.trim() || title.trim().length < 3) { Alert.alert('Invalid', 'Title must be at least 3 characters.'); return; }
    if (description.length > MAX_DESC) { Alert.alert('Too Long', `Max ${MAX_DESC} characters.`); return; }
    setSaving(true);
    try {
      if (title.trim() !== origTitle) { await updateEntryTitle(entryId, title.trim()); setOrigTitle(title.trim()); }
      if (description !== origDesc) { await updateEntryDescription(entryId, description); setOrigDesc(description); }
      const added = photos.filter((p) => !origPhotos.includes(p));
      const removed = origPhotos.filter((p) => !photos.includes(p));
      for (const u of added) await addPhotoToEntry(entryId, u);
      for (const u of removed) await removePhotoFromEntry(entryId, u);
      setOrigPhotos(photos); setIsEditing(false);
    } catch (e: any) { Alert.alert('Save Failed', e?.message || 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  const pickPhoto = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: '📷 Camera', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera access required.'); return; }
        const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
        if (!r.canceled && r.assets[0]?.uri) setPhotos((p) => [...p, r.assets[0].uri]);
      }},
      { text: '🖼 Library', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Library access required.'); return; }
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.85 });
        if (!r.canceled && r.assets[0]?.uri) setPhotos((p) => [...p, r.assets[0].uri]);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const formattedDate = entry ? (() => {
    try {
      const d = new Date(entry.createdAt);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch { return { day: '', full: 'Unknown date', time: '' }; }
  })() : { day: '', full: '', time: '' };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading entry...</Text>
    </View>
  );
  if (!entry) return null;

  const shortAddress = entry.address.split(',')[0];
  const totalPhotos = 1 + photos.length;

  return (
    <>
      {/* Fullscreen modal */}
      <Modal visible={!!fullscreenUri} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setFullscreenUri(null)}>
        <View style={styles.modalOverlay}>
          {fullscreenUri && <Image source={{ uri: fullscreenUri }} style={styles.fullscreenPhoto} resizeMode="contain" />}
          <Pressable onPress={() => setFullscreenUri(null)} style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.modalCloseBtnText}>✕</Text>
          </Pressable>
        </View>
      </Modal>

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
        {/* ── Hero with film strip ───────────────────────────────────── */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: entry.imageUri }} style={styles.heroPhoto} resizeMode="cover" />
          <View style={styles.heroVignette} />

          {/* Film strip perforations on left edge */}
          <FilmStrip />

          <Pressable style={styles.heroTouchable} onPress={() => { if (!isEditing) setFullscreenUri(entry.imageUri); }} />

          <View style={styles.heroBottom}>
            <View style={styles.locationPill}>
              <View style={styles.locationDot} />
              <Text style={styles.locationText} numberOfLines={1}>{shortAddress}</Text>
            </View>
            <Text style={styles.heroDate}>{formattedDate.day} · {formattedDate.time}</Text>
          </View>

          {!isEditing ? (
            <Pressable onPress={startEdit} style={({ pressed }) => [styles.editFab, { backgroundColor: theme.primary, shadowColor: theme.primary }, pressed && { opacity: 0.85 }]}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
              <Text style={styles.editFabText}>EDIT</Text>
            </Pressable>
          ) : (
            <Pressable onPress={cancelEdit} style={({ pressed }) => [styles.editFab, { backgroundColor: 'rgba(0,0,0,0.5)' }, pressed && { opacity: 0.7 }]}>
              <Text style={styles.editFabText}>✕ CANCEL</Text>
            </Pressable>
          )}
        </View>

        {/* ── Passport stamp band ───────────────────────────────────── */}
        <View style={[styles.stampBand, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
          <View style={styles.stampLeft}>
            <Text style={styles.stampIcon}>🌍</Text>
            <View>
              <Text style={[styles.stampLabel, { color: theme.subtext }]}>Destination</Text>
              <Text style={[styles.stampValue, { color: theme.text }]} numberOfLines={1}>{shortAddress}</Text>
            </View>
          </View>
          <View style={[styles.stampDivider, { backgroundColor: theme.text }]} />
          <View>
            <Text style={[styles.stampDate, { color: theme.text }]}>{formattedDate.full}</Text>
            <Text style={[styles.stampDateSub, { color: theme.subtext }]}>{totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} captured</Text>
          </View>
        </View>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <View style={styles.body}>

          {/* Title */}
          <View style={styles.titleWrap}>
            <Text style={[styles.titleEyebrow, { color: theme.primary }]}>Memory</Text>
            {isEditing ? (
              <View>
                <TextInput
                  ref={titleRef}
                  value={title}
                  onChangeText={(t) => { if (t.length <= MAX_TITLE) setTitle(t); }}
                  onFocus={() => setTitleFocused(true)}
                  style={[styles.titleInput, { color: theme.text, borderBottomColor: titleFocused ? theme.primary : theme.border }]}
                  placeholder="Entry title..."
                  placeholderTextColor={theme.placeholder}
                  maxLength={MAX_TITLE}
                  returnKeyType="done"
                  onSubmitEditing={confirmTitle}
                />
                {titleFocused && <InlineActions onConfirm={confirmTitle} onCancel={cancelTitle} theme={theme} />}
              </View>
            ) : (
              <Text style={[styles.titleText, { color: theme.text }]}>{title || 'Untitled Entry'}</Text>
            )}
          </View>

          <RuleLine color={theme.border} accent={theme.primary} />

          {/* Travel Notes — lined paper feel */}
          <View style={styles.notesWrap}>
            <View style={styles.notesSectionHeader}>
              <Text style={[styles.sectionLabel, { color: theme.subtext }]}>Travel Notes</Text>
              {!isEditing && description.length > 0 && (
                <Text style={[{ fontSize: 10, fontWeight: '600', opacity: 0.5 }, { color: theme.subtext }]}>
                  {description.split(' ').length} words
                </Text>
              )}
            </View>

            {isEditing ? (
              <View>
                <TextInput
                  value={description}
                  onChangeText={(t) => { if (t.length <= MAX_DESC) setDescription(t); }}
                  onFocus={() => setDescFocused(true)}
                  placeholder="Write about this memory..."
                  placeholderTextColor={theme.placeholder}
                  multiline
                  style={[styles.descInput, { color: theme.text, borderBottomColor: descFocused ? theme.primary : theme.border }]}
                  maxLength={MAX_DESC}
                />
                <Text style={[styles.charCount, { color: MAX_DESC - description.length < 50 ? theme.danger : theme.subtext }]}>
                  {MAX_DESC - description.length} left
                </Text>
                {descFocused && <InlineActions onConfirm={confirmDesc} onCancel={cancelDesc} theme={theme} />}
              </View>
            ) : description ? (
              // Lined paper effect — each paragraph on its own ruled line
              <View style={{ gap: 0 }}>
                {description.split('\n').map((line, i) => (
                  <View key={i} style={[styles.descLine, { borderBottomColor: theme.border + '55' }]}>
                    <Text style={[styles.descText, { color: theme.text }]}>{line || ' '}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.descEmpty, { color: theme.placeholder }]}>
                No notes yet — tap Edit to capture this memory in words.
              </Text>
            )}
          </View>

          {/* Photo Gallery — polaroid style */}
          {(photos.length > 0 || isEditing) && (
            <>
              <RuleLine color={theme.border} accent={theme.primary} />
              <View style={styles.galleryWrap}>
                <View style={styles.gallerySectionHeader}>
                  <Text style={[styles.sectionLabel, { color: theme.subtext }]}>Photo Roll</Text>
                  <View style={[styles.photoCountChip, { borderColor: theme.border, backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.photoCountChipText, { color: theme.primary }]}>
                      🎞 {totalPhotos} SHOT{totalPhotos !== 1 ? 'S' : ''}
                    </Text>
                  </View>
                </View>

                <View style={[styles.polaroidGrid, { paddingBottom: 12, paddingTop: 8 }]}>
                  {/* Add photo button in edit mode */}
                  {isEditing && (
                    <Pressable
                      onPress={pickPhoto}
                      style={({ pressed }) => [
                        styles.addPhotoBtn,
                        { borderColor: theme.primary, backgroundColor: theme.primaryLight },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.addPhotoIcon}>📷</Text>
                      <Text style={[styles.addPhotoBtnText, { color: theme.primary }]}>Add</Text>
                    </Pressable>
                  )}

                  {/* Polaroid photos */}
                  {photos.map((uri, i) => (
                    <Polaroid
                      key={uri + i}
                      uri={uri}
                      isEditing={isEditing}
                      onPress={() => setFullscreenUri(uri)}
                      onRemove={() => setPhotos((p) => p.filter((x) => x !== uri))}
                      rotate={isEditing ? '0deg' : rotations[i % rotations.length]}
                    />
                  ))}
                </View>

                {photos.length === 0 && isEditing && (
                  <Text style={[styles.descEmpty, { color: theme.placeholder }]}>
                    Tap the camera to add photos to this memory.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* Save / Discard */}
          {isEditing && (
            <>
              <RuleLine color={theme.border} accent={theme.primary} />
              <View style={styles.editActions}>
                <Pressable onPress={cancelEdit} style={({ pressed }) => [styles.cancelBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, pressed && { opacity: 0.7 }]}>
                  <Text style={[styles.cancelBtnText, { color: theme.subtext }]}>Discard</Text>
                </Pressable>
                <Pressable onPress={saveAll} disabled={saving} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.primary }, saving && styles.disabled, pressed && { opacity: 0.8 }]}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveBtnText}>Save Entry</Text>
                  }
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EntryDetailScreen;