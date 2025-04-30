// services/authService.js
import api from './api';

/**
 * Login user with phone and password
 * @param {string} phone - User's phone number
 * @param {string} password - User's password
 * @returns {Promise} - Promise with user data
 */
export const login = async (phone, password) => {
  try {
    const response = await api.post('/auth/login', { phone, password });
    
    if (response.data.status === 'success') {
      // Store token
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Login failed';
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise with user data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Registration failed';
  }
};

/**
 * Logout user and clear localStorage
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
};

/**
 * Request password reset
 * @param {string} phone - User's phone number
 * @returns {Promise} - Promise with response data
 */
export const requestPasswordReset = async (phone) => {
  try {
    const response = await api.post('/auth/request-reset', { phone });
    
    if (response.data.status === 'success') {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Password reset request failed');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Password reset request failed';
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise} - Promise with response data
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    
    if (response.data.status === 'success') {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Password reset failed');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Password reset failed';
  }
};

/**
 * Verify user's token
 * @returns {Promise} - Promise with user data
 */
export const verifyToken = async () => {
  try {
    const response = await api.get('/users/profile');
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Token verification failed');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Token verification failed';
  }
};