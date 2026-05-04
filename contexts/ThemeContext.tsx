import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DarkColors, LightColors, ColorScheme } from '@/constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  isDark: true,
  colors: DarkColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const colors = useMemo(() => (mode === 'dark' ? DarkColors : LightColors), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  const { colors } = useContext(ThemeContext);
  return colors;
}
