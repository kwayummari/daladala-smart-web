// components/common/RouteCard.jsx
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { AccessTime, ArrowForward, Star } from '@mui/icons-material';

const RouteCard = ({ route }) => {
  return (
    <Card className="route-card h-100 shadow-sm transition-all hover-lift">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Badge bg="primary" className="px-3 py-2 fw-normal">
            {route.route_number}
          </Badge>
          <div className="text-warning d-flex align-items-center">
            <Star fontSize="small" />
            <span className="ms-1">4.5</span>
          </div>
        </div>
        
        <Card.Title className="mb-3">{route.route_name}</Card.Title>
        
        <div className="d-flex flex-column mb-3">
          <div className="d-flex align-items-start mb-2">
            <div className="route-point start-point me-2">A</div>
            <div>
              <p className="mb-0 fw-bold">{route.start_point}</p>
            </div>
          </div>
          
          <div className="route-line my-1 ms-2"></div>
          
          <div className="d-flex align-items-start">
            <div className="route-point end-point me-2">B</div>
            <div>
              <p className="mb-0 fw-bold">{route.end_point}</p>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex align-items-center text-muted">
            <AccessTime fontSize="small" className="me-1" />
            <span>{Math.round(route.estimated_time_minutes / 60)} hr {route.estimated_time_minutes % 60} min</span>
          </div>
          <div className="text-muted">
            {route.distance_km} km
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-white border-top-0">
        <Link 
          to={`/routes/${route.route_id}`} 
          className="d-flex justify-content-between align-items-center text-decoration-none"
        >
          <span className="text-primary fw-bold">View Details</span>
          <ArrowForward className="text-primary" />
        </Link>
      </Card.Footer>
      
      <style jsx>{`
        .route-card {
          border-radius: 12px;
          border: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
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
    </Card>
  );
};

export default RouteCard;