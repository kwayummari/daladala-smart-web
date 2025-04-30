// components/home/QuickSearch.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { ArrowForward, DirectionsBus, LocationOn, Schedule } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const QuickSearch = () => {
  const [popularStops, setPopularStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularStops = async () => {
      try {
        // In a real application, you'd have an endpoint for popular stops
        // For now we'll just fetch all stops and take the first few
        const response = await api.get('/stops');
        if (response.data.status === 'success') {
          // We'll pretend these are the popular stops
          const stops = response.data.data.slice(0, 6);
          setPopularStops(stops);
        }
      } catch (error) {
        console.error('Error fetching popular stops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularStops();
  }, []);

  return (
    <section className="quick-search py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title mb-3">Quick Search</h2>
          <p className="text-muted">Explore popular stops and routes in Dar es Salaam</p>
        </div>

        <Row className="g-4">
          <Col lg={4} md={6}>
            <Card className="h-100 popular-card shadow-sm hover-lift">
              <Card.Body>
                <div className="icon-wrapper bg-primary-light mb-4">
                  <DirectionsBus className="text-primary" />
                </div>
                <h3 className="card-title h5 mb-3">All Routes</h3>
                <p className="text-muted mb-4">
                  Explore all available daladala routes across the city.
                </p>
                <Link to="/routes" className="d-flex align-items-center text-primary">
                  View All Routes
                  <ArrowForward className="ms-2" fontSize="small" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6}>
            <Card className="h-100 popular-card shadow-sm hover-lift">
              <Card.Body>
                <div className="icon-wrapper bg-warning-light mb-4">
                  <Schedule className="text-warning" />
                </div>
                <h3 className="card-title h5 mb-3">Today's Schedule</h3>
                <p className="text-muted mb-4">
                  Check the daladala schedule for today's trips.
                </p>
                <Link to="/booking" className="d-flex align-items-center text-primary">
                  View Schedule
                  <ArrowForward className="ms-2" fontSize="small" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6}>
            <Card className="h-100 popular-card shadow-sm hover-lift">
              <Card.Body>
                <div className="icon-wrapper bg-success-light mb-4">
                  <LocationOn className="text-success" />
                </div>
                <h3 className="card-title h5 mb-3">Nearby Stops</h3>
                <p className="text-muted mb-4">
                  Find daladala stops near your current location.
                </p>
                <Link to="/stops" className="d-flex align-items-center text-primary">
                  Find Nearby
                  <ArrowForward className="ms-2" fontSize="small" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-5 pt-3">
          <h3 className="h4 mb-4">Popular Stops</h3>
          <Row className="g-3">
            {loading ? (
              <Col xs={12} className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            ) : (
              popularStops.map((stop) => (
                <Col key={stop.stop_id} md={4} sm={6}>
                  <Link 
                    to={`/stops/${stop.stop_id}`} 
                    className="text-decoration-none"
                  >
                    <div className="stop-card p-3 rounded bg-white shadow-sm d-flex align-items-center">
                      <div className="stop-icon me-3">
                        <LocationOn className="text-primary" />
                      </div>
                      <div>
                        <h4 className="h6 mb-0">{stop.stop_name}</h4>
                        {stop.address && (
                          <p className="text-muted small mb-0">{stop.address}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </Col>
              ))
            )}
          </Row>
        </div>
      </Container>
      
      <style jsx>{`
        .popular-card {
          border-radius: 12px;
          border: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .bg-primary-light {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
        }
        
        .bg-warning-light {
          background-color: rgba(var(--bs-warning-rgb), 0.1);
        }
        
        .bg-success-light {
          background-color: rgba(var(--bs-success-rgb), 0.1);
        }
        
        .stop-card {
          transition: transform 0.2s ease;
        }
        
        .stop-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>
    </section>
  );
};

export default QuickSearch;