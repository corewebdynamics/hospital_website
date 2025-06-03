const db = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

async function checkUsers() {
  try {
    // Get all users from the database
    const [users] = await db.query('SELECT * FROM users');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users in the database:`);
    console.log('-----------------------------------');
    
    for (const user of users) {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.created_at}`);
      console.log('-----------------------------------');
      
      // Get additional information based on role
      if (user.role === 'doctor') {
        const [doctors] = await db.query(
          'SELECT * FROM doctors WHERE user_id = ?',
          [user.id]
        );
        if (doctors.length > 0) {
          const doctor = doctors[0];
          console.log(`Doctor details:`);
          console.log(`Name: ${doctor.first_name} ${doctor.last_name}`);
          console.log(`Specialization: ${doctor.specialization}`);
          console.log(`Qualification: ${doctor.qualification}`);
          console.log(`Phone: ${doctor.phone}`);
          console.log('-----------------------------------');
        } else {
          console.log(`Warning: Doctor record not found for user ${user.id}`);
          console.log('-----------------------------------');
        }
      } else if (user.role === 'patient') {
        const [patients] = await db.query(
          'SELECT * FROM patients WHERE user_id = ?',
          [user.id]
        );
        if (patients.length > 0) {
          const patient = patients[0];
          console.log(`Patient details:`);
          console.log(`Name: ${patient.first_name} ${patient.last_name}`);
          console.log(`Phone: ${patient.phone}`);
          console.log('-----------------------------------');
        } else {
          console.log(`Warning: Patient record not found for user ${user.id}`);
          console.log('-----------------------------------');
        }
      } else if (user.role === 'receptionist') {
        // Check if there's a specific table for receptionists
        try {
          const [receptionists] = await db.query(
            'SELECT * FROM receptionists WHERE user_id = ?',
            [user.id]
          );
          if (receptionists.length > 0) {
            const receptionist = receptionists[0];
            console.log(`Receptionist details:`);
            console.log(`Name: ${receptionist.first_name} ${receptionist.last_name}`);
            console.log(`Phone: ${receptionist.phone}`);
            console.log('-----------------------------------');
          }
        } catch (error) {
          // Table might not exist, which is okay
          console.log(`Note: No specific receptionist details found`);
          console.log('-----------------------------------');
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

// Run the function
checkUsers(); 