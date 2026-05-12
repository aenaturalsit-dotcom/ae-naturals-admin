// src/components/providers/AuthProvider.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Session } from "next-auth";
import { useAuthStore } from "@/store/authStore";

interface AuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  const initialized = useRef(false);

  // Hydrate NextAuth's initial token into Zustand on first load
  useEffect(() => {
    if (session?.accessToken && !initialized.current) {
      useAuthStore.getState().updateToken(session.accessToken);
      initialized.current = true;
    }
  }, [session]);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}