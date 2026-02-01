/**
 * HealthEduLtd Backend Server
 * Main entry point for the Express application
 */

const app = require('./app');
const { connectDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  try {
    // Connect to PostgreSQL database
    await connectDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`[Server] HealthEduLtd API running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
