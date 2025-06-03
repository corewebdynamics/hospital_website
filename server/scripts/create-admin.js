const bcrypt = require('bcrypt');
const db = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

async function createAdminUser() {
  try {
    // Admin user details
    const admin = {
      username: 'admin',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin'
    };
    
    // Check if admin already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [admin.username, admin.email]
    );
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin.password, salt);
    
    // Insert admin user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [admin.username, admin.email, hashedPassword, admin.role]
    );
    
    console.log(`Admin user created with ID: ${result.insertId}`);
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser(); 