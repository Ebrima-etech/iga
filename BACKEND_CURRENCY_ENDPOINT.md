# Django Backend: Currency Settings Endpoint

## Required Endpoint

The frontend is configured to save manual currency rates to the Django backend at:

```
POST /api/v1/settings/currency/
```

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <token>  # or Session auth if configured
```

### Request Body
```json
{
  "default_currency": "USD",
  "base_currency": "GMD",
  "currencies": [
    {
      "code": "GMD",
      "name": "Gambian Dalasi",
      "symbol": "D",
      "rate": 1
    },
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "rate": 0.017
    },
    {
      "code": "GBP",
      "name": "British Pound",
      "symbol": "£",
      "rate": 0.013
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "rate": 0.016
    }
  ],
  "mode": "manual"
}
```

## Response Format

### Success (200/201)
```json
{
  "success": true,
  "message": "Currency settings saved successfully",
  "data": {
    "default_currency": "USD",
    "base_currency": "GMD",
    "currencies": [
      // ... currency array
    ],
    "mode": "manual",
    "saved_at": "2026-08-28T12:00:00Z"
  }
}
```

### Error (400/404/500)
```json
{
  "detail": "Invalid currency code: XYZ",
  "error": "INVALID_CURRENCY"
}
```

## Django Implementation Example

```python
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache

class CurrencySettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Save manual currency rates"""
        try:
            data = request.data

            # Validate required fields
            if not data.get('default_currency'):
                return Response(
                    {'detail': 'default_currency is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not data.get('currencies') or not isinstance(data['currencies'], list):
                return Response(
                    {'detail': 'currencies must be a non-empty array'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate currency codes
            valid_codes = {'GMD', 'USD', 'GBP', 'EUR'}
            for currency in data['currencies']:
                if currency.get('code') not in valid_codes:
                    return Response(
                        {'detail': f'Invalid currency code: {currency.get("code")}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if not isinstance(currency.get('rate'), (int, float)):
                    return Response(
                        {'detail': f'Rate must be a number for {currency.get("code")}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Save to cache/database
            # Option 1: Save to database model
            settings, created = CurrencySettings.objects.get_or_create(
                user=request.user,
                defaults={'data': data}
            )
            if not created:
                settings.data = data
                settings.save()

            # Option 2: Save to cache (if no persistence needed)
            cache.set(f'currency_settings_{request.user.id}', data, timeout=None)

            return Response(
                {
                    'success': True,
                    'message': 'Currency settings saved successfully',
                    'data': data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Retrieve saved currency settings"""
        try:
            # Try to get from database
            settings = CurrencySettings.objects.get(user=request.user)
            return Response(settings.data, status=status.HTTP_200_OK)
        except CurrencySettings.DoesNotExist:
            return Response(
                {
                    'default_currency': 'USD',
                    'base_currency': 'GMD',
                    'mode': 'manual',
                    'currencies': []
                },
                status=status.HTTP_200_OK
            )


# urls.py
from django.urls import path
from .views import CurrencySettingsView

urlpatterns = [
    path('api/v1/settings/currency/', CurrencySettingsView.as_view(), name='currency-settings'),
]


# models.py (Optional - for database persistence)
from django.db import models
from django.contrib.auth.models import User

class CurrencySettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='currency_settings')
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Currency Settings'

    def __str__(self):
        return f'Currency settings for {self.user.username}'
```

## Frontend Behavior

When saving manual rates:

1. **Success**: Toast shows "✓ Manual currency rates saved to database!"
2. **Failure**: Toast shows detailed error message from backend
3. **Fallback**: Saves to localStorage as temporary backup if backend unavailable

## Testing the Endpoint

### Using curl
```bash
curl -X POST http://localhost:8000/api/v1/settings/currency/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "default_currency": "USD",
    "base_currency": "GMD",
    "currencies": [
      {"code": "GMD", "name": "Gambian Dalasi", "symbol": "D", "rate": 1},
      {"code": "USD", "name": "US Dollar", "symbol": "$", "rate": 0.017},
      {"code": "GBP", "name": "British Pound", "symbol": "£", "rate": 0.013},
      {"code": "EUR", "name": "Euro", "symbol": "€", "rate": 0.016}
    ],
    "mode": "manual"
  }'
```

### Using Python requests
```python
import requests

url = 'http://localhost:8000/api/v1/settings/currency/'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

payload = {
    "default_currency": "USD",
    "base_currency": "GMD",
    "currencies": [
        {"code": "GMD", "name": "Gambian Dalasi", "symbol": "D", "rate": 1},
        {"code": "USD", "name": "US Dollar", "symbol": "$", "rate": 0.017},
        {"code": "GBP", "name": "British Pound", "symbol": "£", "rate": 0.013},
        {"code": "EUR", "name": "Euro", "symbol": "€", "rate": 0.016}
    ],
    "mode": "manual"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())
```

## API Endpoint Checklist

- [ ] Endpoint created at `/api/v1/settings/currency/`
- [ ] POST method accepts currency data
- [ ] GET method retrieves saved settings
- [ ] Authentication required (IsAuthenticated)
- [ ] Input validation for currency codes
- [ ] Input validation for rate values (must be numbers > 0)
- [ ] Error messages in response.data['detail']
- [ ] Database model created (CurrencySettings)
- [ ] Migrations run successfully
- [ ] Tested with frontend form

## Deployment Checklist

1. Create the Django view and model
2. Run migrations: `python manage.py makemigrations && python manage.py migrate`
3. Update URLs in Django `urls.py`
4. Test endpoint with curl or Postman
5. Deploy to Vercel (frontend will automatically use it)

## Notes

- Frontend requires this endpoint to save manual currency rates
- Without this endpoint, rates save only to localStorage (temporary)
- Real-time rates bypass this endpoint (uses exchangerate.host API)
- Manual rates take priority when real-time mode is disabled
