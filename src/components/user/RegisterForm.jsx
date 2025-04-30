// components/user/RegisterForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Person, Phone, Lock, Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { validatePhoneNumber, validateEmail, validatePassword } from '../../utils/validators';

const RegisterForm = ({ onSubmit, loading, error, success }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Remove confirm_password from the data sent to the API
    const { confirm_password, ...registrationData } = formData;
    
    onSubmit(registrationData);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  if (success) {
    return (
      <Alert variant="success" className="mb-4">
        <Alert.Heading>Registration Successful!</Alert.Heading>
        <p>
          Your account has been created successfully. You will be redirected to the login page shortly.
        </p>
      </Alert>
    );
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
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
  );
};

export default RegisterForm;