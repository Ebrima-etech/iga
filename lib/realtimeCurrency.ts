import { CurrencyCode } from '@/types';

type CurrencyMode = 'manual' | 'realtime';

interface CurrencyRateUpdate {
  rates: Record<CurrencyCode, number>;
  timestamp: number;
  mode: CurrencyMode;
  source: string;
}

let currentMode: CurrencyMode = 'manual';
let updateInterval: NodeJS.Timeout | null = null;
let currentRates: Record<CurrencyCode, number> = {
  GMD: 1,
  USD: 0.017,
  GBP: 0.013,
  EUR: 0.016,
};

const LISTENERS = new Set<(update: CurrencyRateUpdate) => void>();
const FETCH_INTERVAL = 30 * 60 * 1000; // Update every 30 minutes (1,800,000ms)

/**
 * Fetch real-time rates from API with fallback
 */
export async function fetchRealtimeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'https://api.exchangerate.host/latest?base=GMD&symbols=USD,GBP,EUR',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API returned status ${response.status}, using fallback rates`);
      return currentRates;
    }

    const data = await response.json();

    // If success flag is explicitly false, use fallback
    if (data.success === false) {
      console.warn('API returned success: false (possibly rate limited), using fallback rates');
      return currentRates;
    }

    // Verify rates exist and are valid
    if (!data.rates || typeof data.rates !== 'object' || Object.keys(data.rates).length === 0) {
      console.warn('No valid rates in API response, using fallback rates');
      return currentRates;
    }

    // Extract rates with validation
    const newRates = {
      GMD: 1,
      USD: typeof data.rates.USD === 'number' ? data.rates.USD : currentRates.USD,
      GBP: typeof data.rates.GBP === 'number' ? data.rates.GBP : currentRates.GBP,
      EUR: typeof data.rates.EUR === 'number' ? data.rates.EUR : currentRates.EUR,
    };

    // Validate rates are reasonable (not zero or negative)
    if (newRates.USD > 0 && newRates.GBP > 0 && newRates.EUR > 0) {
      console.log('✓ Real-time rates fetched successfully', newRates);
      return newRates;
    } else {
      console.warn('Invalid rate values received, using fallback rates');
      return currentRates;
    }
  } catch (error) {
    console.warn('Failed to fetch realtime rates, using fallback:', error);
    // Return current rates as fallback - never fail
    return currentRates;
  }
}

/**
 * Set currency mode (manual or realtime)
 */
export function setCurrencyMode(mode: CurrencyMode) {
  currentMode = mode;

  if (mode === 'realtime') {
    startRealtimeUpdates();
  } else {
    stopRealtimeUpdates();
  }
}

/**
 * Get current mode
 */
export function getCurrencyMode(): CurrencyMode {
  return currentMode;
}

/**
 * Update manual rates
 */
export function updateManualRates(rates: Record<CurrencyCode, number>) {
  currentRates = { ...rates };
  notifyListeners('manual', 'manual');
}

/**
 * Start real-time updates
 */
export function startRealtimeUpdates() {
  if (updateInterval) return; // Already running

  console.log('🔄 Starting real-time currency updates...');

  // Fetch immediately
  fetchRealtimeRates().then((rates) => {
    currentRates = rates;
    notifyListeners('realtime', 'exchangerate.host');
  });

  // Then update every 30 minutes
  updateInterval = setInterval(async () => {
    try {
      const rates = await fetchRealtimeRates();
      currentRates = rates;
      notifyListeners('realtime', 'exchangerate.host');
    } catch (error) {
      console.error('Error updating rates:', error);
    }
  }, FETCH_INTERVAL);
}

/**
 * Stop real-time updates
 */
export function stopRealtimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('⏹️ Stopped real-time currency updates');
  }
}

/**
 * Get current rates
 */
export function getCurrentRates(): Record<CurrencyCode, number> {
  return { ...currentRates };
}

/**
 * Get specific rate
 */
export function getRate(currency: CurrencyCode): number {
  return currentRates[currency] || 1;
}

/**
 * Subscribe to rate updates
 */
export function subscribeToRateUpdates(
  callback: (update: CurrencyRateUpdate) => void
): () => void {
  LISTENERS.add(callback);

  // Return unsubscribe function
  return () => {
    LISTENERS.delete(callback);
  };
}

/**
 * Notify all listeners of rate changes
 */
function notifyListeners(mode: CurrencyMode, source: string) {
  const update: CurrencyRateUpdate = {
    rates: { ...currentRates },
    timestamp: Date.now(),
    mode,
    source,
  };

  LISTENERS.forEach((listener) => {
    try {
      listener(update);
    } catch (error) {
      console.error('Error in rate update listener:', error);
    }
  });
}

/**
 * Initialize currency system
 */
export function initializeCurrency(mode: CurrencyMode = 'manual', manualRates?: Record<CurrencyCode, number>) {
  if (manualRates) {
    currentRates = manualRates;
  }

  setCurrencyMode(mode);

  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      stopRealtimeUpdates();
    });
  }
}

/**
 * Get status info
 */
export function getCurrencyStatus() {
  return {
    mode: currentMode,
    rates: currentRates,
    isUpdating: updateInterval !== null,
    updateInterval: FETCH_INTERVAL,
  };
}
