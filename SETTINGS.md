# Settings Guide - GIA Hajj Operations Dashboard

## Overview

The Settings section provides comprehensive management of user profiles, currency preferences, and system configuration. It's designed with a professional, FAANG-level interface for optimal user experience.

## Sections

### 1. Profile Settings

Manage your personal account information:

- **First Name & Last Name**: Update your display name
- **Email Address**: Change your email (must be unique)
- **Username**: View your system username (read-only)
- **Account Status**: View your account health and role

**Features:**
- Edit mode with save/cancel options
- Real-time validation
- Account status indicators
- Role badges

### 2. Currency Settings

Manage currency preferences and exchange rates:

#### Default Currency
Select the currency used for all transactions and reporting:
- USD (US Dollar)
- GBP (British Pound)
- EUR (Euro)
- GMD (Gambian Dalasi)

#### Currency Rates
Configure exchange rates relative to GMD (base currency):

| Currency | Code | Symbol | Rate (to GMD) |
|----------|------|--------|---------------|
| Gambian Dalasi | GMD | D | 1.000000 |
| US Dollar | USD | $ | 0.017000 |
| British Pound | GBP | £ | 0.013000 |
| Euro | EUR | € | 0.016000 |

**How to Update Rates:**
1. Click "Edit Rates" button
2. Update the exchange rates for each currency
3. Click "Save Rates" to apply changes
4. Rates update across the entire system

### 3. System Configuration

View and manage system-wide settings:

- **System Version**: Current application version
- **API Status**: Backend connectivity status
- **Database Status**: Database health indicator
- **Organization Info**: Company details

## Currency Conversion

### Using Currency in Your Code

```typescript
import { convertCurrency, formatCurrency, getCurrency } from '@/lib/currency';

// Convert 1000 USD to EUR
const amount = convertCurrency(1000, 'USD', 'EUR');
// Returns: 926.47

// Format amount with currency symbol
const formatted = formatCurrency(1000, 'USD');
// Returns: "$1,000.00"

// Get currency details
const currency = getCurrency('GMD');
// Returns: { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 1 }
```

### Context API Usage

```typescript
import { useCurrency } from '@/lib/currencyContext';

function MyComponent() {
  const { defaultCurrency, convert, format, symbol } = useCurrency();

  return (
    <div>
      <p>Default: {defaultCurrency}</p>
      <p>Formatted: {format(5000)}</p>
    </div>
  );
}
```

## Available Currency Functions

### Core Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `convertCurrency()` | Convert between currencies | `convertCurrency(1000, 'USD', 'EUR')` |
| `formatCurrency()` | Format with symbol | `formatCurrency(1000, 'USD')` → `"$1,000.00"` |
| `formatCurrencyValue()` | Format without symbol | `formatCurrencyValue(1000)` → `"1,000.00"` |
| `getCurrency()` | Get currency config | `getCurrency('USD')` |
| `getCurrencySymbol()` | Get symbol | `getCurrencySymbol('USD')` → `"$"` |
| `getCurrencyName()` | Get name | `getCurrencyName('USD')` → `"US Dollar"` |

### Utility Functions

| Function | Purpose |
|----------|---------|
| `getAllCurrencies()` | Get all available currencies |
| `convertMultiple()` | Batch convert amounts |
| `getPercentageInCurrency()` | Calculate percentage in specific currency |

## Best Practices

### 1. Consistent Formatting
Always use `formatCurrency()` when displaying monetary values to users:

```typescript
// ✅ Good
<p>{formatCurrency(amount, defaultCurrency)}</p>

// ❌ Avoid
<p>{amount}</p>
```

### 2. Rate Updates
Update currency rates regularly to ensure accuracy:
- Check rates weekly or monthly
- Update before major financial reports
- Document rate changes in audit logs

### 3. Database Storage
Store all amounts in the base currency (GMD) internally:
- Simplifies calculations
- Avoids rounding errors
- Enables easy rate updates

### 4. Performance
Cache currency rates in memory:
```typescript
// ✅ Good - loaded once
const rates = getAllCurrencies();

// ❌ Avoid - repeated lookups
for (item of items) {
  getCurrency(item.currency); // Multiple times
}
```

## Responsive Design

The settings interface is fully responsive:

- **Desktop**: Full-width tabbed interface with cards
- **Tablet**: Optimized column layout
- **Mobile**: Single-column stackable layout with touch-friendly controls

## Security

### Admin Only
- Currency rate updates (requires admin role)
- System configuration changes
- API status monitoring

### User Level
- Profile information (own data only)
- View default currency setting
- View exchange rates

## API Integration

### Update Currency Settings

```typescript
// POST /api/settings/currency/
{
  "default_currency": "USD",
  "base_currency": "GMD",
  "currencies": {
    "GMD": { "code": "GMD", "rate": 1 },
    "USD": { "code": "USD", "rate": 0.017 },
    "GBP": { "code": "GBP", "rate": 0.013 },
    "EUR": { "code": "EUR", "rate": 0.016 }
  }
}
```

### Update User Profile

```typescript
// PUT /api/users/{id}/
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

## Troubleshooting

### Rates Not Updating
1. Verify admin permissions
2. Check API connectivity
3. Verify rate format (must be decimal numbers)
4. Check browser console for errors

### Currency Not Appearing
1. Verify currency code is valid (GMD, USD, GBP, EUR)
2. Check case sensitivity
3. Reload page after updates

## Future Enhancements

- [ ] Historical rate tracking
- [ ] Automatic rate sync from external APIs
- [ ] Bulk import/export of settings
- [ ] Rate change audit logs
- [ ] Localization settings
- [ ] Theme customization

## Support

For issues or questions:
- Check the Settings UI tooltips
- Review this guide
- Contact system administrator
