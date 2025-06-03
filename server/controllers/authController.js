const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, first_name, last_name, phone, specialization, qualification } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Insert the new user
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );

      const userId = result.insertId;

      // Create role-specific records
      if (role === 'doctor') {
        await db.query(
          'INSERT INTO doctors (user_id, first_name, last_name, specialization, qualification, phone) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, first_name || '', last_name || '', specialization || '', qualification || '', phone || '']
        );
      } else if (role === 'patient') {
        await db.query(
          'INSERT INTO patients (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
          [userId, first_name || '', last_name || '', phone || '']
        );
      } else if (role === 'receptionist') {
        // Create receptionist record
        await db.query(
          'INSERT INTO receptionists (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
          [userId, first_name || '', last_name || '', phone || '']
        );
      }

      // Generate token
      const token = jwt.sign(
        { id: userId, username, email, role },
        process.env.JWT_SECRET || 'hospital_system_jwt_secret_key',
        { expiresIn: '1d' }
      );

      // Commit the transaction
      await db.query('COMMIT');

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { 
          id: userId, 
          username, 
          email, 
          role,
          first_name,
          last_name
        }
      });
    } catch (error) {
      // Rollback the transaction if there's an error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the user
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'hospital_system_jwt_secret_key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const [users] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get role-specific data
    let profileData = {};
    
    if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [userId]);
      if (doctors.length > 0) {
        profileData = doctors[0];
      }
    } else if (user.role === 'patient') {
      const [patients] = await db.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
      if (patients.length > 0) {
        profileData = patients[0];
      }
    }
    
    res.json({
      user,
      profile: profileData
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 