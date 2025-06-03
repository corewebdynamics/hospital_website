import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaCalendarPlus, FaCalendarCheck, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const ReceptionDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [stats, setStats] = useState({
    totalAppointmentsToday: 0,
    waitingPatients: 0,
    newPatients: 0,
    emergencyCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check-in modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [patientToCheckIn, setPatientToCheckIn] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [checkInDoctor, setCheckInDoctor] = useState('');
  const [checkInReason, setCheckInReason] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState('');
  const [checkInError, setCheckInError] = useState('');
  const [availableAppointments, setAvailableAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get appointments from localStorage
        const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        
        // Filter for today's appointments
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const todayStoredAppointments = storedAppointments
          .filter(apt => apt.date === today)
          .map(apt => ({
            id: apt.id,
            patient: apt.patient || 'Unknown Patient',
            doctor: apt.doctor || 'Unknown Doctor',
            time: apt.time,
            status: apt.status,
            type: apt.reason
          }));
        
        setTodayAppointments(todayStoredAppointments);

        // Calculate waiting patients based on checked-in status
        const waitingPatientsFromAppointments = todayStoredAppointments
          .filter(apt => apt.status === 'checked-in')
          .map(apt => ({
            id: apt.id,
            name: apt.patient,
            arrivalTime: getArrivalTime(apt.time), 
            doctor: apt.doctor,
            waitingTime: getWaitingTime(apt.time)
          }));
        
        setWaitingPatients(waitingPatientsFromAppointments);

        // Calculate statistics
        setStats({
          totalAppointmentsToday: todayStoredAppointments.filter(apt => apt.status !== 'cancelled').length,
          waitingPatients: waitingPatientsFromAppointments.length,
          newPatients: todayStoredAppointments.filter(apt => apt.type === 'New Patient' || apt.reason === 'New Patient').length,
          emergencyCases: todayStoredAppointments.filter(apt => apt.type === 'Emergency' || apt.reason === 'Emergency').length
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching reception dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    e.preventDefault();
    // In a real app, this would trigger an API call to search for patients
    console.log('Searching for:', searchTerm);
  };

  // Helper function to calculate arrival time (typically 15 mins before appointment)
  const getArrivalTime = (appointmentTime) => {
    try {
      // Parse the appointment time (basic implementation)
      const [time, period] = appointmentTime.split(' ');
      const [hour, minute] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hour;
      if (period === 'PM' && hour !== 12) hour24 += 12;
      if (period === 'AM' && hour === 12) hour24 = 0;
      
      // Subtract 15 minutes for arrival time
      let arrivalHour = hour24;
      let arrivalMinute = minute - 15;
      
      if (arrivalMinute < 0) {
        arrivalMinute += 60;
        arrivalHour -= 1;
        if (arrivalHour < 0) arrivalHour = 23;
      }
      
      // Convert back to 12-hour format
      let displayHour = arrivalHour % 12;
      if (displayHour === 0) displayHour = 12;
      const displayPeriod = arrivalHour < 12 ? 'AM' : 'PM';
      
      return `${displayHour}:${arrivalMinute.toString().padStart(2, '0')} ${displayPeriod}`;
    } catch (error) {
      return '15 mins before appointment';
    }
  };
  
  // Helper function to calculate waiting time
  const getWaitingTime = (appointmentTime) => {
    try {
      // Calculate difference between current time and arrival time
      // This is a simplified version for demo purposes
      return Math.floor(Math.random() * 30) + 5 + ' mins';
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleOpenCheckInModal = () => {
    setPatientToCheckIn('');
    setAppointmentDate(new Date().toISOString().split('T')[0]); // Today by default
    setAppointmentTime('');
    setCheckInDoctor('');
    setCheckInReason('');
    setCheckInError('');
    setCheckInSuccess('');
    
    // Get available appointments for today from localStorage
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = storedAppointments.filter(apt => 
      apt.date === today && apt.status === 'scheduled'
    );
    
    setAvailableAppointments(todayAppointments);
    setShowCheckInModal(true);
  };
  
  const handleCheckIn = () => {
    // Validate form
    if (!patientToCheckIn || !appointmentDate || !appointmentTime || !checkInDoctor || !checkInReason) {
      setCheckInError('Please fill in all required fields');
      return;
    }
    
    // Create a new appointment if one doesn't exist, or update an existing one
    const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
    
    // Check if selected appointment is from dropdown
    const selectedAppointment = availableAppointments.find(apt => 
      apt.id === parseInt(patientToCheckIn)
    );
    
    if (selectedAppointment) {
      // Update existing appointment
      const updatedAppointments = storedAppointments.map(apt => {
        if (apt.id === parseInt(patientToCheckIn)) {
          return {
            ...apt,
            status: 'checked-in'
          };
        }
        return apt;
      });
      
      localStorage.setItem('patientAppointments', JSON.stringify(updatedAppointments));
      
      // Add to waiting patients
      const newWaitingPatient = {
        id: selectedAppointment.id,
        name: selectedAppointment.patient,
        arrivalTime: getArrivalTime(selectedAppointment.time),
        doctor: selectedAppointment.doctor,
        waitingTime: '0 mins'
      };
      
      setWaitingPatients([...waitingPatients, newWaitingPatient]);
      
      // Update today's appointments list
      const updatedTodayAppointments = todayAppointments.map(apt => {
        if (apt.id === selectedAppointment.id) {
          return {
            ...apt,
            status: 'checked-in'
          };
        }
        return apt;
      });
      
      setTodayAppointments(updatedTodayAppointments);
      
      // Update stats
      setStats({
        ...stats,
        waitingPatients: stats.waitingPatients + 1
      });
      
      setCheckInSuccess('Patient checked in successfully');
      
      // Clear form after 2 seconds and close modal
      setTimeout(() => {
        setShowCheckInModal(false);
        setCheckInSuccess('');
      }, 2000);
    } else {
      // Create a new appointment and check in
      const newAppointmentId = Date.now();
      const newAppointment = {
        id: newAppointmentId,
        patient: patientToCheckIn,
        doctor: checkInDoctor,
        date: appointmentDate,
        time: appointmentTime,
        reason: checkInReason,
        status: 'checked-in',
        notes: 'Walk-in patient'
      };
      
      // Save to localStorage
      localStorage.setItem('patientAppointments', JSON.stringify([...storedAppointments, newAppointment]));
      
      // Add to today's appointments
      setTodayAppointments([...todayAppointments, {
        id: newAppointmentId,
        patient: patientToCheckIn,
        doctor: checkInDoctor,
        time: appointmentTime,
        status: 'checked-in',
        type: checkInReason
      }]);
      
      // Add to waiting patients
      const newWaitingPatient = {
        id: newAppointmentId,
        name: patientToCheckIn,
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctor: checkInDoctor,
        waitingTime: '0 mins'
      };
      
      setWaitingPatients([...waitingPatients, newWaitingPatient]);
      
      // Update stats
      setStats({
        ...stats,
        totalAppointmentsToday: stats.totalAppointmentsToday + 1,
        waitingPatients: stats.waitingPatients + 1
      });
      
      setCheckInSuccess('Patient checked in successfully');
      
      // Clear form after 2 seconds and close modal
      setTimeout(() => {
        setShowCheckInModal(false);
        setCheckInSuccess('');
      }, 2000);
    }
  };
  
  const handleSelectExistingAppointment = (e) => {
    const appointmentId = parseInt(e.target.value);
    if (!appointmentId) {
      setPatientToCheckIn('');
      setAppointmentTime('');
      setCheckInDoctor('');
      setCheckInReason('');
      return;
    }
    
    const selectedAppointment = availableAppointments.find(apt => apt.id === appointmentId);
    if (selectedAppointment) {
      setPatientToCheckIn(e.target.value);
      setAppointmentTime(selectedAppointment.time);
      setCheckInDoctor(selectedAppointment.doctor);
      setCheckInReason(selectedAppointment.reason);
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Reception Dashboard</h2>
        <div>
          <Button as={Link} to="/reception/patients/register" variant="outline-primary" className="me-2">
            <FaUserPlus className="me-2" />
            Register Patient
          </Button>
          <Button as={Link} to="/reception/appointments" variant="primary">
            <FaCalendarPlus className="me-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Today's Appointments</h6>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <FaCalendarCheck className="text-primary" />
                </div>
              </div>
              <h3 className="mb-0">{stats.totalAppointmentsToday}</h3>
              <small className="text-primary">Scheduled today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Waiting Patients</h6>
                <div className="bg-warning bg-opacity-10 p-2 rounded">
                  <FaUserPlus className="text-warning" />
                </div>
              </div>
              <h3 className="mb-0">{stats.waitingPatients}</h3>
              <small className="text-warning">Currently waiting</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">New Patients</h6>
                <div className="bg-success bg-opacity-10 p-2 rounded">
                  <FaUserPlus className="text-success" />
                </div>
              </div>
              <h3 className="mb-0">{stats.newPatients}</h3>
              <small className="text-success">Registered today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Emergency Cases</h6>
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <FaExclamationTriangle className="text-danger" />
                </div>
              </div>
              <h3 className="mb-0">{stats.emergencyCases}</h3>
              <small className="text-danger">Requires attention</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Patient Search */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                placeholder="Search patients by name, ID, or phone number..."
                aria-label="Search patients"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <FaSearch className="me-2" />
                Search
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Waiting Patients */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Waiting Room</h5>
          <Button variant="outline-success" size="sm" onClick={handleOpenCheckInModal}>Check In Patient</Button>
        </Card.Header>
        <Card.Body>
          {waitingPatients.length === 0 ? (
            <div className="text-center py-3">
              <p className="mb-0">No patients in the waiting room.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Arrival Time</th>
                  <th>Doctor</th>
                  <th>Waiting Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.arrivalTime}</td>
                    <td>{patient.doctor}</td>
                    <td>{patient.waitingTime}</td>
                    <td>
                      <Button variant="success" size="sm" className="me-2">
                        Send to Doctor
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Today's Appointments */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Today's Appointments</h5>
          <Button as={Link} to="/reception/appointments" variant="outline-primary" size="sm">Manage All</Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.patient}</td>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.type}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    {appointment.status === 'scheduled' ? (
                      <Button variant="warning" size="sm" className="me-2">
                        Check In
                      </Button>
                    ) : appointment.status === 'checked-in' ? (
                      <Button variant="info" size="sm" className="me-2">
                        Notify Doctor
                      </Button>
                    ) : null}
                    <Button variant="outline-secondary" size="sm">
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Check In Modal */}
      <Modal show={showCheckInModal} onHide={() => setShowCheckInModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Check In Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkInError && <Alert variant="danger">{checkInError}</Alert>}
          {checkInSuccess && <Alert variant="success">{checkInSuccess}</Alert>}
          
          <Form>
            {availableAppointments.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Select Existing Appointment</Form.Label>
                <Form.Select 
                  value={patientToCheckIn} 
                  onChange={handleSelectExistingAppointment}
                >
                  <option value="">-- Select an appointment --</option>
                  {availableAppointments.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {apt.patient} - {apt.time} ({apt.doctor})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            <hr />
            <p>Or enter new patient details:</p>
            
            <Form.Group className="mb-3">
              <Form.Label>Patient Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter patient name"
                value={availableAppointments.find(apt => apt.id === parseInt(patientToCheckIn))?.patient || patientToCheckIn}
                onChange={(e) => {
                  // Clear selected appointment and set name directly
                  setPatientToCheckIn(e.target.value);
                }}
                disabled={availableAppointments.find(apt => apt.id === parseInt(patientToCheckIn))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Appointment Date</Form.Label>
              <Form.Control
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Appointment Time</Form.Label>
              <Form.Control 
                type="time" 
                value={appointmentTime.includes(':') ? appointmentTime : ''}
                onChange={(e) => setAppointmentTime(e.target.value)}
                disabled={availableAppointments.find(apt => apt.id === parseInt(patientToCheckIn))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter doctor name"
                value={checkInDoctor}
                onChange={(e) => setCheckInDoctor(e.target.value)}
                disabled={availableAppointments.find(apt => apt.id === parseInt(patientToCheckIn))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter reason for visit"
                value={checkInReason}
                onChange={(e) => setCheckInReason(e.target.value)}
                disabled={availableAppointments.find(apt => apt.id === parseInt(patientToCheckIn))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCheckIn} disabled={checkInSuccess}>
            Check In Patient
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReceptionDashboard; 