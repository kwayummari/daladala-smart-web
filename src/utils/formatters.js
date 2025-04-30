// utils/formatters.js
/**
 * Format date to display in a user-friendly format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    try {
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Format time to display in a user-friendly format
   * @param {string|Date} dateString - The date containing the time to format
   * @returns {string} Formatted time string
   */
  export const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    
    try {
      return date.toLocaleTimeString('en-US', options);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateString;
    }
  };
  
  /**
   * Format currency to display with 2 decimal places and TZS symbol
   * @param {number} amount - The amount to format
   * @param {string} currency - The currency code (default: TZS)
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (amount, currency = 'TZS') => {
    if (amount === undefined || amount === null) return '';
    
    try {
      return `${currency} ${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount}`;
    }
  };
  
  /**
   * Format a phone number for display
   * @param {string} phone - The phone number to format
   * @returns {string} Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Format for Tanzanian numbers: +255 XXX XXX XXX
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 9) {
      return `+255 ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      return `+255 ${cleanPhone.substring(1, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('255')) {
      return `+255 ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)} ${cleanPhone.substring(9)}`;
    }
    
    return phone;
  };
  
  /**
   * Truncate a string to a specific length and add ellipsis
   * @param {string} text - The text to truncate
   * @param {number} length - The maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };