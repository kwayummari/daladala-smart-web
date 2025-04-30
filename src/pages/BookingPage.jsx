// pages/BookingPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  // Stepper, 
  // Step, 
  // StepLabel, 
  Accordion,
  Badge
} from 'react-bootstrap';
import { 
  AccessTime, 
  DirectionsBus, 
  Person, 
  Payment, 
  CheckCircleOutline, 
  ArrowForward,
  ArrowBack,
  LocationOn,
  CreditCard,
  AccountBalanceWallet,
  MonetizationOn
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { BookingContext } from '../contexts/BookingContext';
import * as bookingService from '../services/bookingService';
import * as paymentService from '../services/paymentService';
import * as tripService from '../services/tripService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const BookingPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const { 
    selectedRoute, 
    selectedTrip, 
    pickupStop, 
    dropoffStop, 
    passengerCount, 
    fareAmount,
    setPassengerCount,
    clearBookingData
  } = useContext(BookingContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const steps = [
    'Trip Details',
    'Payment',
    'Confirmation'
  ];
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/booking' } });
    }
  }, [currentUser, authLoading, navigate]);
  
  useEffect(() => {
    // Redirect to routes page if necessary data is missing
    if (!selectedRoute || !selectedTrip || !pickupStop || !dropoffStop) {
      navigate('/routes');
    }
    
    // Set payment phone from user data
    if (currentUser?.phone) {
      setPaymentPhone(currentUser.phone);
    }
  }, [selectedRoute, selectedTrip, pickupStop, dropoffStop, navigate, currentUser]);
  
  const totalFare = fareAmount * passengerCount;
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setPassengerCount(count);
  };
  
  const handleSubmitBooking = async () => {
    if (!agreed) {
      setError('Please agree to the terms and conditions.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create booking
      const bookingPayload = {
        trip_id: selectedTrip.trip_id,
        pickup_stop_id: pickupStop.stop_id,
        dropoff_stop_id: dropoffStop.stop_id,
        passenger_count: passengerCount
      };
      
      const booking = await bookingService.createBooking(bookingPayload);
      
      // Process payment
      const paymentPayload = {
        booking_id: booking.booking_id,
        payment_method: paymentMethod,
        payment_details: {
          phone: paymentPhone
        }
      };
      
      const payment = await paymentService.processPayment(paymentPayload);
      
      // Set booking data for confirmation
      setBookingData({
        booking,
        payment
      });
      
      // Move to confirmation step
      setSuccess(true);
      handleNext();
    } catch (err) {
      console.error('Error processing booking:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinish = () => {
    clearBookingData();
    navigate('/profile');
  };
  
  // If loading auth, show spinner
  if (authLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading...</p>
      </Container>
    );
  }
  
  // Return empty div if necessary data is missing (will redirect)
  if (!selectedRoute || !selectedTrip || !pickupStop || !dropoffStop) {
    return <div></div>;
  }

  return (
    <>
      <Helmet>
        <title>Book Your Trip | Daladala Smart</title>
        <meta 
          name="description" 
          content="Book your daladala trip with Daladala Smart. Quick, easy and secure payment options." 
        />
      </Helmet>
      
      <div className="booking-page py-5">
        <Container>
          <div className="mb-5">
            <h1 className="mb-3">Book Your Trip</h1>
            
            <div className="stepper-container mb-4">
              <div className="stepper">
                {steps.map((label, index) => (
                  <div 
                    key={label} 
                    className={`step ${activeStep === index ? 'active' : ''} ${activeStep > index ? 'completed' : ''}`}
                  >
                    <div className="step-indicator">
                      {activeStep > index ? (
                        <CheckCircleOutline />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  {activeStep === 0 && (
                    <div className="trip-details-step">
                      <h3 className="mb-4">Trip Details</h3>
                      
                      <div className="route-info mb-4">
                        <h5 className="mb-3">Route</h5>
                        <div className="d-flex align-items-start">
                          <DirectionsBus className="text-primary mt-1 me-3" />
                          <div>
                            <div className="fw-bold">{selectedRoute.route_name}</div>
                            <div className="text-muted small">{selectedRoute.route_number}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="stops-info mb-4">
                        <h5 className="mb-3">Stops</h5>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-start mb-3">
                            <div className="stop-point pickup me-3">
                              <LocationOn fontSize="small" />
                            </div>
                            <div>
                              <div className="fw-bold">{pickupStop.stop_name}</div>
                              <div className="text-muted small">Pickup Location</div>
                            </div>
                          </div>
                          
                          <div className="route-line my-1 ms-3"></div>
                          
                          <div className="d-flex align-items-start">
                            <div className="stop-point dropoff me-3">
                              <LocationOn fontSize="small" />
                            </div>
                            <div>
                              <div className="fw-bold">{dropoffStop.stop_name}</div>
                              <div className="text-muted small">Destination</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="trip-info mb-4">
                        <h5 className="mb-3">Trip</h5>
                        <Row>
                          <Col sm={6} className="mb-3">
                            <div className="info-item">
                              <div className="info-label">Date</div>
                              <div className="info-value">{formatDate(selectedTrip.start_time)}</div>
                            </div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <div className="info-item">
                              <div className="info-label">Time</div>
                              <div className="info-value">{formatTime(selectedTrip.start_time)}</div>
                            </div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <div className="info-item">
                              <div className="info-label">Vehicle</div>
                              <div className="info-value">
                                {selectedTrip.Vehicle.plate_number}
                                <span className="ms-2">
                                  <Badge bg="info">
                                    {selectedTrip.Vehicle.vehicle_type}
                                  </Badge>
                                </span>
                              </div>
                            </div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <div className="info-item">
                              <div className="info-label">Status</div>
                              <div className="info-value">
                                <Badge bg={selectedTrip.status === 'scheduled' ? 'primary' : 'success'}>
                                  {selectedTrip.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="passenger-info mb-4">
                        <h5 className="mb-3">Passengers</h5>
                        <Form.Group className="mb-3">
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
                      </div>
                      
                      <div className="fare-info mb-4">
                        <h5 className="mb-3">Fare</h5>
                        <div className="fare-calculation">
                          <div className="d-flex justify-content-between mb-2">
                            <div>Base fare</div>
                            <div>{formatCurrency(fareAmount)}</div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <div>Number of passengers</div>
                            <div>x {passengerCount}</div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <div>Total fare</div>
                            <div>{formatCurrency(totalFare)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="primary" 
                          onClick={handleNext}
                          className="d-flex align-items-center"
                        >
                          Continue to Payment
                          <ArrowForward className="ms-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeStep === 1 && (
                    <div className="payment-step">
                      <h3 className="mb-4">Payment</h3>
                      
                      {error && (
                        <Alert variant="danger" className="mb-4">
                          {error}
                        </Alert>
                      )}
                      
                      <div className="payment-methods mb-4">
                        <h5 className="mb-3">Payment Method</h5>
                        <Form>
                          <div className="payment-options">
                            <div 
                              className={`payment-option ${paymentMethod === 'mobile_money' ? 'active' : ''}`}
                              onClick={() => setPaymentMethod('mobile_money')}
                            >
                              <div className="option-icon">
                                <AccountBalanceWallet className="text-primary" />
                              </div>
                              <div className="option-details">
                                <div className="option-title">Mobile Money</div>
                                <div className="option-desc">Pay using M-Pesa, Airtel Money, or Tigo Pesa</div>
                              </div>
                              <div className="option-radio">
                                <Form.Check 
                                  type="radio" 
                                  name="paymentMethod" 
                                  checked={paymentMethod === 'mobile_money'}
                                  onChange={() => setPaymentMethod('mobile_money')}
                                />
                              </div>
                            </div>
                            
                            <div 
                              className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                              onClick={() => setPaymentMethod('cash')}
                            >
                              <div className="option-icon">
                                <MonetizationOn className="text-success" />
                              </div>
                              <div className="option-details">
                                <div className="option-title">Cash</div>
                                <div className="option-desc">Pay in cash to the driver when boarding</div>
                              </div>
                              <div className="option-radio">
                                <Form.Check 
                                  type="radio" 
                                  name="paymentMethod" 
                                  checked={paymentMethod === 'cash'}
                                  onChange={() => setPaymentMethod('cash')}
                                />
                              </div>
                            </div>
                            
                            <div 
                              className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                              onClick={() => setPaymentMethod('card')}
                            >
                              <div className="option-icon">
                                <CreditCard className="text-info" />
                              </div>
                              <div className="option-details">
                                <div className="option-title">Card Payment</div>
                                <div className="option-desc">Pay with your debit or credit card</div>
                              </div>
                              <div className="option-radio">
                                <Form.Check 
                                  type="radio" 
                                  name="paymentMethod" 
                                  checked={paymentMethod === 'card'}
                                  onChange={() => setPaymentMethod('card')}
                                />
                              </div>
                            </div>
                          </div>
                        </Form>
                      </div>
                      
                      {paymentMethod === 'mobile_money' && (
                        <div className="mobile-money-form mb-4">
                          <h5 className="mb-3">Mobile Money Details</h5>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control 
                              type="tel" 
                              placeholder="Enter mobile money number"
                              // pages/BookingPage.jsx (continued)
                              value={paymentPhone}
                              onChange={(e) => setPaymentPhone(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                              Enter the phone number registered with your mobile money account.
                            </Form.Text>
                          </Form.Group>
                        </div>
                      )}
                      
                      {paymentMethod === 'card' && (
                        <div className="card-payment-form mb-4">
                          <h5 className="mb-3">Card Details</h5>
                          <Alert variant="info">
                            Card payment functionality is in development. Please use Mobile Money or Cash for now.
                          </Alert>
                        </div>
                      )}
                      
                      <div className="order-summary mb-4">
                        <h5 className="mb-3">Order Summary</h5>
                        <div className="summary-box p-3 bg-light rounded">
                          <div className="d-flex justify-content-between mb-2">
                            <div>Trip</div>
                            <div>{selectedRoute.route_name}</div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <div>From</div>
                            <div>{pickupStop.stop_name}</div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <div>To</div>
                            <div>{dropoffStop.stop_name}</div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <div>Date & Time</div>
                            <div>{formatDate(selectedTrip.start_time)} at {formatTime(selectedTrip.start_time)}</div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <div>Passengers</div>
                            <div>{passengerCount}</div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <div>Total Amount</div>
                            <div>{formatCurrency(totalFare)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="terms-agreement mb-4">
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
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="outline-primary" 
                          onClick={handleBack}
                          className="d-flex align-items-center"
                        >
                          <ArrowBack className="me-2" />
                          Back to Trip Details
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          onClick={handleSubmitBooking}
                          disabled={loading || !agreed}
                          className="d-flex align-items-center"
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
                              Complete Booking
                              <ArrowForward className="ms-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeStep === 2 && (
                    <div className="confirmation-step">
                      {success ? (
                        <div className="text-center py-4">
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
                              <div>{selectedRoute.route_name}</div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Date & Time</div>
                              <div>{formatDate(selectedTrip.start_time)} at {formatTime(selectedTrip.start_time)}</div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Pickup</div>
                              <div>{pickupStop.stop_name}</div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Destination</div>
                              <div>{dropoffStop.stop_name}</div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Passengers</div>
                              <div>{passengerCount}</div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Payment Method</div>
                              <div className="text-capitalize">
                                {paymentMethod.replace('_', ' ')}
                              </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                              <div>Total Amount</div>
                              <div>{formatCurrency(totalFare)}</div>
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
                            onClick={handleFinish}
                          >
                            View My Bookings
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <Alert variant="danger">
                            There was an error processing your booking. Please try again.
                          </Alert>
                          <Button 
                            variant="outline-primary" 
                            onClick={handleBack}
                            className="mt-3"
                          >
                            Back to Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <div className="sticky-summary-card">
                <Card className="shadow-sm summary-card">
                  <Card.Body>
                    <h4 className="mb-4">Order Summary</h4>
                    
                    <div className="route-summary mb-3">
                      <div className="fw-bold mb-2">{selectedRoute.route_name}</div>
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-start mb-2">
                          <div className="stop-point pickup me-2">
                            <LocationOn fontSize="small" />
                          </div>
                          <div>
                            <div className="small">{pickupStop.stop_name}</div>
                          </div>
                        </div>
                        
                        <div className="route-line my-1 ms-2"></div>
                        
                        <div className="d-flex align-items-start">
                          <div className="stop-point dropoff me-2">
                            <LocationOn fontSize="small" />
                          </div>
                          <div>
                            <div className="small">{dropoffStop.stop_name}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="trip-summary mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <AccessTime fontSize="small" className="text-muted me-2" />
                        <span className="small">
                          {formatDate(selectedTrip.start_time)} at {formatTime(selectedTrip.start_time)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <DirectionsBus fontSize="small" className="text-muted me-2" />
                        <span className="small">
                          {selectedTrip.Vehicle.plate_number} ({selectedTrip.Vehicle.vehicle_type})
                        </span>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="price-summary">
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
                    
                    {activeStep === 0 && (
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 mt-4"
                        onClick={handleNext}
                      >
                        Continue to Payment
                      </Button>
                    )}
                  </Card.Body>
                </Card>
                
                {activeStep !== 2 && (
                  <Card className="shadow-sm mt-4">
                    <Card.Body>
                      <h5 className="mb-3">Need Help?</h5>
                      <p className="small text-muted mb-3">
                        If you have any questions or need assistance with your booking, please feel free to contact our support team.
                      </p>
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2">📱</div>
                        <a href="tel:+255755123456" className="text-decoration-none">
                          +255 755 123 456
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-2">✉️</div>
                        <a href="mailto:support@daladasmart.co.tz" className="text-decoration-none">
                          support@daladasmart.co.tz
                        </a>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </Container>
        
        <style jsx>{`
          .stepper {
            display: flex;
            justify-content: space-between;
            position: relative;
            margin-bottom: 30px;
          }
          
          .stepper::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #e9ecef;
            z-index: 0;
          }
          
          .step {
            flex: 1;
            text-align: center;
            position: relative;
            z-index: 1;
          }
          
          .step-indicator {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            color: #6c757d;
            font-weight: bold;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
          }
          
          .step.active .step-indicator {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }
          
          .step.completed .step-indicator {
            background-color: var(--success-color);
            color: white;
            border-color: var(--success-color);
          }
          
          .step-label {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
          }
          
          .step.active .step-label {
            color: var(--primary-color);
            font-weight: bold;
          }
          
          .step.completed .step-label {
            color: var(--success-color);
          }
          
          .info-item {
            margin-bottom: 8px;
          }
          
          .info-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-weight: 500;
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
          
          .sticky-summary-card {
            position: sticky;
            top: 80px;
          }
          
          .summary-card {
            border-radius: 12px;
          }
          
          .payment-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .payment-option {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .payment-option:hover {
            border-color: #adb5bd;
          }
          
          .payment-option.active {
            border-color: var(--primary-color);
            background-color: rgba(var(--bs-primary-rgb), 0.05);
          }
          
          .option-icon {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(var(--bs-primary-rgb), 0.1);
            border-radius: 8px;
            margin-right: 12px;
          }
          
          .option-details {
            flex-grow: 1;
          }
          
          .option-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .option-desc {
            font-size: 14px;
            color: #6c757d;
          }
          
          .option-radio {
            flex-shrink: 0;
          }
          
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
    </>
  );
};

export default BookingPage;