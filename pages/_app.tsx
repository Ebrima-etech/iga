import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/Providers/ThemeProvider';
import { isLoggedIn } from '@/lib/auth';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!isPublicPage && !isLoggedIn()) {
      router.push('/login');
    }
  }, [router, isPublicPage]);

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
