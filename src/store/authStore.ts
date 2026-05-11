// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  role: 'STORE_MANAGER' | 'USER';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

/**
 * Production-grade Auth Store
 * Uses partialize to ensure the token is never written to localStorage.
 * This prevents XSS attacks from stealing the token and ensures the 
 * browser's HttpOnly cookie remains the source of truth for sessions.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // Initialized as null
      setUser: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        // Standard persist clear
        localStorage.removeItem('auth-storage');
      },
    }),
    { 
      name: 'auth-storage',
      /**
       * Security Rule: Do not persist the token.
       * We only persist the 'user' object so the UI knows the user's name/role 
       * on page reload while the 'api-client' handles the token refresh via cookies.
       */
      partialize: (state) => ({ 
        user: state.user 
      }),
    }
  )
);