/**
 * Utility Helper Functions
 * Common utility functions used across the application
 */

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration
 * @returns {string} JWT token
 */
exports.generateToken = (payload, secret, expiresIn) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
exports.hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Comparison result
 */
exports.comparePassword = async (password, hashedPassword) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination object with offset and limit
 */
exports.paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @returns {Object} Formatted response
 */
exports.formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data && { data })
  };
};
