// utils/api.js
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔌 Environment variables check:');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Final API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - will be enhanced by components with tokens
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('🔐 Making API request to:', config.url);
      // Token will be added by components using getToken()
    } catch (error) {
      console.warn('Error in request interceptor:', error);
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
      data: error.response?.data,
    });
    
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
    sync: '/users/sync',
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