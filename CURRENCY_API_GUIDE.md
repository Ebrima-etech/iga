# Real-Time Currency Exchange Rate APIs (Free)

## Best Free Options

### 1. **Exchangerate.host** ⭐ RECOMMENDED
- **Cost**: FREE (no API key required!)
- **Rate Limits**: Very generous (no documented limit)
- **Accuracy**: Updated daily
- **Features**:
  - Real-time rates
  - Historical rates
  - No authentication needed
  - CORS enabled
  - Reliable uptime

```typescript
// Example API call
https://api.exchangerate.host/latest?base=GMD&symbols=USD,GBP,EUR
```

### 2. Open Exchange Rates
- **Cost**: Free tier (1000 requests/month)
- **Rate Limits**: 1000/month
- **Requires**: API key (free registration)
- **Accuracy**: Real-time

```typescript
https://openexchangerates.org/api/latest.json?app_id=YOUR_KEY&base=GMD
```

### 3. ExchangeRate-API
- **Cost**: Free tier (1500 requests/month)
- **Rate Limits**: 1500/month
- **Requires**: API key (free registration)
- **Accuracy**: Real-time

```typescript
https://api.exchangerate-api.com/v4/latest/GMD
```

### 4. Fixer.io
- **Cost**: Free tier (100 requests/month)
- **Rate Limits**: 100/month
- **Requires**: API key
- **Accuracy**: Real-time

## Recommended Implementation

### Option 1: Direct API Calls (Simplest)

```typescript
// lib/currencyApi.ts
import { CurrencyCode } from '@/types';

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRates(baseCurrency: CurrencyCode = 'GMD'): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=USD,GBP,EUR,GMD`
    );
    
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    const data: ExchangeRateResponse = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Currency API error:', error);
    // Fallback to cached rates
    return getCachedRates();
  }
}

function getCachedRates(): Record<string, number> {
  return {
    USD: 0.017,
    GBP: 0.013,
    EUR: 0.016,
    GMD: 1,
  };
}
```

### Option 2: Scheduled Updates (Best Practice)

```typescript
// lib/currencyScheduler.ts
import { fetchExchangeRates } from './currencyApi';
import api from './api';

let lastUpdateTime: Date | null = null;
let cachedRates: Record<string, number> | null = null;
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function updateCurrencyRates() {
  try {
    const rates = await fetchExchangeRates('GMD');
    
    // Update in database
    await api.post('/settings/currency/rates/', {
      rates,
      updated_at: new Date(),
    });
    
    // Update cache
    cachedRates = rates;
    lastUpdateTime = new Date();
    
    console.log('✅ Currency rates updated:', rates);
  } catch (error) {
    console.error('❌ Failed to update currency rates:', error);
  }
}

// Start scheduled updates on app load
export function startCurrencyUpdates() {
  // Update immediately on startup
  updateCurrencyRates();
  
  // Then update every 24 hours
  setInterval(updateCurrencyRates, UPDATE_INTERVAL);
}

export function getLastUpdateTime(): Date | null {
  return lastUpdateTime;
}
```

### Option 3: Backend Service (Most Reliable)

```python
# Django backend - tasks.py
from celery import shared_task
from django.utils import timezone
import requests
from .models import CurrencySettings

@shared_task
def update_currency_rates():
    """Update currency rates from free API every 24 hours"""
    try:
        response = requests.get(
            'https://api.exchangerate.host/latest?base=GMD&symbols=USD,GBP,EUR'
        )
        data = response.json()
        
        if data.get('success') or 'rates' in data:
            settings = CurrencySettings.objects.first()
            if settings:
                settings.currencies = data.get('rates', {})
                settings.last_updated = timezone.now()
                settings.save()
                
            return {
                'status': 'success',
                'rates': data.get('rates'),
                'timestamp': str(timezone.now())
            }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

# In settings.py - configure Celery Beat
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'update-currency-rates': {
        'task': 'dashboard.tasks.update_currency_rates',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
}
```

## Integration Steps

### Step 1: Install Required Package
```bash
npm install node-fetch  # if not using modern fetch API
```

### Step 2: Create Currency Service
```typescript
// lib/currencyService.ts
import { fetchExchangeRates } from './currencyApi';

export async function syncCurrencyRates() {
  try {
    const rates = await fetchExchangeRates('GMD');
    
    // Save to localStorage for offline fallback
    localStorage.setItem('currencyRates', JSON.stringify({
      rates,
      timestamp: new Date().toISOString(),
    }));
    
    return rates;
  } catch (error) {
    // Fallback to localStorage
    const cached = localStorage.getItem('currencyRates');
    if (cached) {
      return JSON.parse(cached).rates;
    }
    throw error;
  }
}
```

### Step 3: Use in Settings Page
```typescript
// pages/dashboard/settings.tsx
import { syncCurrencyRates } from '@/lib/currencyService';

const handleAutoUpdateRates = async () => {
  try {
    toast.loading('Updating rates from API...');
    const rates = await syncCurrencyRates();
    
    // Update state
    setCurrencies(Object.entries(rates).map(([code, rate]) => ({
      code: code as CurrencyCode,
      name: getCurrencyName(code as CurrencyCode),
      symbol: getCurrencySymbol(code as CurrencyCode),
      rate: rate as number,
    })));
    
    toast.success('Rates updated from live API!');
  } catch (error) {
    toast.error('Failed to fetch live rates');
  }
};

return (
  <div>
    <ProfessionalButton
      variant="secondary"
      icon={<BiRefresh />}
      onClick={handleAutoUpdateRates}
    >
      Auto-Update from API
    </ProfessionalButton>
  </div>
);
```

## Cost Comparison

| Provider | Free Tier | Cost/month (paid) | Best For |
|----------|-----------|-------------------|----------|
| **Exchangerate.host** | Unlimited | FREE | Production ⭐ |
| Open Exchange Rates | 1000/month | $12+ | Medium volume |
| ExchangeRate-API | 1500/month | $8+ | Medium volume |
| Fixer.io | 100/month | $10+ | Low volume |

## Best Practices

### 1. **Caching Strategy**
```typescript
const cache = {
  rates: null as Record<string, number> | null,
  timestamp: 0,
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
};

export async function getRatesWithCache() {
  const now = Date.now();
  
  if (cache.rates && (now - cache.timestamp) < cache.MAX_AGE) {
    return cache.rates; // Return cached
  }
  
  // Fetch new rates
  const rates = await fetchExchangeRates();
  cache.rates = rates;
  cache.timestamp = now;
  return rates;
}
```

### 2. **Error Handling**
```typescript
export async function getSafeRates(): Promise<Record<string, number>> {
  try {
    return await getRatesWithCache();
  } catch (error) {
    console.error('Rate fetch failed, using defaults:', error);
    return {
      USD: 0.017,
      GBP: 0.013,
      EUR: 0.016,
      GMD: 1,
    };
  }
}
```

### 3. **Rate Limiting (if needed)**
```typescript
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 60 * 60 * 1000; // 1 hour minimum

export async function fetchRatesSafely() {
  const now = Date.now();
  
  if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
    console.log('Rate limit: too soon, using cache');
    return;
  }
  
  lastFetchTime = now;
  await updateCurrencyRates();
}
```

## Implementation Recommendation

**For your system, I recommend:**

1. **Use exchangerate.host** (completely free, no key needed)
2. **Update daily** (scheduled task at midnight)
3. **Cache locally** (fallback if API fails)
4. **Show last update time** (user confidence)
5. **Add manual sync button** (admin can force update)

### Complete Example:

```typescript
// Add to lib/currency.ts
export async function updateCurrencyRatesFromAPI(): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api.exchangerate.host/latest?base=GMD&symbols=USD,GBP,EUR'
    );
    const data = await response.json();
    
    if (!data.rates) return false;
    
    // Update DEFAULT_CURRENCIES
    DEFAULT_CURRENCIES.USD.rate = data.rates.USD;
    DEFAULT_CURRENCIES.GBP.rate = data.rates.GBP;
    DEFAULT_CURRENCIES.EUR.rate = data.rates.EUR;
    
    // Save to database
    await api.post('/settings/currency/sync/', {
      rates: data.rates,
      source: 'exchangerate.host',
    });
    
    return true;
  } catch (error) {
    console.error('Failed to update rates:', error);
    return false;
  }
}
```

## Next Steps

Would you like me to:
1. ✅ Integrate exchangerate.host API into your settings page
2. ✅ Add auto-update scheduled task
3. ✅ Create sync button with loading state
4. ✅ Add last update timestamp display
