/**
 * Course Routes
 * Handles educational course-related API endpoints
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/courses - Get all courses
router.get('/', courseController.getAllCourses);

// GET /api/v1/courses/:id - Get course by ID
router.get('/:id', courseController.getCourseById);

// POST /api/v1/courses - Create new course (admin/instructor)
router.post('/', authenticate, courseController.createCourse);

// PUT /api/v1/courses/:id - Update course
router.put('/:id', authenticate, courseController.updateCourse);

// DELETE /api/v1/courses/:id - Delete course
router.delete('/:id', authenticate, courseController.deleteCourse);

// POST /api/v1/courses/:id/enroll - Enroll in course
router.post('/:id/enroll', authenticate, courseController.enrollInCourse);

// GET /api/v1/courses/:id/modules - Get course modules
router.get('/:id/modules', courseController.getCourseModules);

module.exports = router;
