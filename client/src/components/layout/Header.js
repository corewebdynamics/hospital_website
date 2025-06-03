import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBell, FaEnvelope, FaHospital } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Header = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState([
    { id: 1, message: 'New appointment request', time: '5 mins ago', read: false },
    { id: 2, message: 'Lab results available', time: '1 hour ago', read: false },
    { id: 3, message: 'Prescription refill approved', time: '3 hours ago', read: true },
  ]);

  const [messages] = useState([
    { id: 1, from: 'Dr. Smith', subject: 'Follow-up appointment', time: '10 mins ago', read: false },
    { id: 2, from: 'Reception', subject: 'Schedule update', time: '2 hours ago', read: true },
  ]);

  const handleLogout = () => {
    // Use the provided logout function
    logout();
    navigate('/login');
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!user) return null;
    
    const userRole = user.role;
    
    switch (userRole) {
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users" active={location.pathname === '/admin/users'}>User Management</Nav.Link>
          </>
        );
      case 'doctor':
        return (
          <>
            <Nav.Link as={Link} to="/doctor" active={location.pathname === '/doctor'}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/doctor/appointments" active={location.pathname === '/doctor/appointments'}>Appointments</Nav.Link>
            <Nav.Link as={Link} to="/doctor/patients" active={location.pathname === '/doctor/patients'}>Patients</Nav.Link>
          </>
        );
      case 'patient':
        return (
          <>
            <Nav.Link as={Link} to="/patient" active={location.pathname === '/patient'}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/patient/appointments/book" active={location.pathname === '/patient/appointments/book'}>Book Appointment</Nav.Link>
            <Nav.Link as={Link} to="/patient/medical-history" active={location.pathname === '/patient/medical-history'}>Medical History</Nav.Link>
          </>
        );
      case 'receptionist':
        return (
          <>
            <Nav.Link as={Link} to="/reception" active={location.pathname === '/reception'}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/reception/appointments" active={location.pathname === '/reception/appointments'}>Appointments</Nav.Link>
            <Nav.Link as={Link} to="/reception/patients/register" active={location.pathname === '/reception/patients/register'}>Patient Registration</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaHospital className="me-2" />
          Hospital Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {getNavLinks()}
          </Nav>
          {isAuthenticated && user && (
            <Nav>
              <Dropdown align="end" className="me-2">
                <Dropdown.Toggle variant="primary" id="notification-dropdown">
                  <FaBell />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>Notifications</Dropdown.Header>
                  {notifications.map(notification => (
                    <Dropdown.Item key={notification.id} className={notification.read ? 'text-muted' : 'fw-bold'}>
                      {notification.message}
                      <div className="text-muted small">{notification.time}</div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-center">View All</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Dropdown align="end" className="me-2">
                <Dropdown.Toggle variant="primary" id="message-dropdown">
                  <FaEnvelope />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {messages.filter(m => !m.read).length}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>Messages</Dropdown.Header>
                  {messages.map(message => (
                    <Dropdown.Item key={message.id} className={message.read ? 'text-muted' : 'fw-bold'}>
                      <div>{message.from}: {message.subject}</div>
                      <div className="text-muted small">{message.time}</div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-center">View All</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Dropdown align="end">
                <Dropdown.Toggle variant="primary" id="user-dropdown">
                  <FaUser className="me-1" /> {user.name || 'Profile'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          )}
          {!isAuthenticated && (
            <Nav>
              <Button variant="outline-light" as={Link} to="/login" className="me-2">Login</Button>
              <Button variant="light" as={Link} to="/register">Register</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

Header.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object,
  logout: PropTypes.func
};

export default Header; 