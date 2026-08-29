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
      try {
        // Try to fetch from backend
        const response = await api.get('/settings/currency/');
        const settings = response.data;

        if (settings.default_currency && settings.currencies) {
          currencyStore.updateCurrencySettings(
            settings.default_currency,
            settings.base_currency || 'GMD',
            settings.currencies
          );
          console.log('✓ Currency settings loaded from backend');
        }
      } catch (error) {
        console.warn('Failed to load currency settings from backend, using defaults:', error);
        // Fall back to localStorage if available
        if (typeof window !== 'undefined') {
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
                console.log('✓ Currency settings loaded from localStorage');
              }
            } catch (parseError) {
              console.error('Failed to parse localStorage currency settings:', parseError);
            }
          }
        }
      }
    };

    loadCurrencySettings();
  }, [currencyStore]);

  return <>{children}</>;
}
