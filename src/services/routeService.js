// services/routeService.js
import api from './api';

/**
 * Get all routes
 * @returns {Promise} - Promise with routes data
 */
export const getAllRoutes = async () => {
  try {
    const response = await api.get('/routes');
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch routes');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch routes';
  }
};

/**
 * Get route by ID
 * @param {number} routeId - Route ID
 * @returns {Promise} - Promise with route data
 */
export const getRouteById = async (routeId) => {
  try {
    const response = await api.get(`/routes/${routeId}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch route');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch route';
  }
};

/**
 * Get route stops
 * @param {number} routeId - Route ID
 * @returns {Promise} - Promise with stops data
 */
export const getRouteStops = async (routeId) => {
  try {
    const response = await api.get(`/routes/${routeId}/stops`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch route stops');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch route stops';
  }
};

/**
 * Get route fares
 * @param {number} routeId - Route ID
 * @param {string} fareType - Fare type (optional)
 * @returns {Promise} - Promise with fares data
 */
export const getRouteFares = async (routeId, fareType = '') => {
  try {
    const url = fareType 
      ? `/routes/${routeId}/fares?fare_type=${fareType}`
      : `/routes/${routeId}/fares`;
      
    const response = await api.get(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch route fares');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch route fares';
  }
};

/**
 * Search routes
 * @param {Object} params - Search parameters
 * @returns {Promise} - Promise with routes data
 */
export const searchRoutes = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.start_point) queryParams.append('start_point', params.start_point);
    if (params.end_point) queryParams.append('end_point', params.end_point);
    
    const response = await api.get(`/routes/search?${queryParams.toString()}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to search routes');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to search routes';
  }
};

/**
 * Get fare between stops
 * @param {Object} params - Fare parameters
 * @returns {Promise} - Promise with fare data
 */
export const getFareBetweenStops = async (params) => {
  try {
    const { route_id, start_stop_id, end_stop_id, fare_type = 'standard' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('route_id', route_id);
    queryParams.append('start_stop_id', start_stop_id);
    queryParams.append('end_stop_id', end_stop_id);
    queryParams.append('fare_type', fare_type);
    
    const response = await api.get(`/routes/fare?${queryParams.toString()}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get fare');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to get fare';
  }
};
