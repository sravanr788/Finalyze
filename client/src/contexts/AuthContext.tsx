import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

// Extend AxiosRequestConfig for retry flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Axios instance with cookies enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // ✅ send cookies automatically
});

interface AuthContextType {
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
  getApi: () => typeof api;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      await api.post('/auth/refresh',{}, {withCredentials:true}); // cookie sent automatically
      return true;
    } catch (error) {
      console.error('Refresh token failed', error);
      setUser(null);
      navigate('/'); // redirect to login
      return false;
    }
  }, [navigate]);

  useEffect(() => {
    // Response interceptor for handling 401
    const responseInterceptor = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Only retry once
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

          // Don't retry /auth/refresh itself
          if (originalRequest.url?.endsWith('/auth/refresh')) {
            setUser(null);
            navigate('/');
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          const refreshed = await refreshToken();
          if (refreshed) return api(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    // Fetch user profile on mount
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile'); // cookie sent automatically
        setUser(res.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  // Sign in via Google OAuth
  const signIn = () => {
    window.location.href = import.meta.env.VITE_BACKEND_URL + '/auth/google';
  };

  // Logout
  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout'); // clears cookies on backend
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApi = () => api;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, getApi }}>
      {children}
    </AuthContext.Provider>
  );
};
