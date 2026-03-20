import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import TravelEntryCard from '../components/TravelEntryCard';
import SortPicker, { SortOption } from '../components/SortPicker';
import { sortEntries } from '../utils/sort';
import { getEntries, removeEntry } from '../utils/storage';
import { TravelEntry, RootStackParamList } from '../types';
import { styles } from '../styles/HomeScreen.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
};

const getHeadline = (count: number): { top: string; bottom: string } => {
  if (count === 0) return { top: 'Your Journey', bottom: 'Begins Here.' };
  if (count === 1) return { top: 'One Memory,', bottom: 'Infinite Stories.' };
  if (count < 5)  return { top: `${count} Memories,`, bottom: 'Counting.' };
  if (count < 10) return { top: 'A Growing', bottom: 'Collection.' };
  return { top: `${count} Chapters`, bottom: 'Written.' };
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();

  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>('default');

  useFocusEffect(useCallback(() => { loadEntries(); }, []));

  const loadEntries = async () => {
    try {
      setLoading(true);
      setEntries(await getEntries());
    } catch {
      Alert.alert('Error', 'Failed to load entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { setEntries(await getEntries()); }
    catch { Alert.alert('Error', 'Failed to refresh.'); }
    finally { setRefreshing(false); }
  };

  const handleRemove = async (id: string) => {
    setEntries(await removeEntry(id));
  };

  const uniquePlaces = new Set(entries.map((e) => e.address.split(',')[0]?.trim() ?? '')).size;
  const totalPhotos = entries.reduce((acc, e) => acc + 1 + (e.photos?.length ?? 0), 0);
  const headline = getHeadline(entries.length);
  const sortedEntries = sortEntries(entries, sort);

  // ─── Header ───────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <>
      <View style={[styles.headerBanner, { backgroundColor: theme.background }]}>
        {/* Decorative circles */}
        <View style={[styles.bannerAccent, { backgroundColor: theme.primary }]} />
        <View style={[styles.bannerAccent2, { backgroundColor: theme.primary }]} />

        {/* Top row: logo + greeting */}
        <View style={styles.headerTopRow}>
          <View style={styles.logoMark}>
            <View style={[styles.logoStamp, { borderColor: theme.primary }]}>
              <Image
                source={require('../../assets/SquareLogo.png')}
                style={styles.logoStampImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.logoTextWrap}>
              <Text style={[styles.logoEyebrow, { color: theme.primary }]}>Personal</Text>
              <Text style={[styles.logoTitle, { color: theme.text }]}>Travel Diary</Text>
            </View>
          </View>

          <View style={[styles.greetingPill, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={[styles.greetingPillText, { color: theme.subtext }]}>
              {getGreeting()} ✦
            </Text>
          </View>
        </View>

        {/* Editorial headline */}
        <View style={styles.headlineWrap}>
          <Text style={[styles.headlineSub, { color: theme.primary }]}>
            ✦ Your Story
          </Text>
          <Text style={[styles.headlineMain, { color: theme.text }]}>
            {headline.top}{'\n'}
            <Text style={{ color: theme.primary }}>{headline.bottom}</Text>
          </Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={[styles.statChip, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '40' }]}>
            <Text style={styles.statChipIcon}>🗺️</Text>
            <View style={styles.statChipRight}>
              <Text style={[styles.statChipNumber, { color: theme.primary }]}>{entries.length}</Text>
              <Text style={[styles.statChipLabel, { color: theme.primary + 'aa' }]}>Entries</Text>
            </View>
          </View>

          <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statChipIcon}>📍</Text>
            <View style={styles.statChipRight}>
              <Text style={[styles.statChipNumber, { color: theme.text }]}>{uniquePlaces}</Text>
              <Text style={[styles.statChipLabel, { color: theme.subtext }]}>Places</Text>
            </View>
          </View>

          <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statChipIcon}>🖼</Text>
            <View style={styles.statChipRight}>
              <Text style={[styles.statChipNumber, { color: theme.text }]}>{totalPhotos}</Text>
              <Text style={[styles.statChipLabel, { color: theme.subtext }]}>Photos</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section divider with label + sort picker */}
      {entries.length > 0 && (
        <View style={[styles.sectionDivider, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <View style={[styles.dividerDiamond, { borderColor: theme.primary }]} />
            <Text style={[styles.dividerLabel, { color: theme.subtext }]}>
              Memories · {entries.length}
            </Text>
          </View>
          <SortPicker current={sort} onChange={setSort} />
        </View>
      )}
    </>
  );

  // ─── Empty state ───────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyMapWrap, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
        <Text style={styles.emptyMapEmoji}>🗺️</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Memories{'\n'}Yet.
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
        Every great journey starts with a single photo. Tap the button below to capture your first memory.
      </Text>
      <View style={styles.emptyHintRow}>
        <View style={[styles.emptyHintLine, { backgroundColor: theme.primary }]} />
        <Text style={[styles.emptyHintText, { color: theme.primary }]}>Start Now</Text>
        <View style={[styles.emptyHintLine, { backgroundColor: theme.primary }]} />
      </View>
    </View>
  );

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading your diary...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={sortedEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TravelEntryCard entry={item} onRemove={handleRemove} index={index} />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[styles.listContent, entries.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} colors={[theme.primary]} />
        }
      />

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <View style={styles.fabWrap}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
            pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => navigation.navigate('AddEntry')}
          accessibilityLabel="Add new travel entry"
          accessibilityRole="button"
        >
          <View style={styles.fabPlusWrap}>
            <Text style={styles.fabPlus}>+</Text>
          </View>
          <Text style={styles.fabText}>New Memory</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default HomeScreen;