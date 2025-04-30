// components/home/HeroSection.jsx
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowForward, Download } from '@mui/icons-material';
import SearchBar from '../common/SearchBar';

const HeroSection = () => {
  return (
    <section className="hero-section position-relative">
      <div className="hero-bg"></div>
      <Container className="py-5">
        <Row className="py-md-5 align-items-center">
          <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0">
            <h1 className="display-4 fw-bold text-white mb-3">
              Modernizing Public Transport in Tanzania
            </h1>
            <p className="lead text-white-75 mb-4">
              Track, book, and pay for your daladala rides easily. Say goodbye to waiting and uncertainty.
            </p>
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 mt-4">
              <Button as={Link} to="/routes" size="lg" variant="primary" className="d-flex align-items-center">
                Explore Routes
                <ArrowForward className="ms-2" />
              </Button>
              <Button as={Link} to="/booking" size="lg" variant="outline-light" className="d-flex align-items-center">
                Book a Trip
              </Button>
            </div>
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-2 mt-4">
              <a href="#" className="text-white text-decoration-none">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  height="40" 
                />
              </a>
              <a href="#" className="text-white text-decoration-none">
                <img 
                  src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  height="40" 
                />
              </a>
            </div>
          </Col>
          <Col lg={6}>
            <div className="search-container bg-white rounded-4 p-4 shadow">
              <h3 className="text-center mb-4">Find Your Route</h3>
              <SearchBar />
            </div>
          </Col>
        </Row>
      </Container>
      
      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: 600px;
          padding-top: 60px;
          padding-bottom: 60px;
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/hero-banner.png');
          background-size: cover;
          background-position: center;
          z-index: -1;
        }
        
        .text-white-75 {
          color: rgba(255, 255, 255, 0.75);
        }
        
        .search-container {
          transform: translateY(0);
          transition: transform 0.3s ease;
        }
        
        @media (max-width: 992px) {
          .hero-section {
            min-height: auto;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;