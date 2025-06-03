import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, ListGroup, Tabs, Tab, Table, Badge, Button, Accordion } from 'react-bootstrap';
import axios from 'axios';

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      // In a real app, these would be API calls
      // For demo purposes, we'll use mock data
      
      // Mock medical records
      const mockRecords = [
        { 
          id: 1, 
          date: '2023-05-15', 
          doctor: 'Dr. John Smith', 
          specialty: 'Cardiology',
          diagnosis: 'Hypertension',
          notes: 'Patient presented with elevated blood pressure. Prescribed medication and recommended lifestyle changes.',
          vitals: {
            bloodPressure: '140/90 mmHg',
            heartRate: '78 bpm',
            temperature: '98.6°F',
            weight: '165 lbs'
          }
        },
        { 
          id: 2, 
          date: '2023-04-10', 
          doctor: 'Dr. Emily Clark', 
          specialty: 'Dermatology',
          diagnosis: 'Eczema',
          notes: 'Patient has eczema on both hands. Prescribed topical corticosteroid cream.',
          vitals: {
            bloodPressure: '125/85 mmHg',
            heartRate: '72 bpm',
            temperature: '98.4°F',
            weight: '164 lbs'
          }
        },
        { 
          id: 3, 
          date: '2023-03-05', 
          doctor: 'Dr. John Smith', 
          specialty: 'Cardiology',
          diagnosis: 'Follow-up for Hypertension',
          notes: 'Blood pressure has improved. Continue current medication regimen.',
          vitals: {
            bloodPressure: '135/88 mmHg',
            heartRate: '75 bpm',
            temperature: '98.5°F',
            weight: '167 lbs'
          }
        },
      ];
      
      // Mock medications
      const mockMedications = [
        { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2023-05-15', status: 'active' },
        { id: 2, name: 'Hydrocortisone Cream', dosage: 'Apply thin layer', frequency: 'Twice daily', startDate: '2023-04-10', endDate: '2023-04-24', status: 'completed' },
        { id: 3, name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for pain', startDate: '2023-03-05', endDate: '2023-03-12', status: 'completed' },
      ];
      
      // Mock allergies
      const mockAllergies = [
        { id: 1, allergen: 'Penicillin', severity: 'Severe', reaction: 'Hives, difficulty breathing', diagnosed: '2020-01-15' },
        { id: 2, allergen: 'Peanuts', severity: 'Moderate', reaction: 'Swelling, itching', diagnosed: '2015-03-22' },
      ];
      
      // Mock vaccinations
      const mockVaccinations = [
        { id: 1, vaccine: 'Influenza', date: '2022-10-15', provider: 'Dr. Sarah Johnson' },
        { id: 2, vaccine: 'COVID-19', date: '2021-05-10', provider: 'Community Vaccination Center' },
        { id: 3, vaccine: 'Tetanus', date: '2018-07-22', provider: 'Dr. Michael Brown' },
      ];
      
      setRecords(mockRecords);
      setMedications(mockMedications);
      setAllergies(mockAllergies);
      setVaccinations(mockVaccinations);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setLoading(false);
    }
  };

  const getMedicationStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge bg="success">Active</Badge>;
      case 'completed': return <Badge bg="secondary">Completed</Badge>;
      case 'discontinued': return <Badge bg="danger">Discontinued</Badge>;
      default: return <Badge bg="primary">{status}</Badge>;
    }
  };

  const getAllergySeverityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe': return <Badge bg="danger">Severe</Badge>;
      case 'moderate': return <Badge bg="warning">Moderate</Badge>;
      case 'mild': return <Badge bg="info">Mild</Badge>;
      default: return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  if (loading) {
    return <Container className="py-4">Loading medical history...</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Medical History</h2>
      
      <Tabs defaultActiveKey="records" className="mb-4">
        <Tab eventKey="records" title="Medical Records">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Past Visits and Diagnoses</h5>
              
              <Accordion>
                {records.map((record, index) => (
                  <Accordion.Item key={record.id} eventKey={`${index}`}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between w-100 me-3">
                        <span><strong>{record.date}</strong> - {record.doctor}</span>
                        <span>{record.diagnosis}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={8}>
                          <p><strong>Specialty:</strong> {record.specialty}</p>
                          <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                          <p><strong>Notes:</strong> {record.notes}</p>
                        </Col>
                        <Col md={4}>
                          <Card className="bg-light">
                            <Card.Body>
                              <h6>Vitals</h6>
                              <ListGroup variant="flush">
                                <ListGroup.Item className="bg-light px-0 py-1">
                                  <strong>BP:</strong> {record.vitals.bloodPressure}
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-light px-0 py-1">
                                  <strong>HR:</strong> {record.vitals.heartRate}
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-light px-0 py-1">
                                  <strong>Temp:</strong> {record.vitals.temperature}
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-light px-0 py-1">
                                  <strong>Weight:</strong> {record.vitals.weight}
                                </ListGroup.Item>
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      <div className="mt-3 text-end">
                        <Button variant="outline-primary" size="sm">View Full Record</Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              
              {records.length === 0 && (
                <p className="text-center py-3">No medical records found.</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="medications" title="Medications">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Current and Past Medications</h5>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(medication => (
                    <tr key={medication.id}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage}</td>
                      <td>{medication.frequency}</td>
                      <td>{medication.startDate}</td>
                      <td>{medication.endDate || '-'}</td>
                      <td>{getMedicationStatusBadge(medication.status)}</td>
                    </tr>
                  ))}
                  {medications.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-3">No medications found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="allergies" title="Allergies & Immunizations">
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-3">Allergies</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Allergen</th>
                        <th>Severity</th>
                        <th>Reaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allergies.map(allergy => (
                        <tr key={allergy.id}>
                          <td>{allergy.allergen}</td>
                          <td>{getAllergySeverityBadge(allergy.severity)}</td>
                          <td>{allergy.reaction}</td>
                        </tr>
                      ))}
                      {allergies.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center py-3">No allergies recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Immunizations</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Vaccine</th>
                        <th>Date</th>
                        <th>Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccinations.map(vaccination => (
                        <tr key={vaccination.id}>
                          <td>{vaccination.vaccine}</td>
                          <td>{vaccination.date}</td>
                          <td>{vaccination.provider}</td>
                        </tr>
                      ))}
                      {vaccinations.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center py-3">No immunizations recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="test-results" title="Test Results">
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h5>Lab & Test Results</h5>
              <p className="text-muted">No recent test results available.</p>
              <Button variant="primary">Request Test Results</Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default MedicalHistory; 