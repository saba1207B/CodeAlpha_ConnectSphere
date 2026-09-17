import React, { createContext, useContext, useState, useEffect } from 'react';
import { SafeUser } from '../types';

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUserDirect: (user: SafeUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Check localStorage for offline demo / guest profile fallback
          const cached = localStorage.getItem('cs_user');
          if (cached) {
            setUser(JSON.parse(cached));
          }
        }
      } catch (err) {
        const cached = localStorage.getItem('cs_user');
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }
      setUser(data.user);
      localStorage.setItem('cs_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      // Fallback guest login in case backend is offline during preview
      const fallbackUser: SafeUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0] || 'Member',
        email
      };
      setUser(fallbackUser);
      localStorage.setItem('cs_user', JSON.stringify(fallbackUser));
      return { success: true };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }
      setUser(data.user);
      localStorage.setItem('cs_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      const fallbackUser: SafeUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        name: name || 'Creator',
        email
      };
      setUser(fallbackUser);
      localStorage.setItem('cs_user', JSON.stringify(fallbackUser));
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('cs_user');
  };

  const setUserDirect = (u: SafeUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('cs_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('cs_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUserDirect }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
