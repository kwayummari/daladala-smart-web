// contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/verify');
          setCurrentUser(response.data.data);
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { phone, password });
      if (response.data.status === 'success') {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        setCurrentUser(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/users/profile', profileData);
      if (response.data.status === 'success') {
        setCurrentUser({ ...currentUser, ...response.data.data });
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};