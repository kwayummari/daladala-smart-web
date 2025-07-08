// src/pages/BookingPage.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import {
  LocationOn,
  Schedule,
  Person,
  Payment,
  CheckCircle,
  ArrowForward,
  DirectionsBus,
  Phone,
  CreditCard,
} from "@mui/icons-material";
import { AuthContext } from "../contexts/AuthContext";
import {
  createBooking,
  calculateFare,
  checkSeatAvailability,
} from "../services/bookingService";
import { getRouteById, getRouteStops } from "../services/routeService";
import { getTripDetails } from "../services/tripService";
import { processPayment, getPaymentMethods } from "../services/paymentService";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser } = useContext(AuthContext);

  // Get initial data from URL params or state
  const tripId = searchParams.get("tripId") || location.state?.tripId;
  const routeId = searchParams.get("routeId") || location.state?.routeId;

  // Booking flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Data state
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [seatAvailability, setSeatAvailability] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    pickupStopId: "",
    dropoffStopId: "",
    passengerCount: 1,
    bookingTime: "",
    passengerInfo: {
      firstName: currentUser?.first_name || "",
      lastName: currentUser?.last_name || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
    },
    specialRequests: "",
  });

  // Payment state
  const [fareCalculation, setFareCalculation] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "mobile_money",
    phoneNumber: currentUser?.phone || "",
    saveMethod: false,
  });

  // UI state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Trip Details",
      description: "Select stops and passengers",
    },
    { id: 2, title: "Passenger Info", description: "Confirm your details" },
    { id: 3, title: "Payment", description: "Choose payment method" },
    { id: 4, title: "Confirmation", description: "Booking complete" },
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        state: { redirectTo: location.pathname + location.search },
      });
      return;
    }

    if (!tripId) {
      navigate("/routes", {
        state: { error: "Please select a trip to book" },
      });
      return;
    }

    initializeBooking();
  }, [tripId, routeId, currentUser, navigate]);

  const initializeBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🎫 Initializing booking for trip:", tripId);

      // Load trip details
      const tripDetails = await getTripDetails(tripId);
      setTrip(tripDetails);

      // Load route information if we have routeId
      if (routeId || tripDetails.route_id) {
        const routeDetails = await getRouteById(
          routeId || tripDetails.route_id,
          true,
          true
        );
        setRoute(routeDetails);

        // Load route stops
        const routeStops = await getRouteStops(routeId || tripDetails.route_id);
        setStops(routeStops);
      }

      // Check seat availability
      const availability = await checkSeatAvailability(tripId);
      setSeatAvailability(availability);

      // Load payment methods
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);

      console.log("✅ Booking initialization complete");
    } catch (err) {
      console.error("❌ Booking initialization error:", err);
      setError(err.message || "Failed to initialize booking");
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step) => {
    if (step > currentStep) {
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        return;
      }
    }
    setCurrentStep(step);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!bookingData.pickupStopId || !bookingData.dropoffStopId) {
          setError("Please select pickup and dropoff stops");
          return false;
        }
        if (bookingData.pickupStopId === bookingData.dropoffStopId) {
          setError("Pickup and dropoff stops must be different");
          return false;
        }
        if (bookingData.passengerCount < 1) {
          setError("Please select number of passengers");
          return false;
        }
        break;
      case 2:
        if (
          !bookingData.passengerInfo.firstName ||
          !bookingData.passengerInfo.lastName
        ) {
          setError("Please enter passenger name");
          return false;
        }
        if (!bookingData.passengerInfo.phone) {
          setError("Please enter phone number");
          return false;
        }
        break;
      case 3:
        if (!paymentData.paymentMethod) {
          setError("Please select payment method");
          return false;
        }
        if (
          paymentData.paymentMethod === "mobile_money" &&
          !paymentData.phoneNumber
        ) {
          setError("Please enter phone number for mobile money");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const calculateBookingFare = async () => {
    try {
      if (!bookingData.pickupStopId || !bookingData.dropoffStopId) {
        return;
      }

      const fareData = await calculateFare({
        tripId: parseInt(tripId),
        pickupStopId: bookingData.pickupStopId,
        dropoffStopId: bookingData.dropoffStopId,
        passengerCount: bookingData.passengerCount,
        fareType: "adult",
      });

      setFareCalculation(fareData);
    } catch (err) {
      console.error("❌ Fare calculation error:", err);
      setError("Failed to calculate fare");
    }
  };

  const handleBookingSubmit = async () => {
    try {
      if (!validateCurrentStep()) {
        return;
      }

      setProcessing(true);
      setError(null);

      console.log("🚀 Creating booking...");

      // Create booking
      const booking = await createBooking({
        tripId: parseInt(tripId),
        pickupStopId: parseInt(bookingData.pickupStopId),
        dropoffStopId: parseInt(bookingData.dropoffStopId),
        passengerCount: bookingData.passengerCount,
        bookingTime: bookingData.bookingTime || new Date().toISOString(),
        passengerInfo: bookingData.passengerInfo,
        specialRequests: bookingData.specialRequests,
      });

      console.log("✅ Booking created:", booking);

      // Process payment
      const payment = await processPayment({
        bookingId: booking.booking_id,
        paymentMethod: paymentData.paymentMethod,
        phoneNumber: paymentData.phoneNumber,
        amount: fareCalculation?.totalFare || booking.fare_amount,
        currency: "TZS",
      });

      console.log("✅ Payment processed:", payment);

      setBookingResult({ booking, payment });
      setCurrentStep(4);
    } catch (err) {
      console.error("❌ Booking submission error:", err);
      setError(err.message || "Failed to complete booking");
    } finally {
      setProcessing(false);
    }
  };

  const handleBookingDataChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Recalculate fare when relevant fields change
    if (["pickupStopId", "dropoffStopId", "passengerCount"].includes(field)) {
      setTimeout(() => calculateBookingFare(), 500);
    }
  };

  const handlePassengerInfoChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      passengerInfo: {
        ...prev.passengerInfo,
        [field]: value,
      },
    }));
  };

  const handlePaymentDataChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStepIndicator = () => (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="d-flex align-items-center">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${
                  step.id <= currentStep
                    ? "bg-primary text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
                onClick={() => handleStepChange(step.id)}
              >
                {step.id < currentStep ? (
                  <CheckCircle fontSize="small" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ms-2 d-none d-md-block">
                <div className="fw-semibold">{step.title}</div>
                <div className="small text-muted">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ArrowForward className="mx-3 text-muted d-none d-md-block" />
              )}
            </div>
          ))}
        </div>
        <ProgressBar
          now={(currentStep / steps.length) * 100}
          className="mt-3"
          variant="primary"
        />
      </Card.Body>
    </Card>
  );

  const renderStep1 = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Trip Details</h5>
      </Card.Header>
      <Card.Body>
        {trip && route && (
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <DirectionsBus className="text-primary me-2" />
              <div>
                <h6 className="mb-1">{route.route_name}</h6>
                <div className="text-muted small">
                  {route.start_point} → {route.end_point}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center mb-3">
              <Schedule className="text-primary me-2" />
              <div>
                <div className="fw-semibold">
                  {formatDate(trip.trip_date)} at {formatTime(trip.start_time)}
                </div>
                <div className="text-muted small">
                  Estimated duration: {trip.estimated_duration || "N/A"} minutes
                </div>
              </div>
            </div>

            {seatAvailability && (
              <Alert variant="info" className="mb-3">
                <strong>Seats Available:</strong>{" "}
                {seatAvailability.availableSeats} of{" "}
                {seatAvailability.totalSeats}
              </Alert>
            )}
          </div>
        )}

        <Row>
          <Col md={6} className="mb-3">
            <Form.Label>Pickup Stop</Form.Label>
            <Form.Select
              value={bookingData.pickupStopId}
              onChange={(e) =>
                handleBookingDataChange("pickupStopId", e.target.value)
              }
              required
            >
              <option value="">Select pickup stop</option>
              {stops.map((stop) => (
                <option key={stop.stop_id} value={stop.stop_id}>
                  {stop.stop_name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Dropoff Stop</Form.Label>
            <Form.Select
              value={bookingData.dropoffStopId}
              onChange={(e) =>
                handleBookingDataChange("dropoffStopId", e.target.value)
              }
              required
            >
              <option value="">Select dropoff stop</option>
              {stops.map((stop) => (
                <option key={stop.stop_id} value={stop.stop_id}>
                  {stop.stop_name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Number of Passengers</Form.Label>
            <Form.Select
              value={bookingData.passengerCount}
              onChange={(e) =>
                handleBookingDataChange(
                  "passengerCount",
                  parseInt(e.target.value)
                )
              }
              required
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} passenger{num > 1 ? "s" : ""}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Special Requests (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={bookingData.specialRequests}
              onChange={(e) =>
                handleBookingDataChange("specialRequests", e.target.value)
              }
              placeholder="Any special requirements..."
            />
          </Col>
        </Row>

        {fareCalculation && (
          <Alert variant="success">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>Total Fare:</strong>
              </span>
              <span className="h5 mb-0">
                {formatCurrency(fareCalculation.totalFare)}
              </span>
            </div>
            {fareCalculation.breakdown && (
              <div className="mt-2 small">
                <div>Base fare: {formatCurrency(fareCalculation.baseFare)}</div>
                {fareCalculation.discount > 0 && (
                  <div className="text-success">
                    Discount: -{formatCurrency(fareCalculation.discount)}
                  </div>
                )}
              </div>
            )}
          </Alert>
        )}

        <div className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={() => handleStepChange(2)}
            disabled={!bookingData.pickupStopId || !bookingData.dropoffStopId}
          >
            Continue to Passenger Info
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Passenger Information</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={bookingData.passengerInfo.firstName}
              onChange={(e) =>
                handlePassengerInfoChange("firstName", e.target.value)
              }
              required
            />
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={bookingData.passengerInfo.lastName}
              onChange={(e) =>
                handlePassengerInfoChange("lastName", e.target.value)
              }
              required
            />
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={bookingData.passengerInfo.phone}
              onChange={(e) =>
                handlePassengerInfoChange("phone", e.target.value)
              }
              placeholder="+255..."
              required
            />
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              value={bookingData.passengerInfo.email}
              onChange={(e) =>
                handlePassengerInfoChange("email", e.target.value)
              }
              required
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => handleStepChange(1)}
          >
            Back to Trip Details
          </Button>
          <Button
            variant="primary"
            onClick={() => handleStepChange(3)}
            disabled={
              !bookingData.passengerInfo.firstName ||
              !bookingData.passengerInfo.phone
            }
          >
            Continue to Payment
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Payment Method</h5>
      </Card.Header>
      <Card.Body>
        {fareCalculation && (
          <Alert variant="info" className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>Amount to Pay:</strong>
              </span>
              <span className="h4 mb-0">
                {formatCurrency(fareCalculation.totalFare)}
              </span>
            </div>
          </Alert>
        )}

        <div className="mb-4">
          <h6>Select Payment Method</h6>

          <div className="payment-methods">
            <div
              className={`payment-option ${paymentData.paymentMethod === "mobile_money" ? "selected" : ""}`}
              onClick={() =>
                handlePaymentDataChange("paymentMethod", "mobile_money")
              }
            >
              <Phone className="payment-icon" />
              <div className="option-details">
                <div className="option-title">Mobile Money</div>
                <div className="option-desc">
                  Pay with M-Pesa, Tigo Pesa, or Airtel Money
                </div>
              </div>
              <Form.Check
                type="radio"
                name="paymentMethod"
                checked={paymentData.paymentMethod === "mobile_money"}
                onChange={() => {}}
                className="option-radio"
              />
            </div>

            <div
              className={`payment-option ${paymentData.paymentMethod === "card" ? "selected" : ""}`}
              onClick={() => handlePaymentDataChange("paymentMethod", "card")}
            >
              <CreditCard className="payment-icon" />
              <div className="option-details">
                <div className="option-title">Credit/Debit Card</div>
                <div className="option-desc">
                  Pay with Visa, Mastercard, or local cards
                </div>
              </div>
              <Form.Check
                type="radio"
                name="paymentMethod"
                checked={paymentData.paymentMethod === "card"}
                onChange={() => {}}
                className="option-radio"
              />
            </div>
          </div>
        </div>

        {paymentData.paymentMethod === "mobile_money" && (
          <div className="mb-3">
            <Form.Label>Mobile Money Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={paymentData.phoneNumber}
              onChange={(e) =>
                handlePaymentDataChange("phoneNumber", e.target.value)
              }
              placeholder="+255..."
              required
            />
            <Form.Text className="text-muted">
              Enter the phone number registered with your mobile money account
            </Form.Text>
          </div>
        )}

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => handleStepChange(2)}
          >
            Back to Passenger Info
          </Button>
          <Button
            variant="primary"
            onClick={handleBookingSubmit}
            disabled={processing || !paymentData.paymentMethod}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Complete Booking"
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <Card.Body className="text-center">
        <div className="success-circle">
          <CheckCircle style={{ fontSize: "4rem" }} />
        </div>

        <h3 className="mt-4 mb-3">Booking Confirmed!</h3>

        {bookingResult && (
          <div className="mb-4">
            <Alert variant="success">
              <div className="mb-2">
                <strong>Booking ID:</strong> {bookingResult.booking.booking_id}
              </div>
              <div className="mb-2">
                <strong>Payment Status:</strong> {bookingResult.payment.status}
              </div>
              {bookingResult.payment.reference && (
                <div>
                  <strong>Payment Reference:</strong>{" "}
                  {bookingResult.payment.reference}
                </div>
              )}
            </Alert>
          </div>
        )}

        <div className="mb-4">
          <h5>What's Next?</h5>
          <div className="mt-3">
            <div className="next-step">
              <div className="step-number">1</div>
              <div className="step-text">
                <strong>Check your email</strong>
                <br />
                We've sent your booking confirmation and e-ticket
              </div>
            </div>

            <div className="next-step">
              <div className="step-number">2</div>
              <div className="step-text">
                <strong>Arrive at pickup stop</strong>
                <br />
                Be at the pickup stop 5 minutes before departure
              </div>
            </div>

            <div className="next-step">
              <div className="step-number">3</div>
              <div className="step-text">
                <strong>Show your ticket</strong>
                <br />
                Present your e-ticket or booking ID to the conductor
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-3 justify-content-center">
          <Button
            variant="outline-primary"
            onClick={() => navigate("/profile?tab=bookings")}
          >
            View My Bookings
          </Button>
          <Button variant="primary" onClick={() => navigate("/")}>
            Book Another Trip
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading booking details...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book Your Trip - Daladala Smart</title>
        <meta
          name="description"
          content="Complete your daladala booking with secure payment options"
        />
      </Helmet>

      <Container className="py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">Book Your Trip</h1>
          <p className="text-muted">Complete your booking in simple steps</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {renderStepIndicator()}

        <Row>
          <Col lg={8}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </Col>

          <Col lg={4}>
            {trip && route && (
              <Card className="sticky-top">
                <Card.Header>
                  <h6 className="mb-0">Booking Summary</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="fw-semibold">{route.route_name}</div>
                    <div className="text-muted small">
                      {route.start_point} → {route.end_point}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Date:</span>
                      <span>{formatDate(trip.trip_date)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Time:</span>
                      <span>{formatTime(trip.start_time)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Passengers:</span>
                      <span>{bookingData.passengerCount}</span>
                    </div>
                  </div>

                  {fareCalculation && (
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between fw-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(fareCalculation.totalFare)}</span>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <style jsx>{`
          .payment-option {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
          }

          .payment-option:hover {
            border-color: var(--primary-color);
            background-color: rgba(var(--bs-primary-rgb), 0.05);
          }

          .payment-option.selected {
            border-color: var(--primary-color);
            background-color: rgba(var(--bs-primary-rgb), 0.1);
          }

          .payment-icon {
            width: 48px;
            height: 48px;
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
            margin-bottom: 1rem;
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
      </Container>
    </>
  );
};

export default BookingPage;
