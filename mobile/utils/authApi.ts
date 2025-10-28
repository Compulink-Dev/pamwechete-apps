// utils/authApi.js
import api from './api';

/**
 * Helper function to make authenticated API requests
 * @param {Function} getToken - Function that returns the Clerk token
 * @param {Object} config - Axios request config
 */
export const makeAuthenticatedRequest = async (getToken: any, config: any) => {
  try {
    const token = await getToken();
    
    const authenticatedConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return api(authenticatedConfig);
  } catch (error) {
    console.error('Error in authenticated request:', error);
    throw error;
  }
};

/**
 * Helper to create API functions with auth
 */
export const createAuthApi = (getToken: any) => ({
  get: (url: any, config = {}) => makeAuthenticatedRequest(getToken, { ...config, method: 'GET', url }),
  post: (url: any, data = {}, config = {}) => makeAuthenticatedRequest(getToken, { ...config, method: 'POST', url, data }),
  put: (url: any, data = {}, config = {}) => makeAuthenticatedRequest(getToken, { ...config, method: 'PUT', url, data }),
  patch: (url: any, data = {}, config = {}) => makeAuthenticatedRequest(getToken, { ...config, method: 'PATCH', url, data }),
  delete: (url: any, config = {}) => makeAuthenticatedRequest(getToken, { ...config, method: 'DELETE', url }),
});