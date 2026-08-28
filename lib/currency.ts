import { CurrencyCode } from '@/types';

interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to GMD
}

const DEFAULT_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GMD: { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 1 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.017 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.013 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.016 },
};

/**
 * Get currency configuration
 */
export function getCurrency(code: CurrencyCode): CurrencyConfig {
  return DEFAULT_CURRENCIES[code] || DEFAULT_CURRENCIES.USD;
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode = 'GMD',
  toCurrency: CurrencyCode = 'USD'
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = DEFAULT_CURRENCIES[fromCurrency]?.rate || 1;
  const toRate = DEFAULT_CURRENCIES[toCurrency]?.rate || 1;

  // Convert to GMD first, then to target currency
  const amountInGMD = amount / fromRate;
  const convertedAmount = amountInGMD * toRate;

  return parseFloat(convertedAmount.toFixed(2));
}

/**
 * Format currency value with symbol
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param decimals - Number of decimal places
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  decimals: number = 2
): string {
  const currencyConfig = getCurrency(currency);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${currencyConfig.symbol}${formatted}`;
}

/**
 * Format currency without symbol
 */
export function formatCurrencyValue(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return getCurrency(code).symbol;
}

/**
 * Get currency name
 */
export function getCurrencyName(code: CurrencyCode): string {
  return getCurrency(code).name;
}

/**
 * Get all available currencies
 */
export function getAllCurrencies(): CurrencyConfig[] {
  return Object.values(DEFAULT_CURRENCIES);
}

/**
 * Batch convert amounts
 */
export function convertMultiple(
  amounts: number[],
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number[] {
  return amounts.map((amount) => convertCurrency(amount, fromCurrency, toCurrency));
}

/**
 * Calculate percentage of amount in different currency
 */
export function getPercentageInCurrency(
  total: number,
  percentage: number,
  currency: CurrencyCode = 'GMD'
): number {
  const amount = (total * percentage) / 100;
  return convertCurrency(amount, 'GMD', currency);
}
