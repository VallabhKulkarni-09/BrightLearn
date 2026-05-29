import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { UserProfile } from '../types';
import { setAccessToken } from '../utils/tokenManager';

interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to get a fresh access token immediately
        const { data } = await api.post('/auth/refresh', { refreshToken });
        
        // Update both memory utility and localStorage
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Fetch user profile
        const profileRes = await api.get('/auth/me');
        setUser(profileRes.data);
      } catch (err) {
        console.error('Session initialization failed:', err);
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    
    setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    const profileRes = await api.get('/auth/me');
    setUser(profileRes.data);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshUser = async () => {
    try {
      const profileRes = await api.get('/auth/me');
      setUser(profileRes.data);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
