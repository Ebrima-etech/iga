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
const FETCH_INTERVAL = 5000; // Update every 5 seconds

/**
 * Fetch real-time rates from API
 */
export async function fetchRealtimeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const response = await fetch(
      'https://api.exchangerate.host/latest?base=GMD&symbols=USD,GBP,EUR'
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // Check if success flag is present and true
    if (data.success === false) {
      throw new Error('API returned success: false');
    }

    // Verify rates exist
    if (!data.rates || typeof data.rates !== 'object') {
      console.warn('API response structure:', data);
      throw new Error('No rates in response or rates is not an object');
    }

    // Extract rates, fallback to current rates if missing
    return {
      GMD: 1,
      USD: data.rates.USD ?? currentRates.USD,
      GBP: data.rates.GBP ?? currentRates.GBP,
      EUR: data.rates.EUR ?? currentRates.EUR,
    };
  } catch (error) {
    console.error('Failed to fetch realtime rates:', error);
    // Return current rates as fallback
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

  // Then update every 5 seconds
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
