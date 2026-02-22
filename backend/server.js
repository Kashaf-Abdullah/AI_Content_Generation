require('dotenv').config({ path: './.env' });
const app = require('./app');
const connectDB = require('./config/database');
const schedulerService = require('./services/schedulerService');

const PORT = process.env.PORT || 5000;

// Graceful shutdown
const shutDown = (httpServer) => {
  console.log('🔄 Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected.');
 // Start the scheduler
    schedulerService.start();
    console.log('✅ Scheduler Service Started');

    // AI provider key validation
    if (process.env.AI_PROVIDER === 'GEMINI') {
      if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI selected as AI_PROVIDER but GEMINI_API_KEY is missing.');
        process.exit(1);
      }
    } else if (process.env.AI_PROVIDER === 'OPENAI') {
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI selected as AI_PROVIDER but OPENAI_API_KEY is missing.');
        process.exit(1);
      }
    }

    const httpServer = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}/health`);
    });

    process.on('SIGTERM', () => shutDown(httpServer));
    process.on('SIGINT', () => shutDown(httpServer));

  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
};

startServer();
