/**
 * User Service
 * Handles user-related API calls
 */

import api from './api';

export const userService = {
  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters
   */
  getAllUsers: async (params = {}) => {
    return api.get('/users', { params });
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   */
  getUserById: async (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   */
  updateUser: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Delete user
   * @param {string} id - User ID
   */
  deleteUser: async (id) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Get user profile
   * @param {string} id - User ID
   */
  getUserProfile: async (id) => {
    return api.get(`/users/${id}/profile`);
  }
};
