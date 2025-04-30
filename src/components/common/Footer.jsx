// components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Facebook, Twitter, Instagram, Phone, Email, LocationOn } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-4 mb-md-0">
            <img 
              src="/images/logo.svg" 
              alt="Daladala Smart" 
              height="40" 
              className="mb-3" 
            />
            <p className="text-light">
              Modernizing public transportation in Tanzania with real-time tracking, 
              digital payments, and a seamless booking experience.
            </p>
            <div className="d-flex mt-3">
              <a href="https://facebook.com" className="text-white me-3" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="https://twitter.com" className="text-white me-3" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="https://instagram.com" className="text-white" aria-label="Instagram">
                <Instagram />
              </a>
            </div>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/routes" className="text-light">Routes</Link>
              </li>
              <li className="mb-2">
                <Link to="/booking" className="text-light">Book a Trip</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-light">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-light">Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Contact Us</h5>
            <address className="text-light">
              <p className="d-flex align-items-center mb-2">
                <LocationOn className="me-2" fontSize="small" />
                123 Samora Ave, Dar es Salaam
              </p>
              <p className="d-flex align-items-center mb-2">
                <Phone className="me-2" fontSize="small" />
                +255 755 123 456
              </p>
              <p className="d-flex align-items-center">
                <Email className="me-2" fontSize="small" />
                info@daladasmart.co.tz
              </p>
            </address>
          </Col>
          
          <Col md={3}>
            <h5 className="mb-3">Download App</h5>
            <p className="text-light mb-3">
              Get the full experience with our mobile app
            </p>
            <div className="d-flex flex-column">
              <a href="#" className="mb-2">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  height="40" 
                />
              </a>
              <a href="#">
                <img 
                  src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  height="40" 
                />
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="bg-secondary" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="text-light mb-0">
              &copy; {currentYear} Daladala Smart. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/terms" className="text-light">Terms of Service</Link>
              </li>
              <li className="list-inline-item mx-3">
                <Link to="/privacy" className="text-light">Privacy Policy</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/faq" className="text-light">FAQ</Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
