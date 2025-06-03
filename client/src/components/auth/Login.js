import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserMd, FaUser, FaUserNurse, FaUserInjured } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';

const Login = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { username, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connect to the backend API
      const response = await axios.post('http://localhost:5000/api/auth/login', { 
        username, 
        password 
      });
      
      // Call the login function with the user data and token
      if (login) {
        login(response.data.user, response.data.token);
      }
      
      // Redirect based on role
      const userRole = response.data.user.role;
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'patient':
          navigate('/patient');
          break;
        case 'receptionist':
          navigate('/reception');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <FaUser className="me-2" />;
      case 'doctor':
        return <FaUserMd className="me-2" />;
      case 'patient':
        return <FaUserInjured className="me-2" />;
      case 'receptionist':
        return <FaUserNurse className="me-2" />;
      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  <FaSignInAlt className="me-2" />
                  Login
                </h2>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username or Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    placeholder="Enter your username or email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : (
                      <>
                        {getRoleIcon()}
                        Login
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-3 text-center">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Remember me"
                    className="d-inline-block me-2"
                  />
                  <a href="#" className="text-decoration-none small">Forgot Password?</a>
                </div>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Register</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

Login.propTypes = {
  login: PropTypes.func
};

export default Login; 