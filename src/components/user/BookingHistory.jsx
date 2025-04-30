// components/user/BookingHistory.jsx
import { useState, useEffect } from 'react';
import { Button, Badge, Spinner, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import { DirectionsBus, AccessTime, LocationOn } from '@mui/icons-material';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import * as bookingService from '../../services/bookingService';

const BookingHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);
  
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let status = null;
      
      // Set status filter based on active tab
      if (activeTab !== 'all') {
        status = activeTab;
      }
      
      const bookingsData = await bookingService.getUserBookings(status);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      // Update the local state after cancellation
      setBookings(bookings.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge bg="primary">Confirmed</Badge>;
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
  
const getPaymentStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <Badge bg="warning">Pending</Badge>;
    case 'paid':
      return <Badge bg="success">Paid</Badge>;
    case 'failed':
      return <Badge bg="danger">Failed</Badge>;
    case 'refunded':
      return <Badge bg="info">Refunded</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

return (
  <div className="booking-history">
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      className="mb-4"
    >
      <Tab eventKey="all" title="All Bookings" />
      <Tab eventKey="confirmed" title="Confirmed" />
      <Tab eventKey="completed" title="Completed" />
      <Tab eventKey="cancelled" title="Cancelled" />
    </Tabs>
    
    {loading ? (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading bookings...</p>
      </div>
    ) : error ? (
      <Alert variant="danger">{error}</Alert>
    ) : bookings.length === 0 ? (
      <div className="text-center py-4">
        <DirectionsBus style={{ fontSize: 48 }} className="text-muted mb-3" />
        <h4>No Bookings Found</h4>
        <p className="text-muted">
          You haven't made any {activeTab !== 'all' ? activeTab : ''} bookings yet.
        </p>
      </div>
    ) : (
      <div className="bookings-list">
        {bookings.map((booking) => (
          <Card key={booking.booking_id} className="mb-3 booking-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center">
                  <DirectionsBus className="text-primary me-2" />
                  <div>
                    <div className="fw-bold">{booking.Trip.Route.route_name}</div>
                    <div className="text-muted small">{booking.Trip.Route.route_number}</div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div className="d-flex mb-3">
                <div className="me-4">
                  <div className="small text-muted">Date</div>
                  <div>{formatDate(booking.Trip.start_time)}</div>
                </div>
                <div className="me-4">
                  <div className="small text-muted">Time</div>
                  <div>{formatTime(booking.Trip.start_time)}</div>
                </div>
                <div>
                  <div className="small text-muted">Payment</div>
                  <div>{getPaymentStatusBadge(booking.payment_status)}</div>
                </div>
              </div>
              
              <div className="route-info mb-3">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-start mb-2">
                    <div className="stop-point pickup me-2">
                      <LocationOn fontSize="small" />
                    </div>
                    <div>
                      <div className="small">{booking.pickupStop.stop_name}</div>
                    </div>
                  </div>
                  
                  <div className="route-line my-1 ms-2"></div>
                  
                  <div className="d-flex align-items-start">
                    <div className="stop-point dropoff me-2">
                      <LocationOn fontSize="small" />
                    </div>
                    <div>
                      <div className="small">{booking.dropoffStop.stop_name}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted">Total</div>
                  <div className="fw-bold">{formatCurrency(booking.fare_amount)}</div>
                </div>
                
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    href={`/bookings/${booking.booking_id}`}
                  >
                    View Details
                  </Button>
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.booking_id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
            
            <style jsx>{`
              .booking-card {
                border-radius: 12px;
                transition: transform 0.2s ease;
              }
              
              .booking-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              }
              
              .route-line {
                width: 2px;
                height: 20px;
                background-color: #ddd;
              }
              
              .stop-point {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
              }
              
              .pickup {
                background-color: var(--primary-color);
              }
              
              .dropoff {
                background-color: var(--secondary-color);
              }
            `}</style>
          </Card>
        ))}
      </div>
    )}
  </div>
);
};

export default BookingHistory;