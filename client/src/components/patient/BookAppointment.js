import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedDoctorId = queryParams.get('doctor');

  const [formData, setFormData] = useState({
    doctorId: selectedDoctorId || '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // In a real app, this would be an API call to fetch doctors
        // For demo purposes, we'll use mock data
        const mockDoctors = [
          { id: '1', name: 'Dr. John Smith', specialty: 'Cardiology' },
          { id: '2', name: 'Dr. Emily Clark', specialty: 'Dermatology' },
          { id: '3', name: 'Dr. Robert Johnson', specialty: 'Orthopedics' },
          { id: '4', name: 'Dr. Lisa Wong', specialty: 'Pediatrics' }
        ];
        setDoctors(mockDoctors);

        // If a doctor was selected from the dashboard, set it in the form
        if (selectedDoctorId) {
          const selectedDoctor = mockDoctors.find(doc => doc.id === selectedDoctorId);
          if (selectedDoctor) {
            setFormData(prev => ({ ...prev, doctorId: selectedDoctorId }));
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, [selectedDoctorId]);

  // Generate available times when date changes
  useEffect(() => {
    if (formData.date && formData.doctorId) {
      // In a real app, this would be an API call to fetch available times for the selected doctor and date
      // For demo purposes, we'll generate mock available times
      const generateMockTimes = () => {
        const times = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM
        const interval = 30; // 30 minute intervals
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += interval) {
            // Randomly make some slots unavailable
            if (Math.random() > 0.3) {
              const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
              const period = hour < 12 ? 'AM' : 'PM';
              times.push(`${formattedHour}:${minute === 0 ? '00' : minute} ${period}`);
            }
          }
        }
        
        return times;
      };
      
      setAvailableTimes(generateMockTimes());
    } else {
      setAvailableTimes([]);
    }
  }, [formData.date, formData.doctorId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear any existing messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.doctorId || !formData.date || !formData.time || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to book the appointment
      // For demo purposes, we'll simulate a successful booking and save to localStorage
      
      // Get the doctor name and specialty from the selected doctor
      const selectedDoctor = doctors.find(doc => doc.id === formData.doctorId) || {};
      
      // Create the appointment object
      const newAppointment = {
        id: Date.now(), // Use timestamp as a simple unique ID
        doctor: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage (in a real app, this would go to a backend API)
      const existingAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      existingAppointments.push(newAppointment);
      localStorage.setItem('patientAppointments', JSON.stringify(existingAppointments));
      
      console.log('Booking appointment with data:', newAppointment);
      
      // Reset form and show success message
      setSuccess('Appointment booked successfully! You will receive a confirmation email shortly.');
      
      // In a real app, you would navigate to a confirmation page or back to dashboard
      setTimeout(() => {
        navigate('/patient');
      }, 3000);
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Book an Appointment</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Doctor <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Select Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Select Time <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={availableTimes.length === 0}
                    required
                  >
                    <option value="">-- Select a Time --</option>
                    {availableTimes.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </Form.Select>
                  {formData.date && formData.doctorId && availableTimes.length === 0 && (
                    <Form.Text className="text-danger">
                      No available slots for the selected date. Please try another date.
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Reason for Visit <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Reason --</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Check-up">Routine Check-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Test Results">Test Results</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Please provide any additional information that might be helpful..."
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

BookAppointment.propTypes = {
  // Add any necessary prop types here
};

export default BookAppointment; 