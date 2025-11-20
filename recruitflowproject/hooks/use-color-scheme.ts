import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'auto';

export function useColorScheme(): ColorScheme {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('auto');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme_preference');
      if (saved) {
        setThemePreference(saved as ThemePreference);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  // Return the appropriate color scheme based on preference
  if (themePreference === 'auto') {
    return systemColorScheme ?? 'light';
  }
  
  return themePreference;
}
