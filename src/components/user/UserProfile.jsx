// components/user/UserProfile.jsx
import { useState } from 'react';
import { Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Edit, Person, Email } from '@mui/icons-material';
import { formatPhoneNumber } from '../../utils/formatters';

const UserProfile = ({ 
  user, 
  onUpdate, 
  loading = false, 
  error, 
  success 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    profile_picture: user?.profile_picture || ''
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const startEditing = () => {
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    // Reset form data to current user data
    setProfileData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      profile_picture: user.profile_picture || ''
    });
    setIsEditing(false);
  };
  
  const saveProfile = () => {
    onUpdate(profileData);
    setIsEditing(false);
  };
  
  return (
    <div className="user-profile">
      {error && (
        <Alert variant="danger" className="mb-4" dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4" dismissible>
          {success}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Personal Information</h4>
        {!isEditing ? (
          <Button 
            variant="outline-primary" 
            className="d-flex align-items-center"
            onClick={startEditing}
          >
            <Edit className="me-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={cancelEditing}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={saveProfile}
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </div>
      
      <Form>
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
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
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
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            value={formatPhoneNumber(user?.phone || '')}
            disabled
          />
          <Form.Text className="text-muted">
            Phone number cannot be changed. Contact support for assistance.
          </Form.Text>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <div className="input-group">
            <div className="input-group-text">
              <Email fontSize="small" />
            </div>
            <Form.Control
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </Form.Group>
      </Form>
    </div>
  );
};

export default UserProfile;