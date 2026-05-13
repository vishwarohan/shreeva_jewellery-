import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wyw_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('wyw_token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('wyw_user', JSON.stringify(data.user));
    } catch {
      logout();
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('wyw_token', data.token);
      localStorage.setItem('wyw_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('wyw_token', data.token);
      localStorage.setItem('wyw_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('wyw_token');
    localStorage.removeItem('wyw_user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
