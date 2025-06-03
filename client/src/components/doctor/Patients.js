import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaFileMedical, FaCalendarPlus } from 'react-icons/fa';
import axios from 'axios';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Get stored appointments from localStorage
      const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      
      // Create a unique list of patients from appointments
      const uniquePatients = [];
      const patientMap = new Map();
      
      storedAppointments.forEach(apt => {
        if (apt.patient && !patientMap.has(apt.patient)) {
          patientMap.set(apt.patient, true);
          
          // Find the last appointment for this patient
          const patientAppointments = storedAppointments
            .filter(a => a.patient === apt.patient)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          const lastAppointment = patientAppointments[0];
          
          // Generate a random age between 25-75 for demo purposes
          const age = Math.floor(Math.random() * (75 - 25 + 1)) + 25;
          
          // Randomly assign gender
          const gender = Math.random() > 0.5 ? 'Female' : 'Male';
          
          uniquePatients.push({
            id: uniquePatients.length + 1,
            name: apt.patient,
            age: age,
            gender: gender,
            lastVisit: lastAppointment ? lastAppointment.date : 'N/A',
            condition: lastAppointment ? lastAppointment.reason : 'N/A',
            phone: '(555) xxx-xxxx' // Generic phone format for privacy
          });
        }
      });
      
      setPatients(uniquePatients);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Container className="py-4">Loading patients...</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Patients</h2>
      
      {/* Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form>
            <InputGroup>
              <Form.Control
                placeholder="Search patients by name or condition..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Button variant="primary">
                <FaSearch className="me-2" />
                Search
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Patients Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Last Visit</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.lastVisit}</td>
                    <td>{patient.condition}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        <FaFileMedical className="me-1" />
                        Records
                      </Button>
                      <Button variant="outline-success" size="sm">
                        <FaCalendarPlus className="me-1" />
                        Schedule
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No patients found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Stats */}
      <Row className="mt-4 g-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h5>Total Patients</h5>
              <h2 className="display-4">{patients.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h5>New This Month</h5>
              <h2 className="display-4">
                {(() => {
                  // Calculate patients with first visit in the current month
                  const today = new Date();
                  const currentMonth = today.getMonth();
                  const currentYear = today.getFullYear();
                  
                  return patients.filter(patient => {
                    if (!patient.lastVisit || patient.lastVisit === 'N/A') return false;
                    const visitDate = new Date(patient.lastVisit);
                    return visitDate.getMonth() === currentMonth && 
                           visitDate.getFullYear() === currentYear;
                  }).length;
                })()}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h5>Appointments Today</h5>
              <h2 className="display-4">
                {(() => {
                  // Get today's appointments count
                  const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
                  const today = new Date().toISOString().split('T')[0];
                  return storedAppointments.filter(apt => apt.date === today).length;
                })()}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Patients; 