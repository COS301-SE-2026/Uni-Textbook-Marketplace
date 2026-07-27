'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getMe, logoutUser } from '@/lib/auth.api';
import type { AuthUser } from '@/lib/auth.api';
import { setUnauthorizedHandle } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = ['/', '/auth/login','/auth/register','/auth/resetpassword', '/help', '/brand']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => route === '/' ? pathname === '/' : pathname.startsWith(route));
}

function getStoredUser(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem('auth_user');
    if (stored && stored !== 'undefined') {
      return JSON.parse(stored) as AuthUser;
    }
  } catch {

  }
  return null;
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredUser();
    
    if(stored){
      setUser(stored);
      setIsLoading(false);
    }
    
    setHydrated(true);
  },[])

  useEffect(() => {

    if (!hydrated) return;
    if (user) return;

    getMe()
      .then((me) => {
        setUser(me);
        sessionStorage.setItem('auth_user', JSON.stringify(me));
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [hydrated,user]);

  useEffect(() => {
    if(isLoading) return;
    if(!user && !isPublicRoute(pathname)){
      router.push('/auth/login');
    }
  },[isLoading,user,pathname,router]);

  useEffect(() => {
    setUnauthorizedHandle(() => {
      setUser(null);
      sessionStorage.removeItem('auth_user');
    });
  },[])

  const login = (userData: AuthUser) => {
    if (!userData) return;
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