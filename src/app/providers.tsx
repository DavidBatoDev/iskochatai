// app/providers.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { initAuthListener } from '../lib/auth';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize auth listener
    initAuthListener();
  }, []);

  return <>{children}</>;
}