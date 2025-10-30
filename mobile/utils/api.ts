// utils/api.js
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pamwechete-api.onrender.com/api';

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

// Request interceptor
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
    
    // Handle specific error cases
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Check if server is running and accessible');
    }
    
    return Promise.reject(error);
  }
);

export default api;