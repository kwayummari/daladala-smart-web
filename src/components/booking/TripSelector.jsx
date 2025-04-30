// components/booking/TripSelector.jsx
import { useState, useEffect } from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import { DatePicker } from '@mantine/dates';
import { CalendarToday } from '@mui/icons-material';
import TripCard from '../common/TripCard';
import * as tripService from '../../services/tripService';

const TripSelector = ({ routeId, onSelect, selectedTripId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    const fetchTrips = async () => {
      if (!routeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        const tripsData = await tripService.getTripsByRoute(routeId, formattedDate);
        setTrips(tripsData);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to fetch trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [routeId, selectedDate]);
  
  const handleSelectTrip = (trip) => {
    onSelect(trip);
  };
  
  return (
    <div className="trip-selector">
      <div className="date-picker-container mb-4">
        <Form.Label>Select Date</Form.Label>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          minDate={new Date()}
          maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
          icon={<CalendarToday />}
          fullWidth
        />
      </div>
      
      <div className="trips-list">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading trips...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : trips.length === 0 ? (
          <Alert variant="info">
            No trips available for the selected date. Please try another date.
          </Alert>
        ) : (
          <>
            <p className="text-muted mb-3">
              Select a trip from the list below:
            </p>
            
            {trips.map((trip) => (
              <TripCard 
                key={trip.trip_id}
                trip={trip}
                onSelect={handleSelectTrip}
                selected={selectedTripId === trip.trip_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TripSelector;