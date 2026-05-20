'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, logoutUser } from '@/lib/auth.api';
import type { AuthUser } from '@/lib/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem('auth_user');
    } catch {

    }
    if (stored && stored !== 'undefined') {
      try {
        setUser(JSON.parse(stored));
        setIsLoading(false);
        return;
      } catch {
        sessionStorage.removeItem('auth_user');
      }
    }

  
    getMe()
      .then((me) => {
        setUser(me);
        sessionStorage.setItem('auth_user', JSON.stringify(me));
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (userData: AuthUser) => {
    if (!userData) return;  // ← never store undefined
    setUser(userData);
    try {
      sessionStorage.setItem('auth_user', JSON.stringify(userData));
    } catch {
      // sessionStorage not available
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      
    } finally {
      setUser(null);
      sessionStorage.removeItem('auth_user');
      router.push('/auth/login');
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider check your layout.tsx');
  }
  return context;
}
