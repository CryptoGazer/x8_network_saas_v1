import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  subscription_tier?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  loginWithOAuth: (provider: 'google' | 'apple' | 'facebook') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('isAuthenticated');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await apiClient.login(email, password);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      await apiClient.register({ email, password, full_name: fullName, role: 'client' });
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const loginWithOAuth = (provider: 'google' | 'apple' | 'facebook') => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/v1/oauth/${provider}/login`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
