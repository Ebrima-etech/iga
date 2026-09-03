/**
 * Optimized Next.js configuration for high performance
 * Production-ready settings for GIA Dashboard
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ============================================================================
  // CORE SETTINGS
  // ============================================================================

  reactStrictMode: true,
  swcMinify: true,  // Use SWC for faster compilation
  productionBrowserSourceMaps: false,  // Disable source maps in production
  compress: true,  // Enable gzip compression

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================

  images: {
    formats: ['image/avif', 'image/webp'],  // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,  // 1 year cache
  },

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================

  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,  // 1 hour
    pagesBufferLength: 5,  // Keep 5 pages in memory
  },

  // ============================================================================
  // WEBPACK OPTIMIZATION
  // ============================================================================

  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,

            // Vendor libraries
            vendor: {
              filename: `static/chunks/vendor-[hash].js`,
              test: /node_modules/,
              priority: 10,
              reuseExistingChunk: true,
            },

            // React and Next.js framework
            react: {
              filename: `static/chunks/react-[hash].js`,
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },

            // UI libraries
            ui: {
              filename: `static/chunks/ui-[hash].js`,
              test: /[\\/]node_modules[\\/](@mui|antd)[\\/]/,
              priority: 15,
              reuseExistingChunk: true,
            },

            // Common chunks used in multiple places
            common: {
              filename: `static/chunks/common-[hash].js`,
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // ============================================================================
  // HTTP CACHING HEADERS
  // ============================================================================

  async headers() {
    return [
      // Immutable static assets (long cache)
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',  // 1 year
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // API responses (medium cache)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=120',  // 1 min cache
          },
        ],
      },

      // Dynamic pages (minimal cache)
      {
        source: '/:path((?!static|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',  // No cache
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },

      // Images (long cache)
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // REDIRECTS AND REWRITES
  // ============================================================================

  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite API calls to backend
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://igaa.onrender.com'}/api/v1/:path*`,
        },
      ],
    };
  },

  // ============================================================================
  // ENVIRONMENT VARIABLES
  // ============================================================================

  env: {
    NEXT_TELEMETRY_DISABLED: '1',  // Disable Next.js telemetry
  },

  // ============================================================================
  // EXPERIMENTAL FEATURES
  // ============================================================================

  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],  // Auto-optimize imports
    esmExternals: true,  // Better ES module handling
  },

  // ============================================================================
  // OUTPUT SETTINGS
  // ============================================================================

  output: 'standalone',  // For Docker/serverless deployment

  // ============================================================================
  // BUILD OPTIMIZATION
  // ============================================================================

  // Skip linting during build if needed
  eslint: {
    ignoreDuringBuilds: false,  // Enforce linting
  },

  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // ============================================================================
  // PRODUCTION DEPLOYMENT
  // ============================================================================

  poweredByHeader: false,  // Remove X-Powered-By header
  generateEtags: true,  // Generate ETags for caching
  trailingSlash: false,  // Don't add trailing slashes
  basePath: '',  // No base path needed
  assetPrefix: '',  // CDN prefix (if using CDN)
});
