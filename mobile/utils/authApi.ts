import api from './api'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Helper function to make authenticated API requests
 */
export const makeAuthenticatedRequest = async <T = any>(
  getToken: () => Promise<string | null>,
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    const token = await getToken()

    if (!token) {
      throw new Error('No authentication token available')
    }

    const authenticatedConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    }

    console.log('🔄 Making authenticated request to:', config.url)
    return api(authenticatedConfig)
  } catch (error) {
    console.error('Error in authenticated request:', error)
    throw error
  }
}

/**
 * Helper to create API functions with auth
 */
export const createAuthApi = (getToken: () => Promise<string | null>) => ({
  get: <T = any>(url: string, config: AxiosRequestConfig = {}) =>
    makeAuthenticatedRequest<T>(getToken, { ...config, method: 'GET', url }),

  post: <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}) =>
    makeAuthenticatedRequest<T>(getToken, { ...config, method: 'POST', url, data }),

  put: <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}) =>
    makeAuthenticatedRequest<T>(getToken, { ...config, method: 'PUT', url, data }),

  patch: <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}) =>
    makeAuthenticatedRequest<T>(getToken, { ...config, method: 'PATCH', url, data }),

  delete: <T = any>(url: string, config: AxiosRequestConfig = {}) =>
    makeAuthenticatedRequest<T>(getToken, { ...config, method: 'DELETE', url }),
})

/**
 * API endpoints
 */
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
    me: '/users/me',
  },

  // Trades
  trades: {
    list: '/trades',
    create: '/trades',
    details: (id: string | number) => `/trades/${id}`,
    update: (id: string | number) => `/trades/${id}`,
    delete: (id: string | number) => `/trades/${id}`,
    search: '/trades/search',
    recommendations: '/trades/recommendations',
    wishlist: '/trades/wishlist',
  },

  // Trade Requests
  tradeRequests: {
    create: '/trade-requests',
    list: '/trade-requests',
    details: (id: string | number) => `/trade-requests/${id}`,
    accept: (id: string | number) => `/trade-requests/${id}/accept`,
    reject: (id: string | number) => `/trade-requests/${id}/reject`,
    complete: (id: string | number) => `/trade-requests/${id}/complete`,
  },

  // Messages
  messages: {
    conversations: '/messages/conversations',
    send: '/messages',
    thread: (id: string | number) => `/messages/thread/${id}`,
  },

  // Community
  community: {
    posts: '/community/posts',
    create: '/community/posts',
    like: (id: string | number) => `/community/posts/${id}/like`,
    comment: (id: string | number) => `/community/posts/${id}/comment`,
  },

  // Categories
  categories: {
    list: '/categories',
  },
}
