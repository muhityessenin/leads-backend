import prisma from './config/db';
import { createApp } from './app';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    const app = createApp();

    const PORT = 3000;

    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
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
