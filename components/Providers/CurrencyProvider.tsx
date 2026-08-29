import { useEffect } from 'react';
import { useCurrencyStore } from '@/lib/stores/currencyStore';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currencyStore = useCurrencyStore();

  useEffect(() => {
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
          }
        } catch (parseError) {
          console.error('Failed to parse localStorage currency settings:', parseError);
        }
      }
    }
  }, [currencyStore]);

  return <>{children}</>;
}
