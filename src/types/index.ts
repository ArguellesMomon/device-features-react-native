// ─── Travel Entry Data Model ───────────────────────────────────────────────────
export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string; // ISO date string
}

// ─── Navigation Stack Params ───────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
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