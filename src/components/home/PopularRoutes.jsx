// components/home/PopularRoutes.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteCard from '../common/RouteCard';
import api from '../../services/api';

const PopularRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/routes');
        if (response.data.status === 'success') {
          // For demonstration, we'll just take the first 6 routes
          const popularRoutes = response.data.data.slice(0, 6);
          setRoutes(popularRoutes);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <section className="popular-routes py-5 bg-light">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="section-title mb-1">Popular Routes</h2>
            <p className="text-muted">Most frequently traveled daladala routes</p>
          </div>
          
          <Button
            as={Link}
            to="/routes"
            variant="outline-primary"
          >
            View All
          </Button>
        </div>

        <Row className="g-4">
          {loading ? (
            <Col xs={12} className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Col>
          ) : routes.length === 0 ? (
            <Col xs={12} className="text-center py-5">
              <p className="mb-0">No routes found.</p>
            </Col>
          ) : (
            routes.map((route) => (
              <Col key={route.route_id} lg={4} md={6}>
                <RouteCard route={route} />
              </Col>
            ))
          )}
        </Row>
      </Container>
    </section>
  );
};

export default PopularRoutes;