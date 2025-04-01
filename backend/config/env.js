import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, '../.env') // Points to backend/.env
});

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zaf_aams'
  },

  // Email configuration
  emailService: process.env.EMAIL_SERVICE || 'sendgrid',
  emailUser: process.env.EMAIL_USER || 'apikey', // For SendGrid, this should be 'apikey'
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',

  // Task notification recipients
  taskNotificationRecipients: process.env.TASK_NOTIFICATION_RECIPIENTS || '',

  // Server configuration
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // JWT Secret for auth
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};