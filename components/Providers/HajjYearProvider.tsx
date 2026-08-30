import { useEffect } from 'react';
import { useHajjYear } from '@/lib/stores/hajjYearStore';

interface HajjYearProviderProps {
  children: React.ReactNode;
}

export default function HajjYearProvider({ children }: HajjYearProviderProps) {
  const { initializeHajjYear } = useHajjYear();

  useEffect(() => {
    // Only initialize if user has a token (is logged in)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      initializeHajjYear();
    }
  }, [initializeHajjYear]);

  return <>{children}</>;
}
