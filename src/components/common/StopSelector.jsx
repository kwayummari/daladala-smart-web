// components/common/StopSelector.jsx
import { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { Search, LocationOn } from '@mui/icons-material';
import api from '../../services/api';

const StopSelector = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  excludeStopId = null,
  routeId = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (value) {
      setSearchTerm(value.stop_name || '');
    } else {
      setSearchTerm('');
    }
  }, [value]);

  const searchStops = async (query) => {
    if (!query.trim()) {
      setStops([]);
      return;
    }

    setLoading(true);
    try {
      let endpoint = `/stops/search?query=${encodeURIComponent(query)}`;
      
      if (routeId) {
        endpoint = `/routes/${routeId}/stops`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data.status === 'success') {
        let filteredStops = response.data.data;
        
        // Filter out the excluded stop
        if (excludeStopId) {
          filteredStops = filteredStops.filter(stop => stop.stop_id !== excludeStopId);
        }
        
        setStops(filteredStops);
      }
    } catch (error) {
      console.error('Error searching stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowDropdown(true);
    
    if (query.length >= 2) {
      searchStops(query);
    } else {
      setStops([]);
    }
  };

  const handleStopSelect = (stop) => {
    setSearchTerm(stop.stop_name);
    setShowDropdown(false);
    onChange(stop);
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
      searchStops(searchTerm);
    }
  };

  return (
    <div className="stop-selector position-relative">
      <Form.Group className="mb-3">
        {label && <Form.Label>{label}</Form.Label>}
        <div className="position-relative">
          <Form.Control
            type="text"
            placeholder={placeholder || "Search for a stop..."}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            autoComplete="off"
            className="pe-5"
          />
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Search fontSize="small" color="action" />
            )}
          </div>
        </div>
      </Form.Group>

      {showDropdown && stops.length > 0 && (
        <ListGroup className="position-absolute w-100 shadow-sm z-1000">
          {stops.map((stop) => (
            <ListGroup.Item 
              key={stop.stop_id}
              action
              onClick={() => handleStopSelect(stop)}
              className="d-flex align-items-center py-2"
            >
              <LocationOn fontSize="small" className="me-2 text-primary" />
              <div>
                <p className="mb-0 fw-medium">{stop.stop_name}</p>
                {stop.address && <small className="text-muted">{stop.address}</small>}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default StopSelector;