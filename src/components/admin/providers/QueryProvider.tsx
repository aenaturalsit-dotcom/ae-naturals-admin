// src/components/providers/QueryProvider.tsx
'use client'; // This is mandatory for providers in Next.js App Router

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}