// utils/validators.js
/**
 * Validate a Tanzanian phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for valid formats:
    // 1. 9 digits (without country code): 712345678
    // 2. 10 digits (with leading 0): 0712345678
    // 3. 12 digits (with 255 country code): 255712345678
    // 4. 13 digits (with + and 255 country code): +255712345678
    
    if (cleanPhone.length === 9) {
      // Must start with valid prefix (7, 6, or 1 for Tanzania)
      return /^[761]\d{8}$/.test(cleanPhone);
    } else if (cleanPhone.length === 10) {
      // Must start with 0 followed by valid prefix
      return /^0[761]\d{8}$/.test(cleanPhone);
    } else if (cleanPhone.length === 12) {
      // Must start with 255 followed by valid prefix
      return /^255[761]\d{8}$/.test(cleanPhone);
    } else if (cleanPhone.length === 13 && cleanPhone.startsWith('+255')) {
      // Must start with +255 followed by valid prefix
      return /^\+255[761]\d{8}$/.test(cleanPhone);
    }
    
    return false;
  };
  
  /**
   * Validate an email address
   * @param {string} email - The email to validate
   * @returns {boolean} Whether the email is valid
   */
  export const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a password
   * @param {string} password - The password to validate
   * @returns {Object} Validation result with isValid and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }
    
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Validate required fields in a form
   * @param {Object} data - The form data
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} Validation result with isValid and errors
   */
  export const validateRequiredFields = (data, requiredFields) => {
    const errors = {};
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
        isValid = false;
      }
    });
    
    return {
      isValid,
      errors
    };
  };