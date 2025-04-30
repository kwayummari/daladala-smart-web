// pages/LoginPage.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Lock, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { validatePhoneNumber } from '../utils/validators';

const LoginPage = () => {
  const { currentUser, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [currentUser, navigate, location]);
  
  const validateForm = () => {
    let isValid = true;
    setPhoneError('');
    
    if (!phone) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (!validatePhoneNumber(phone)) {
      setPhoneError('Enter a valid Tanzanian phone number');
      isValid = false;
    }
    
    if (!password) {
      setError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call login method from AuthContext
      await login(phone, password);
      
      // Redirect to previous page or home
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>Login | Daladala Smart</title>
        <meta name="description" content="Log in to your Daladala Smart account to book trips and manage your bookings." />
      </Helmet>
      
      <div className="login-page py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                <img 
                  src="/images/logo.svg" 
                  alt="Daladala Smart" 
                  height="50" 
                  className="mb-3" 
                />
                <h1 className="mb-1">Welcome Back</h1>
                <p className="text-muted">Log in to your account to continue</p>
              </div>
              
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Phone fontSize="small" />
                        </div>
                        <Form.Control
                          type="tel"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          isInvalid={!!phoneError}
                        />
                        <Form.Control.Feedback type="invalid">
                          {phoneError}
                        </Form.Control.Feedback>
                      </div>
                      <Form.Text className="text-muted">
                        e.g. 0712345678 or +255712345678
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Lock fontSize="small" />
                        </div>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={toggleShowPassword}
                          tabIndex="-1"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        id="remember-me"
                        label="Remember me"
                      />
                      <Link to="/forgot-password" className="text-decoration-none">
                        Forgot Password?
                      </Link>
                    </div>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg" 
                      className="w-100 mb-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Logging in...
                        </>
                      ) : (
                        'Log In'
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="mb-0">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-decoration-none fw-medium">
                          Sign Up
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default LoginPage;