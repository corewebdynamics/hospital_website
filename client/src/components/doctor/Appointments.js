import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Tabs, Tab, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Get stored appointments from localStorage
      const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      
      // Format stored appointments for doctor's view
      const formattedStoredAppointments = storedAppointments.map(apt => ({
        id: apt.id,
        patient: apt.patient || 'Unknown Patient',
        date: apt.date,
        time: apt.time,
        reason: apt.reason,
        status: apt.status,
        notes: apt.notes,
        doctorId: apt.doctorId
      }));
      
      setAppointments(formattedStoredAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled': return <Badge bg="primary">Scheduled</Badge>;
      case 'completed': return <Badge bg="success">Completed</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      case 'no-show': return <Badge bg="warning">No Show</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    if (filter !== 'all' && appointment.status !== filter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter && appointment.date !== dateFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !appointment.patient.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle opening the details modal
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentNotes(appointment.notes || '');
    setShowDetailsModal(true);
  };
  
  // Handle starting an appointment
  const handleStartAppointment = (appointment) => {
    // In a real app, this would update the appointment status in the backend
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointment.id) {
        return { ...apt, status: 'in-progress' };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    
    // Also update localStorage if this is a patient-booked appointment
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.map(apt => {
      if (apt.id === appointment.id) {
        return { ...apt, status: 'in-progress' };
      }
      return apt;
    });
    
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    // Open the details modal
    handleViewDetails({ ...appointment, status: 'in-progress' });
  };
  
  // Handle opening the cancel modal
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };
  
  // Handle appointment cancellation
  const handleCancelConfirm = () => {
    // Update appointment in state
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { ...apt, status: 'cancelled' };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    
    // Update localStorage if this is a patient-booked appointment
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { ...apt, status: 'cancelled' };
      }
      return apt;
    });
    
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    // Close modal
    setShowCancelModal(false);
  };
  
  // Handle saving appointment notes
  const handleSaveNotes = () => {
    // Update appointment in state
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { ...apt, notes: appointmentNotes };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    
    // Update localStorage if this is a patient-booked appointment
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { ...apt, notes: appointmentNotes };
      }
      return apt;
    });
    
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    // Close modal
    setShowDetailsModal(false);
  };
  
  // Handle completing an appointment
  const handleCompleteAppointment = () => {
    // Update appointment in state
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { 
          ...apt, 
          status: 'completed',
          notes: appointmentNotes 
        };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    
    // Update localStorage if this is a patient-booked appointment
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { 
          ...apt, 
          status: 'completed',
          notes: appointmentNotes 
        };
      }
      return apt;
    });
    
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    // Close modal
    setShowDetailsModal(false);
  };

  if (loading) {
    return <Container className="py-4">Loading appointments...</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Appointments</h2>
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Search Patient</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by patient name"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Filter by Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="all">All Appointments</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Appointments Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <Tabs defaultActiveKey="upcoming" className="mb-3">
            <Tab eventKey="upcoming" title="Upcoming Appointments">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.reason}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          {appointment.status === 'scheduled' ? (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleStartAppointment(appointment)}
                              >
                                Start
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleCancelClick(appointment)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              View Details
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        No appointments found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="past" title="Past Appointments">
              {/* Similar table for past appointments */}
              <p className="text-muted mb-0">View past appointments history here.</p>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Appointment Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Patient Information</h5>
                  <p><strong>Name:</strong> {selectedAppointment.patient}</p>
                  <p><strong>Reason for Visit:</strong> {selectedAppointment.reason}</p>
                </Col>
                <Col md={6}>
                  <h5>Appointment Details</h5>
                  <p><strong>Date:</strong> {selectedAppointment.date}</p>
                  <p><strong>Time:</strong> {selectedAppointment.time}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedAppointment.status)}</p>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Appointment Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Enter notes about the patient's visit..."
                  disabled={selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled'}
                />
              </Form.Group>
              
              {selectedAppointment.status === 'in-progress' && (
                <Alert variant="info">
                  This appointment is currently in progress. Complete the appointment when finished.
                </Alert>
              )}
              
              {selectedAppointment.status === 'completed' && (
                <Alert variant="success">
                  This appointment has been completed.
                </Alert>
              )}
              
              {selectedAppointment.status === 'cancelled' && (
                <Alert variant="danger">
                  This appointment was cancelled.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          
          {selectedAppointment && selectedAppointment.status === 'in-progress' && (
            <>
              <Button variant="primary" onClick={handleSaveNotes}>
                Save Notes
              </Button>
              <Button variant="success" onClick={handleCompleteAppointment}>
                Complete Appointment
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <p>
              Are you sure you want to cancel the appointment with <strong>{selectedAppointment.patient}</strong> on <strong>{selectedAppointment.date}</strong> at <strong>{selectedAppointment.time}</strong>?
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
    </Container>
  );
};

export default Appointments; 