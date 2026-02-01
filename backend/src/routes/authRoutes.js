/**
 * Authentication Routes
 * Handles login, registration, and token management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/v1/auth/login - User login
router.post('/login', authController.login);

// POST /api/v1/auth/logout - User logout
router.post('/logout', authenticate, authController.logout);

// POST /api/v1/auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authController.refreshToken);

// GET /api/v1/auth/me - Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password - Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
