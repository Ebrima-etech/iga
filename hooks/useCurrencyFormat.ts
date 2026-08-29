import { useCurrencyStore } from '@/lib/stores/currencyStore';
import { formatCurrency as baseFormatCurrency } from '@/lib/utils';

export function useCurrencyFormat() {
  const { defaultCurrency } = useCurrencyStore();

  return {
    formatCurrency: (amount: number | string) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: defaultCurrency || 'USD',
      }).format(num);
    },
    defaultCurrency,
  };
}
