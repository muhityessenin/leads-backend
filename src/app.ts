import express, { Express } from 'express';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware';

export const createApp = (): Express => {
  const app: Express = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Routes
  app.use('/api', routes);

  // Error handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

export default createApp;
