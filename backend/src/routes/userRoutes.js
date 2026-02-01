/**
 * User Routes
 * Handles user-related API endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/users - Get all users (admin only)
router.get('/', authenticate, userController.getAllUsers);

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// PUT /api/v1/users/:id - Update user
router.put('/:id', authenticate, userController.updateUser);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', authenticate, userController.deleteUser);

// GET /api/v1/users/:id/profile - Get user profile
router.get('/:id/profile', authenticate, userController.getUserProfile);

module.exports = router;
