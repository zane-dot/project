import { create } from 'zustand';
import { authService } from '../services/auth';
import type { User } from '../types';

const TOKEN_KEY = 'finance.token';
const USER_KEY = 'finance.user';

interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  status: 'idle',

  login: async (email, password) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, status: 'ready' });
  },

  register: async (email, name, password) => {
    const { token, user } = await authService.register(email, name, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, status: 'ready' });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, status: 'ready' });
  },

  hydrate: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!token) {
      set({ status: 'ready' });
      return;
    }
    // Optimistically load cached user; verify in background.
    if (userRaw) {
      try {
        set({ token, user: JSON.parse(userRaw) as User });
      } catch {
        // ignore parse errors
      }
    } else {
      set({ token });
    }
    try {
      const user = await authService.me();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, status: 'ready' });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, status: 'ready' });
    }
  },
}));
