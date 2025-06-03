import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'add'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'patient',
    first_name: '',
    last_name: '',
    phone: '',
    specialization: '',
    qualification: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users from the backend API
      let response;
      try {
        response = await axios.get('http://localhost:5000/api/users', {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        setUsers(response.data);
      } catch (fetchErr) {
        console.error('Error fetching from API, using mock data instead:', fetchErr);
        
        // Fallback to mock data if API fails
        const mockUsers = [
          { id: 1, username: 'admin', email: 'admin@hospital.com', role: 'admin' },
          { id: 2, username: 'drsmith', email: 'john.smith@hospital.com', role: 'doctor', first_name: 'John', last_name: 'Smith', specialization: 'Cardiology' },
          { id: 3, username: 'sarahj', email: 'sarah.j@example.com', role: 'patient', first_name: 'Sarah', last_name: 'Johnson' },
          { id: 4, username: 'mikedavis', email: 'mike.davis@hospital.com', role: 'receptionist', first_name: 'Mike', last_name: 'Davis' },
          { id: 5, username: 'drclark', email: 'emily.clark@hospital.com', role: 'doctor', first_name: 'Emily', last_name: 'Clark', specialization: 'Pediatrics' },
        ];
        
        setUsers(mockUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'patient',
      first_name: '',
      last_name: '',
      phone: '',
      specialization: '',
      qualification: ''
    });
    setError('');
    setSuccess('');
  };

  const handleAddUser = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setModalMode('edit');
    
    // For edit, we don't set password - it will be updated separately if needed
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      specialization: user.specialization || '',
      qualification: user.qualification || ''
    });
    
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (modalMode === 'add') {
        // Create a new user via API
        const response = await axios.post('http://localhost:5000/api/auth/register', formData);
        
        console.log('User created:', response.data);
        
        // Add the user to the local state
        const newUser = {
          id: response.data.user.id,
          ...formData,
          password: undefined // Don't store password in client state
        };
        
        setUsers([...users, newUser]);
        setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully`);
        
        // Keep the modal open to show success message
        setTimeout(() => {
          setShowModal(false);
          resetForm();
        }, 1500);
      } else {
        // Update the user via API
        const response = await axios.put(`http://localhost:5000/api/users/${currentUser.id}`, 
          // Only send password if it was changed
          formData.password ? formData : { ...formData, password: undefined },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        console.log('User updated:', response.data);
        
        // Update the user in the local state
        const updatedUsers = users.map(user => 
          user.id === currentUser.id ? { ...user, ...formData, password: undefined } : user
        );
        
        setUsers(updatedUsers);
        setSuccess('User updated successfully');
        
        // Keep the modal open to show success message
        setTimeout(() => {
          setShowModal(false);
          resetForm();
        }, 1500);
      }
    } catch (err) {
      console.error('Error handling user:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleDeleteUser = (userId) => {
    // In a real app, this would delete the user via API
    // await axios.delete(`http://localhost:5000/api/users/${userId}`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // });
    
    // For demo purposes, simulate API call
    console.log('Delete user with ID:', userId);
    
    // Remove the user from the local state for demo purposes
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  // Render additional fields based on the selected role
  const renderRoleFields = () => {
    const { role } = formData;
    
    const commonFields = (
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    );
    
    if (role === 'doctor') {
      return (
        <>
          {commonFields}
          <Form.Group className="mb-3">
            <Form.Label>Specialization</Form.Label>
            <Form.Control
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Qualification</Form.Label>
            <Form.Control
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      );
    } else if (role === 'patient' || role === 'receptionist') {
      return commonFields;
    }
    
    return null;
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading users...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button variant="primary" onClick={handleAddUser}>Add New User</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : '-'}
              </td>
              <td>{user.email}</td>
              <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* User Modal (Add/Edit) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {modalMode === 'add' && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalMode === 'add'}
                  placeholder={modalMode === 'edit' ? 'Leave blank to keep unchanged' : ''}
                />
                {modalMode === 'add' && (
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {modalMode === 'add' ? (
                  <>
                    {/* In add mode, admin can create any type of user */}
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="patient">Patient</option>
                    {/* Only show admin option in edit mode or if adding with special rights */}
                    <option value="admin">Admin</option>
                  </>
                ) : (
                  <>
                    {/* In edit mode, ensure we keep the original role option */}
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>

            {renderRoleFields()}
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={() => setShowModal(false)}
                disabled={!!success}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={!!success}
              >
                {success ? 'Saved!' : modalMode === 'add' ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement; 