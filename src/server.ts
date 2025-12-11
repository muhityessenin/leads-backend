import env from './config/env';
import prisma from './config/db';
import { createApp } from './app';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    const app = createApp();

    const server = app.listen(env.port, () => {
      console.log(`✓ Server running on port ${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ Health check: http://localhost:${env.port}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
      });

      await prisma.$disconnect();
      console.log('Database connection closed');

      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
