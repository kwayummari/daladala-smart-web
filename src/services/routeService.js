// src/services/routeService.js
import { apiMethods, getCached, retryRequest } from './api';

/**
 * Route Service - Enhanced with better error handling and caching
 */

/**
 * Get all routes with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for route name or locations
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of routes per page
 * @param {string} options.sortBy - Sort field (route_name, created_at, etc.)
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @param {boolean} options.active - Filter by active routes only
 * @returns {Promise} - Promise with routes data
 */
export const getAllRoutes = async (options = {}) => {
  try {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'route_name',
      sortOrder = 'asc',
      active = true
    } = options;

    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    if (active !== undefined) queryParams.append('active', active.toString());

    const url = `/routes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Use caching for route list (cache for 5 minutes)
    const response = await getCached(url, {}, 5 * 60 * 1000);

    if (response.status === 'success') {
      return {
        routes: response.data.routes || response.data,
        pagination: response.data.pagination || null,
        total: response.data.total || response.data.length
      };
    }

    throw new Error(response.message || 'Failed to fetch routes');
  } catch (error) {
    console.error('❌ Get all routes error:', error);
    throw new Error(error.message || 'Failed to fetch routes');
  }
};

/**
 * Get route by ID with detailed information
 * @param {number} routeId - Route ID
 * @param {boolean} includeStops - Include stops information
 * @param {boolean} includeFares - Include fare information
 * @returns {Promise} - Promise with route data
 */
export const getRouteById = async (routeId, includeStops = true, includeFares = true) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const queryParams = new URLSearchParams();
    if (includeStops) queryParams.append('includeStops', 'true');
    if (includeFares) queryParams.append('includeFares', 'true');

    const url = `/routes/${routeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Use retry logic for critical route data
    const response = await retryRequest(
      () => getCached(url, {}, 3 * 60 * 1000), // Cache for 3 minutes
      3,
      1000
    );

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch route details');
  } catch (error) {
    console.error(`❌ Get route ${routeId} error:`, error);
    throw new Error(error.message || 'Failed to fetch route details');
  }
};

/**
 * Get route stops with detailed information
 * @param {number} routeId - Route ID
 * @param {boolean} includeSchedules - Include schedule information
 * @returns {Promise} - Promise with stops data
 */
export const getRouteStops = async (routeId, includeSchedules = false) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const queryParams = new URLSearchParams();
    if (includeSchedules) queryParams.append('includeSchedules', 'true');

    const url = `/routes/${routeId}/stops${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await getCached(url, {}, 10 * 60 * 1000); // Cache for 10 minutes

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch route stops');
  } catch (error) {
    console.error(`❌ Get route ${routeId} stops error:`, error);
    throw new Error(error.message || 'Failed to fetch route stops');
  }
};

/**
 * Get route fares with different fare types
 * @param {number} routeId - Route ID
 * @param {string} fareType - Fare type (adult, student, senior, etc.)
 * @param {number} fromStopId - Starting stop ID (optional)
 * @param {number} toStopId - Destination stop ID (optional)
 * @returns {Promise} - Promise with fares data
 */
export const getRouteFares = async (routeId, fareType = '', fromStopId = null, toStopId = null) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const queryParams = new URLSearchParams();
    if (fareType) queryParams.append('fareType', fareType);
    if (fromStopId) queryParams.append('fromStopId', fromStopId.toString());
    if (toStopId) queryParams.append('toStopId', toStopId.toString());

    const url = `/routes/${routeId}/fares${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await getCached(url, {}, 15 * 60 * 1000); // Cache for 15 minutes

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch route fares');
  } catch (error) {
    console.error(`❌ Get route ${routeId} fares error:`, error);
    throw new Error(error.message || 'Failed to fetch route fares');
  }
};

/**
 * Search routes by start and end points
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.startPoint - Starting location
 * @param {string} searchParams.endPoint - Destination location
 * @param {string} searchParams.date - Travel date (optional)
 * @param {string} searchParams.time - Travel time (optional)
 * @returns {Promise} - Promise with matching routes
 */
export const searchRoutes = async (searchParams) => {
  try {
    const { startPoint, endPoint, date, time } = searchParams;

    if (!startPoint || !endPoint) {
      throw new Error('Start point and end point are required');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('startPoint', startPoint);
    queryParams.append('endPoint', endPoint);
    if (date) queryParams.append('date', date);
    if (time) queryParams.append('time', time);

    const url = `/routes/search?${queryParams.toString()}`;

    // Don't cache search results as they're dynamic
    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return {
        routes: response.data.routes || response.data,
        suggestions: response.data.suggestions || [],
        total: response.data.total || (response.data.routes ? response.data.routes.length : 0)
      };
    }

    throw new Error(response.message || 'Failed to search routes');
  } catch (error) {
    console.error('❌ Search routes error:', error);
    throw new Error(error.message || 'Failed to search routes');
  }
};

/**
 * Get popular routes based on booking frequency
 * @param {number} limit - Number of popular routes to fetch
 * @returns {Promise} - Promise with popular routes data
 */
export const getPopularRoutes = async (limit = 10) => {
  try {
    const url = `/routes/popular?limit=${limit}`;

    // Cache popular routes for 30 minutes
    const response = await getCached(url, {}, 30 * 60 * 1000);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch popular routes');
  } catch (error) {
    console.error('❌ Get popular routes error:', error);
    throw new Error(error.message || 'Failed to fetch popular routes');
  }
};

/**
 * Get nearby routes based on user location
 * @param {Object} location - User location
 * @param {number} location.latitude - User latitude
 * @param {number} location.longitude - User longitude
 * @param {number} radius - Search radius in kilometers (default: 5km)
 * @returns {Promise} - Promise with nearby routes data
 */
export const getNearbyRoutes = async (location, radius = 5) => {
  try {
    const { latitude, longitude } = location;

    if (!latitude || !longitude) {
      throw new Error('User location is required');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
    queryParams.append('radius', radius.toString());

    const url = `/routes/nearby?${queryParams.toString()}`;

    // Don't cache location-based searches as they're user-specific
    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch nearby routes');
  } catch (error) {
    console.error('❌ Get nearby routes error:', error);
    throw new Error(error.message || 'Failed to fetch nearby routes');
  }
};

/**
 * Get route statistics and analytics
 * @param {number} routeId - Route ID
 * @returns {Promise} - Promise with route statistics
 */
export const getRouteStatistics = async (routeId) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const url = `/routes/${routeId}/statistics`;

    // Cache statistics for 1 hour
    const response = await getCached(url, {}, 60 * 60 * 1000);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch route statistics');
  } catch (error) {
    console.error(`❌ Get route ${routeId} statistics error:`, error);
    throw new Error(error.message || 'Failed to fetch route statistics');
  }
};

/**
 * Get route reviews and ratings
 * @param {number} routeId - Route ID
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of reviews per page
 * @returns {Promise} - Promise with route reviews
 */
export const getRouteReviews = async (routeId, page = 1, limit = 10) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const url = `/routes/${routeId}/reviews?${queryParams.toString()}`;

    // Cache reviews for 5 minutes
    const response = await getCached(url, {}, 5 * 60 * 1000);

    if (response.status === 'success') {
      return {
        reviews: response.data.reviews || response.data,
        pagination: response.data.pagination || null,
        summary: response.data.summary || null
      };
    }

    throw new Error(response.message || 'Failed to fetch route reviews');
  } catch (error) {
    console.error(`❌ Get route ${routeId} reviews error:`, error);
    throw new Error(error.message || 'Failed to fetch route reviews');
  }
};

/**
 * Submit a route review
 * @param {number} routeId - Route ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @param {number} reviewData.bookingId - Related booking ID (optional)
 * @returns {Promise} - Promise with submission result
 */
export const submitRouteReview = async (routeId, reviewData) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    const { rating, comment } = reviewData;

    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Valid rating (1-5) is required');
    }

    if (!comment || comment.trim().length < 10) {
      throw new Error('Review comment must be at least 10 characters long');
    }

    const url = `/routes/${routeId}/reviews`;

    const response = await apiMethods.post(url, reviewData);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to submit review');
  } catch (error) {
    console.error(`❌ Submit route ${routeId} review error:`, error);
    throw new Error(error.message || 'Failed to submit review');
  }
};

/**
 * Get route schedule for a specific date
 * @param {number} routeId - Route ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} - Promise with route schedule
 */
export const getRouteSchedule = async (routeId, date) => {
  try {
    if (!routeId) {
      throw new Error('Route ID is required');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    const url = `/routes/${routeId}/schedule?date=${date}`;

    // Cache schedules for 1 hour
    const response = await getCached(url, {}, 60 * 60 * 1000);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch route schedule');
  } catch (error) {
    console.error(`❌ Get route ${routeId} schedule error:`, error);
    throw new Error(error.message || 'Failed to fetch route schedule');
  }
};

/**
 * Get fare between two stops on a route
 * @param {number} routeId - Route ID
 * @param {number} fromStopId - Starting stop ID
 * @param {number} toStopId - Destination stop ID
 * @param {string} fareType - Fare type (adult, student, senior)
 * @returns {Promise} - Promise with fare data
 */
export const getFareBetweenStops = async (routeId, fromStopId, toStopId, fareType = 'adult') => {
  try {
    if (!routeId || !fromStopId || !toStopId) {
      throw new Error('Route ID, from stop ID, and to stop ID are required');
    }

    if (fromStopId === toStopId) {
      throw new Error('From and to stops cannot be the same');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('fromStopId', fromStopId.toString());
    queryParams.append('toStopId', toStopId.toString());
    if (fareType) queryParams.append('fareType', fareType);

    const url = `/routes/${routeId}/fare?${queryParams.toString()}`;

    const response = await apiMethods.get(url);

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch fare between stops');
  } catch (error) {
    console.error(`❌ Get fare between stops error:`, error);
    throw new Error(error.message || 'Failed to fetch fare between stops');
  }
};

// Export all functions
export default {
  getAllRoutes,
  getRouteById,
  getRouteStops,
  getRouteFares,
  getFareBetweenStops,
  searchRoutes,
  getPopularRoutes,
  getNearbyRoutes,
  getRouteStatistics,
  getRouteReviews,
  submitRouteReview,
  getRouteSchedule
};