// components/routes/RouteDetails.jsx
import { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { AccessTime, DirectionsBus } from '@mui/icons-material';
import * as routeService from '../../services/routeService';

const RouteDetails = ({ routeId, onLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  
  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (!routeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const routeData = await routeService.getRouteById(routeId);
        setRoute(routeData);
        
        // Call onLoad callback with route data
        if (onLoad) {
          onLoad(routeData);
        }
      } catch (err) {
        console.error('Error fetching route details:', err);
        setError('Failed to load route details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRouteDetails();
  }, [routeId, onLoad]);
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading route details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">{error}</Alert>
    );
  }
  
  if (!route) {
    return (
      <Alert variant="warning">Route not found.</Alert>
    );
  }

  return (
    <div className="route-details">
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
                  <div className="detail-value">
                    <AccessTime fontSize="small" className="me-1 text-muted" />
                    {Math.round(route.estimated_time_minutes / 60)} hr {route.estimated_time_minutes % 60} min
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="detail-item">
                  <div className="detail-label">Vehicle Type</div>
                  <div className="detail-value">
                    <DirectionsBus fontSize="small" className="me-1 text-muted" />
                    Daladala, Bus
                  </div>
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
      // components/routes/RouteDetails.jsx (continued)
        .detail-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 4px;
        }
        
        .detail-value {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default RouteDetails;