import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/Providers/ThemeProvider';
import CurrencyProvider from '@/components/Providers/CurrencyProvider';
import HajjYearProvider from '@/components/Providers/HajjYearProvider';
import { isLoggedIn } from '@/lib/auth';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const authCheckRef = useRef(false);
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    // Only check auth once per route change to prevent infinite redirects
    if (!router.isReady) return;
    if (authCheckRef.current) return;

    if (!isPublicPage && !isLoggedIn()) {
      authCheckRef.current = true;
      router.push('/login');
    }
  }, [router.isReady, router.pathname, isPublicPage]);

  // Reset auth check when route changes
  useEffect(() => {
    authCheckRef.current = false;
  }, [router.pathname]);

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <HajjYearProvider>
          <Toaster position="top-right" />
          <Component {...pageProps} />
        </HajjYearProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
