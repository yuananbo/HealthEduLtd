/**
 * Health Resource Model
 * Defines the HealthResource schema for PostgreSQL using Sequelize
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthResource = sequelize.define('HealthResource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('article', 'video', 'infographic', 'guide', 'faq'),
    defaultValue: 'article'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'health_resources',
  timestamps: true,
  underscored: true
});

// TODO: Define associations with User model

module.exports = HealthResource;
