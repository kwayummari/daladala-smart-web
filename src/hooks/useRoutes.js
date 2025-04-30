// hooks/useRoutes.js
import { useState, useEffect } from 'react';
import * as routeService from '../services/routeService';

/**
 * Custom hook to fetch and manage routes
 */
const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const routesData = await routeService.getAllRoutes();
        setRoutes(routesData);
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError('Failed to fetch routes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, []);
  
  const getRouteById = async (routeId) => {
    try {
      const route = await routeService.getRouteById(routeId);
      return route;
    } catch (err) {
      console.error('Error fetching route:', err);
      setError('Failed to fetch route. Please try again later.');
      return null;
    }
  };
  
  const searchRoutes = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const routesData = await routeService.searchRoutes(params);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error searching routes:', err);
      setError('Failed to search routes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return { routes, loading, error, getRouteById, searchRoutes };
};

export default useRoutes;