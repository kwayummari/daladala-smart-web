// components/booking/BookingConfirmation.jsx
import { Button } from 'react-bootstrap';
import { CheckCircleOutline, Home } from '@mui/icons-material';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const BookingConfirmation = ({ bookingData, onFinish, routeInfo }) => {
  return (
    <div className="booking-confirmation text-center">
      <div className="success-circle mb-4">
        <CheckCircleOutline style={{ fontSize: 80 }} />
      </div>
      <h3 className="mb-3">Booking Confirmed!</h3>
      <p className="mb-4">
        Your booking has been successfully confirmed. A confirmation SMS will be sent to your registered phone number.
      </p>
      
      <div className="booking-details p-4 bg-light rounded mb-4 text-start">
        <h5 className="mb-3">Booking Details</h5>
        <div className="d-flex justify-content-between mb-2">
          <div>Booking ID</div>
          <div className="fw-bold">#{bookingData?.booking.booking_id}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Trip</div>
          <div>{routeInfo.routeName}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Date & Time</div>
          <div>{formatDate(routeInfo.startTime)} at {formatTime(routeInfo.startTime)}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Pickup</div>
          <div>{routeInfo.pickupStop}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Destination</div>
          <div>{routeInfo.dropoffStop}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Passengers</div>
          <div>{routeInfo.passengerCount}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div>Payment Method</div>
          <div className="text-capitalize">
            {bookingData?.payment.payment_method.replace('_', ' ')}
          </div>
        </div>
        <hr />
        <div className="d-flex justify-content-between fw-bold">
          <div>Total Amount</div>
          <div>{formatCurrency(bookingData?.payment.amount)}</div>
        </div>
      </div>
      
      <div className="what-next mb-4">
        <h5 className="mb-3">What's Next?</h5>
        <div className="d-flex flex-column gap-3">
          <div className="next-step">
            <div className="step-number">1</div>
            <div className="step-text">
              Arrive at the pickup location at least 5 minutes before the departure time.
            </div>
          </div>
          <div className="next-step">
            <div className="step-number">2</div>
            <div className="step-text">
              Show the driver your booking confirmation or mention your booking ID.
            </div>
          </div>
          <div className="next-step">
            <div className="step-number">3</div>
            <div className="step-text">
              Track your trip in real-time using the Daladala Smart app.
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        variant="primary" 
        size="lg" 
        onClick={onFinish}
        className="d-flex align-items-center justify-content-center mx-auto"
      >
        <Home className="me-2" />
        Back to Home
      </Button>
      
      <style jsx>{`
        .success-circle {
          width: 120px;
          height: 120px;
          background-color: rgba(var(--bs-success-rgb), 0.1);
          color: var(--success-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .next-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .step-text {
          flex-grow: 1;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;