// pages/RoutesPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { DirectionsBus, FilterList } from '@mui/icons-material';
import SearchBar from '../components/common/SearchBar';
import RouteCard from '../components/common/RouteCard';
import { BookingContext } from '../contexts/BookingContext';
import * as routeService from '../services/routeService';

const RoutesPage = () => {
  const location = useLocation();
  const { pickupStop, dropoffStop } = useContext(BookingContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState('name');
  
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if coming from search with specific pickup/dropoff
        if (location.state?.fromSearch && location.state?.pickup && location.state?.dropoff) {
          const { pickup, dropoff } = location.state;
          
          // Search routes between pickup and dropoff
          const params = {
            start_point: pickup.stop_name,
            end_point: dropoff.stop_name
          };
          
          const searchedRoutes = await routeService.searchRoutes(params);
          setRoutes(searchedRoutes);
          setFilteredRoutes(searchedRoutes);
        } else {
          // Fetch all routes
          const allRoutes = await routeService.getAllRoutes();
          setRoutes(allRoutes);
          setFilteredRoutes(allRoutes);
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError('Failed to load routes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [location.state]);
  
  // Handle search and filtering
  useEffect(() => {
    if (!routes.length) return;
    
    setIsSearching(true);
    
    // Apply search term filter
    let result = [...routes];
    
    if (searchTerm) {
      result = result.filter(route => 
        route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.route_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.end_point.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'name':
        result.sort((a, b) => a.route_name.localeCompare(b.route_name));
        break;
      case 'number':
        result.sort((a, b) => a.route_number.localeCompare(b.route_number));
        break;
      case 'distance':
        result.sort((a, b) => a.distance_km - b.distance_km);
        break;
      case 'time':
        result.sort((a, b) => a.estimated_time_minutes - b.estimated_time_minutes);
        break;
      default:
        break;
    }
    
    setFilteredRoutes(result);
    setIsSearching(false);
  }, [routes, searchTerm, sortOption]);
  
  return (
    <>
      <Helmet>
        <title>Daladala Routes | Daladala Smart</title>
        <meta 
          name="description" 
          content="Explore all available daladala routes in Dar es Salaam. Find routes, stops, and schedules." 
        />
      </Helmet>
      
      <div className="routes-page py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1">Daladala Routes</h1>
              <p className="text-muted">Find and explore routes in Dar es Salaam</p>
            </div>
          </div>
          
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Search Routes</h5>
              <SearchBar variant="compact" />
            </Card.Body>
          </Card>
          
          <Row>
            <Col lg={3} className="mb-4">
              <Card className="shadow-sm filter-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FilterList className="me-2" />
                    <h5 className="mb-0">Filters</h5>
                  </div>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Search by keyword</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Route name, number, or destination"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select 
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="name">Route Name</option>
                      <option value="number">Route Number</option>
                      <option value="distance">Distance (shortest first)</option>
                      <option value="time">Travel Time (shortest first)</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              {pickupStop && dropoffStop && (
                <Card className="mt-4 shadow-sm search-info-card">
                  <Card.Body>
                    <h6 className="mb-3">Your Search</h6>
                    <div className="d-flex flex-column mb-3">
                      <div className="d-flex align-items-start mb-2">
                        <div className="route-point start-point me-2">A</div>
                        <div>
                          <p className="mb-0 fw-medium">{pickupStop.stop_name}</p>
                          <small className="text-muted">Pickup</small>
                        </div>
                      </div>
                      
                      <div className="route-line my-1 ms-2"></div>
                      
                      <div className="d-flex align-items-start">
                        <div className="route-point end-point me-2">B</div>
                        <div>
                          <p className="mb-0 fw-medium">{dropoffStop.stop_name}</p>
                          <small className="text-muted">Destination</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
            
            <Col lg={9}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading routes...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredRoutes.length === 0 ? (
                <div className="text-center py-5">
                  <DirectionsBus style={{ fontSize: 48 }} className="text-muted mb-3" />
                  <h3>No Routes Found</h3>
                  <p className="text-muted">
                    We couldn't find any routes matching your criteria.
                    <br />
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <p className="text-muted mb-0">
                      {isSearching ? (
                        <small><Spinner animation="border" size="sm" className="me-2" />Searching...</small>
                      ) : (
                        <small>Showing {filteredRoutes.length} routes</small>
                      )}
                    </p>
                  </div>
                  
                  <Row className="g-4">
                    {filteredRoutes.map((route) => (
                      <Col key={route.route_id} lg={6} xl={4}>
                        <RouteCard route={route} />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Container>
        
        <style jsx>{`
          .filter-card {
            border-radius: 12px;
            position: sticky;
            top: 80px;
          }
          
          .search-info-card {
            border-radius: 12px;
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
          
          .route-line {
            width: 2px;
            height: 20px;
            background-color: #ddd;
          }
        `}</style>
      </div>
    </>
  );
};

export default RoutesPage;