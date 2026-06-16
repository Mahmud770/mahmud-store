import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 }); // 15 min
        Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// Services
export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getCategories: () => api.get('/services/categories'),
  getOne: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
  createCategory: (data: any) => api.post('/services/categories/create', data),
};

// Orders
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getOne: (id: string) => api.get(`/orders/${id}`),
  export: () => api.get('/orders/export/excel', { responseType: 'blob' }),
  adminGetAll: (params?: any) => api.get('/orders/admin/all', { params }),
  adminUpdate: (id: string, data: any) => api.put(`/orders/admin/${id}`, data),
};

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  applyCoupon: (data: any) => api.post('/payments/coupon', data),
  adminAddBalance: (data: any) => api.post('/payments/admin/add-balance', data),
  adminGetAll: () => api.get('/payments/admin/all'),
};

// Tickets
export const ticketsAPI = {
  create: (data: any) => api.post('/tickets', data),
  getAll: () => api.get('/tickets'),
  reply: (id: string, data: any) => api.post(`/tickets/${id}/reply`, data),
  adminGetAll: (params?: any) => api.get('/tickets/admin/all', { params }),
  adminReply: (id: string, data: any) => api.post(`/tickets/admin/${id}/reply`, data),
};

// Users
export const usersAPI = {
  dashboard: () => api.get('/users/dashboard'),
  getNotifications: () => api.get('/users/notifications'),
  markRead: (id: string) => api.put(`/users/notifications/${id}/read`),
  markAllRead: () => api.put('/users/notifications/read-all'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: any) => api.put('/users/change-password', data),
  getReferrals: () => api.get('/users/referrals'),
  regenerateApiKey: () => api.post('/users/api-key/regenerate'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  getSettings: () => api.get('/admin/settings'),
  saveSettings: (data: any) => api.post('/admin/settings', data),
  broadcast: (data: any) => api.post('/admin/broadcast', data),
  getActivity: () => api.get('/admin/activity'),
};
