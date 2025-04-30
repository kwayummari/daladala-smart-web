// components/common/SearchBar.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { Search } from '@mui/icons-material';
import StopSelector from './StopSelector';
import { BookingContext } from '../../contexts/BookingContext';

const SearchBar = ({ variant = "default" }) => {
  const navigate = useNavigate();
  const { setPickupStop, setDropoffStop } = useContext(BookingContext);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (pickup && dropoff) {
      setPickupStop(pickup);
      setDropoffStop(dropoff);
      
      navigate('/routes', { 
        state: { 
          fromSearch: true,
          pickup,
          dropoff
        } 
      });
    }
  };

  return (
    <div className={`search-bar ${variant === 'compact' ? 'search-bar-compact' : ''}`}>
      <Form onSubmit={handleSearch}>
        <Row className="g-3">
          <Col xs={12} md={variant === 'compact' ? 4 : 5}>
            <StopSelector
              label={variant === 'compact' ? "" : "Pickup Location"}
              placeholder="Enter pickup location"
              value={pickup}
              onChange={setPickup}
              excludeStopId={dropoff?.stop_id}
            />
          </Col>
          
          <Col xs={12} md={variant === 'compact' ? 4 : 5}>
            <StopSelector
              label={variant === 'compact' ? "" : "Destination"}
              placeholder="Enter destination"
              value={dropoff}
              onChange={setDropoff}
              excludeStopId={pickup?.stop_id}
            />
          </Col>
          
          <Col xs={12} md={variant === 'compact' ? 4 : 2} className="d-flex align-items-end">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-100"
              disabled={!pickup || !dropoff}
            >
              <Search className={variant === 'compact' ? "" : "me-2"} />
              {variant === 'compact' ? "" : "Search"}
            </Button>
          </Col>
        </Row>
      </Form>
      
      <style jsx>{`
        .search-bar {
          background-color: white;
          border-radius: 12px;
          padding: ${variant === 'compact' ? '12px' : '24px'};
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .search-bar-compact {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;