'use client';

import { useEffect, useState } from 'react';
import { useCashFlowStore } from '@/store/use-cashflow-store';

export function useHasHydrated(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);
  const storeHydrated = useCashFlowStore((state) => state.hasHydrated);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated || storeHydrated;
}
