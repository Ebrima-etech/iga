import { useEffect } from 'react';
import { useHajjYear } from '@/lib/stores/hajjYearStore';

interface HajjYearProviderProps {
  children: React.ReactNode;
}

export default function HajjYearProvider({ children }: HajjYearProviderProps) {
  const { initializeHajjYear } = useHajjYear();

  useEffect(() => {
    // Initialize Hajj year on app load
    initializeHajjYear();
  }, [initializeHajjYear]);

  return <>{children}</>;
}
