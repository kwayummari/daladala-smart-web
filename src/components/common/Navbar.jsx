// components/common/Navbar.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Container, Navbar as BootstrapNavbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { Person, Menu, Close } from '@mui/icons-material';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar 
      expand="lg" 
      bg="white" 
      sticky="top" 
      expanded={expanded}
      className="navbar-light shadow-sm py-3"
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <img 
            src="/images/logo.svg" 
            alt="Daladala Smart" 
            height="40" 
            className="d-inline-block align-top" 
          />
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Close /> : <Menu />}
        </BootstrapNavbar.Toggle>
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/routes" onClick={() => setExpanded(false)}>
              Routes
            </Nav.Link>
            <Nav.Link as={Link} to="/booking" onClick={() => setExpanded(false)}>
              Book a Trip
            </Nav.Link>
          </Nav>
          
          <Nav>
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  id="dropdown-basic"
                  className="d-flex align-items-center"
                >
                  <Person className="me-1" />
                  {currentUser.first_name}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary"
                  onClick={() => setExpanded(false)}
                >
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;