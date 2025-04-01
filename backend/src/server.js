import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';
import movementsRouter from './routes/movements.js';
import trainingRouter from './routes/training.js';
import reportRoutes from './routes/reports.js';
import db from './services/db.js';
import { transporter } from './services/emailService.js';


const app = express();

// Middleware: apply CORS and JSON parsing first
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.json());

// Register routes
app.use('/api/movements', movementsRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/training', trainingRouter);
app.use('/api/reports', reportRoutes); // Fixed variable name consistency



const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});

app.get('/api/test-email', async (req, res) => {
  try {
    const testEmail = {
      from: `"Aircraft Task System" <${config.emailFrom}>`,
      to: 'daliwa52@gmail.com', // Change this to your email
      subject: 'SendGrid Test',
      text: 'If you can read this, SendGrid is working correctly!',
      html: '<h1>SendGrid Test</h1><p>If you can read this, SendGrid is working correctly!</p>'
    };

    const info = await transporter.sendMail(testEmail);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Test email sent successfully!'
    });
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.body || {}
    });
  }
});