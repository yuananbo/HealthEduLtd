/**
 * PostgreSQL Database Configuration
 * Using Sequelize ORM for database connectivity
 */

const { Sequelize } = require('sequelize');

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'healthedu_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Initialize Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

/**
 * Connect to PostgreSQL database
 */
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Database] PostgreSQL connection established successfully');
    
    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[Database] Models synchronized');
    }
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase
};
