import { create } from 'zustand';
import { CurrencyCode } from '@/types';

interface CurrencyRate {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number;
}

interface CurrencyStoreState {
  defaultCurrency: CurrencyCode;
  baseCurrency: CurrencyCode;
  currencies: Record<CurrencyCode, CurrencyRate>;
  setDefaultCurrency: (currency: CurrencyCode) => void;
  setCurrencies: (currencies: CurrencyRate[]) => void;
  updateCurrencySettings: (defaultCurrency: CurrencyCode, baseCurrency: CurrencyCode, currencies: CurrencyRate[]) => void;
  getSymbol: (code: CurrencyCode) => string;
  getRate: (code: CurrencyCode) => number;
}

const defaultCurrencies: CurrencyRate[] = [
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.017 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.013 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.016 },
];

const currenciesRecord = defaultCurrencies.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {} as Record<CurrencyCode, CurrencyRate>);

export const useCurrencyStore = create<CurrencyStoreState>((set, get) => ({
  defaultCurrency: 'GMD',
  baseCurrency: 'GMD',
  currencies: currenciesRecord,

  setDefaultCurrency: (currency: CurrencyCode) => {
    set({ defaultCurrency: currency });
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultCurrency', currency);
    }
  },

  setCurrencies: (currencies: CurrencyRate[]) => {
    const currenciesMap = currencies.reduce((acc, curr) => {
      acc[curr.code] = curr;
      return acc;
    }, {} as Record<CurrencyCode, CurrencyRate>);
    set({ currencies: currenciesMap });
  },

  updateCurrencySettings: (defaultCurrency: CurrencyCode, baseCurrency: CurrencyCode, currencies: CurrencyRate[]) => {
    const currenciesMap = currencies.reduce((acc, curr) => {
      acc[curr.code] = curr;
      return acc;
    }, {} as Record<CurrencyCode, CurrencyRate>);

    set({
      defaultCurrency,
      baseCurrency,
      currencies: currenciesMap,
    });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultCurrency', defaultCurrency);
      localStorage.setItem('currencySettings', JSON.stringify({
        defaultCurrency,
        baseCurrency,
        currencies,
      }));
    }
  },

  getSymbol: (code: CurrencyCode) => {
    const state = get();
    return state.currencies[code]?.symbol || '$';
  },

  getRate: (code: CurrencyCode) => {
    const state = get();
    return state.currencies[code]?.rate || 1;
  },
}));
