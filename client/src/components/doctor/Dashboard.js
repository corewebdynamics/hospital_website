import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
import { FaCalendarCheck, FaUserInjured, FaClipboardList, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get appointments from localStorage
      const storedAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      
      // Calculate statistics from actual stored appointments
      const stats = {
        totalAppointments: storedAppointments.length,
        todayAppointments: storedAppointments.filter(apt => 
          apt.date === new Date().toISOString().split('T')[0]
        ).length,
        totalPatients: new Set(storedAppointments.map(apt => apt.patient)).size,
        pendingReports: storedAppointments.filter(apt => 
          apt.status === 'completed' && (!apt.notes || apt.notes.trim() === '')
        ).length
      };
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = storedAppointments
        .filter(apt => apt.date === today)
        .map(apt => ({
          id: apt.id,
          patient: apt.patient,
          time: apt.time,
          date: apt.date,
          reason: apt.reason,
          status: apt.status
        }));
      
      // Generate list of unique patients from appointments
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
          const nextAppointment = patientAppointments
            .find(a => 
              new Date(`${a.date}T${a.time}`) > new Date() && 
              a.status !== 'cancelled'
            );
          
          uniquePatients.push({
            id: uniquePatients.length + 1,
            name: apt.patient,
            lastVisit: lastAppointment ? lastAppointment.date : 'N/A',
            condition: lastAppointment ? lastAppointment.reason : 'N/A',
            nextAppointment: nextAppointment ? nextAppointment.date : 'None Scheduled'
          });
        }
      });
      
      // Sort by last visit date (most recent first) and take the first 3
      const recentPatients = uniquePatients
        .filter(p => p.lastVisit !== 'N/A')
        .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
        .slice(0, 3);
      
      setStats(stats);
      setUpcomingAppointments(todayAppointments);
      setRecentPatients(recentPatients);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return <Container className="py-4">Loading dashboard...</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Doctor Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FaCalendarCheck className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="mb-1">Today's Appointments</h6>
                <h3 className="mb-0">{stats.todayAppointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <FaUserInjured className="text-success" size={24} />
              </div>
              <div>
                <h6 className="mb-1">Total Patients</h6>
                <h3 className="mb-0">{stats.totalPatients}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <FaClipboardList className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="mb-1">Pending Reports</h6>
                <h3 className="mb-0">{stats.pendingReports}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <FaClock className="text-info" size={24} />
              </div>
              <div>
                <h6 className="mb-1">Total Appointments</h6>
                <h3 className="mb-0">{stats.totalAppointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col lg={8}>
          {/* Today's Schedule */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Today's Schedule</h5>
                <Button as={Link} to="/doctor/appointments" variant="outline-primary" size="sm">View All</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.reason}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          {appointment.status === 'checked-in' ? (
                            <Button variant="success" size="sm">Start Session</Button>
                          ) : appointment.status === 'scheduled' ? (
                            <Button variant="outline-primary" size="sm">View Details</Button>
                          ) : (
                            <Button variant="outline-secondary" size="sm">View Details</Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3">No appointments scheduled for today.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          {/* Recent Patients */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Patients</h5>
                <Button as={Link} to="/doctor/patients" variant="outline-primary" size="sm">View All Patients</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Last Visit</th>
                    <th>Condition</th>
                    <th>Next Appointment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.name}</td>
                      <td>{patient.lastVisit}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.nextAppointment}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">View Records</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Schedule Progress */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Today's Progress</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Appointments Completed</span>
                  <span>{2}/{stats.todayAppointments}</span>
                </div>
                <ProgressBar 
                  now={stats.todayAppointments > 0 ? (2 / stats.todayAppointments) * 100 : 0} 
                  variant="success" 
                  className="mb-3"
                />
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Reports Completed</span>
                  <span>{1}/{stats.pendingReports + 1}</span>
                </div>
                <ProgressBar 
                  now={((1) / (stats.pendingReports + 1)) * 100} 
                  variant="info" 
                  className="mb-3"
                />
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Overall Day Progress</span>
                  <span>25%</span>
                </div>
                <ProgressBar now={25} variant="primary" />
              </div>
              
              <div className="text-center mt-4">
                <p className="text-muted mb-2">Next Appointment</p>
                {upcomingAppointments.length > 0 ? (
                  <div className="border rounded p-3">
                    <h6 className="mb-1">{upcomingAppointments[0].patient}</h6>
                    <p className="mb-1">{upcomingAppointments[0].time} - {upcomingAppointments[0].reason}</p>
                    <div>{getStatusBadge(upcomingAppointments[0].status)}</div>
                  </div>
                ) : (
                  <p>No upcoming appointments</p>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {/* Quick Actions */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary">
                  <FaCalendarCheck className="me-2" />
                  View Today's Schedule
                </Button>
                <Button variant="outline-success">
                  <FaUserInjured className="me-2" />
                  Search Patient Records
                </Button>
                <Button variant="outline-info">
                  <FaClipboardList className="me-2" />
                  Write Medical Report
                </Button>
                <Button variant="outline-secondary">
                  <FaClock className="me-2" />
                  Update Availability
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard; 