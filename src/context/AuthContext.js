"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSessionAPI, loginAPI, logoutAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncAuthFromStorage = async () => {
    try {
      setLoading(true);
      const res = await checkSessionAPI();
      
      if (res && res.success) {
        setIsAuthenticated(true);
        setUser(res.data);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (e) {
      console.warn('Failed to sync auth from backend', e);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAuthFromStorage();
    // We remove the old localStorage event listeners because session is now securely
    // managed by HttpOnly cookies on the backend.
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginAPI(email, password);
      if (res && res.success) {
        setUser(res.data);
        setIsAuthenticated(true);
        
        window.dispatchEvent(new Event('emi-auth-change'));
        
        if (res.data.must_change_password) {
          return { success: true, requirePasswordChange: true, user: res.data };
        }
        
        window.location.replace('/');
        return { success: true };
      }
      return { success: false, message: res?.message || 'Invalid credentials' };
    } catch (e) {
      console.error('Login error', e);
      return { success: false, message: 'Server error during login' };
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
      setUser(null);
      setIsAuthenticated(false);
      
      window.dispatchEvent(new Event('emi-auth-change'));
      window.location.replace('/login');
    } catch (e) {
      console.error('Logout error', e);
      window.location.replace('/login');
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
