import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chaiconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chaiconnect_token');
      localStorage.removeItem('chaiconnect_user');
      // Don't redirect if already on auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ===== SHOPS =====
export const shopAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  getDirections: (data) => api.post('/shops/directions', data),
};

// ===== REVIEWS =====
export const reviewAPI = {
  getByShop: (shopId) => api.get(`/reviews/shop/${shopId}`),
  create: (shopId, data) => api.post(`/reviews/${shopId}`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
};

// ===== REWARDS =====
export const rewardAPI = {
  getBalance: () => api.get('/rewards/balance'),
  redeem: () => api.post('/rewards/redeem'),
  getLeaderboard: () => api.get('/rewards/leaderboard'),
};

export default api;
