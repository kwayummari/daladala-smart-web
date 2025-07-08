// src/pages/ProfilePage.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  Modal,
  Table,
  Pagination,
} from "react-bootstrap";
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
  Notifications,
  Delete,
  Download,
  Star,
} from "@mui/icons-material";
import { AuthContext } from "../contexts/AuthContext";
import {
  getUserBookings,
  getBookingStatistics,
} from "../services/bookingService";
import {
  getPaymentHistory,
  getPaymentStatistics,
} from "../services/paymentService";
import {
  formatDate,
  formatCurrency,
  formatPhoneNumber,
  formatBookingStatus,
  formatPaymentStatus,
  formatRelativeTime,
} from "../utils/formatters";

const ProfilePage = () => {
  const {
    currentUser,
    loading: authLoading,
    updateProfile,
    logout,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [bookingsPage, setBookingsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [bookingsPagination, setBookingsPagination] = useState(null);
  const [paymentsPagination, setPaymentsPagination] = useState(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_picture: "",
  });

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login", {
        state: { redirectTo: "/profile" },
      });
      return;
    }

    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        profile_picture: currentUser.profile_picture || "",
      });

      loadTabData(activeTab);
    }
  }, [currentUser, authLoading, navigate, activeTab]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const loadTabData = async (tab) => {
    try {
      setLoading(true);
      setError(null);

      switch (tab) {
        case "bookings":
          await loadBookings();
          await loadBookingStatistics();
          break;
        case "payments":
          await loadPaymentHistory();
          await loadPaymentStatistics();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`❌ Error loading ${tab} data:`, err);
      setError(err.message || `Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (page = 1) => {
    try {
      console.log("📋 Loading user bookings...");
      const result = await getUserBookings({
        page,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      setBookings(result.bookings || []);
      setBookingsPagination(result.pagination);
      setBookingsPage(page);

      console.log("✅ Bookings loaded:", result.bookings?.length || 0);
    } catch (err) {
      console.error("❌ Load bookings error:", err);
      throw err;
    }
  };

  const loadPaymentHistory = async (page = 1) => {
    try {
      console.log("💳 Loading payment history...");
      const result = await getPaymentHistory({
        page,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      setPaymentHistory(result.payments || []);
      setPaymentsPagination(result.pagination);
      setPaymentsPage(page);

      console.log("✅ Payment history loaded:", result.payments?.length || 0);
    } catch (err) {
      console.error("❌ Load payment history error:", err);
      throw err;
    }
  };

  const loadBookingStatistics = async () => {
    try {
      const stats = await getBookingStatistics("month");
      setBookingStats(stats);
    } catch (err) {
      console.error("❌ Load booking statistics error:", err);
    }
  };

  const loadPaymentStatistics = async () => {
    try {
      const stats = await getPaymentStatistics("month");
      setPaymentStats(stats);
    } catch (err) {
      console.error("❌ Load payment statistics error:", err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("👤 Updating profile...");

      await updateProfile(profileData);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      console.log("✅ Profile updated successfully");
    } catch (err) {
      console.error("❌ Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      setPasswordError(null);

      // Validate passwords
      if (passwordData.new_password !== passwordData.confirm_password) {
        setPasswordError("New passwords do not match");
        return;
      }

      if (passwordData.new_password.length < 8) {
        setPasswordError("New password must be at least 8 characters long");
        return;
      }

      setLoading(true);

      // Call password change API
      // await changePassword(passwordData);

      setSuccess("Password changed successfully!");
      setShowChangePassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("❌ Password change error:", err);
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const renderProfileTab = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Personal Information</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="me-1" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleProfileUpdate}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    required
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    required
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    required
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="+255..."
                    required
                  />
                </Col>
              </Row>

              {isEditing && (
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Form>
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">Security Settings</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="fw-semibold">Password</div>
                <div className="text-muted small">
                  Last changed:{" "}
                  {formatRelativeTime(currentUser?.password_updated_at)}
                </div>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                <Lock className="me-1" />
                Change Password
              </Button>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold text-danger">Delete Account</div>
                <div className="text-muted small">
                  Permanently delete your account and all data
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Delete className="me-1" />
                Delete Account
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        <Card>
          <Card.Body className="text-center">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <Person style={{ fontSize: "2rem", color: "white" }} />
            </div>
            <h5>
              {currentUser?.first_name} {currentUser?.last_name}
            </h5>
            <p className="text-muted mb-2">
              {formatPhoneNumber(currentUser?.phone)}
            </p>
            <p className="text-muted">{currentUser?.email}</p>

            <Badge bg="success" className="mb-3">
              Member since {formatDate(currentUser?.created_at)}
            </Badge>

            {bookingStats && (
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Trips:</span>
                  <span className="fw-bold">
                    {bookingStats.totalBookings || 0}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Spent:</span>
                  <span className="fw-bold">
                    {formatCurrency(bookingStats.totalSpent || 0)}
                  </span>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderBookingsTab = () => (
    <>
      {bookingStats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">
                  {bookingStats.totalBookings || 0}
                </h3>
                <p className="text-muted mb-0">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {bookingStats.completedBookings || 0}
                </h3>
                <p className="text-muted mb-0">Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {bookingStats.pendingBookings || 0}
                </h3>
                <p className="text-muted mb-0">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger">
                  {bookingStats.cancelledBookings || 0}
                </h3>
                <p className="text-muted mb-0">Cancelled</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">My Bookings</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Route</th>
                      <th>Date</th>
                      <th>Fare</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const status = formatBookingStatus(booking.status);
                      return (
                        <tr key={booking.booking_id}>
                          <td>
                            <span className="fw-bold">
                              #{booking.booking_id}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">
                                {booking.Trip?.Route?.route_name}
                              </div>
                              <div className="small text-muted">
                                {booking.pickupStop?.stop_name} →{" "}
                                {booking.dropoffStop?.stop_name}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>{formatDate(booking.Trip?.trip_date)}</div>
                              <div className="small text-muted">
                                {booking.Trip?.start_time}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold">
                              {formatCurrency(booking.fare_amount)}
                            </span>
                          </td>
                          <td>
                            <Badge
                              bg={
                                status.className.includes("success")
                                  ? "success"
                                  : status.className.includes("warning")
                                    ? "warning"
                                    : status.className.includes("danger")
                                      ? "danger"
                                      : "secondary"
                              }
                            >
                              {status.text}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                navigate(`/bookings/${booking.booking_id}`)
                              }
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {bookingsPagination && bookingsPagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={bookingsPage <= 1}
                      onClick={() => loadBookings(bookingsPage - 1)}
                    />
                    {Array.from(
                      { length: bookingsPagination.totalPages },
                      (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={bookingsPage === i + 1}
                          onClick={() => loadBookings(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      )
                    )}
                    <Pagination.Next
                      disabled={bookingsPage >= bookingsPagination.totalPages}
                      onClick={() => loadBookings(bookingsPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <DirectionsBus
                className="text-muted mb-3"
                style={{ fontSize: "3rem" }}
              />
              <h5 className="text-muted">No Bookings Found</h5>
              <p className="text-muted">You haven't made any bookings yet.</p>
              <Button variant="primary" onClick={() => navigate("/routes")}>
                Browse Routes
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );

  const renderPaymentsTab = () => (
    <>
      {paymentStats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">
                  {formatCurrency(paymentStats.totalAmount || 0)}
                </h3>
                <p className="text-muted mb-0">Total Spent</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {paymentStats.successfulPayments || 0}
                </h3>
                <p className="text-muted mb-0">Successful</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {paymentStats.pendingPayments || 0}
                </h3>
                <p className="text-muted mb-0">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger">
                  {paymentStats.failedPayments || 0}
                </h3>
                <p className="text-muted mb-0">Failed</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Payment History</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading payment history...</p>
            </div>
          ) : paymentHistory.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Booking</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => {
                      const status = formatPaymentStatus(payment.status);
                      return (
                        <tr key={payment.payment_id}>
                          <td>
                            <span className="fw-bold">
                              #{payment.payment_id}
                            </span>
                          </td>
                          <td>
                            <span>#{payment.booking_id}</span>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">
                                {payment.payment_method === "mobile_money"
                                  ? "Mobile Money"
                                  : payment.payment_method === "card"
                                    ? "Card"
                                    : payment.payment_method}
                              </div>
                              {payment.phone_number && (
                                <div className="small text-muted">
                                  {formatPhoneNumber(payment.phone_number)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td>
                            <Badge
                              bg={
                                status.className.includes("success")
                                  ? "success"
                                  : status.className.includes("warning")
                                    ? "warning"
                                    : status.className.includes("danger")
                                      ? "danger"
                                      : "secondary"
                              }
                            >
                              {status.text}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <div>{formatDate(payment.created_at)}</div>
                              <div className="small text-muted">
                                {formatRelativeTime(payment.created_at)}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                /* Download receipt */
                              }}
                            >
                              <Download className="me-1" />
                              Receipt
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {paymentsPagination && paymentsPagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={paymentsPage <= 1}
                      onClick={() => loadPaymentHistory(paymentsPage - 1)}
                    />
                    {Array.from(
                      { length: paymentsPagination.totalPages },
                      (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={paymentsPage === i + 1}
                          onClick={() => loadPaymentHistory(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      )
                    )}
                    <Pagination.Next
                      disabled={paymentsPage >= paymentsPagination.totalPages}
                      onClick={() => loadPaymentHistory(paymentsPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <Receipt
                className="text-muted mb-3"
                style={{ fontSize: "3rem" }}
              />
              <h5 className="text-muted">No Payment History</h5>
              <p className="text-muted">You haven't made any payments yet.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );

  // Change Password Modal
  const ChangePasswordModal = () => (
    <Modal
      show={showChangePassword}
      onHide={() => setShowChangePassword(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handlePasswordChange}>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPasswords ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    current_password: e.target.value,
                  }))
                }
                required
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPasswords(!showPasswords)}
                style={{ border: "none", background: "none" }}
              >
                {showPasswords ? <VisibilityOff /> : <Visibility />}
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type={showPasswords ? "text" : "password"}
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  new_password: e.target.value,
                }))
              }
              minLength={8}
              required
            />
            <Form.Text className="text-muted">
              Password must be at least 8 characters long
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type={showPasswords ? "text" : "password"}
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirm_password: e.target.value,
                }))
              }
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangePassword(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  // Delete Account Modal
  const DeleteAccountModal = () => (
    <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Delete Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger">
          <strong>Warning:</strong> This action cannot be undone. All your data
          will be permanently deleted.
        </Alert>

        <p>
          To confirm account deletion, please type <strong>DELETE</strong> in
          the field below:
        </p>

        <Form.Control
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={deleteConfirmText !== "DELETE" || loading}
          onClick={async () => {
            try {
              setLoading(true);
              // await deleteAccount();
              logout();
              navigate("/");
            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            "Delete Account"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (authLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Profile - Daladala Smart</title>
        <meta
          name="description"
          content="Manage your profile, view bookings and payment history"
        />
      </Helmet>

      <Container className="py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">My Profile</h1>
          <p className="text-muted">
            Manage your account and view your activity
          </p>
        </div>

        {error && (
          <Alert
            variant="danger"
            className="mb-4"
            dismissible
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            variant="success"
            className="mb-4"
            dismissible
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-4">
          <Tab
            eventKey="profile"
            title={
              <span>
                <Person className="me-1" />
                Profile
              </span>
            }
          >
            {renderProfileTab()}
          </Tab>

          <Tab
            eventKey="bookings"
            title={
              <span>
                <DirectionsBus className="me-1" />
                Bookings
              </span>
            }
          >
            {renderBookingsTab()}
          </Tab>

          <Tab
            eventKey="payments"
            title={
              <span>
                <Receipt className="me-1" />
                Payments
              </span>
            }
          >
            {renderPaymentsTab()}
          </Tab>
        </Tabs>
      </Container>

      <ChangePasswordModal />
      <DeleteAccountModal />
    </>
  );
};

export default ProfilePage;
