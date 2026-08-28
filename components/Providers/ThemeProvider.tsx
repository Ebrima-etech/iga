import { useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    // Initialize theme from localStorage on mount
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
