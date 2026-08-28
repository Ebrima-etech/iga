# GIA Hajj Operations Management System - Frontend

Next.js + TypeScript + Tailwind CSS responsive dashboard for managing Hajj operations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` and login with your credentials.

## 📁 Project Structure

```
iga/
├── pages/                    # Next.js pages
│   ├── _app.tsx             # App root with auth wrapper
│   ├── _document.tsx        # HTML document structure
│   ├── index.tsx            # Home redirect to dashboard
│   ├── login.tsx            # Login page
│   └── dashboard/
│       ├── index.tsx        # Main dashboard with stats
│       ├── pilgrims.tsx     # Pilgrim management (GHXXXXX IDs)
│       ├── payments.tsx     # Payment tracking multi-bank
│       ├── reports.tsx      # Reports & export
│       └── settings.tsx     # Account settings
├── components/
│   ├── Layout/
│   │   ├── index.tsx        # Main layout wrapper
│   │   ├── Header.tsx       # Top navigation
│   │   ├── Sidebar.tsx      # Side navigation
│   │   └── Footer.tsx       # Footer
│   └── Common/
│       ├── Button.tsx       # Reusable button
│       ├── Modal.tsx        # Modal dialog
│       ├── Alert.tsx        # Alert messages
│       └── Loading.tsx      # Loading spinner
├── lib/
│   ├── api.ts               # Axios API client with JWT
│   ├── auth.ts              # Authentication functions
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript interfaces
├── styles/
│   └── globals.css          # Global Tailwind styles
└── public/                  # Static assets
```

## 🎨 Features Built

### Pages

| Page | Purpose |
|------|---------|
| **Login** | Email/password authentication |
| **Dashboard** | Stats, charts, bank overview |
| **Pilgrims** | Register, list, search (GHXXXXX format) |
| **Payments** | Track payments from all banks |
| **Reports** | Export data to PDF/Excel |
| **Settings** | Account and system settings |

### Components

| Component | Purpose |
|-----------|---------|
| **Layout** | Header, Sidebar, Footer wrapper |
| **Button** | Variants: primary, secondary, danger |
| **Modal** | Dialog forms and confirmations |
| **Alert** | Toast-style notifications |
| **Loading** | Spinner animation |

## 🔐 Authentication

- **JWT Tokens**: Stored in localStorage
- **Auto Redirect**: Unauth users → login
- **Protected Routes**: All dashboard pages require login
- **Token Intercept**: Auto-included in API headers

## 📱 Responsive Design

- **Mobile-First**: Designed for 375px+ screens
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px
- **Touch-Friendly**: 44px+ buttons, readable fonts
- **Adaptive Layout**: Sidebar collapses on mobile

## 🎯 Key Features

### Pilgrims (GHXXXXX Format)
✓ Registration with auto-generated IDs  
✓ Full profile capture  
✓ Status tracking  
✓ Search and filter  
✓ Document uploads  

### Payments
✓ Multi-bank view  
✓ Status filtering  
✓ Amount summaries  
✓ Date range filtering  
✓ Bank breakdowns  

### Dashboard
✓ Total pilgrim count  
✓ Total paid amount  
✓ Pending amounts  
✓ Active bank count  
✓ Charts and analytics  

## 🛠️ Development

### Environment
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=GIA Hajj Operations
```

### Add New Page
1. Create file in `pages/dashboard/`
2. Wrap with `<Layout>`
3. Fetch data with `api.get()`
4. Add link in Sidebar

### API Integration
```tsx
import api from '@/lib/api';

const fetchData = async () => {
  const response = await api.get('/endpoint/');
};
```

## 🚀 Production

```bash
npm run build
npm start
```

---

**Version**: 1.0.0  
**Stack**: Next.js 14 + TypeScript + Tailwind CSS + Recharts  
**Status**: ✅ Production Ready