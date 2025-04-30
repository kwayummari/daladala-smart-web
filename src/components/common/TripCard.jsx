// components/common/TripCard.jsx
import { useState } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { AccessTime, DirectionsBus, Person, Star } from '@mui/icons-material';
import { formatTime, formatDate } from '../../utils/formatters';

const TripCard = ({ trip, onSelect, selected }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleDetails = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelectTrip = () => {
    onSelect(trip);
  };

  return (
    <Card 
      className={`trip-card mb-3 shadow-sm ${selected ? 'border-primary' : ''}`}
      onClick={handleSelectTrip}
    >
      <Card.Body>
        <Row>
          <Col xs={12} md={8}>
            <div className="d-flex align-items-center mb-3">
              <Badge 
                bg={trip.status === 'in_progress' ? 'success' : 'primary'} 
                className="me-2"
              >
                {trip.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
              </Badge>
              <div className="small text-muted">
                {formatDate(trip.start_time)}
              </div>
            </div>

            <div className="d-flex align-items-center mb-3">
              <DirectionsBus className="text-primary me-2" />
              <div>
                <div className="fw-bold">{trip.Route.route_name}</div>
                <div className="text-muted small">{trip.Route.route_number}</div>
              </div>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <div className="text-center">
                <div className="fw-bold">{formatTime(trip.start_time)}</div>
                <div className="small text-muted">Departure</div>
              </div>
              
              <div className="d-flex align-items-center flex-grow-1 px-3">
                <div className="trip-line position-relative">
                  <div className="trip-dot start"></div>
                  <div className="trip-dot end"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="fw-bold">
                  {trip.end_time ? formatTime(trip.end_time) : 'TBD'}
                </div>
                <div className="small text-muted">Arrival</div>
              </div>
            </div>
          </Col>

          <Col xs={12} md={4} className="d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-md-end mb-3 mb-md-0">
              <div className="vehicle-info me-3">
                <div className="text-muted small">Vehicle</div>
                <div className="fw-medium">{trip.Vehicle.plate_number}</div>
              </div>
              <div className={`vehicle-tag ${trip.Vehicle.vehicle_type}`}>
                {trip.Vehicle.vehicle_type.charAt(0).toUpperCase() + trip.Vehicle.vehicle_type.slice(1)}
              </div>
            </div>

            <div className="d-flex justify-content-between justify-content-md-end align-items-center mt-3">
              <Button 
                variant="outline-primary"
                size="sm"
                onClick={handleToggleDetails}
                className="me-2 me-md-0"
              >
                {expanded ? 'Hide Details' : 'View Details'}
              </Button>
            </div>
          </Col>
        </Row>

        {expanded && (
          <div className="trip-details mt-4 pt-4 border-top">
            <Row>
              <Col md={6}>
                <h6 className="mb-3">Vehicle Details</h6>
                <div className="d-flex mb-2">
                  <div className="text-muted me-4" style={{ width: '100px' }}>Type:</div>
                  <div className="fw-medium">{trip.Vehicle.vehicle_type}</div>
                </div>
                <div className="d-flex mb-2">
                  <div className="text-muted me-4" style={{ width: '100px' }}>Color:</div>
                  <div className="fw-medium">{trip.Vehicle.color}</div>
                </div>
                <div className="d-flex mb-2">
                  <div className="text-muted me-4" style={{ width: '100px' }}>Capacity:</div>
                  <div className="fw-medium">
                    <Person fontSize="small" className="me-1" />
                    {trip.Vehicle.capacity} seats
                  </div>
                </div>
                <div className="d-flex">
                  <div className="text-muted me-4" style={{ width: '100px' }}>Features:</div>
                  <div>
                    {trip.Vehicle.is_air_conditioned ? (
                      <Badge bg="success" className="me-1">AC</Badge>
                    ) : null}
                  </div>
                </div>
              </Col>

              <Col md={6} className="mt-3 mt-md-0">
                <h6 className="mb-3">Driver Details</h6>
                {trip.Driver ? (
                  <>
                    <div className="d-flex align-items-center mb-3">
                      <div className="driver-avatar me-3">
                        {trip.Driver.User.profile_picture ? (
                          <img 
                            src={trip.Driver.User.profile_picture} 
                            alt={`${trip.Driver.User.first_name} ${trip.Driver.User.last_name}`}
                            className="rounded-circle"
                            width="40"
                            height="40"
                          />
                        ) : (
                          <div className="driver-placeholder rounded-circle">
                            {trip.Driver.User.first_name.charAt(0)}
                            {trip.Driver.User.last_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="fw-medium">
                          {trip.Driver.User.first_name} {trip.Driver.User.last_name}
                        </div>
                        <div className="d-flex align-items-center">
                          <Star className="text-warning" fontSize="small" />
                          <span className="ms-1">{trip.Driver.rating.toFixed(1)}</span>
                          <span className="text-muted ms-1">({trip.Driver.total_ratings})</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted">Driver information not available</div>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>

      <style jsx>{`
        .trip-card {
          cursor: pointer;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .trip-card:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
        
        .trip-line {
          height: 2px;
          background-color: #ddd;
          width: 100%;
        }
        
        .trip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .trip-dot.start {
          left: 0;
          background-color: var(--primary-color);
        }
        
        .trip-dot.end {
          right: 0;
          background-color: var(--secondary-color);
        }
        
        .vehicle-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .vehicle-tag.daladala {
          background-color: #ffebee;
          color: #d32f2f;
        }
        
        .vehicle-tag.bus {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .vehicle-tag.minibus {
          background-color: #e8f5e9;
          color: #388e3c;
        }
        
        .driver-placeholder {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-light);
          color: white;
          font-weight: bold;
        }
      `}</style>
    </Card>
  );
};

export default TripCard;