// components/routes/RouteMap.jsx
import { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as routeService from '../../services/routeService';

// Fix Leaflet marker icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const RouteMap = ({ routeId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stops, setStops] = useState([]);
  const [route, setRoute] = useState(null);
  
  useEffect(() => {
    const fetchRouteData = async () => {
      if (!routeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch route details
        const routeData = await routeService.getRouteById(routeId);
        setRoute(routeData);
        
        // Fetch route stops
        const stopsData = await routeService.getRouteStops(routeId);
        setStops(stopsData);
      } catch (err) {
        console.error('Error fetching route data:', err);
        setError('Failed to load route data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRouteData();
  }, [routeId]);
  
  // Generate polyline for the route
  const generatePolyline = () => {
    if (!stops || stops.length < 2) return [];
    
    return stops.map(stop => [
      parseFloat(stop.latitude),
      parseFloat(stop.longitude)
    ]);
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading map data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">{error}</Alert>
    );
  }
  
  if (!route || stops.length === 0) {
    return (
      <Alert variant="warning">No map data available for this route.</Alert>
    );
  }

  return (
    <div className="route-map">
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
    </div>
  );
};

export default RouteMap;