# Django Backend Setup Guide

## Quick Start

Copy the following files into your Django project:

1. **settings_app/models.py** - Database models
2. **settings_app/views.py** - API views
3. **settings_app/serializers.py** - DRF serializers
4. **settings_app/urls.py** - URL routing
5. **settings_app/admin.py** - Django admin

## Step 1: Add to INSTALLED_APPS

In your Django `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',  # Required for DRF
    'settings_app',    # Add this
]

# Add to REST_FRAMEWORK settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # or 'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

## Step 2: Create Database Models

```python
# settings_app/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class CurrencySettings(models.Model):
    CURRENCY_CHOICES = [
        ('GMD', 'Gambian Dalasi'),
        ('USD', 'US Dollar'),
        ('GBP', 'British Pound'),
        ('EUR', 'Euro'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='currency_settings')
    default_currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    base_currency = models.CharField(max_length=3, default='GMD')
    mode = models.CharField(max_length=20, choices=[('manual', 'Manual'), ('realtime', 'Real-Time')], default='manual')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Currency Settings'

    def __str__(self):
        return f'Currency settings for {self.user.username}'


class CurrencyRate(models.Model):
    settings = models.ForeignKey(CurrencySettings, on_delete=models.CASCADE, related_name='currencies')
    code = models.CharField(max_length=3, choices=[('GMD', 'GMD'), ('USD', 'USD'), ('GBP', 'GBP'), ('EUR', 'EUR')])
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=5)
    rate = models.DecimalField(max_digits=10, decimal_places=6, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('settings', 'code')
        verbose_name_plural = 'Currency Rates'

    def __str__(self):
        return f'{self.code} - {self.rate} ({self.name})'
```

## Step 3: Create Serializers

```python
# settings_app/serializers.py
from rest_framework import serializers
from .models import CurrencySettings, CurrencyRate

class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        fields = ['code', 'name', 'symbol', 'rate']


class CurrencySettingsSerializer(serializers.ModelSerializer):
    currencies = CurrencyRateSerializer(many=True, write_only=True)

    class Meta:
        model = CurrencySettings
        fields = ['default_currency', 'base_currency', 'mode', 'currencies']

    def create(self, validated_data):
        currencies_data = validated_data.pop('currencies', [])
        user = self.context['request'].user
        
        settings, created = CurrencySettings.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        
        if not created:
            # Update existing
            for attr, value in validated_data.items():
                setattr(settings, attr, value)
            settings.save()
        
        # Update currencies
        settings.currencies.all().delete()
        for currency_data in currencies_data:
            CurrencyRate.objects.create(settings=settings, **currency_data)
        
        return settings

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['currencies'] = CurrencyRateSerializer(instance.currencies.all(), many=True).data
        return ret
```

## Step 4: Create Views

```python
# settings_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CurrencySettings, CurrencyRate
from .serializers import CurrencySettingsSerializer
import logging

logger = logging.getLogger(__name__)


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

            if len(data['currencies']) == 0:
                return Response(
                    {'detail': 'At least one currency is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate currency codes
            valid_codes = {'GMD', 'USD', 'GBP', 'EUR'}
            for currency in data['currencies']:
                code = currency.get('code')
                if code not in valid_codes:
                    return Response(
                        {'detail': f'Invalid currency code: {code}. Valid codes: {valid_codes}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if 'rate' not in currency:
                    return Response(
                        {'detail': f'rate is required for currency {code}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                rate = currency.get('rate')
                if not isinstance(rate, (int, float)):
                    return Response(
                        {'detail': f'Rate must be a number for {code}, got {type(rate).__name__}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if rate < 0:
                    return Response(
                        {'detail': f'Rate must be positive for {code}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Use serializer to save
            serializer = CurrencySettingsSerializer(
                data=data,
                context={'request': request}
            )

            if serializer.is_valid():
                settings = serializer.save()
                logger.info(f'Currency settings saved for user {request.user.username}')
                
                return Response(
                    {
                        'success': True,
                        'message': 'Currency settings saved successfully',
                        'data': CurrencySettingsSerializer(settings, context={'request': request}).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                logger.error(f'Validation error: {serializer.errors}')
                return Response(
                    {'detail': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.exception(f'Error saving currency settings: {str(e)}')
            return Response(
                {'detail': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Retrieve saved currency settings"""
        try:
            settings = CurrencySettings.objects.get(user=request.user)
            serializer = CurrencySettingsSerializer(settings, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CurrencySettings.DoesNotExist:
            # Return default settings if not found
            return Response(
                {
                    'default_currency': 'USD',
                    'base_currency': 'GMD',
                    'mode': 'manual',
                    'currencies': [
                        {'code': 'GMD', 'name': 'Gambian Dalasi', 'symbol': 'D', 'rate': 1.0},
                        {'code': 'USD', 'name': 'US Dollar', 'symbol': '$', 'rate': 0.017},
                        {'code': 'GBP', 'name': 'British Pound', 'symbol': '£', 'rate': 0.013},
                        {'code': 'EUR', 'name': 'Euro', 'symbol': '€', 'rate': 0.016},
                    ]
                },
                status=status.HTTP_200_OK
            )


class CurrencyRatesListView(APIView):
    """Get all available currency rates"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current rates for authenticated user"""
        try:
            settings = CurrencySettings.objects.get(user=request.user)
            rates = {
                rate.code: {
                    'name': rate.name,
                    'symbol': rate.symbol,
                    'rate': float(rate.rate)
                }
                for rate in settings.currencies.all()
            }
            
            return Response(
                {
                    'mode': settings.mode,
                    'base_currency': settings.base_currency,
                    'rates': rates
                },
                status=status.HTTP_200_OK
            )
        except CurrencySettings.DoesNotExist:
            return Response(
                {'detail': 'No currency settings found'},
                status=status.HTTP_404_NOT_FOUND
            )
```

## Step 5: Create URLs

```python
# settings_app/urls.py
from django.urls import path
from .views import CurrencySettingsView, CurrencyRatesListView

app_name = 'settings_app'

urlpatterns = [
    path('api/v1/settings/currency/', CurrencySettingsView.as_view(), name='currency-settings'),
    path('api/v1/currency-rates/', CurrencyRatesListView.as_view(), name='currency-rates'),
]
```

## Step 6: Add to Main URLs

In your main Django `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('', include('settings_app.urls')),
]
```

## Step 7: Create Admin Interface

```python
# settings_app/admin.py
from django.contrib import admin
from .models import CurrencySettings, CurrencyRate

class CurrencyRateInline(admin.TabularInline):
    model = CurrencyRate
    extra = 0

@admin.register(CurrencySettings)
class CurrencySettingsAdmin(admin.ModelAdmin):
    inlines = [CurrencyRateInline]
    readonly_fields = ('created_at', 'updated_at')
    list_display = ('user', 'mode', 'default_currency', 'updated_at')
    fields = ('user', 'mode', 'default_currency', 'base_currency', 'created_at', 'updated_at')
```

## Step 8: Run Migrations

```bash
python manage.py makemigrations settings_app
python manage.py migrate settings_app
```

## Step 9: Test the Endpoint

```bash
# Get settings
curl -X GET http://localhost:8000/api/v1/settings/currency/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save settings
curl -X POST http://localhost:8000/api/v1/settings/currency/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "default_currency": "USD",
    "base_currency": "GMD",
    "mode": "manual",
    "currencies": [
      {"code": "GMD", "name": "Gambian Dalasi", "symbol": "D", "rate": 1.0},
      {"code": "USD", "name": "US Dollar", "symbol": "$", "rate": 0.017},
      {"code": "GBP", "name": "British Pound", "symbol": "£", "rate": 0.013},
      {"code": "EUR", "name": "Euro", "symbol": "€", "rate": 0.016}
    ]
  }'
```

## Deployment

1. Create the files in your Django project's `settings_app` directory
2. Update `INSTALLED_APPS` in settings.py
3. Run migrations
4. Deploy to your server (igaa.onrender.com)
5. Frontend will automatically connect and save currency settings

## Environment Setup

Make sure you have:

```bash
pip install djangorestframework
pip install django-cors-headers  # For CORS if needed
```

## CORS Configuration (if needed)

In `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:52479",
    "https://iga-frontend.vercel.app",  # Your Vercel domain
]
```

## Troubleshooting

**404 Not Found**: Make sure URL is added to main urls.py
**401 Unauthorized**: Check authentication token
**400 Bad Request**: Validate currency data format
**500 Internal Error**: Check Django logs

That's it! Your backend is ready to handle currency settings.
