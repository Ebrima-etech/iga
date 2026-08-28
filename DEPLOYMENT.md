# GIA Hajj Dashboard - Deployment Guide

## Overview
This is a Next.js 14 application built with React 18, TypeScript, and Tailwind CSS. It provides a professional dashboard for managing Hajj operations.

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Vercel account (for Vercel deployment)
- Access to backend API

## Environment Setup

### Development
```bash
cp .env.example .env.local
# Update API_BASE_URL to your development backend
npm install
npm run dev
```

### Production
1. Copy `.env.example` to `.env.production`
2. Update production API endpoints:
   - `NEXT_PUBLIC_API_BASE_URL` - Production API URL
   - `NEXT_PUBLIC_APP_URL` - Production app domain

## Building for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test production build locally
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy: `vercel --prod`

### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Self-Hosted
1. Build: `npm run build`
2. Install PM2: `npm install -g pm2`
3. Start: `pm2 start npm -- start --name "gia-dashboard"`

## Security Checklist

- [ ] All sensitive data in `.env.production` (not committed)
- [ ] HTTPS enabled for production
- [ ] CORS properly configured for backend API
- [ ] Authentication tokens handled securely
- [ ] No API keys exposed in client code
- [ ] Content Security Policy headers configured
- [ ] Security headers set (X-Frame-Options, X-Content-Type-Options)

## Performance Optimization

### Already Implemented
- ✅ Code splitting (Next.js automatic)
- ✅ Image optimization
- ✅ Lazy loading components
- ✅ CSS minimization (Tailwind)
- ✅ Modern JavaScript (ES2020+)

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor Core Web Vitals
- Set up performance alerts
- Monitor API response times

## Troubleshooting

### Build Failures
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: `node -v` (should be 18+)

### API Connection Issues
- Verify API_BASE_URL in environment variables
- Check CORS configuration on backend
- Verify network connectivity to backend
- Check browser console for detailed errors

### Performance Issues
- Enable caching headers
- Use CDN for static assets
- Monitor bundle size: `npm run build -- --debug`
- Use Next.js Analytics

## Rollback Procedure

### Vercel
1. Go to Vercel dashboard
2. Select deployment to revert to
3. Click "Promote to Production"

### Self-Hosted
1. Keep previous build archived
2. Point app server to previous build
3. Restart service with `pm2 restart gia-dashboard`

## Support
For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- Backend API documentation
- Application logs and error tracking system
