import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Check if token exists and fetch user profile
    const token = localStorage.getItem('ai_qa_token');
    if (token) {
      api.setToken(token);
      api.get('/auth/me')
        .then(res => {
          if (res.user) setUser(res.user);
        })
        .catch(() => {
          api.setToken('');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Auto-login with default demo user if fresh session so user can immediately test!
      login('lead@inspectron.io', 'password123', false)
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    const onExpired = () => {
      setUser(null);
      toast.warning('Session expired. Please sign in again.');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async (email, password, showNotification = true) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      api.setToken(res.token);
      setUser(res.user);
      if (showNotification) {
        toast.success(`Welcome back, ${res.user.name}!`);
      }
      return res.user;
    } catch (err) {
      if (showNotification) {
        toast.error(err.message || 'Login failed.');
      }
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      api.setToken(res.token);
      setUser(res.user);
      toast.success(`Account created successfully! Welcome, ${res.user.name}.`);
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    api.setToken('');
    setUser(null);
    toast.info('Signed out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
