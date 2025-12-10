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
  loginWithOAuth: (provider: 'google' | 'facebook') => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  requestMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

  const loginWithOAuth = (provider: 'google' | 'facebook') => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/v1/oauth/${provider}/login`;
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await apiClient.requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      return false;
    }
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    try {
      await apiClient.verifyResetCode(email, code);
      return true;
    } catch (error) {
      console.error('Code verification failed:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      await apiClient.resetPassword(email, code, newPassword);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  const requestMagicLink = async (email: string): Promise<boolean> => {
    try {
      await apiClient.requestMagicLink(email);
      return true;
    } catch (error) {
      console.error('Magic link request failed:', error);
      return false;
    }
  };

  const verifyMagicLink = async (token: string): Promise<boolean> => {
    try {
      await apiClient.verifyMagicLink(token);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Magic link verification failed:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithOAuth, requestPasswordReset, verifyResetCode, resetPassword, requestMagicLink, verifyMagicLink, changePassword }}>
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
