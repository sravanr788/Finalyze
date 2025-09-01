import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
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

const checkAuthStatus = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get('http://localhost:5000/auth/profile', {
      withCredentials: true,
    });
    setUser(response.data.user);
  } catch (error) {
    console.error('Failed to retrieve user profile:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  // Check if we're coming back from OAuth
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Check auth status after successful OAuth
    checkAuthStatus();
  } else {
    // Regular auth check
    checkAuthStatus();
  }
}, [checkAuthStatus]);

const signIn = useCallback(() => {
  // Store the current path to redirect back after login
  const currentPath = window.location.pathname;
  window.location.href = `http://localhost:5000/auth/google?returnTo=${encodeURIComponent(currentPath)}`;
}, []);

// Function to handle logout
const signOut = useCallback(async () => {
  setLoading(true);
  try {
      await axios.post('http://localhost:5000/auth/logout', {}, {
          withCredentials: true,
      });
      setUser(null);
  } catch (error) {
      console.error('Logout failed:', error);
  } finally {
      setLoading(false);
  }
}, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};