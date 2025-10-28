// hooks/useApi.js
import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';
import { createAuthApi } from '../utils/authApi';

export const useApi = () => {
  const { getToken } = useAuth();

  const authApi = useMemo(() => {
    return createAuthApi(getToken);
  }, [getToken]);

  return authApi;
};