// ─── Travel Entry Data Model ───────────────────────────────────────────────────
export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  title: string;
  description: string;
  photos: string[];           // Additional photos added in detail view
  textAlign: 'left' | 'center' | 'right'; // Description text alignment
}

// ─── Navigation Stack Params ───────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
  EntryDetail: { entryId: string }; // Pass only the ID, screen loads from storage
};

// ─── Theme Color Palette ───────────────────────────────────────────────────────
export interface AppTheme {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  primaryLight: string;
  border: string;
  danger: string;
  dangerLight: string;
  headerBg: string;
  inputBg: string;
  shadow: string;
  placeholder: string;
}

// ─── Theme Context Shape ───────────────────────────────────────────────────────
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: AppTheme;
}