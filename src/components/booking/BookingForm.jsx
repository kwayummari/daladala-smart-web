// components/booking/BookingForm.jsx
import { useState, useContext } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Person, ArrowForward } from '@mui/icons-material';
import { BookingContext } from '../../contexts/BookingContext';
import { formatCurrency } from '../../utils/formatters';

const BookingForm = ({ onSubmit, loading, error }) => {
  const { passengerCount, setPassengerCount, fareAmount } = useContext(BookingContext);
  const [agreed, setAgreed] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!agreed) {
      return;
    }
    
    onSubmit({ passengerCount });
  };
  
  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setPassengerCount(count);
  };
  
  const totalFare = fareAmount * passengerCount;
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Form.Group className="mb-4">
        <Form.Label>Number of Passengers</Form.Label>
        <Form.Select 
          value={passengerCount} 
          onChange={handlePassengerCountChange}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Passenger' : 'Passengers'}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      <div className="fare-calculation p-3 bg-light rounded mb-4">
        <div className="d-flex justify-content-between mb-2">
          <div>Base fare</div>
          <div>{formatCurrency(fareAmount)}</div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <Person fontSize="small" className="me-1" />
            <span>x {passengerCount}</span>
          </div>
          <div></div>
        </div>
        <hr />
        <div className="d-flex justify-content-between fw-bold">
          <div>Total</div>
          <div>{formatCurrency(totalFare)}</div>
        </div>
      </div>
      
      <Form.Group className="mb-4">
        <Form.Check
          type="checkbox"
          id="terms-agreement"
          label={
            <span>
              I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
            </span>
          }
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
      </Form.Group>
      
      <Button 
        variant="primary" 
        type="submit" 
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center"
        disabled={loading || !agreed}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Processing...
          </>
        ) : (
          <>
            Continue to Payment
            <ArrowForward className="ms-2" />
          </>
        )}
      </Button>
    </Form>
  );
};

export default BookingForm;