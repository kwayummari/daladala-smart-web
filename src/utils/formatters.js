// src/utils/formatters.js

/**
 * Utility functions for formatting data display
 */

/**
 * Format currency in Tanzanian Shillings
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: TZS)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'TZS') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'TZS 0';
  }

  const formatter = new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  try {
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `${currency} ${parseInt(amount).toLocaleString()}`;
  }
};

/**
 * Format date in a readable format
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string (default: 'en-TZ')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, locale = 'en-TZ') => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Dar_es_Salaam'
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toString();
  }
};

/**
 * Format date in short format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toString();
  }
};

/**
 * Format time in 12-hour format
 * @param {string|Date} time - Time to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (time, includeSeconds = false) => {
  if (!time) return 'N/A';

  try {
    let timeObj;

    if (typeof time === 'string') {
      // Handle time strings like "14:30:00" or full datetime strings
      if (time.includes(':') && !time.includes('T')) {
        // Pure time string
        const [hours, minutes, seconds] = time.split(':');
        timeObj = new Date();
        timeObj.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      } else {
        // Full datetime string
        timeObj = new Date(time);
      }
    } else {
      timeObj = time;
    }

    if (isNaN(timeObj.getTime())) {
      return 'Invalid Time';
    }

    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Dar_es_Salaam'
    };

    if (includeSeconds) {
      options.second = '2-digit';
    }

    return new Intl.DateTimeFormat('en-US', options).format(timeObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return time.toString();
  }
};

/**
 * Format datetime in a readable format
 * @param {string|Date} datetime - Datetime to format
 * @param {string} locale - Locale string (default: 'en-TZ')
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (datetime, locale = 'en-TZ') => {
  if (!datetime) return 'N/A';

  try {
    const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid DateTime';
    }

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Dar_es_Salaam'
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return datetime.toString();
  }
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Handle Tanzanian phone numbers
  if (cleaned.startsWith('255')) {
    // International format: +255 XXX XXX XXX
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Local format: 0XXX XXX XXX
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  // Return original if no pattern matches
  return phoneNumber;
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return 'N/A';

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format distance in meters/kilometers
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (meters) => {
  if (!meters || isNaN(meters)) return 'N/A';

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)} km`;
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format relative time (time ago)
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    // Future dates
    if (diffInSeconds < 0) {
      const absDiff = Math.abs(diffInSeconds);

      if (absDiff < 60) return 'in a few seconds';
      if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
      if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
      if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;

      return formatDate(dateObj);
    }

    // Past dates
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return date.toString();
  }
};

/**
 * Format vehicle capacity
 * @param {number} capacity - Vehicle capacity
 * @returns {string} - Formatted capacity string
 */
export const formatCapacity = (capacity) => {
  if (!capacity || isNaN(capacity)) return 'N/A';

  return `${capacity} seat${capacity !== 1 ? 's' : ''}`;
};

/**
 * Format booking status with appropriate styling class
 * @param {string} status - Booking status
 * @returns {Object} - Object with formatted status and CSS class
 */
export const formatBookingStatus = (status) => {
  if (!status) return { text: 'Unknown', className: 'text-muted' };

  const statusMap = {
    'pending': { text: 'Pending', className: 'text-warning' },
    'confirmed': { text: 'Confirmed', className: 'text-success' },
    'cancelled': { text: 'Cancelled', className: 'text-danger' },
    'completed': { text: 'Completed', className: 'text-primary' },
    'no_show': { text: 'No Show', className: 'text-secondary' },
    'refunded': { text: 'Refunded', className: 'text-info' }
  };

  return statusMap[status.toLowerCase()] || { text: status, className: 'text-muted' };
};

/**
 * Format payment status with appropriate styling class
 * @param {string} status - Payment status
 * @returns {Object} - Object with formatted status and CSS class
 */
export const formatPaymentStatus = (status) => {
  if (!status) return { text: 'Unknown', className: 'text-muted' };

  const statusMap = {
    'pending': { text: 'Pending', className: 'text-warning' },
    'processing': { text: 'Processing', className: 'text-info' },
    'completed': { text: 'Completed', className: 'text-success' },
    'failed': { text: 'Failed', className: 'text-danger' },
    'cancelled': { text: 'Cancelled', className: 'text-secondary' },
    'refunded': { text: 'Refunded', className: 'text-primary' }
  };

  return statusMap[status.toLowerCase()] || { text: status, className: 'text-muted' };
};

/**
 * Format star rating for display
 * @param {number} rating - Rating value (0-5)
 * @param {boolean} showText - Whether to show text with stars
 * @returns {string} - Formatted rating string
 */
export const formatRating = (rating, showText = true) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return showText ? 'No rating' : '☆☆☆☆☆';
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);

  if (showText) {
    return `${stars} (${rating.toFixed(1)})`;
  }

  return stars;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @param {string} suffix - Suffix for truncated text (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Format route code for display
 * @param {string} routeCode - Route code
 * @returns {string} - Formatted route code
 */
export const formatRouteCode = (routeCode) => {
  if (!routeCode) return 'N/A';

  // Convert to uppercase and add dashes for readability
  return routeCode.toUpperCase().replace(/(.{3})/g, '$1-').slice(0, -1);
};

/**
 * Format vehicle plate number
 * @param {string} plateNumber - Vehicle plate number
 * @returns {string} - Formatted plate number
 */
export const formatPlateNumber = (plateNumber) => {
  if (!plateNumber) return 'N/A';

  // Convert to uppercase and format Tanzanian plate numbers
  const cleaned = plateNumber.replace(/[^A-Z0-9]/g, '');

  if (cleaned.length >= 6) {
    // Format as: ABC 123 or T123 ABC
    return cleaned.replace(/(.{3})(.{3})/, '$1 $2');
  }

  return plateNumber.toUpperCase();
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} precision - Decimal places (default: 6)
 * @returns {string} - Formatted coordinates
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return 'N/A';
  }

  const lat = parseFloat(latitude).toFixed(precision);
  const lng = parseFloat(longitude).toFixed(precision);

  return `${lat}, ${lng}`;
};

/**
 * Format speed for display
 * @param {number} speed - Speed in km/h
 * @returns {string} - Formatted speed string
 */
export const formatSpeed = (speed) => {
  if (!speed || isNaN(speed)) return 'N/A';

  return `${Math.round(speed)} km/h`;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format error message for user display
 * @param {Error|string} error - Error object or message
 * @returns {string} - User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  if (typeof error === 'string') return error;

  if (error.message) {
    // Common API error patterns
    if (error.message.includes('Network Error')) {
      return 'Network connection error. Please check your internet connection.';
    }

    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }

    if (error.message.includes('401')) {
      return 'You are not authorized to perform this action.';
    }

    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }

    return error.message;
  }

  return 'An unexpected error occurred';
};

// Export all functions as named exports and default export
export default {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatPhoneNumber,
  formatDuration,
  formatDistance,
  formatPercentage,
  formatFileSize,
  formatRelativeTime,
  formatCapacity,
  formatBookingStatus,
  formatPaymentStatus,
  formatRating,
  truncateText,
  formatRouteCode,
  formatPlateNumber,
  formatCoordinates,
  formatSpeed,
  capitalizeWords,
  formatErrorMessage
};