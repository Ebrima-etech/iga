import { useState, useEffect } from 'react';
import { CurrencyCode } from '@/types';
import {
  subscribeToRateUpdates,
  getCurrentRates,
  getCurrencyMode,
  getRate,
} from '@/lib/realtimeCurrency';

interface LiveRatesState {
  rates: Record<CurrencyCode, number>;
  mode: 'manual' | 'realtime';
  lastUpdate: number;
  isLive: boolean;
}

/**
 * Hook to subscribe to live rate updates
 */
export function useLiveRates(): LiveRatesState {
  const [state, setState] = useState<LiveRatesState>({
    rates: getCurrentRates(),
    mode: getCurrencyMode(),
    lastUpdate: Date.now(),
    isLive: getCurrencyMode() === 'realtime',
  });

  useEffect(() => {
    // Subscribe to rate updates
    const unsubscribe = subscribeToRateUpdates((update) => {
      setState({
        rates: update.rates,
        mode: update.mode,
        lastUpdate: update.timestamp,
        isLive: update.mode === 'realtime',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Hook to get a specific currency rate
 */
export function useCurrencyRate(currency: CurrencyCode) {
  const [rate, setRate] = useState(getRate(currency));

  useEffect(() => {
    const unsubscribe = subscribeToRateUpdates((update) => {
      setRate(update.rates[currency] || rate);
    });

    return () => {
      unsubscribe();
    };
  }, [currency, rate]);

  return rate;
}

/**
 * Hook to format live rate with animation
 */
export function useLiveFormattedRate(amount: number, currency: CurrencyCode) {
  const rate = useCurrencyRate(currency);
  const converted = (amount * rate).toFixed(2);

  return {
    rate,
    converted,
    display: `${converted}`,
  };
}
