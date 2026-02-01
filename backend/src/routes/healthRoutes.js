/**
 * Health Resources Routes
 * Handles health education resource-related API endpoints
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/health-resources - Get all health resources
router.get('/', healthController.getAllResources);

// GET /api/v1/health-resources/:id - Get resource by ID
router.get('/:id', healthController.getResourceById);

// POST /api/v1/health-resources - Create new resource
router.post('/', authenticate, healthController.createResource);

// PUT /api/v1/health-resources/:id - Update resource
router.put('/:id', authenticate, healthController.updateResource);

// DELETE /api/v1/health-resources/:id - Delete resource
router.delete('/:id', authenticate, healthController.deleteResource);

// GET /api/v1/health-resources/category/:category - Get resources by category
router.get('/category/:category', healthController.getResourcesByCategory);

module.exports = router;
