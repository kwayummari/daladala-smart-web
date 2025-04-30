// pages/RouteDetailPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Tabs, Tab, Badge, Alert, Spinner } from 'react-bootstrap';
import { 
  AccessTime, 
  DirectionsBus, 
  LocationOn, 
  Payment, 
  ArrowForward,
  Star,
  ArrowBack
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BookingContext } from '../contexts/BookingContext';
import StopSelector from '../components/common/StopSelector';
import TripCard from '../components/common/TripCard';
import * as routeService from '../services/routeService';
import * as tripService from '../services/tripService';
import { formatCurrency } from '../utils/formatters';

const RouteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    setSelectedRoute, 
    setSelectedTrip,
    setPickupStop,
    setDropoffStop,
    setFareAmount
  } = useContext(BookingContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [fares, setFares] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [fare, setFare] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch route details
        const routeData = await routeService.getRouteById(id);
        setRoute(routeData);
        
        // Fetch route stops
        const stopsData = await routeService.getRouteStops(id);
        setStops(stopsData);
        
        // Fetch upcoming trips for this route
        const tripsData = await tripService.getUpcomingTrips(id);
        setTrips(tripsData);
        
        // Fetch fares for this route
        const faresData = await routeService.getRouteFares(id);
        setFares(faresData);
        
      } catch (err) {
        console.error('Error fetching route details:', err);
        setError('Failed to load route details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [id]);
  
  // Reset pickup/dropoff when route changes
  useEffect(() => {
    setPickup(null);
    setDropoff(null);
    setFare(null);
  }, [route]);
  
  // Fetch fare when pickup and dropoff are selected
  useEffect(() => {
    const fetchFare = async () => {
      if (pickup && dropoff && route) {
        try {
          const fareData = await routeService.getFareBetweenStops({
            route_id: route.route_id,
            start_stop_id: pickup.stop_id,
            end_stop_id: dropoff.stop_id
          });
          
          setFare(fareData);
        } catch (err) {
          console.error('Error fetching fare:', err);
          setFare(null);
        }
      } else {
        setFare(null);
      }
    };
    
    fetchFare();
  }, [pickup, dropoff, route]);
  
  const handleTripSelect = (trip) => {
    setSelectedTripId(trip.trip_id);
    setSelectedTrip(trip);
  };
  
  const handleBookTrip = () => {
    if (!pickup || !dropoff || !selectedTripId || !fare) {
      return;
    }
    
    const selectedTrip = trips.find(t => t.trip_id === selectedTripId);
    
    // Set context values for booking page
    setSelectedRoute(route);
    setSelectedTrip(selectedTrip);
    setPickupStop(pickup);
    setDropoffStop(dropoff);
    setFareAmount(fare.amount);
    
    // Navigate to booking page
    navigate('/booking');
  };
  
  // Generate "fake" polyline for the route (would be replaced with real data)
  const generatePolyline = () => {
    if (!stops || stops.length < 2) return [];
    
    return stops.map(stop => [
      parseFloat(stop.latitude),
      parseFloat(stop.longitude)
    ]);
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading route details...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button 
          variant="outline-primary" 
          className="mt-3" 
          onClick={() => navigate('/routes')}
        >
          <ArrowBack className="me-2" />
          Back to Routes
        </Button>
      </Container>
    );
  }
  
  if (!route) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Route not found.</Alert>
        <Button 
          variant="outline-primary" 
          className="mt-3" 
          onClick={() => navigate('/routes')}
        >
          <ArrowBack className="me-2" />
          Back to Routes
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{route.route_name} | Daladala Smart</title>
        <meta 
          name="description" 
          content={`Details, schedule, and fare information for ${route.route_name} daladala route from ${route.start_point} to ${route.end_point}.`} 
        />
      </Helmet>
      
      <div className="route-detail-page py-5">
        <Container>
          <div className="mb-4">
            <Button 
              variant="link" 
              className="text-decoration-none mb-3 ps-0" 
              onClick={() => navigate('/routes')}
            >
              <ArrowBack className="me-1" fontSize="small" />
              Back to Routes
            </Button>
            
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center mb-2">
                  <Badge bg="primary" className="me-2 px-3 py-2">
                    {route.route_number}
                  </Badge>
                  <div className="text-warning d-flex align-items-center">
                    <Star fontSize="small" />
                    <span className="ms-1">4.5</span>
                  </div>
                </div>
                <h1 className="mb-3">{route.route_name}</h1>
                <p className="text-muted">
                  <span className="me-3">
                    <AccessTime fontSize="small" className="me-1" />
                    {Math.round(route.estimated_time_minutes / 60)} hr {route.estimated_time_minutes % 60} min
                  </span>
                  <span>
                    <DirectionsBus fontSize="small" className="me-1" />
                    {route.distance_km} km
                  </span>
                </p>
              </Col>
            </Row>
          </div>
          
          <Row>
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="shadow-sm mb-4">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-0"
                >
                  <Tab eventKey="overview" title="Overview">
                    <Card.Body>
                      <div className="route-overview">
                        <div className="route-path mb-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="route-point start-point me-3">A</div>
                            <div>
                              <h5 className="mb-0">{route.start_point}</h5>
                              <p className="text-muted mb-0">Starting Point</p>
                            </div>
                          </div>
                          
                          <div className="route-line"></div>
                          
                          <div className="d-flex align-items-start mt-3">
                            <div className="route-point end-point me-3">B</div>
                            <div>
                              <h5 className="mb-0">{route.end_point}</h5>
                              <p className="text-muted mb-0">Destination</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="route-details">
                          <h5 className="mb-3">Route Information</h5>
                          <Row>
                            <Col md={6} className="mb-3">
                              <div className="detail-item">
                                <div className="detail-label">Route Number</div>
                                <div className="detail-value">{route.route_number}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="detail-item">
                                <div className="detail-label">Status</div>
                                <div className="detail-value">
                                  <Badge bg={route.status === 'active' ? 'success' : 'warning'}>
                                    {route.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="detail-item">
                                <div className="detail-label">Distance</div>
                                <div className="detail-value">{route.distance_km} km</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="detail-item">
                                <div className="detail-label">Estimated Time</div>
                                <div className="detail-value">{Math.round(route.estimated_time_minutes / 60)} hr {route.estimated_time_minutes % 60} min</div>
                              </div>
                            </Col>
                          </Row>
                          
                          {route.description && (
                            <div className="mt-3">
                              <h5 className="mb-2">Description</h5>
                              <p>{route.description}</p>
                            </div>
                                                  )}
                        </div>
                      </div>
                    </Card.Body>
                  </Tab>
                  
                  <Tab eventKey="stops" title="Stops">
                    <Card.Body>
                      <h5 className="mb-4">Stops on this Route</h5>
                      
                      {stops.length === 0 ? (
                        <Alert variant="info">No stops information available for this route.</Alert>
                      ) : (
                        <div className="stops-timeline">
                          {stops.map((stop, index) => (
                            <div key={stop.stop_id} className="timeline-item">
                              <div className="timeline-marker">
                                <div className={`marker ${stop.is_major ? 'major' : 'minor'}`}>
                                  {stop.stop_order}
                                </div>
                              </div>
                              <div className="timeline-content">
                                <h6 className="mb-1">{stop.stop_name}</h6>
                                {stop.address && (
                                  <p className="text-muted small mb-1">{stop.address}</p>
                                )}
                                <div className="d-flex align-items-center small text-muted">
                                  <AccessTime fontSize="inherit" className="me-1" />
                                  <span>
                                    {Math.floor(stop.estimated_time_from_start / 60)} hr {stop.estimated_time_from_start % 60} min from start
                                  </span>
                                </div>
                                {stop.is_major && (
                                  <Badge bg="primary" className="mt-2">Major Stop</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Tab>
                  
                  <Tab eventKey="fares" title="Fares">
                    <Card.Body>
                      <h5 className="mb-4">Fare Information</h5>
                      
                      {fares.length === 0 ? (
                        <Alert variant="info">No fare information available for this route.</Alert>
                      ) : (
                        <>
                          <div className="fare-types mb-4">
                            <h6 className="mb-3">Fare Types</h6>
                            <div className="d-flex flex-wrap gap-2">
                              <Badge bg="primary" className="px-3 py-2">Standard</Badge>
                              <Badge bg="success" className="px-3 py-2">Student</Badge>
                              <Badge bg="info" className="px-3 py-2">Senior</Badge>
                              <Badge bg="warning" className="px-3 py-2 text-dark">Special</Badge>
                            </div>
                            <p className="small text-muted mt-2">
                              Different fare rates apply based on passenger category. Student and senior 
                              discounts available with valid ID.
                            </p>
                          </div>
                          
                          <div className="fare-calculator mb-4">
                            <h6 className="mb-3">Fare Calculator</h6>
                            <p className="text-muted mb-3">
                              Calculate fare between any two stops on this route.
                            </p>
                            
                            <Row className="g-3 mb-3">
                              <Col md={5}>
                                <StopSelector
                                  label="From"
                                  placeholder="Select departure stop"
                                  value={pickup}
                                  onChange={setPickup}
                                  excludeStopId={dropoff?.stop_id}
                                  routeId={route.route_id}
                                />
                              </Col>
                              
                              <Col md={5}>
                                <StopSelector
                                  label="To"
                                  placeholder="Select destination stop"
                                  value={dropoff}
                                  onChange={setDropoff}
                                  excludeStopId={pickup?.stop_id}
                                  routeId={route.route_id}
                                />
                              </Col>
                            </Row>
                            
                            {fare ? (
                              <Card className="bg-light border-0">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h6 className="mb-1">Fare Amount</h6>
                                      <div className="d-flex align-items-center">
                                        <Payment className="text-primary me-2" />
                                        <span className="h4 mb-0">{formatCurrency(fare.amount)}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Badge bg="primary" className="px-3 py-2">
                                        {fare.fare_type.charAt(0).toUpperCase() + fare.fare_type.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            ) : (
                              <div className="text-center py-3">
                                <p className="text-muted mb-0">
                                  Select departure and destination stops to calculate fare.
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="fare-table">
                            <h6 className="mb-3">Popular Fare Routes</h6>
                            <div className="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>From</th>
                                    <th>To</th>
                                    <th className="text-end">Fare</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fares.slice(0, 5).map((fare) => (
                                    <tr key={fare.fare_id}>
                                      <td>{fare.startStop.stop_name}</td>
                                      <td>{fare.endStop.stop_name}</td>
                                      <td className="text-end">{formatCurrency(fare.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Tab>
                  
                  <Tab eventKey="map" title="Map">
                    <Card.Body>
                      <h5 className="mb-3">Route Map</h5>
                      
                      <div className="route-map-container">
                        {stops.length === 0 ? (
                          <Alert variant="info">No map data available for this route.</Alert>
                        ) : (
                          <MapContainer 
                            center={[
                              parseFloat(stops[0].latitude), 
                              parseFloat(stops[0].longitude)
                            ]} 
                            zoom={13} 
                            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            
                            {stops.map((stop) => (
                              <Marker 
                                key={stop.stop_id}
                                position={[
                                  parseFloat(stop.latitude), 
                                  parseFloat(stop.longitude)
                                ]}
                              >
                                <Popup>
                                  <div>
                                    <h6>{stop.stop_name}</h6>
                                    {stop.address && <p className="mb-1">{stop.address}</p>}
                                    <p className="mb-0 small text-muted">
                                      Stop #{stop.stop_order}
                                    </p>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                            
                            <Polyline 
                              positions={generatePolyline()} 
                              color="#ff6b00" 
                              weight={4}
                            />
                          </MapContainer>
                        )}
                      </div>
                    </Card.Body>
                  </Tab>
                </Tabs>
              </Card>
              
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-4">Upcoming Trips</h4>
                  
                  {trips.length === 0 ? (
                    <Alert variant="info">
                      No upcoming trips scheduled for this route. Please check back later.
                    </Alert>
                  ) : (
                    <div className="trips-list">
                      {trips.map((trip) => (
                        <TripCard 
                          key={trip.trip_id}
                          trip={trip}
                          onSelect={handleTripSelect}
                          selected={selectedTripId === trip.trip_id}
                        />
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <div className="sticky-booking-card">
                <Card className="shadow-sm booking-card">
                  <Card.Body>
                    <h4 className="mb-4">Book a Trip</h4>
                    
                    <div className="mb-4">
                      <StopSelector
                        label="Pickup Location"
                        placeholder="Select pickup stop"
                        value={pickup}
                        onChange={setPickup}
                        excludeStopId={dropoff?.stop_id}
                        routeId={route.route_id}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <StopSelector
                        label="Destination"
                        placeholder="Select destination stop"
                        value={dropoff}
                        onChange={setDropoff}
                        excludeStopId={pickup?.stop_id}
                        routeId={route.route_id}
                      />
                    </div>
                    
                    {pickup && dropoff && (
                      <div className="mb-4">
                        <h5 className="mb-3">Fare</h5>
                        {fare ? (
                          <div className="fare-display d-flex align-items-center">
                            <Payment className="text-primary me-2" />
                            <span className="h3 mb-0">{formatCurrency(fare.amount)}</span>
                          </div>
                        ) : (
                          <Spinner animation="border" size="sm" />
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 d-flex align-items-center justify-content-center"
                        disabled={!pickup || !dropoff || !selectedTripId || !fare}
                        onClick={handleBookTrip}
                      >
                        Book Now
                        <ArrowForward className="ms-2" />
                      </Button>
                      
                      {(!pickup || !dropoff || !selectedTripId) && (
                        <div className="text-muted text-center mt-2 small">
                          {!pickup || !dropoff 
                            ? 'Select pickup and destination stops' 
                            : 'Select a trip from the list below'}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
        
        <style jsx>{`
          .route-line {
            width: 2px;
            height: 80px;
            background-color: #ddd;
            margin-left: 12px;
          }
          
          .route-point {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          
          .start-point {
            background-color: var(--primary-color);
          }
          
          .end-point {
            background-color: var(--secondary-color);
          }
          
          .detail-item {
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 4px;
          }
          
          .detail-value {
            font-weight: 500;
          }
          
          .stops-timeline {
            position: relative;
          }
          
          .stops-timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 15px;
            width: 2px;
            background-color: #ddd;
          }
          
          .timeline-item {
            display: flex;
            margin-bottom: 20px;
            position: relative;
          }
          
          .timeline-marker {
            width: 30px;
            flex-shrink: 0;
            position: relative;
          }
          
          .marker {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            background-color: #6c757d;
            z-index: 1;
          }
          
          .marker.major {
            background-color: var(--primary-color);
          }
          
          .timeline-content {
            flex-grow: 1;
            padding-left: 15px;
          }
          
          .sticky-booking-card {
            position: sticky;
            top: 80px;
          }
          
          .booking-card {
            border-radius: 12px;
          }
          
          .fare-display {
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
        `}</style>
      </div>
    </>
  );
};

export default RouteDetailPage;