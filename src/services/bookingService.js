// services/bookingService.js
import api from './api';

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise} - Promise with booking data
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create booking');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to create booking';
  }
};

/**
 * Get user bookings
 * @param {string} status - Booking status (optional)
 * @returns {Promise} - Promise with bookings data
 */
export const getUserBookings = async (status = null) => {
  try {
    const url = status 
      ? `/bookings?status=${status}`
      : '/bookings';
      
    const response = await api.get(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch bookings');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch bookings';
  }
};

/**
 * Get booking details
 * @param {number} bookingId - Booking ID
 * @returns {Promise} - Promise with booking data
 */
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking details');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch booking details';
  }
};

/**
 * Cancel booking
 * @param {number} bookingId - Booking ID
 * @returns {Promise} - Promise with response data
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    
    if (response.data.status === 'success') {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Failed to cancel booking');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to cancel booking';
  }
};