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
  updateToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      updateToken: (token) => set({ token }),
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');
      },
    }),
    { 
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token // Hydrate token instantly on page reload
      }),
    }
  )
);