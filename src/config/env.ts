import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'webhook_secret',
  oneVisionApiKey: process.env.ONE_VISION_API_KEY || '',
  oneVisionApiUrl: process.env.ONE_VISION_API_URL || '',
};

export default env;
