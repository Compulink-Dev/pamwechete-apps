import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    update: '/users/update',
    verification: '/users/verification',
    uploadDocument: '/users/verification/documents',
  },
  
  // Trades
  trades: {
    list: '/trades',
    create: '/trades',
    details: (id: string) => `/trades/${id}`,
    update: (id: string) => `/trades/${id}`,
    delete: (id: string) => `/trades/${id}`,
    search: '/trades/search',
    recommendations: '/trades/recommendations',
    wishlist: '/trades/wishlist',
  },
  
  // Trade Requests
  tradeRequests: {
    create: '/trade-requests',
    list: '/trade-requests',
    details: (id: string) => `/trade-requests/${id}`,
    accept: (id: string) => `/trade-requests/${id}/accept`,
    reject: (id: string) => `/trade-requests/${id}/reject`,
    complete: (id: string) => `/trade-requests/${id}/complete`,
  },
  
  // Messages
  messages: {
    conversations: '/messages/conversations',
    send: '/messages',
    thread: (id: string) => `/messages/thread/${id}`,
  },
  
  // Community
  community: {
    posts: '/community/posts',
    create: '/community/posts',
    like: (id: string) => `/community/posts/${id}/like`,
    comment: (id: string) => `/community/posts/${id}/comment`,
  },
  
  // Categories
  categories: {
    list: '/categories',
  },
};
