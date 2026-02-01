/**
 * API Routes Index
 * Central routing configuration
 */

const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const healthRoutes = require('./healthRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/health-resources', healthRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'HealthEduLtd API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      courses: '/api/v1/courses',
      healthResources: '/api/v1/health-resources'
    }
  });
});

module.exports = router;
