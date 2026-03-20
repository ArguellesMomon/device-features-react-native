import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = '@travel_diary_entries';

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// ─── Migrate old entries missing new fields ───────────────────────────────────
const migrate = (entry: any): TravelEntry => ({
  ...entry,
  title: entry.title ?? 'Untitled Entry',
  description: entry.description ?? '',
  photos: entry.photos ?? [],
  textAlign: entry.textAlign ?? 'left',
});

// ─── Load all entries ─────────────────────────────────────────────────────────
export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrate);
  } catch (e) {
    console.error('[Storage] getEntries failed:', e);
    return [];
  }
};

// ─── Get single entry by ID ───────────────────────────────────────────────────
export const getEntryById = async (id: string): Promise<TravelEntry | null> => {
  if (!id) throw new Error('ID is required');
  try {
    const entries = await getEntries();
    return entries.find((e) => e.id === id) ?? null;
  } catch (e) {
    console.error('[Storage] getEntryById failed:', e);
    return null;
  }
};

// ─── Save new entry ───────────────────────────────────────────────────────────
export const saveEntry = async (entry: TravelEntry): Promise<void> => {
  if (!entry.id) throw new Error('Entry must have an ID');
  if (!entry.imageUri) throw new Error('Entry must have an image');
  if (!entry.address) throw new Error('Entry must have an address');
  if (!entry.title || entry.title.trim().length === 0) throw new Error('Entry must have a title');
  if (typeof entry.latitude !== 'number') throw new Error('Invalid latitude');
  if (typeof entry.longitude !== 'number') throw new Error('Invalid longitude');

  try {
    const current = await getEntries();
    if (current.some((e) => e.id === entry.id)) throw new Error('Duplicate entry ID');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...current]));
  } catch (e) {
    console.error('[Storage] saveEntry failed:', e);
    throw e;
  }
};

// ─── Update title ─────────────────────────────────────────────────────────────
export const updateEntryTitle = async (id: string, title: string): Promise<void> => {
  if (!id) throw new Error('ID is required');
  if (!title.trim()) throw new Error('Title cannot be empty');
  if (title.trim().length < 3) throw new Error('Title must be at least 3 characters');
  if (title.length > 80) throw new Error('Title must be 80 characters or less');
  try {
    const current = await getEntries();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');
    current[index] = { ...current[index], title };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('[Storage] updateEntryTitle failed:', e);
    throw e;
  }
};

// ─── Update description ───────────────────────────────────────────────────────
export const updateEntryDescription = async (id: string, description: string): Promise<void> => {
  if (!id) throw new Error('ID is required');
  if (description.length > 1000) throw new Error('Description is too long (max 1000 characters)');
  try {
    const current = await getEntries();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');
    current[index] = { ...current[index], description };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('[Storage] updateEntryDescription failed:', e);
    throw e;
  }
};

// ─── Update text alignment ────────────────────────────────────────────────────
export const updateEntryTextAlign = async (
  id: string,
  textAlign: 'left' | 'center' | 'right'
): Promise<void> => {
  if (!id) throw new Error('ID is required');
  try {
    const current = await getEntries();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');
    current[index] = { ...current[index], textAlign };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('[Storage] updateEntryTextAlign failed:', e);
    throw e;
  }
};

// ─── Add a photo to entry ─────────────────────────────────────────────────────
export const addPhotoToEntry = async (id: string, photoUri: string): Promise<void> => {
  if (!id) throw new Error('ID is required');
  if (!photoUri) throw new Error('Photo URI is required');
  try {
    const current = await getEntries();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');
    const photos = [...(current[index].photos ?? []), photoUri];
    current[index] = { ...current[index], photos };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('[Storage] addPhotoToEntry failed:', e);
    throw e;
  }
};

// ─── Remove a photo from entry ────────────────────────────────────────────────
export const removePhotoFromEntry = async (id: string, photoUri: string): Promise<void> => {
  if (!id) throw new Error('ID is required');
  try {
    const current = await getEntries();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');
    const photos = (current[index].photos ?? []).filter((p) => p !== photoUri);
    current[index] = { ...current[index], photos };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('[Storage] removePhotoFromEntry failed:', e);
    throw e;
  }
};

// ─── Remove entry by ID ───────────────────────────────────────────────────────
export const removeEntry = async (id: string): Promise<TravelEntry[]> => {
  if (!id) throw new Error('ID is required');
  try {
    const current = await getEntries();
    if (!current.some((e) => e.id === id)) throw new Error('Entry not found');
    const updated = current.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('[Storage] removeEntry failed:', e);
    throw e;
  }
};