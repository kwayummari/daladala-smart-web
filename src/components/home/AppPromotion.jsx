// components/home/AppPromotion.jsx
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CheckCircle, Android, Apple } from '@mui/icons-material';

const AppPromotion = () => {
  const features = [
    'Real-time tracking of your daladala',
    'Book and pay for trips in advance',
    'Save favorite routes and stops',
    'Receive notifications for trip updates',
    'Find the best routes to your destination',
    'View driver and vehicle information'
  ];

  return (
    <section className="app-promotion py-5">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-5 mb-lg-0">
            <h2 className="section-title mb-4">Download Our Mobile App</h2>
            <p className="lead mb-4">
              Get the full Daladala Smart experience on your smartphone. Our mobile app provides enhanced features for the best travel experience.
            </p>
            
            <ul className="feature-list mb-4">
              {features.map((feature, index) => (
                <li key={index} className="d-flex align-items-center mb-3">
                  <CheckCircle className="text-success me-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="d-flex flex-wrap gap-3">
              <Button 
                variant="dark" 
                size="lg" 
                className="d-flex align-items-center"
                as="a"
                href="#"
              >
                <Android className="me-2" />
                Google Play
              </Button>
              
              <Button 
                variant="dark" 
                size="lg" 
                className="d-flex align-items-center"
                as="a"
                href="#"
              >
                <Apple className="me-2" />
                App Store
              </Button>
            </div>
          </Col>
          
          <Col lg={6}>
            <div className="app-screenshot-wrapper">
              <img 
                src="/images/app-screenshot.png" 
                alt="Daladala Smart Mobile App" 
                className="app-screenshot img-fluid" 
              />
            </div>
          </Col>
        </Row>
      </Container>
      
      <style jsx>{`
        .app-promotion {
          background-color: #f8f9fa;
          position: relative;
          overflow: hidden;
        }
        
        .feature-list {
          list-style: none;
          padding-left: 0;
        }
        
        .app-screenshot-wrapper {
          position: relative;
          text-align: center;
        }
        
        .app-screenshot {
          max-width: 80%;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 992px) {
          .app-screenshot {
            max-width: 60%;
          }
        }
      `}</style>
    </section>
  );
};

export default AppPromotion;