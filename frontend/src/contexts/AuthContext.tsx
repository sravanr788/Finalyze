import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

// Extend AxiosRequestConfig to include _retry property
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh access token
  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data.accessToken;
    } catch (error) {
      // If refresh fails, log the user out
      setUser(null);
      return null;
    }
  }, []);

  // Add request interceptor to handle 401 errors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Add auth header if user is logged in
        if (user) {
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    const responseInterceptor = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            if (newToken && originalRequest.headers) {
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            setUser(null);
            navigate('/');
          }
        }
        return Promise.reject(error);
      }
    );

    // Fetch user profile
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, refreshToken, user]);

  const signIn = () => {
    // Redirect to Google OAuth (cookie set by backend on success)
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export the axios instance for use in other components
  const getApi = () => api;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, getApi }}>
      {children}
    </AuthContext.Provider>
  );
};
