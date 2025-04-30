// services/paymentService.js
import api from './api';

/**
 * Process payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise} - Promise with payment data
 */
export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to process payment');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to process payment';
  }
};

/**
 * Get payment history
 * @returns {Promise} - Promise with payments data
 */
export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/history');
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch payment history');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch payment history';
  }
};

/**
 * Get payment details
 * @param {number} paymentId - Payment ID
 * @returns {Promise} - Promise with payment data
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch payment details');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch payment details';
  }
};