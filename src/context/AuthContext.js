"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncAuthFromStorage = () => {
    try {
      const auth = localStorage.getItem('emi_admin_auth');
      const storedUser = localStorage.getItem('emi_admin_user');
      
      if (auth === 'true') {
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ name: 'Super Admin', email: 'admin@energymall.in', role: 'Super Admin' });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (e) {
      console.warn('Failed to sync auth from storage', e);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAuthFromStorage();

    const handleAuthChange = () => {
      syncAuthFromStorage();
    };

    window.addEventListener('emi-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('emi-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = (userData) => {
    try {
      // 1. Clear prior session cache & tokens
      sessionStorage.clear();
      localStorage.setItem('emi_admin_auth', 'true');
      const userPayload = userData || { name: 'Super Admin', email: 'admin@energymall.in', role: 'Super Admin' };
      localStorage.setItem('emi_admin_user', JSON.stringify(userPayload));

      setUser(userPayload);
      setIsAuthenticated(true);

      // 2. Broadcast auth change event to active components
      window.dispatchEvent(new Event('emi-auth-change'));

      // 3. Immediately transition to dashboard with fresh route mount
      window.location.href = '/';
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const logout = () => {
    try {
      // 1. Clear all local & session auth tokens/cache
      localStorage.removeItem('emi_admin_auth');
      localStorage.removeItem('emi_admin_user');
      sessionStorage.clear();

      setUser(null);
      setIsAuthenticated(false);

      // 2. Broadcast auth change event
      window.dispatchEvent(new Event('emi-auth-change'));

      // 3. Transition to login page cleanly
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, syncAuthFromStorage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
