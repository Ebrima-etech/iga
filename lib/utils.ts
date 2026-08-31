export const formatCurrency = (amount: number | string, currency?: string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // If currency is explicitly provided, use it
  if (currency) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(num);
    } catch (e) {
      // Fallback if currency code is invalid
    }
  }

  // Default to GMD (Gambian Dalasi)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GMD',
  }).format(num);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    failed: 'text-red-600 bg-red-50',
    refunded: 'text-gray-600 bg-gray-50',
    registered: 'text-blue-600 bg-blue-50',
    paid: 'text-green-600 bg-green-50',
    departed: 'text-purple-600 bg-purple-50',
    returned: 'text-gray-600 bg-gray-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

export const truncate = (text: string, length: number = 50): string => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
