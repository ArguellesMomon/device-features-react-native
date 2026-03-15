import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = '@travel_diary_entries';

// ─── Generate a simple unique ID ──────────────────────────────────────────────
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// ─── Load all entries ─────────────────────────────────────────────────────────
export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TravelEntry[];
  } catch (e) {
    console.error('[Storage] getEntries failed:', e);
    return [];
  }
};

// ─── Save a new entry (newest first) ─────────────────────────────────────────
export const saveEntry = async (entry: TravelEntry): Promise<void> => {
  if (!entry.id) throw new Error('Entry must have an ID');
  if (!entry.imageUri) throw new Error('Entry must have an image');
  if (!entry.address) throw new Error('Entry must have an address');
  if (typeof entry.latitude !== 'number') throw new Error('Invalid latitude');
  if (typeof entry.longitude !== 'number') throw new Error('Invalid longitude');

  try {
    const current = await getEntries();
    if (current.some((e) => e.id === entry.id)) {
      throw new Error('Duplicate entry ID');
    }
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...current])
    );
  } catch (e) {
    console.error('[Storage] saveEntry failed:', e);
    throw e;
  }
};

// ─── Remove an entry by ID, returns updated list ──────────────────────────────
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