// src/services/bookingService.js
import { apiMethods, retryRequest } from './api';

/**
 * Booking Service - Enhanced with better error handling and validation
 */

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @param {number} bookingData.tripId - Trip ID
 * @param {number} bookingData.pickupStopId - Pickup stop ID
 * @param {number} bookingData.dropoffStopId - Dropoff stop ID
 * @param {number} bookingData.passengerCount - Number of passengers
 * @param {string} bookingData.bookingTime - Preferred booking time (ISO string)
 * @param {Object} bookingData.passengerInfo - Passenger information
 * @param {string} bookingData.specialRequests - Special requests (optional)
 * @returns {Promise} - Promise with booking result
 */
export const createBooking = async (bookingData) => {
  try {
    // Validate required fields
    const requiredFields = ['tripId', 'pickupStopId', 'dropoffStopId', 'passengerCount'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate passenger count
    if (bookingData.passengerCount < 1 || bookingData.passengerCount > 10) {
      throw new Error('Passenger count must be between 1 and 10');
    }

    // Validate pickup and dropoff stops are different
    if (bookingData.pickupStopId === bookingData.dropoffStopId) {
      throw new Error('Pickup and dropoff stops must be different');
    }

    console.log('🎫 Creating booking:', bookingData);

    const response = await retryRequest(
      () => apiMethods.post('/bookings', bookingData),
      2,
      1000
    );

    if (response.status === 'success') {
      console.log('✅ Booking created successfully:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to create booking');
  } catch (error) {
    console.error('❌ Create booking error:', error);
    throw new Error(error.message || 'Failed to create booking');
  }
};

/**
 * Get user bookings with filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by booking status
 * @param {number} options.page - Page number
 * @param {number} options.limit - Number of bookings per page
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @param {string} options.dateFrom - Filter bookings from date
 * @param {string} options.dateTo - Filter bookings to date
 * @returns {Promise} - Promise with user bookings
 */
export const getUserBookings = async (options = {}) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = options;

    const queryParams = new URLSearchParams();

    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const url = `/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return {
        bookings: response.data.bookings || response.data,
        pagination: response.data.pagination || null,
        total: response.data.total || (response.data.bookings ? response.data.bookings.length : 0)
      };
    }

    throw new Error(response.message || 'Failed to fetch user bookings');
  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    throw new Error(error.message || 'Failed to fetch user bookings');
  }
};

/**
 * Get booking details by ID
 * @param {number} bookingId - Booking ID
 * @returns {Promise} - Promise with booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    console.log(`🔍 Fetching booking details for ID: ${bookingId}`);

    const response = await apiMethods.get(`/bookings/${bookingId}`);

    if (response.status === 'success') {
      console.log('✅ Booking details fetched:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch booking details');
  } catch (error) {
    console.error(`❌ Get booking ${bookingId} error:`, error);
    throw new Error(error.message || 'Failed to fetch booking details');
  }
};

/**
 * Update booking status
 * @param {number} bookingId - Booking ID
 * @param {string} status - New booking status
 * @param {string} reason - Reason for status change (optional)
 * @returns {Promise} - Promise with update result
 */
export const updateBookingStatus = async (bookingId, status, reason = '') => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData = { status };
    if (reason) {
      updateData.reason = reason;
    }

    console.log(`🔄 Updating booking ${bookingId} status to: ${status}`);

    const response = await apiMethods.patch(`/bookings/${bookingId}/status`, updateData);

    if (response.status === 'success') {
      console.log('✅ Booking status updated successfully');
      return response.data;
    }

    throw new Error(response.message || 'Failed to update booking status');
  } catch (error) {
    console.error(`❌ Update booking ${bookingId} status error:`, error);
    throw new Error(error.message || 'Failed to update booking status');
  }
};

/**
 * Cancel a booking
 * @param {number} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @param {boolean} requestRefund - Whether to request a refund
 * @returns {Promise} - Promise with cancellation result
 */
export const cancelBooking = async (bookingId, reason = '', requestRefund = false) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const cancellationData = {
      reason: reason || 'User requested cancellation',
      requestRefund
    };

    console.log(`❌ Cancelling booking ${bookingId}:`, cancellationData);

    const response = await apiMethods.post(`/bookings/${bookingId}/cancel`, cancellationData);

    if (response.status === 'success') {
      console.log('✅ Booking cancelled successfully');
      return response.data;
    }

    throw new Error(response.message || 'Failed to cancel booking');
  } catch (error) {
    console.error(`❌ Cancel booking ${bookingId} error:`, error);
    throw new Error(error.message || 'Failed to cancel booking');
  }
};

/**
 * Calculate booking fare
 * @param {Object} fareParams - Fare calculation parameters
 * @param {number} fareParams.tripId - Trip ID
 * @param {number} fareParams.pickupStopId - Pickup stop ID
 * @param {number} fareParams.dropoffStopId - Dropoff stop ID
 * @param {number} fareParams.passengerCount - Number of passengers
 * @param {string} fareParams.fareType - Fare type (adult, student, senior)
 * @param {string} fareParams.promoCode - Promotional code (optional)
 * @returns {Promise} - Promise with fare calculation
 */
export const calculateFare = async (fareParams) => {
  try {
    const requiredFields = ['tripId', 'pickupStopId', 'dropoffStopId', 'passengerCount'];
    const missingFields = requiredFields.filter(field => !fareParams[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('💰 Calculating fare:', fareParams);

    const response = await apiMethods.post('/bookings/calculate-fare', fareParams);

    if (response.status === 'success') {
      console.log('✅ Fare calculated:', response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to calculate fare');
  } catch (error) {
    console.error('❌ Calculate fare error:', error);
    throw new Error(error.message || 'Failed to calculate fare');
  }
};

/**
 * Get booking statistics for the user
 * @param {string} period - Time period (week, month, year)
 * @returns {Promise} - Promise with booking statistics
 */
export const getBookingStatistics = async (period = 'month') => {
  try {
    const validPeriods = ['week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    const response = await apiMethods.get(`/bookings/statistics?period=${period}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch booking statistics');
  } catch (error) {
    console.error('❌ Get booking statistics error:', error);
    throw new Error(error.message || 'Failed to fetch booking statistics');
  }
};

/**
 * Check seat availability for a trip
 * @param {number} tripId - Trip ID
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @returns {Promise} - Promise with seat availability
 */
export const checkSeatAvailability = async (tripId, date = null) => {
  try {
    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    const url = date
      ? `/bookings/seat-availability/${tripId}?date=${date}`
      : `/bookings/seat-availability/${tripId}`;

    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to check seat availability');
  } catch (error) {
    console.error(`❌ Check seat availability for trip ${tripId} error:`, error);
    throw new Error(error.message || 'Failed to check seat availability');
  }
};

/**
 * Get booking confirmation details
 * @param {number} bookingId - Booking ID
 * @returns {Promise} - Promise with confirmation details
 */
export const getBookingConfirmation = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiMethods.get(`/bookings/${bookingId}/confirmation`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch booking confirmation');
  } catch (error) {
    console.error(`❌ Get booking ${bookingId} confirmation error:`, error);
    throw new Error(error.message || 'Failed to fetch booking confirmation');
  }
};

/**
 * Send booking confirmation email/SMS
 * @param {number} bookingId - Booking ID
 * @param {Object} options - Notification options
 * @param {boolean} options.email - Send email notification
 * @param {boolean} options.sms - Send SMS notification
 * @returns {Promise} - Promise with notification result
 */
export const sendBookingConfirmation = async (bookingId, options = { email: true, sms: false }) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await apiMethods.post(`/bookings/${bookingId}/send-confirmation`, options);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to send booking confirmation');
  } catch (error) {
    console.error(`❌ Send booking ${bookingId} confirmation error:`, error);
    throw new Error(error.message || 'Failed to send booking confirmation');
  }
};

/**
 * Rate a completed trip
 * @param {number} bookingId - Booking ID
 * @param {Object} ratingData - Rating information
 * @param {number} ratingData.rating - Rating (1-5)
 * @param {string} ratingData.comment - Review comment
 * @param {Object} ratingData.categories - Category ratings (punctuality, cleanliness, etc.)
 * @returns {Promise} - Promise with rating result
 */
export const rateTrip = async (bookingId, ratingData) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const { rating, comment } = ratingData;

    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Valid rating (1-5) is required');
    }

    if (comment && comment.length > 500) {
      throw new Error('Comment must be less than 500 characters');
    }

    const response = await apiMethods.post(`/bookings/${bookingId}/rate`, ratingData);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to submit trip rating');
  } catch (error) {
    console.error(`❌ Rate trip ${bookingId} error:`, error);
    throw new Error(error.message || 'Failed to submit trip rating');
  }
};

/**
 * Request booking modification
 * @param {number} bookingId - Booking ID
 * @param {Object} modifications - Requested modifications
 * @param {number} modifications.newTripId - New trip ID (optional)
 * @param {number} modifications.newPickupStopId - New pickup stop ID (optional)
 * @param {number} modifications.newDropoffStopId - New dropoff stop ID (optional)
 * @param {number} modifications.newPassengerCount - New passenger count (optional)
 * @param {string} modifications.reason - Reason for modification
 * @returns {Promise} - Promise with modification request result
 */
export const requestBookingModification = async (bookingId, modifications) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    if (!modifications.reason) {
      throw new Error('Reason for modification is required');
    }

    const response = await apiMethods.post(`/bookings/${bookingId}/modify`, modifications);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to request booking modification');
  } catch (error) {
    console.error(`❌ Request booking ${bookingId} modification error:`, error);
    throw new Error(error.message || 'Failed to request booking modification');
  }
};

/**
 * Get booking receipt/invoice
 * @param {number} bookingId - Booking ID
 * @param {string} format - Receipt format (pdf, json)
 * @returns {Promise} - Promise with receipt data
 */
export const getBookingReceipt = async (bookingId, format = 'json') => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const validFormats = ['pdf', 'json'];
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    const response = await apiMethods.get(`/bookings/${bookingId}/receipt?format=${format}`);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch booking receipt');
  } catch (error) {
    console.error(`❌ Get booking ${bookingId} receipt error:`, error);
    throw new Error(error.message || 'Failed to fetch booking receipt');
  }
};

// Export all functions
export default {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  calculateFare,
  getBookingStatistics,
  checkSeatAvailability,
  getBookingConfirmation,
  sendBookingConfirmation,
  rateTrip,
  requestBookingModification,
  getBookingReceipt
};