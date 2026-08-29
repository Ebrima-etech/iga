/**
 * Common filter configurations for different data types
 * Use these to quickly add filters to pages
 */

export const statusFilters = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Registered', value: 'registered' },
  { label: 'Paid', value: 'paid' },
  { label: 'Departed', value: 'departed' },
  { label: 'Returned', value: 'returned' },
];

export const pilgrimStatusFilters = [
  { label: 'Registered', value: 'registered' },
  { label: 'Paid', value: 'paid' },
  { label: 'Departed', value: 'departed' },
  { label: 'Returned', value: 'returned' },
];

export const paymentStatusFilters = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

export const submissionMethodFilters = [
  { label: 'Manual Form', value: 'manual_form' },
  { label: 'CSV Upload', value: 'csv_upload' },
  { label: 'API', value: 'api' },
];

export const verificationStatusFilters = [
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

export const genderFilters = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
];

export const commonCountries = [
  { label: 'Gambia', value: 'Gambia' },
  { label: 'Senegal', value: 'Senegal' },
  { label: 'Guinea', value: 'Guinea' },
  { label: 'Guinea-Bissau', value: 'Guinea-Bissau' },
  { label: 'Sierra Leone', value: 'Sierra Leone' },
  { label: 'Mali', value: 'Mali' },
  { label: 'Other', value: 'Other' },
];

/**
 * Determine if filters are active (not all default)
 */
export function hasActiveFilters(filters: Record<string, any>): boolean {
  return Object.values(filters).some((value) => value !== null && value !== '' && value !== undefined);
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: string | Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format amount as currency
 */
export function formatAmountForDisplay(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GMD',
  }).format(num);
}

/**
 * Get status color class for badges
 */
export function getStatusColorClass(status: string): string {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    registered: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    departed: 'bg-purple-100 text-purple-800',
    returned: 'bg-gray-100 text-gray-800',
    verified: 'bg-green-100 text-green-800',
    manual_form: 'bg-blue-100 text-blue-800',
    csv_upload: 'bg-purple-100 text-purple-800',
    api: 'bg-indigo-100 text-indigo-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Date range filter helper
 */
export function createDateRangeFilter(
  startDate: string | null,
  endDate: string | null
): (date: string | Date) => boolean {
  return (date: string | Date) => {
    const d = new Date(date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };
}

/**
 * Amount range filter helper
 */
export function createAmountRangeFilter(
  minAmount: number | null,
  maxAmount: number | null
): (amount: number | string) => boolean {
  return (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (minAmount !== null && num < minAmount) return false;
    if (maxAmount !== null && num > maxAmount) return false;
    return true;
  };
}
