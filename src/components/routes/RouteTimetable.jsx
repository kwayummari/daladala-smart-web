// components/routes/RouteTimetable.jsx
import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { DatePicker } from '@mantine/dates';
import { CalendarToday } from '@mui/icons-material';
import * as tripService from '../../services/tripService';
import { formatTime } from '../../utils/formatters';

const RouteTimetable = ({ routeId }) => {
  const [loading, setLoading] = useState(true);
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
        setError('Failed to fetch trip schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [routeId, selectedDate]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge bg="primary">Scheduled</Badge>;
      case 'in_progress':
        return <Badge bg="success">In Progress</Badge>;
      case 'completed':
        return <Badge bg="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  return (
    <div className="route-timetable">
      <div className="mb-4">
        <h5 className="mb-3">Select Date</h5>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          minDate={new Date()}
          maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
          icon={<CalendarToday />}
          fullWidth
        />
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading schedule...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : trips.length === 0 ? (
        <Alert variant="info">
          No trips scheduled for the selected date. Please try another date.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Features</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.trip_id}>
                  <td>{formatTime(trip.start_time)}</td>
                  <td>{trip.end_time ? formatTime(trip.end_time) : 'TBD'}</td>
                  <td>
                    <div>{trip.Vehicle.plate_number}</div>
                    <small className="text-muted">{trip.Vehicle.vehicle_type}</small>
                  </td>
                  <td>{getStatusBadge(trip.status)}</td>
                  <td>{trip.Vehicle.capacity} seats</td>
                  <td>
                    {trip.Vehicle.is_air_conditioned && (
                      <Badge bg="success" className="me-1">AC</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RouteTimetable;