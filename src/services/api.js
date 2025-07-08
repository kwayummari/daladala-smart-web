// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data
      });
    }

    // Handle different response formats
    if (response.data && response.data.status === 'success') {
      return response;
    }

    // Handle backend error responses that still return 200
    if (response.data && response.data.status === 'error') {
      throw new Error(response.data.message || 'Unknown server error');
    }

    return response;
  },
  (error) => {
    // Calculate request duration if available
    if (error.config && error.config.metadata) {
      const endTime = new Date();
      const duration = endTime - error.config.metadata.startTime;
      console.error(`❌ API Error: ${error.config.method?.toUpperCase()} ${error.config.url} (${duration}ms)`);
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?redirected=true';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('❌ Access forbidden:', data?.message);
          break;

        case 404:
          // Not found
          console.error('❌ Resource not found:', error.config.url);
          break;

        case 422:
          // Validation error
          console.error('❌ Validation error:', data?.errors || data?.message);
          break;

        case 429:
          // Rate limit exceeded
          console.error('❌ Rate limit exceeded. Please try again later.');
          break;

        case 500:
          // Server error
          console.error('❌ Internal server error:', data?.message);
          break;

        default:
          console.error(`❌ HTTP Error ${status}:`, data?.message);
      }

      // Create enhanced error object
      const enhancedError = new Error(
        data?.message ||
        `Request failed with status ${status}`
      );
      enhancedError.status = status;
      enhancedError.data = data;
      enhancedError.isApiError = true;

      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Network error - no response received
      console.error('❌ Network error:', error.message);

      const networkError = new Error(
        'Network error. Please check your internet connection and try again.'
      );
      networkError.isNetworkError = true;

      return Promise.reject(networkError);
    } else {
      // Something else went wrong
      console.error('❌ Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Enhanced API methods with better error handling
export const apiMethods = {
  // GET request with caching support
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        } : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url2 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url2;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url2);

      return true;
    } catch (error) {
      throw error;
    }
  }
};

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      status: 'healthy',
      timestamp: new Date(),
      latency: response.headers['x-response-time'] || 'unknown'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message
    };
  }
};

// Retry function for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (error.status === 401 || error.status === 403 || error.status === 422) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

// Request queue for handling multiple simultaneous requests
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

export const requestQueue = new RequestQueue();

// Cache implementation for GET requests
class ApiCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();

// Enhanced GET with caching
export const getCached = async (url, config = {}, cacheTtl = null) => {
  const cacheKey = `${url}_${JSON.stringify(config)}`;

  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData && !config.skipCache) {
    console.log(`📦 Cache hit for: ${url}`);
    return cachedData;
  }

  try {
    const data = await apiMethods.get(url, config);

    // Cache successful responses
    if (data && data.status === 'success') {
      apiCache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export default api;