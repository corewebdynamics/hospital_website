const db = require('../config/db');

// Get all appointments (with filters)
exports.getAppointments = async (req, res) => {
  try {
    const { doctor_id, patient_id, date, status } = req.query;
    let query = `
      SELECT a.*, 
        d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization,
        p.first_name as patient_first_name, p.last_name as patient_last_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      queryParams.push(doctor_id);
    }
    
    if (patient_id) {
      query += ' AND a.patient_id = ?';
      queryParams.push(patient_id);
    }
    
    if (date) {
      query += ' AND a.appointment_date = ?';
      queryParams.push(date);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY a.appointment_date, a.appointment_time';
    
    const [appointments] = await db.query(query, queryParams);
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.*, 
        d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization,
        p.first_name as patient_first_name, p.last_name as patient_last_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?`,
      [req.params.id]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointments[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Check if doctor exists
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [doctor_id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if patient exists
    const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [patient_id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check doctor's schedule
    const appointmentDay = new Date(appointment_date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const [schedules] = await db.query(
      'SELECT * FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?',
      [doctor_id, appointmentDay]
    );
    
    if (schedules.length === 0) {
      return res.status(400).json({ message: 'Doctor is not available on this day' });
    }
    
    const schedule = schedules[0];
    const appointmentTimeObj = new Date(`2000-01-01T${appointment_time}`);
    const startTimeObj = new Date(`2000-01-01T${schedule.start_time}`);
    const endTimeObj = new Date(`2000-01-01T${schedule.end_time}`);
    
    if (appointmentTimeObj < startTimeObj || appointmentTimeObj > endTimeObj) {
      return res.status(400).json({ message: 'Appointment time is outside doctor\'s working hours' });
    }
    
    // Check for existing appointments at the same time
    const [existingAppointments] = await db.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
      [doctor_id, appointment_date, appointment_time]
    );
    
    if (existingAppointments.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    
    // Create the appointment
    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) VALUES (?, ?, ?, ?, ?, "scheduled")',
      [patient_id, doctor_id, appointment_date, appointment_time, reason]
    );
    
    res.status(201).json({
      message: 'Appointment created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await db.query(
      'UPDATE appointments SET status = ?, notes = ? WHERE id = ?',
      [status, notes, id]
    );
    
    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 