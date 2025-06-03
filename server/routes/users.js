const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes in this file require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', authorizeRole(['admin']), usersController.getAllUsers);

// Get a specific user
router.get('/:id', authorizeRole(['admin']), usersController.getUserById);

// Update a user
router.put('/:id', authorizeRole(['admin']), usersController.updateUser);

// Delete a user
router.delete('/:id', authorizeRole(['admin']), usersController.deleteUser);

module.exports = router; 