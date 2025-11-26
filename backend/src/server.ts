import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectToDatabase, isConnected } from './config/database';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ MongoDB connected');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 ReactBis Backend running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${isConnected() ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
