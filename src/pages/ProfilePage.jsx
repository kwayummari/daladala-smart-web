// pages/ProfilePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Tabs, 
  Tab, 
  Badge, 
  Modal 
} from 'react-bootstrap';
import { 
  Person, 
  Phone, 
  Email, 
  Edit, 
  Lock, 
  DirectionsBus, 
  Receipt, 
  Visibility, 
  VisibilityOff,
  Notifications
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import * as bookingService from '../services/bookingService';
import * as paymentService from '../services/paymentService';
import { formatDate, formatCurrency, formatPhoneNumber } from '../utils/formatters';

const ProfilePage = () => {
  const { currentUser, loading: authLoading, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile_picture: ''
  });
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
    } else if (currentUser) {
      // Set initial profile data from current user
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        profile_picture: currentUser.profile_picture || ''
      });
      
      // Fetch user data based on active tab
      if (activeTab === 'bookings') {
        fetchBookings();
      } else if (activeTab === 'payments') {
        fetchPayments();
      } else if (activeTab === 'notifications') {
        fetchNotifications();
      }
    }
  }, [currentUser, authLoading, navigate, activeTab]);
  
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const bookingsData = await bookingService.getUserBookings();
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const paymentsData = await paymentService.getPaymentHistory();
      setPaymentHistory(paymentsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call for now
      // const notificationsData = await userService.getNotifications();
      // setNotifications(notificationsData);
      
      // Mock data
      setTimeout(() => {
        setNotifications([
          {
            notification_id: 1,
            title: 'Booking Confirmation',
            message: 'Your booking #12345 has been confirmed.',
            type: 'success',
            created_at: new Date(),
            is_read: true
          },
          {
            notification_id: 2,
            title: 'Payment Successful',
            message: 'Your payment of TZS 2,500 for booking #12345 was successful.',
            type: 'success',
            created_at: new Date(Date.now() - 86400000),
            is_read: false
          },
          {
            notification_id: 3,
            title: 'Trip Reminder',
            message: 'Your trip from Kariakoo to Mbezi is scheduled in 30 minutes.',
            type: 'info',
            created_at: new Date(Date.now() - 172800000),
            is_read: false
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications. Please try again later.');
    }
  };
  
  const handleTabSelect = (key) => {
    setActiveTab(key);
  };
  
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear password error when typing
    if (passwordError) {
      setPasswordError(null);
    }
  };
  
  const startEditing = () => {
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    // Reset form data to current user data
    setProfileData({
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email || '',
      profile_picture: currentUser.profile_picture || ''
    });
    setIsEditing(false);
  };
  
  const saveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateProfile(profileData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const changePassword = async () => {
    // Validate passwords
    if (!passwordData.current_password) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordData.new_password) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setPasswordError(null);
    
    try {
      // Mock API call for now
      // await userService.changePassword({
      //   current_password: passwordData.current_password,
      //   new_password: passwordData.new_password
      // });
      
      // Mock success
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccess('Password changed successfully');
        
        // Reset form
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Failed to change password. Please check your current password and try again.');
      setLoading(false);
    }
  };
  
  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock API call for now
      // await userService.deleteAccount();
      
      // Mock success
      setTimeout(() => {
        setShowDeleteConfirm(false);
        logout();
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again later.');
      setLoading(false);
    }
  };
  
  // If loading auth, show spinner
  if (authLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading...</p>
      </Container>
    );
  }
  
  // Return empty div if user is not authenticated (will redirect)
  if (!currentUser) {
    return <div></div>;
  }

  return (
    <>
      <Helmet>
        <title>My Profile | Daladala Smart</title>
        <meta name="description" content="Manage your profile, bookings, and payments on Daladala Smart." />
      </Helmet>
      
      <div className="profile-page py-5">
        <Container>
          <div className="mb-4">
            <h1 className="mb-2">My Profile</h1>
            <p className="text-muted">Manage your account, bookings, and payments</p>
          </div>
          
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          
          <Row>
            <Col lg={3} className="mb-4 mb-lg-0">
              <Card className="shadow-sm profile-sidebar">
                <Card.Body className="p-0">
                  <div className="profile-header p-4 text-center">
                    <div className="avatar-wrapper mb-3">
                      {currentUser.profile_picture ? (
                        <img 
                          src={currentUser.profile_picture} 
                          alt={`${currentUser.first_name} ${currentUser.last_name}`}
                          className="avatar rounded-circle"
                        />
                      ) : (
                        <div className="avatar-placeholder rounded-circle">
                          {currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h5 className="mb-1">{currentUser.first_name} {currentUser.last_name}</h5>
                    <p className="text-muted mb-0">{formatPhoneNumber(currentUser.phone)}</p>
                  </div>
                  
                  <hr className="my-0" />
                  
                  <div className="sidebar-menu p-2">
                    <div 
                      className={`menu-item d-flex align-items-center p-3 ${activeTab === 'profile' ? 'active' : ''}`}
                      onClick={() => handleTabSelect('profile')}
                    >
                      <Person className="me-3" />
                      <span>Profile</span>
                    </div>
                    <div 
                      className={`menu-item d-flex align-items-center p-3 ${activeTab === 'bookings' ? 'active' : ''}`}
                      onClick={() => handleTabSelect('bookings')}
                    >
                      <DirectionsBus className="me-3" />
                      <span>My Bookings</span>
                    </div>
                    <div 
                      className={`menu-item d-flex align-items-center p-3 ${activeTab === 'payments' ? 'active' : ''}`}
                      onClick={() => handleTabSelect('payments')}
                    >
                      <Receipt className="me-3" />
                      <span>Payment History</span>
                    </div>
                    <div 
                      className={`menu-item d-flex align-items-center p-3 ${activeTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => handleTabSelect('notifications')}
                    >
                      <Notifications className="me-3" />
                      <span>Notifications</span>
                      <Badge bg="danger" className="ms-auto">
                        {notifications.filter(n => !n.is_read).length}
                      </Badge>
                    </div>
                  </div>
                  
                  <hr className="my-0" />
                  
                  <div className="p-3">
                    <Button 
                      variant="outline-danger" 
                      className="w-100"
                      onClick={() => logout()}
                    >
                      Log Out
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={9}>
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  {activeTab === 'profile' && (
                    <div className="profile-tab">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Personal Information</h3>
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
                              <Form.Control
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleProfileInputChange}
                                disabled={!isEditing}
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleProfileInputChange}
                                disabled={!isEditing}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            value={formatPhoneNumber(currentUser.phone)}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Phone number cannot be changed. Contact support for assistance.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileInputChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                        
                        <hr className="my-4" />
                        
                        <div className="security-section">
                          <h4 className="mb-3">Security</h4>
                          
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <h5 className="mb-1">Password</h5>
                              <p className="text-muted mb-0">
                                Change your password regularly for better security
                              </p>
                            </div>
                            <Button 
                              variant="outline-primary"
                              onClick={() => setShowChangePassword(true)}
                            >
                              Change Password
                            </Button>
                          </div>
                          
                          <hr className="my-4" />
                          
                          <div className="danger-zone">
                            <h4 className="text-danger mb-3">Danger Zone</h4>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1">Delete Account</h5>
                                <p className="text-muted mb-0">
                                  Once you delete your account, there is no going back
                                </p>
                              </div>
                              <Button 
                                variant="danger"
                                onClick={() => setShowDeleteConfirm(true)}
                              >
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    </div>
                  )}
                  
                  {activeTab === 'bookings' && (
                    <div className="bookings-tab">
                      <h3 className="mb-4">My Bookings</h3>
                      
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted">Loading bookings...</p>
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-5">
                          <DirectionsBus style={{ fontSize: 48 }} className="text-muted mb-3" />
                          <h4>No Bookings Found</h4>
                          <p className="text-muted">
                            You haven't made any bookings yet.
                          </p>
                          <Button 
                            variant="primary" 
                            onClick={() => navigate('/routes')}
                          >
                            Book a Trip
                          </Button>
                        </div>
                      ) : (
                        <div className="bookings-list">
                          <Tabs
                            defaultActiveKey="all"
                            className="mb-4"
                          >
                            <Tab eventKey="all" title="All Bookings">
                              {/* All bookings content */}
                            </Tab>
                            <Tab eventKey="upcoming" title="Upcoming">
                              {/* Upcoming bookings content */}
                            </Tab>
                            <Tab eventKey="completed" title="Completed">
                              {/* Completed bookings content */}
                            </Tab>
                            <Tab eventKey="cancelled" title="Cancelled">
                              {/* Cancelled bookings content */}
                            </Tab>
                          </Tabs>
                          
                          {/* Bookings list would go here */}
                          <p className="text-muted text-center">
                            Bookings list will be displayed here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'payments' && (
                    <div className="payments-tab">
                      <h3 className="mb-4">Payment History</h3>
                      
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted">Loading payment history...</p>
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-5">
                          <Receipt style={{ fontSize: 48 }} className="text-muted mb-3" />
                          <h4>No Payments Found</h4>
                          <p className="text-muted">
                            You haven't made any payments yet.
                          </p>
                        </div>
                      ) : (
                        <div className="payments-list">
                          {/* Payments list would go here */}
                          <p className="text-muted text-center">
                            Payment history will be displayed here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'notifications' && (
                    <div className="notifications-tab">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Notifications</h3>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                        >
                          Mark All as Read
                        </Button>
                      </div>
                      
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted">Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-5">
                          <Notifications style={{ fontSize: 48 }} className="text-muted mb-3" />
                          <h4>No Notifications</h4>
                          <p className="text-muted">
                            You don't have any notifications yet.
                          </p>
                        </div>
                      ) : (
                        <div className="notifications-list">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.notification_id} 
                              className={`notification-item p-3 mb-3 rounded ${!notification.is_read ? 'unread' : ''}`}
                            >
                              <div className="d-flex">
                                <div className={`notification-icon me-3 ${notification.type}`}>
                                  {notification.type === 'success' && <CheckCircleOutline />}
                                  {notification.type === 'info' && <Info />}
                                  {notification.type === 'warning' && <Warning />}
                                </div>
                                <div className="notification-content">
                                  <h5 className="mb-1">{notification.title}</h5>
                                  <p className="mb-1">{notification.message}</p>
                                  <small className="text-muted">
                                    {formatDate(notification.created_at, true)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        
        {/* Change Password Modal */}
        <Modal 
          show={showChangePassword} 
          onHide={() => setShowChangePassword(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {passwordError && (
              <Alert variant="danger" className="mb-3">
                {passwordError}
              </Alert>
            )}
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    name="current_password"
                    placeholder="Enter your current password"
                    value={passwordData.current_password}
                    onChange={handlePasswordInputChange}
                  />
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    name="new_password"
                    placeholder="Enter your new password"
                    value={passwordData.new_password}
                    onChange={handlePasswordInputChange}
                  />
                </div>
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Confirm your new password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordInputChange}
                  />
                </div>
              </Form.Group>
              
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  id="show-passwords"
                  label="Show passwords"
                  checked={showPasswords}
                  onChange={() => setShowPasswords(!showPasswords)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowChangePassword(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={changePassword}
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
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Delete Account Confirmation Modal */}
        <Modal 
          show={showDeleteConfirm} 
          onHide={() => setShowDeleteConfirm(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <p className="fw-bold">
              Type "DELETE" to confirm:
            </p>
            <Form.Control
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mb-3"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={deleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || loading}
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
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
        
        <style jsx>{`
          .profile-sidebar {
            border-radius: 12px;
          }
          
          .avatar-wrapper {
            width: 80px;
            height: 80px;
            margin: 0 auto;
          }
          
          .avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .avatar-placeholder {
            width: 100%;
            height: 100%;
            background-color: var(--primary-color);
            color: white;
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .menu-item {
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .menu-item:hover {
            background-color: #f8f9fa;
          }
          
          .menu-item.active {
            background-color: var(--primary-color);
            color: white;
          }
          
          .menu-item.active svg {
            color: white;
          }
          
          .notification-item {
            border: 1px solid #eee;
            transition: all 0.2s ease;
          }
          
          .notification-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          }
          
          .notification-item.unread {
            border-left: 4px solid var(--primary-color);
            background-color: rgba(var(--bs-primary-rgb), 0.05);
          }
          
          .notification-icon {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .notification-icon.success {
            background-color: rgba(var(--bs-success-rgb), 0.1);
            color: var(--success-color);
          }
          
          .notification-icon.info {
            background-color: rgba(var(--bs-info-rgb), 0.1);
            color: var(--info-color);
          }
          
          .notification-icon.warning {
            background-color: rgba(var(--bs-warning-rgb), 0.1);
            color: var(--warning-color);
          }
          
          .notification-content {
            flex-grow: 1;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProfilePage;