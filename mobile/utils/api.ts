import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔌 Environment variables check:');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Final API_URL:', API_URL);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('EXPO')));

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      SecureStore.deleteItemAsync('auth_token');
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
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
