// services/tripService.js (continued)
import api from './api';

/**
 * Get upcoming trips
 * @param {number} routeId - Route ID (optional)
 * @returns {Promise} - Promise with trips data
 */
export const getUpcomingTrips = async (routeId = null) => {
  try {
    const url = routeId 
      ? `/trips/upcoming?route_id=${routeId}`
      : '/trips/upcoming';
      
    const response = await api.get(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch upcoming trips');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch upcoming trips';
  }
};

/**
 * Get trip details
 * @param {number} tripId - Trip ID
 * @returns {Promise} - Promise with trip data
 */
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch trip details');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch trip details';
  }
};

/**
 * Get trips by route
 * @param {number} routeId - Route ID
 * @param {string} date - Date (optional)
 * @returns {Promise} - Promise with trips data
 */
export const getTripsByRoute = async (routeId, date = null) => {
  try {
    const url = date 
      ? `/trips/route/${routeId}?date=${date}`
      : `/trips/route/${routeId}`;
      
    const response = await api.get(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch trips by route');
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch trips by route';
  }
};