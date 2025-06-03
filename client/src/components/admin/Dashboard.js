import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaUsers, FaUserMd, FaCalendarCheck, FaHospitalUser } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    users: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be separate API calls to the backend
        // For demo purposes, we'll use mock data
        
        // Mock data for statistics
        setStats({
          doctors: 12,
          patients: 145,
          appointments: 38,
          users: 175
        });

        // Mock data for recent users
        setRecentUsers([
          { id: 1, name: 'Dr. John Smith', email: 'john.smith@example.com', role: 'doctor', created: '2023-06-15' },
          { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'patient', created: '2023-06-14' },
          { id: 3, name: 'Mike Davis', email: 'mike.davis@example.com', role: 'receptionist', created: '2023-06-13' },
          { id: 4, name: 'Lisa Wong', email: 'lisa.w@example.com', role: 'patient', created: '2023-06-12' },
          { id: 5, name: 'Dr. Emily Clark', email: 'emily.clark@example.com', role: 'doctor', created: '2023-06-11' },
        ]);

        // In a real application, you would fetch actual data from your API:
        // const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
        // const usersRes = await axios.get('http://localhost:5000/api/admin/recent-users');
        // setStats(statsRes.data);
        // setRecentUsers(usersRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'doctor': return 'success';
      case 'receptionist': return 'info';
      case 'patient': return 'primary';
      default: return 'secondary';
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
        <h2 className="mb-0">Admin Dashboard</h2>
        <Button variant="primary" size="sm">Generate Report</Button>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <FaUserMd className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="mb-0">Doctors</h6>
                <h3 className="mb-0">{stats.doctors}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <FaHospitalUser className="text-success" size={24} />
              </div>
              <div>
                <h6 className="mb-0">Patients</h6>
                <h3 className="mb-0">{stats.patients}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <FaCalendarCheck className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="mb-0">Appointments</h6>
                <h3 className="mb-0">{stats.appointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <FaUsers className="text-info" size={24} />
              </div>
              <div>
                <h6 className="mb-0">Total Users</h6>
                <h3 className="mb-0">{stats.users}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Users */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Recent Users</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td>{user.created}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2">
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="bg-white text-end">
          <Button variant="link" className="text-decoration-none">View All Users</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

AdminDashboard.propTypes = {
  // Add any necessary prop types here
};

export default AdminDashboard; 