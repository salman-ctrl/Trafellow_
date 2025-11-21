'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
    const { data } = await api.post('/auth/login', credentials);
    
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    setUser(data.data.user);
    toast.success('Login berhasil!');
    
    // ✅ Redirect based on role
    if (data.data.user.role === 'admin') {
      router.push('/admin');  // ← Admin Dashboard
    } else {
      router.push('/dashboard');  // ← User Dashboard
    }
    
    return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      setUser(data.data.user);
      toast.success('Registrasi berhasil!');
      router.push('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registrasi gagal';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    toast.success('Logout berhasil');
  };

  // ✅ FIX: Update Profile dengan FormData
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/users/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'  // ← PENTING
        }
      });
      
      const updatedUser = data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile berhasil diupdate');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || 'Update profile gagal';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout,
        updateProfile,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};