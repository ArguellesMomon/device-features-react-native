import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContextType } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';

const THEME_KEY = '@travel_diary_theme';

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved !== null) setIsDark(saved === 'dark');
      } catch (e) {
        console.error('[Theme] Failed to load preference:', e);
      }
    };
    load();
  }, []);

  // Toggle and persist
  const toggleTheme = async () => {
    try {
      const next = !isDark;
      setIsDark(next);
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch (e) {
      console.error('[Theme] Failed to save preference:', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, theme: isDark ? darkTheme : lightTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};