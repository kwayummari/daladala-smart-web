// components/user/LoginForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Lock, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { validatePhoneNumber } from '../../utils/validators';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
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
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({ phone, password });
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
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
  );
};

export default LoginForm;