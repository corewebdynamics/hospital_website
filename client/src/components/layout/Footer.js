import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="py-2">
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Hospital Management System</h5>
            <p className="small text-muted mb-0">Providing Quality Healthcare Services</p>
            <p className="small text-muted">© {currentYear} All Rights Reserved</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li><Link to="/about" className="text-decoration-none text-muted">About Us</Link></li>
              <li><Link to="/services" className="text-decoration-none text-muted">Services</Link></li>
              <li><Link to="/contact" className="text-decoration-none text-muted">Contact</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address className="small text-muted">
              <p>123 Hospital Street<br />
              Healthcare City, HC 12345</p>
              <p>Email: info@hospital.com<br />
              Phone: (123) 456-7890</p>
            </address>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

Footer.propTypes = {
  // Add any necessary prop types here
};

export default Footer; 