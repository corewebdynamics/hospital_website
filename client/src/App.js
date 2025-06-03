import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for authentication
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force reload the app to reset state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Admin components
import AdminDashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';

// Doctor components
import DoctorDashboard from './components/doctor/Dashboard';
import Appointments from './components/doctor/Appointments';
import Patients from './components/doctor/Patients';

// Patient components
import PatientDashboard from './components/patient/Dashboard';
import BookAppointment from './components/patient/BookAppointment';
import MedicalHistory from './components/patient/MedicalHistory';

// Reception components
import ReceptionDashboard from './components/reception/Dashboard';
import PatientRegistration from './components/reception/PatientRegistration';
import AppointmentManagement from './components/reception/AppointmentManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return <div className="text-center mt-5">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />
        <main className="flex-grow-1 container py-4">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Doctor routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Patients />
              </ProtectedRoute>
            } />
            
            {/* Patient routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/appointments/book" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/patient/medical-history" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalHistory />
              </ProtectedRoute>
            } />
            
            {/* Reception routes */}
            <Route path="/reception" element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reception/patients/register" element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <PatientRegistration />
              </ProtectedRoute>
            } />
            <Route path="/reception/appointments" element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <AppointmentManagement />
              </ProtectedRoute>
            } />
            
            {/* Default route based on user role */}
            <Route path="/" element={
              !isAuthenticated ? <Navigate to="/login" /> :
              user?.role === 'admin' ? <Navigate to="/admin" /> :
              user?.role === 'doctor' ? <Navigate to="/doctor" /> :
              user?.role === 'patient' ? <Navigate to="/patient" /> :
              user?.role === 'receptionist' ? <Navigate to="/reception" /> :
              <Navigate to="/login" />
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
