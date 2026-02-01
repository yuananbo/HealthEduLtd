/**
 * Health Resources Service
 * Handles health resource-related API calls
 */

import api from './api';

export const healthService = {
  /**
   * Get all health resources
   * @param {Object} params - Query parameters (page, limit, category, etc.)
   */
  getAllResources: async (params = {}) => {
    return api.get('/health-resources', { params });
  },

  /**
   * Get resource by ID
   * @param {string} id - Resource ID
   */
  getResourceById: async (id) => {
    return api.get(`/health-resources/${id}`);
  },

  /**
   * Create new health resource
   * @param {Object} resourceData - Resource data
   */
  createResource: async (resourceData) => {
    return api.post('/health-resources', resourceData);
  },

  /**
   * Update health resource
   * @param {string} id - Resource ID
   * @param {Object} resourceData - Updated resource data
   */
  updateResource: async (id, resourceData) => {
    return api.put(`/health-resources/${id}`, resourceData);
  },

  /**
   * Delete health resource
   * @param {string} id - Resource ID
   */
  deleteResource: async (id) => {
    return api.delete(`/health-resources/${id}`);
  },

  /**
   * Get resources by category
   * @param {string} category - Category name
   */
  getResourcesByCategory: async (category) => {
    return api.get(`/health-resources/category/${category}`);
  }
};
