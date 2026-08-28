import { create } from 'zustand';
import { getThemeById, professionalTheme } from '@/lib/themes/definitions';
import { applyThemeToDocument } from '@/lib/themes/cssVariables';

interface ThemeStore {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = 'iga-theme-preference';

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: 'professional',

  setTheme: (themeId: string) => {
    const theme = getThemeById(themeId);

    // Apply theme to document
    applyThemeToDocument(theme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }

    // Update store
    set({ currentTheme: themeId });
  },

  initializeTheme: () => {
    if (typeof window === 'undefined') return;

    // Get saved theme from localStorage or default to professional
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'professional';
    const theme = getThemeById(savedTheme);

    // Apply theme
    applyThemeToDocument(theme);

    // Update store
    set({ currentTheme: theme.id });
  },
}));

export const useTheme = () => {
  const store = useThemeStore();
  return {
    currentTheme: store.currentTheme,
    setTheme: store.setTheme,
  };
};
