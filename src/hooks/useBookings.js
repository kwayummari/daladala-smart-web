// hooks/useBookings.js
import { useState, useEffect } from 'react';
import * as bookingService from '../services/bookingService';

/**
 * Custom hook to fetch and manage user bookings
 * @param {string} status - Optional status filter
 */
const useBookings = (status = null) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const bookingsData = await bookingService.getUserBookings(status);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [status]);
  
  const refreshBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const bookingsData = await bookingService.getUserBookings(status);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError('Failed to refresh bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const cancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      // Update the local state after cancellation
      setBookings(bookings.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      return true;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
      return false;
    }
  };
  
  return { bookings, loading, error, refreshBookings, cancelBooking };
};

export default useBookings;