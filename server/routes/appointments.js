const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all appointments (filtered by query params)
router.get('/', authenticateToken, appointmentsController.getAppointments);

// Get appointment by ID
router.get('/:id', authenticateToken, appointmentsController.getAppointmentById);

// Create new appointment
router.post('/', authenticateToken, appointmentsController.createAppointment);

// Update appointment status
router.patch('/:id/status', authenticateToken, appointmentsController.updateAppointmentStatus);

// Delete appointment (admin and reception only)
router.delete('/:id', authorize(['admin', 'receptionist']), appointmentsController.deleteAppointment);

module.exports = router; 