import { createContext, useContext } from 'react';
import { CurrencyCode } from '@/types';
import { convertCurrency, formatCurrency, getCurrency } from './currency';

interface CurrencyContextType {
  defaultCurrency: CurrencyCode;
  setDefaultCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, currency?: CurrencyCode) => string;
  symbol: string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Provide default implementation if context not available
    return {
      defaultCurrency: 'GMD' as CurrencyCode,
      setDefaultCurrency: () => {},
      convert: (amount: number, from: CurrencyCode = 'GMD', to: CurrencyCode = 'GMD') =>
        convertCurrency(amount, from, to),
      format: (amount: number, currency: CurrencyCode = 'GMD') => formatCurrency(amount, currency),
      symbol: 'D',
    };
  }
  return context;
}
