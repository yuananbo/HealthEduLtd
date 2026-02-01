/**
 * Course Service
 * Handles course-related API calls
 */

import api from './api';

export const courseService = {
  /**
   * Get all courses
   * @param {Object} params - Query parameters (page, limit, category, etc.)
   */
  getAllCourses: async (params = {}) => {
    return api.get('/courses', { params });
  },

  /**
   * Get course by ID
   * @param {string} id - Course ID
   */
  getCourseById: async (id) => {
    return api.get(`/courses/${id}`);
  },

  /**
   * Create new course
   * @param {Object} courseData - Course data
   */
  createCourse: async (courseData) => {
    return api.post('/courses', courseData);
  },

  /**
   * Update course
   * @param {string} id - Course ID
   * @param {Object} courseData - Updated course data
   */
  updateCourse: async (id, courseData) => {
    return api.put(`/courses/${id}`, courseData);
  },

  /**
   * Delete course
   * @param {string} id - Course ID
   */
  deleteCourse: async (id) => {
    return api.delete(`/courses/${id}`);
  },

  /**
   * Enroll in course
   * @param {string} id - Course ID
   */
  enrollInCourse: async (id) => {
    return api.post(`/courses/${id}/enroll`);
  },

  /**
   * Get course modules
   * @param {string} id - Course ID
   */
  getCourseModules: async (id) => {
    return api.get(`/courses/${id}/modules`);
  }
};
