// pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Home, Search } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Daladala Smart</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      
      <div className="not-found-page py-5">
        <Container className="text-center">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Daladala Smart" 
                  height="50" 
                  className="mb-4" 
                />
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <h2 className="mb-3">Page Not Found</h2>
                <p className="text-muted mb-4">
                  Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
              </div>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  size="lg" 
                  className="d-flex align-items-center justify-content-center"
                >
                  <Home className="me-2" />
                  Go Home
                </Button>
                
                <Button 
                  as={Link} 
                  to="/routes" 
                  variant="outline-primary" 
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  <Search className="me-2" />
                  Find Routes
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default NotFoundPage;