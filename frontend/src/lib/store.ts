import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from './api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  balance: number;
  currency: string;
  apiKey: string;
  referralCode: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  fetchUser: async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) { set({ isLoading: false }); return; }
      const { data } = await authAPI.me();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...data } });
  },
}));
