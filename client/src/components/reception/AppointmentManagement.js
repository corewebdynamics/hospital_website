import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Modal, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaCalendarPlus, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data for new appointment
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
    notes: ''
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    doctor: '',
    patient: '',
    date: '',
    status: ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointmentsData();
  }, []);

  const fetchAppointmentsData = async () => {
    try {
      // Get appointments from localStorage
      const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      
      // Map stored appointments to the format expected by the receptionist view
      const formattedStoredAppointments = storedAppointments.map(apt => {
        return {
          id: apt.id,
          patient: apt.patient || 'Unknown Patient',
          doctor: apt.doctor || 'Unknown Doctor',
          date: apt.date,
          time: apt.time,
          reason: apt.reason,
          status: apt.status,
          notes: apt.notes || ''
        };
      });
      
      // Define basic doctors for the dropdown if none exist
      const defaultDoctors = [
        { id: 1, name: 'Dr. John Smith', specialty: 'General Medicine' },
        { id: 2, name: 'Dr. Emily Clark', specialty: 'Family Medicine' }
      ];
      
      // Define basic patients for the dropdown if none exist
      const defaultPatients = [
        { id: 1, name: 'New Patient', dob: '', phone: '' }
      ];
      
      // Create a unique list of doctors from appointments
      const doctorsFromAppointments = [];
      formattedStoredAppointments.forEach(apt => {
        if (apt.doctor && !doctorsFromAppointments.some(d => d.name === apt.doctor)) {
          doctorsFromAppointments.push({
            id: doctorsFromAppointments.length + 1,
            name: apt.doctor,
            specialty: apt.specialty || 'Unknown'
          });
        }
      });
      
      // Create a unique list of patients from appointments
      const patientsFromAppointments = [];
      formattedStoredAppointments.forEach(apt => {
        if (apt.patient && !patientsFromAppointments.some(p => p.name === apt.patient)) {
          patientsFromAppointments.push({
            id: patientsFromAppointments.length + 1,
            name: apt.patient,
            dob: '',
            phone: ''
          });
        }
      });
      
      // Use doctor and patient lists from appointments if available, otherwise use defaults
      const finalDoctors = doctorsFromAppointments.length > 0 ? doctorsFromAppointments : defaultDoctors;
      const finalPatients = patientsFromAppointments.length > 0 ? patientsFromAppointments : defaultPatients;
      
      setAppointments(formattedStoredAppointments);
      setDoctors(finalDoctors);
      setPatients(finalPatients);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments data:', err);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled': return <Badge bg="primary">Scheduled</Badge>;
      case 'checked-in': return <Badge bg="warning">Checked In</Badge>;
      case 'in-progress': return <Badge bg="info">In Progress</Badge>;
      case 'completed': return <Badge bg="success">Completed</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      case 'no-show': return <Badge bg="dark">No Show</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      doctor: '',
      patient: '',
      date: '',
      status: ''
    });
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    // In a real app, this would trigger a new API call with filter parameters
    // For demo purposes, we'll just close the modal
    setShowFilterModal(false);
  };

  const handleNewAppointment = () => {
    setCurrentAppointment(null);
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setCurrentAppointment(appointment);
    // In a real app, you would map the patient name to patientId
    setFormData({
      patientId: patients.find(p => p.name === appointment.patient)?.id || '',
      doctorId: doctors.find(d => d.name === appointment.doctor)?.id || '',
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Get selected doctor and patient
    const selectedDoctor = doctors.find(d => d.id === parseInt(formData.doctorId));
    const selectedPatient = patients.find(p => p.id === parseInt(formData.patientId));
    
    // Create the appointment object
    const appointmentData = {
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      status: formData.status,
      notes: formData.notes,
      patient: selectedPatient?.name || 'Unknown Patient',
      doctor: selectedDoctor?.name || 'Unknown Doctor',
      doctorId: formData.doctorId,
      patientId: formData.patientId
    };
    
    // Get stored appointments
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    
    if (currentAppointment) {
      // Update existing appointment
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === currentAppointment.id 
          ? { 
              ...appointment, 
              ...appointmentData
            } 
          : appointment
      );
      
      setAppointments(updatedAppointments);
      
      // Update in localStorage
      const updatedStoredAppointments = storedAppointments.map(apt => {
        if (apt.id === currentAppointment.id) {
          return { 
            ...apt, 
            ...appointmentData
          };
        }
        return apt;
      });
      
      localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
      setSuccess('Appointment updated successfully');
    } else {
      // Create new appointment
      const newId = Date.now(); // Generate unique ID
      const newAppointment = {
        id: newId,
        ...appointmentData
      };
      
      // Add to appointments state
      setAppointments([...appointments, newAppointment]);
      
      // Add to localStorage
      localStorage.setItem('patientAppointments', JSON.stringify([...storedAppointments, newAppointment]));
      setSuccess('Appointment created successfully');
    }
    
    // Close the modal and reset form
    setShowModal(false);
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled',
      notes: ''
    });
    setError('');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteAppointment = (id) => {
    // In a real app, this would be an API call to delete appointment
    const updatedAppointments = appointments.filter(appointment => appointment.id !== id);
    setAppointments(updatedAppointments);
    
    // Update localStorage
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.filter(apt => apt.id !== id);
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    setSuccess('Appointment cancelled successfully');
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleUpdateStatus = (id, newStatus) => {
    // In a real app, this would be an API call to update appointment status
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: newStatus } : appointment
    );
    setAppointments(updatedAppointments);
    
    // Update localStorage
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const updatedStoredAppointments = storedAppointments.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: newStatus };
      }
      return apt;
    });
    localStorage.setItem('patientAppointments', JSON.stringify(updatedStoredAppointments));
    
    setSuccess(`Appointment status updated to ${newStatus}`);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  // Filter appointments based on search term and filters
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by search term
    if (searchTerm && 
        !appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by doctor
    if (filters.doctor && appointment.doctor !== filters.doctor) {
      return false;
    }
    
    // Filter by patient
    if (filters.patient && appointment.patient !== filters.patient) {
      return false;
    }
    
    // Filter by date
    if (filters.date && appointment.date !== filters.date) {
      return false;
    }
    
    // Filter by status
    if (filters.status && appointment.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  // Group appointments by date for the calendar view
  const appointmentsByDate = filteredAppointments.reduce((acc, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = [];
    }
    acc[appointment.date].push(appointment);
    return acc;
  }, {});

  if (loading) {
    return <Container className="py-4">Loading appointments...</Container>;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Appointment Management</h2>
        <Button variant="primary" onClick={handleNewAppointment}>
          <FaCalendarPlus className="me-2" />
          New Appointment
        </Button>
      </div>
      
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between">
            <div className="flex-grow-1 me-3">
              <Form.Control
                type="text"
                placeholder="Search appointments by patient, doctor, or reason..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button 
              variant="outline-primary"
              onClick={() => setShowFilterModal(true)}
            >
              <FaFilter className="me-2" />
              Filters
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      <Tabs defaultActiveKey="list" className="mb-4">
        <Tab eventKey="list" title="List View">
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
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
                        <td>{appointment.doctor}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.reason}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          <div className="d-flex">
                            {appointment.status === 'scheduled' && (
                              <Button 
                                variant="warning" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleUpdateStatus(appointment.id, 'checked-in')}
                              >
                                Check In
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              Edit
                            </Button>
                            
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-3">
                        No appointments found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="calendar" title="Calendar View">
          <Card className="shadow-sm">
            <Card.Body>
              {Object.keys(appointmentsByDate).length > 0 ? (
                Object.keys(appointmentsByDate).sort().map(date => (
                  <div key={date} className="mb-4">
                    <h5 className="border-bottom pb-2 mb-3">{date}</h5>
                    <div className="ms-3">
                      {appointmentsByDate[date].sort((a, b) => {
                        // Sort by time
                        const timeA = new Date(`2000-01-01 ${a.time}`);
                        const timeB = new Date(`2000-01-01 ${b.time}`);
                        return timeA - timeB;
                      }).map(appointment => (
                        <Card key={appointment.id} className="mb-2">
                          <Card.Body className="py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{appointment.time}</strong> - {appointment.patient}
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="me-3">{appointment.doctor}</span>
                                <span className="me-3">{getStatusBadge(appointment.status)}</span>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleEditAppointment(appointment)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  No appointments found matching the criteria.
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Appointments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select
                name="doctor"
                value={filters.doctor}
                onChange={handleFilterChange}
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                name="patient"
                value={filters.patient}
                onChange={handleFilterChange}
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.name}>
                    {patient.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked-in">Checked In</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Appointment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentAppointment ? 'Edit Appointment' : 'New Appointment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Doctor <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">Select Reason</option>
                <option value="Check-up">Check-up</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Test Results">Test Results</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            {currentAppointment && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="checked-in">Checked In</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </Form.Select>
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes or instructions..."
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentAppointment ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AppointmentManagement; 