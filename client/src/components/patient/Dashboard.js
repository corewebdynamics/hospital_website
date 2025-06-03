import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaFileMedical, FaUserMd, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state for rescheduling
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  
  // Modal state for cancellation confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  // State for viewing appointment details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get appointments from localStorage
        const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        
        // Use stored appointments
        setAppointments(storedAppointments);

        // Create a list of unique doctors from appointments
        const uniqueDoctors = [];
        storedAppointments.forEach(apt => {
          if (apt.doctor && !uniqueDoctors.some(d => d.name === apt.doctor)) {
            uniqueDoctors.push({
              id: uniqueDoctors.length + 1,
              name: apt.doctor,
              specialty: apt.specialty || 'General Medicine',
              rating: 4.5 + Math.random() * 0.5 // Generate a random rating between 4.5-5.0
            });
          }
        });
        
        // Add a few default doctors if none are found
        if (uniqueDoctors.length === 0) {
          uniqueDoctors.push(
            { id: 1, name: 'Dr. John Smith', specialty: 'General Medicine', rating: 4.8 },
            { id: 2, name: 'Dr. Emily Clark', specialty: 'Family Medicine', rating: 4.9 }
          );
        }
        
        setDoctors(uniqueDoctors);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge bg="success">Confirmed</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Handle opening the reschedule modal
  const handleRescheduleClick = (appointment) => {
    setRescheduleAppointment(appointment);
    setNewDate('');
    setNewTime('');
    setModalError('');
    setModalSuccess('');
    setShowRescheduleModal(true);
  };
  
  // Handle date change in reschedule modal
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewDate(selectedDate);
    setNewTime('');
    
    // Generate available times in 30-minute intervals
    if (selectedDate) {
      const times = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      const interval = 30; // 30 minute intervals
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
          const period = hour < 12 ? 'AM' : 'PM';
          times.push(`${formattedHour}:${minute === 0 ? '00' : minute} ${period}`);
        }
      }
      
      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  };
  
  // Handle reschedule confirmation
  const handleRescheduleConfirm = () => {
    // Validate inputs
    if (!newDate || !newTime) {
      setModalError('Please select both date and time');
      return;
    }
    
    // Update appointment in localStorage
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === rescheduleAppointment.id) {
        return {
          ...appointment,
          date: newDate,
          time: newTime,
          status: 'pending' // Reset to pending after reschedule
        };
      }
      return appointment;
    });
    
    // Save to localStorage
    localStorage.setItem('patientAppointments', JSON.stringify(updatedAppointments));
    
    // Update state
    setAppointments(updatedAppointments);
    setModalSuccess('Appointment rescheduled successfully!');
    
    // Close modal after delay
    setTimeout(() => {
      setShowRescheduleModal(false);
    }, 2000);
  };
  
  // Handle opening the cancel modal
  const handleCancelClick = (appointment) => {
    setCancelAppointment(appointment);
    setShowCancelModal(true);
  };
  
  // Handle appointment cancellation
  const handleCancelConfirm = () => {
    // Update appointment in localStorage
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === cancelAppointment.id) {
        return {
          ...appointment,
          status: 'cancelled'
        };
      }
      return appointment;
    });
    
    // Save to localStorage
    localStorage.setItem('patientAppointments', JSON.stringify(updatedAppointments));
    
    // Update state
    setAppointments(updatedAppointments);
    
    // Close modal
    setShowCancelModal(false);
  };

  // Handle opening the details modal
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">Loading dashboard data...</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Patient Dashboard</h2>
      
      {/* Quick Actions */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCalendarPlus className="text-primary" size={24} />
              </div>
              <h5>Book Appointment</h5>
              <p className="text-muted small mb-3">Schedule a new appointment with a doctor</p>
              <Button as={Link} to="/patient/appointments/book" variant="primary" size="sm">Book Now</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaFileMedical className="text-success" size={24} />
              </div>
              <h5>Medical History</h5>
              <p className="text-muted small mb-3">View your complete medical records</p>
              <Button as={Link} to="/patient/medical-history" variant="success" size="sm">View Records</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUserMd className="text-info" size={24} />
              </div>
              <h5>Find Doctors</h5>
              <p className="text-muted small mb-3">Search for specialists and healthcare providers</p>
              <Button variant="info" size="sm">Find Doctors</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaClipboardList className="text-warning" size={24} />
              </div>
              <h5>Prescriptions</h5>
              <p className="text-muted small mb-3">View and manage your prescriptions</p>
              <Button variant="warning" size="sm">View Prescriptions</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Upcoming Appointments */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Upcoming Appointments</h5>
          <Button as={Link} to="/patient/appointments/book" variant="outline-primary" size="sm">Book New</Button>
        </Card.Header>
        <Card.Body>
          {appointments.length === 0 ? (
            <div className="text-center py-3">
              <p className="mb-0">No upcoming appointments found.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment.id} className={appointment.status === 'cancelled' ? 'text-muted' : ''}>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.specialty}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      {appointment.status !== 'cancelled' && (
                        <>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleRescheduleClick(appointment)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelClick(appointment)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'cancelled' && (
                        <Button as={Link} to="/patient/appointments/book" variant="outline-primary" size="sm">
                          Book New
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Available Doctors */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Available Doctors</h5>
        </Card.Header>
        <Card.Body>
          <Row xs={1} md={2} lg={4} className="g-4">
            {doctors.map(doctor => (
              <Col key={doctor.id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-light mx-auto mb-3" style={{ width: '80px', height: '80px', overflow: 'hidden' }}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${doctor.name.replace('Dr. ', '')}&background=random&size=80`} 
                        alt={doctor.name} 
                        className="img-fluid"
                      />
                    </div>
                    <h5 className="mb-1">{doctor.name}</h5>
                    <p className="text-muted mb-2">{doctor.specialty}</p>
                    <div className="mb-3">
                      {'★'.repeat(Math.floor(doctor.rating))}
                      {doctor.rating % 1 !== 0 ? '½' : ''}
                      {'☆'.repeat(5 - Math.ceil(doctor.rating))}
                      <span className="ms-1">({doctor.rating})</span>
                    </div>
                    <Button 
                      as={Link} 
                      to={`/patient/appointments/book?doctor=${doctor.id}`}
                      variant="outline-primary" 
                      size="sm"
                    >
                      Book Appointment
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Reschedule Modal */}
      <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          {modalSuccess && <Alert variant="success">{modalSuccess}</Alert>}
          
          {rescheduleAppointment && (
            <Form>
              <p>You are rescheduling your appointment with <strong>{rescheduleAppointment.doctor}</strong></p>
              
              <Form.Group className="mb-3">
                <Form.Label>Select New Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Select New Time</Form.Label>
                <Form.Select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  disabled={availableTimes.length === 0}
                  required
                >
                  <option value="">-- Select a Time --</option>
                  {availableTimes.map((time, index) => (
                    <option key={index} value={time}>{time}</option>
                  ))}
                </Form.Select>
                {newDate && availableTimes.length === 0 && (
                  <Form.Text className="text-danger">
                    No available slots for the selected date. Please try another date.
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRescheduleConfirm}
            disabled={!newDate || !newTime || modalSuccess}
          >
            Confirm Reschedule
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelAppointment && (
            <p>
              Are you sure you want to cancel your appointment with <strong>{cancelAppointment.doctor}</strong> on <strong>{cancelAppointment.date}</strong> at <strong>{cancelAppointment.time}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep Appointment
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm}>
            Yes, Cancel Appointment
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Appointment Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <h5 className="mb-3">{selectedAppointment.doctor}</h5>
              <p><strong>Specialty:</strong> {selectedAppointment.specialty}</p>
              <p><strong>Date:</strong> {selectedAppointment.date}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason || 'Not specified'}</p>
              <p><strong>Status:</strong> {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}</p>
              
              {selectedAppointment.notes && (
                <>
                  <h6 className="mt-4">Notes</h6>
                  <p>{selectedAppointment.notes}</p>
                </>
              )}
              
              {selectedAppointment.status === 'confirmed' && (
                <Alert variant="info" className="mt-3">
                  <strong>Reminder:</strong> Please arrive 15 minutes before your scheduled appointment time.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedAppointment && selectedAppointment.status !== 'cancelled' && (
            <>
              <Button variant="primary" onClick={() => {
                setShowDetailsModal(false);
                handleRescheduleClick(selectedAppointment);
              }}>
                Reschedule
              </Button>
              <Button variant="danger" onClick={() => {
                setShowDetailsModal(false);
                handleCancelClick(selectedAppointment);
              }}>
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PatientDashboard; 