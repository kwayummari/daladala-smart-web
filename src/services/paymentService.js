// src/services/paymentService.js
import { apiMethods, retryRequest } from './api';

/**
 * Payment Service - Enhanced with ZenoPay integration and better error handling
 */

/**
 * Process payment for a booking
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.bookingId - Booking ID
 * @param {string} paymentData.paymentMethod - Payment method (mobile_money, card, cash)
 * @param {string} paymentData.phoneNumber - Phone number for mobile money
 * @param {Object} paymentData.cardDetails - Card details (if using card)
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.currency - Currency code (default: TZS)
 * @returns {Promise} - Promise with payment result
 */
export const processPayment = async (paymentData) => {
  try {
    // Validate required fields
    const requiredFields = ['bookingId', 'paymentMethod', 'amount'];
    const missingFields = requiredFields.filter(field => !paymentData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate payment method
    const validMethods = ['mobile_money', 'card', 'cash'];
    if (!validMethods.includes(paymentData.paymentMethod)) {
      throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
    }

    // Validate phone number for mobile money
    if (paymentData.paymentMethod === 'mobile_money' && !paymentData.phoneNumber) {
      throw new Error('Phone number is required for mobile money payments');
    }

    // Validate amount
    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    console.log('💳 Processing payment:', {
      bookingId: paymentData.bookingId,
      method: paymentData.paymentMethod,
      amount: paymentData.amount
    });

    const response = await retryRequest(
      () => apiMethods.post('/payments', paymentData),
      2,
      1000
    );

    if (response.status === 'success') {
      console.log('✅ Payment processed successfully:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to process payment');
  } catch (error) {
    console.error('❌ Process payment error:', error);
    throw new Error(error.message || 'Failed to process payment');
  }
};

/**
 * Get payment status
 * @param {number} paymentId - Payment ID
 * @returns {Promise} - Promise with payment status
 */
export const getPaymentStatus = async (paymentId) => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    console.log(`🔍 Checking payment status for ID: ${paymentId}`);

    const response = await apiMethods.get(`/payments/${paymentId}/status`);

    if (response.status === 'success') {
      console.log('✅ Payment status fetched:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment status');
  } catch (error) {
    console.error(`❌ Get payment ${paymentId} status error:`, error);
    throw new Error(error.message || 'Failed to fetch payment status');
  }
};

/**
 * Get payment history for the user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Number of payments per page
 * @param {string} options.status - Filter by payment status
 * @param {string} options.method - Filter by payment method
 * @param {string} options.dateFrom - Filter payments from date
 * @param {string} options.dateTo - Filter payments to date
 * @returns {Promise} - Promise with payment history
 */
export const getPaymentHistory = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      dateFrom,
      dateTo
    } = options;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (status) queryParams.append('status', status);
    if (method) queryParams.append('method', method);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const url = `/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return {
        payments: response.data.payments || response.data,
        pagination: response.data.pagination || null,
        total: response.data.total || (response.data.payments ? response.data.payments.length : 0)
      };
    }

    throw new Error(response.message || 'Failed to fetch payment history');
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    throw new Error(error.message || 'Failed to fetch payment history');
  }
};

/**
 * Get payment details by ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise} - Promise with payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const response = await apiMethods.get(`/payments/${paymentId}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment details');
  } catch (error) {
    console.error(`❌ Get payment ${paymentId} details error:`, error);
    throw new Error(error.message || 'Failed to fetch payment details');
  }
};

/**
 * Cancel a pending payment
 * @param {number} paymentId - Payment ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} - Promise with cancellation result
 */
export const cancelPayment = async (paymentId, reason = '') => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const cancellationData = {
      reason: reason || 'User requested cancellation'
    };

    console.log(`❌ Cancelling payment ${paymentId}`);

    const response = await apiMethods.post(`/payments/${paymentId}/cancel`, cancellationData);

    if (response.status === 'success') {
      console.log('✅ Payment cancelled successfully');
      return response.data;
    }

    throw new Error(response.message || 'Failed to cancel payment');
  } catch (error) {
    console.error(`❌ Cancel payment ${paymentId} error:`, error);
    throw new Error(error.message || 'Failed to cancel payment');
  }
};

/**
 * Verify ZenoPay payment status
 * @param {string} orderId - ZenoPay order ID
 * @returns {Promise} - Promise with verification result
 */
export const verifyZenoPayPayment = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log(`🔍 Verifying ZenoPay payment: ${orderId}`);

    const response = await apiMethods.get(`/payments/zenopay/verify/${orderId}`);

    if (response.status === 'success') {
      console.log('✅ ZenoPay payment verified:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to verify ZenoPay payment');
  } catch (error) {
    console.error(`❌ Verify ZenoPay payment ${orderId} error:`, error);
    throw new Error(error.message || 'Failed to verify ZenoPay payment');
  }
};

/**
 * Get available payment methods
 * @returns {Promise} - Promise with available payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const response = await apiMethods.get('/payments/methods');

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment methods');
  } catch (error) {
    console.error('❌ Get payment methods error:', error);
    throw new Error(error.message || 'Failed to fetch payment methods');
  }
};

/**
 * Process refund for a payment
 * @param {number} paymentId - Payment ID
 * @param {Object} refundData - Refund information
 * @param {number} refundData.amount - Refund amount (optional, defaults to full amount)
 * @param {string} refundData.reason - Refund reason
 * @returns {Promise} - Promise with refund result
 */
export const processRefund = async (paymentId, refundData) => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    if (!refundData.reason) {
      throw new Error('Refund reason is required');
    }

    console.log(`💰 Processing refund for payment ${paymentId}:`, refundData);

    const response = await apiMethods.post(`/payments/${paymentId}/refund`, refundData);

    if (response.status === 'success') {
      console.log('✅ Refund processed successfully');
      return response.data;
    }

    throw new Error(response.message || 'Failed to process refund');
  } catch (error) {
    console.error(`❌ Process refund for payment ${paymentId} error:`, error);
    throw new Error(error.message || 'Failed to process refund');
  }
};

/**
 * Get payment statistics
 * @param {string} period - Time period (week, month, year)
 * @returns {Promise} - Promise with payment statistics
 */
export const getPaymentStatistics = async (period = 'month') => {
  try {
    const validPeriods = ['week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    const response = await apiMethods.get(`/payments/statistics?period=${period}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment statistics');
  } catch (error) {
    console.error('❌ Get payment statistics error:', error);
    throw new Error(error.message || 'Failed to fetch payment statistics');
  }
};

/**
 * Save payment method for future use
 * @param {Object} paymentMethodData - Payment method information
 * @param {string} paymentMethodData.type - Payment method type
 * @param {string} paymentMethodData.name - Display name for the method
 * @param {Object} paymentMethodData.details - Payment method details
 * @param {boolean} paymentMethodData.isDefault - Set as default payment method
 * @returns {Promise} - Promise with save result
 */
export const savePaymentMethod = async (paymentMethodData) => {
  try {
    const requiredFields = ['type', 'name'];
    const missingFields = requiredFields.filter(field => !paymentMethodData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await apiMethods.post('/payments/methods', paymentMethodData);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to save payment method');
  } catch (error) {
    console.error('❌ Save payment method error:', error);
    throw new Error(error.message || 'Failed to save payment method');
  }
};

/**
 * Delete saved payment method
 * @param {number} methodId - Payment method ID
 * @returns {Promise} - Promise with deletion result
 */
export const deletePaymentMethod = async (methodId) => {
  try {
    if (!methodId) {
      throw new Error('Payment method ID is required');
    }

    const response = await apiMethods.delete(`/payments/methods/${methodId}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to delete payment method');
  } catch (error) {
    console.error(`❌ Delete payment method ${methodId} error:`, error);
    throw new Error(error.message || 'Failed to delete payment method');
  }
};

/**
 * Get user's saved payment methods
 * @returns {Promise} - Promise with saved payment methods
 */
export const getSavedPaymentMethods = async () => {
  try {
    const response = await apiMethods.get('/payments/methods/saved');

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch saved payment methods');
  } catch (error) {
    console.error('❌ Get saved payment methods error:', error);
    throw new Error(error.message || 'Failed to fetch saved payment methods');
  }
};

/**
 * Validate payment before processing
 * @param {Object} paymentData - Payment data to validate
 * @returns {Promise} - Promise with validation result
 */
export const validatePayment = async (paymentData) => {
  try {
    const response = await apiMethods.post('/payments/validate', paymentData);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Payment validation failed');
  } catch (error) {
    console.error('❌ Validate payment error:', error);
    throw new Error(error.message || 'Payment validation failed');
  }
};

/**
 * Get payment receipt
 * @param {number} paymentId - Payment ID
 * @param {string} format - Receipt format (pdf, json)
 * @returns {Promise} - Promise with receipt data
 */
export const getPaymentReceipt = async (paymentId, format = 'json') => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const validFormats = ['pdf', 'json'];
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    const response = await apiMethods.get(`/payments/${paymentId}/receipt?format=${format}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment receipt');
  } catch (error) {
    console.error(`❌ Get payment ${paymentId} receipt error:`, error);
    throw new Error(error.message || 'Failed to fetch payment receipt');
  }
};

// Export all functions
export default {
  processPayment,
  getPaymentStatus,
  getPaymentHistory,
  getPaymentDetails,
  cancelPayment,
  verifyZenoPayPayment,
  getPaymentMethods,
  processRefund,
  getPaymentStatistics,
  savePaymentMethod,
  deletePaymentMethod,
  getSavedPaymentMethods,
  validatePayment,
  getPaymentReceipt
};