# Django Backend Installation & Deployment Guide

## 📋 Overview

This guide walks you through installing the currency settings backend module into your existing Django project. The module handles saving and retrieving currency settings and rates.

## 🚀 Quick Start (5 minutes)

### Step 1: Copy Files to Your Django Project

Your Django backend project should have this structure:

```
your-django-project/
├── manage.py
├── requirements.txt
├── your_project/
│   ├── settings.py
│   ├── urls.py
│   └── ...
└── settings_app/           # CREATE THIS FOLDER
    ├── __init__.py
    ├── models.py           # Copy from django_settings_app_models.py
    ├── views.py            # Copy from django_settings_app_views.py
    ├── serializers.py      # Copy from django_settings_app_serializers.py
    ├── urls.py             # Copy from django_settings_app_urls.py
    ├── admin.py            # Copy from django_settings_app_admin.py
    ├── apps.py             # Copy from django_settings_app_apps.py
    └── migrations/
        └── __init__.py
```

**Copy these files:**

1. `django_settings_app_models.py` → `settings_app/models.py`
2. `django_settings_app_views.py` → `settings_app/views.py`
3. `django_settings_app_serializers.py` → `settings_app/serializers.py`
4. `django_settings_app_urls.py` → `settings_app/urls.py`
5. `django_settings_app_admin.py` → `settings_app/admin.py`
6. `django_settings_app_apps.py` → `settings_app/apps.py`

### Step 2: Update Django Settings

Edit your `your_project/settings.py`:

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',  # Required!
    'corsheaders',     # Recommended for CORS
    
    # Your apps
    'settings_app',    # ADD THIS
]

# Add REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # OR use SessionAuthentication if you prefer
        # 'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Add CORS configuration (if frontend is on different domain)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at the beginning
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:52479",
    "https://iga-frontend.vercel.app",  # Your Vercel frontend URL
]

# Enable CORS for your Render domain
CORS_ALLOW_CREDENTIALS = True
```

### Step 3: Update Main URLs

Edit your `your_project/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('settings_app.urls')),  # Add this line
    # ... other URL patterns
]
```

### Step 4: Create Initial Migration

```bash
cd your-django-project
python manage.py makemigrations settings_app
python manage.py migrate settings_app
```

### Step 5: Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

### Step 6: Test Locally

```bash
python manage.py runserver 8000
```

Then test the endpoints:

```bash
# Get default settings (no auth required for GET in this example)
curl http://localhost:8000/api/v1/settings/currency/

# Or with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/settings/currency/
```

## 📦 Requirements

Add these to your `requirements.txt`:

```
Django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.0
djangorestframework-simplejwt>=5.0  # For JWT auth
```

Or install manually:

```bash
pip install Django djangorestframework django-cors-headers djangorestframework-simplejwt
```

## 🌐 API Endpoints

### GET /api/v1/settings/currency/

**Get user's currency settings**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/settings/currency/
```

**Response (200 OK):**
```json
{
  "default_currency": "USD",
  "base_currency": "GMD",
  "mode": "manual",
  "currencies": [
    {
      "code": "GMD",
      "name": "Gambian Dalasi",
      "symbol": "D",
      "rate": 1.0
    },
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "rate": 0.017
    }
  ],
  "created_at": "2026-08-28T12:00:00Z",
  "updated_at": "2026-08-28T12:00:00Z"
}
```

### POST /api/v1/settings/currency/

**Save/update currency settings**

```bash
curl -X POST \
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
     }' \
     http://localhost:8000/api/v1/settings/currency/
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Currency settings saved successfully",
  "data": {
    "default_currency": "USD",
    "base_currency": "GMD",
    "mode": "manual",
    "currencies": [
      {"code": "GMD", "name": "Gambian Dalasi", "symbol": "D", "rate": 1.0},
      ...
    ],
    "created_at": "2026-08-28T12:00:00Z",
    "updated_at": "2026-08-28T12:00:00Z"
  }
}
```

### GET /api/v1/currency-rates/

**Get formatted currency rates for the user**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/currency-rates/
```

**Response (200 OK):**
```json
{
  "success": true,
  "mode": "manual",
  "base_currency": "GMD",
  "default_currency": "USD",
  "rates": {
    "GMD": {"name": "Gambian Dalasi", "symbol": "D", "rate": 1.0},
    "USD": {"name": "US Dollar", "symbol": "$", "rate": 0.017},
    "GBP": {"name": "British Pound", "symbol": "£", "rate": 0.013},
    "EUR": {"name": "Euro", "symbol": "€", "rate": 0.016}
  }
}
```

## 🐳 Docker Deployment (for Render)

If deploying to Render, add to your `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Run migrations
RUN python manage.py migrate

# Collect static files
RUN python manage.py collectstatic --noinput

# Run server
CMD gunicorn your_project.wsgi:application --bind 0.0.0.0:$PORT
```

Update `requirements.txt`:

```
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.0.0
djangorestframework-simplejwt==5.2.2
gunicorn==20.1.0
psycopg2-binary==2.9.6  # PostgreSQL (if using)
python-decouple==3.8    # For environment variables
```

## 🚢 Render Deployment

### Environment Variables

Set these on Render dashboard:

```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=*.onrender.com,localhost
DATABASE_URL=postgresql://user:password@db-host/dbname
```

### Steps

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Create PostgreSQL database on Render
4. Set environment variables
5. Deploy

### Database Setup on Render

1. Go to Render dashboard
2. Create PostgreSQL database
3. Copy connection string to `DATABASE_URL`
4. Run migrations after deployment:

```bash
# In Render dashboard -> Service -> Shell
python manage.py migrate
python manage.py createsuperuser
```

## 🔒 Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Enable HTTPS (automatic on Render)
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS only for trusted domains
- [ ] Use JWT tokens with expiration
- [ ] Validate all input data
- [ ] Use HTTPS for all API calls

## 🧪 Testing

Run tests:

```bash
python manage.py test settings_app
```

### Manual Testing Checklist

- [ ] Create account and get auth token
- [ ] GET `/api/v1/settings/currency/` - should return defaults
- [ ] POST `/api/v1/settings/currency/` with new rates
- [ ] GET `/api/v1/settings/currency/` - should return saved rates
- [ ] GET `/api/v1/currency-rates/` - should return formatted rates
- [ ] Test with invalid currency codes
- [ ] Test with missing fields
- [ ] Test without authentication token

## 🐛 Troubleshooting

### Migration Errors

```bash
# Reset migrations (CAREFUL - deletes data!)
python manage.py migrate settings_app zero
python manage.py makemigrations settings_app
python manage.py migrate settings_app
```

### Import Errors

Make sure you have all required packages:

```bash
pip install -r requirements.txt
```

### 404 Not Found

Check that URLs are added to main `urls.py`:

```python
path('', include('settings_app.urls')),
```

### 403 Forbidden

Check authentication token:

```bash
# Make sure header is correct
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/settings/currency/
```

### CORS Errors

Add your frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py

## 📊 Database Schema

```
CurrencySettings (One per user)
├── id (PrimaryKey)
├── user (ForeignKey -> User, OneToOne)
├── default_currency (CharField)
├── base_currency (CharField)
├── mode (CharField: manual | realtime)
├── created_at (DateTime)
└── updated_at (DateTime)
    └─── currencies (OneToMany)
         ├── id (PrimaryKey)
         ├── settings (ForeignKey)
         ├── code (CharField: GMD, USD, GBP, EUR)
         ├── name (CharField)
         ├── symbol (CharField)
         ├── rate (DecimalField)
         ├── created_at (DateTime)
         └── updated_at (DateTime)
```

## 🎉 Next Steps

Once deployed:

1. Test from frontend that rates save successfully
2. Monitor logs for errors
3. Set up admin account for managing rates
4. Configure backup strategy
5. Monitor database growth

## 📞 Support

If you encounter issues:

1. Check Django logs: `python manage.py runserver` shows errors
2. Check Render logs: Dashboard -> Service -> Logs
3. Verify database connection: `python manage.py dbshell`
4. Test API with curl/Postman before testing from frontend

---

**Ready to deploy!** Your currency settings system is now complete. 🎊
