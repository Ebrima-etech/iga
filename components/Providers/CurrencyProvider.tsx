import { useEffect } from 'react';
import { useCurrencyStore } from '@/lib/stores/currencyStore';
import api from '@/lib/api';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currencyStore = useCurrencyStore();

  useEffect(() => {
    const loadCurrencySettings = async () => {
      if (typeof window === 'undefined') return;

      try {
        // First try to load from API (server source of truth)
        const response = await api.get('/settings/currency/');
        const settings = response.data;

        if (settings.default_currency && settings.currencies) {
          currencyStore.updateCurrencySettings(
            settings.default_currency,
            settings.base_currency || 'GMD',
            settings.currencies
          );
          // Also save to localStorage for faster subsequent loads
          localStorage.setItem('currencySettings', JSON.stringify(settings));
          console.log('✓ Loaded currency settings from backend API');
          return;
        }
      } catch (apiError) {
        console.warn('Failed to load currency settings from API, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('currencySettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          if (settings.default_currency && settings.currencies) {
            currencyStore.updateCurrencySettings(
              settings.default_currency,
              settings.base_currency || 'GMD',
              settings.currencies
            );
            console.log('✓ Loaded currency settings from localStorage');
          }
        } catch (parseError) {
          console.error('Failed to parse localStorage currency settings:', parseError);
        }
      }
    };

    loadCurrencySettings();
  }, [currencyStore]);

  return <>{children}</>;
}
