// pages/RegisterPage.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Person, Phone, Lock, Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { validatePhoneNumber, validateEmail, validatePassword } from '../utils/validators';

const RegisterPage = () => {
  const { currentUser, register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Validate required fields
    ['first_name', 'last_name', 'phone', 'password', 'confirm_password'].forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    
    // Validate phone
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      errors.phone = 'Enter a valid Tanzanian phone number';
    }
    
    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    
    // Validate password
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    // Check if passwords match
    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Remove confirm_password from the data sent to the API
      const { confirm_password, ...registrationData } = formData;
      
      // Call register method from authService
      await authService.register(registrationData);
      
      // Show success message
      setSuccess(true);
      
      // Clear form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
      });
      
      // Automatically redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
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
        <title>Register | Daladala Smart</title>
        <meta name="description" content="Create a new Daladala Smart account to book and manage your daladala trips." />
      </Helmet>
      
      <div className="register-page py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={7} xl={6}>
              <div className="text-center mb-4">
                <img 
                  src="/images/logo.svg" 
                  alt="Daladala Smart" 
                  height="50" 
                  className="mb-3" 
                />
                <h1 className="mb-1">Create an Account</h1>
                <p className="text-muted">Join Daladala Smart to book and manage your trips</p>
              </div>
              
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                                  )}
      {success && (
                    <Alert variant="success" className="mb-4">
                      <Alert.Heading>Registration Successful!</Alert.Heading>
                      <p>
                        Your account has been created successfully. You will be redirected to the login page shortly.
                      </p>
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <div className="input-group">
                            <div className="input-group-text">
                              <Person fontSize="small" />
                            </div>
                            <Form.Control
                              type="text"
                              name="first_name"
                              placeholder="Enter your first name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              isInvalid={!!validationErrors.first_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {validationErrors.first_name}
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <div className="input-group">
                            <div className="input-group-text">
                              <Person fontSize="small" />
                            </div>
                            <Form.Control
                              type="text"
                              name="last_name"
                              placeholder="Enter your last name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              isInvalid={!!validationErrors.last_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {validationErrors.last_name}
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Phone fontSize="small" />
                        </div>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.phone}
                        </Form.Control.Feedback>
                      </div>
                      <Form.Text className="text-muted">
                        e.g. 0712345678 or +255712345678
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address (Optional)</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Email fontSize="small" />
                        </div>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.email}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Lock fontSize="small" />
                        </div>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.password}
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
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.password}
                        </Form.Control.Feedback>
                      </div>
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group">
                        <div className="input-group-text">
                          <Lock fontSize="small" />
                        </div>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="confirm_password"
                          placeholder="Confirm your password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.confirm_password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.confirm_password}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="terms-agreement"
                        label={
                          <span>
                            I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                          </span>
                        }
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg" 
                      className="w-100 mb-4"
                      disabled={loading || success}
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
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-medium">
                          Log In
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

export default RegisterPage;