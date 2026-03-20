import { TravelEntry } from '../types';
import { SortOption } from '../components/SortPicker';

export const sortEntries = (entries: TravelEntry[], sort: SortOption): TravelEntry[] => {
  const copy = [...entries];
  switch (sort) {
    case 'date_desc':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'date_asc':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'alpha_asc':
      return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'alpha_desc':
      return copy.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'default':
    default:
      return copy; // Original order (newest saved = first, from storage)
  }
};