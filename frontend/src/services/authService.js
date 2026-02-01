/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import api from './api';

export const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  /**
   * Logout user
   */
  logout: async () => {
    return api.post('/auth/logout');
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    return api.post('/auth/refresh-token');
  },

  /**
   * Request password reset
   * @param {string} email - User email
   */
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} password - New password
   */
  resetPassword: async (token, password) => {
    return api.post('/auth/reset-password', { token, password });
  }
};
