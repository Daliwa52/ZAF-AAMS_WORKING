import nodemailer from 'nodemailer';
import { config } from '../../config/env.js';

// Create a transporter using SendGrid
export const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465, // Use SSL port instead of 587
  secure: true,
  auth: {
    user: 'apikey', // Literal string 'apikey' (not a variable)
    pass: config.sendgridApiKey
  },
  tls: {
    rejectUnauthorized: false // Bypass SSL verification if needed
  }
});

/**
 * Send a notification email for a task
 * @param {Array<string>} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {Object} task - Task data object
 * @param {string} authority - Authority information
 * @returns {Promise} - Resolves when email is sent
 */
export const sendTaskNotification = async (recipients, subject, task, authority) => {
  try {
    // Format date for display
    const formattedDate = new Date(task.date_of_flight).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Process affected days for display - MOVED UP before HTML content creation
    let affectedDaysDisplay = 'None';

    if (task.affected_dates) {
      try {
        // Try to parse JSON string if it's stored that way
        const datesArray = typeof task.affected_dates === 'string'
          ? JSON.parse(task.affected_dates)
          : task.affected_dates;

        if (Array.isArray(datesArray) && datesArray.length > 0) {
          // Format each date and join with commas
          affectedDaysDisplay = datesArray.map(date => {
            try {
              return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            } catch (e) {
              return date; // If date can't be formatted, use as is
            }
          }).join(', ');
        }
      } catch (e) {
        // If parsing fails, use the raw value or 'None'
        affectedDaysDisplay = String(task.affected_dates) || 'None';
      }
    }

    // Create email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${subject}: ${task.task_number}</h2>

        <div style="margin: 20px 0;">
          <p><strong>Date of Flight:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> ${task.task_status.toUpperCase()}</p>
          <p><strong>Aircraft Type:</strong> ${task.aircraft_type || 'Not specified'}</p>
          <p><strong>ETD:</strong> ${task.estimated_time_of_departure || 'Not specified'}</p>
          <p><strong>Route:</strong> ${task.route || 'Not specified'}</p>
          <p><strong>Purpose:</strong> ${task.purpose || 'Not specified'}</p>
          <p><strong>Crew:</strong> ${task.crew || 'Not specified'}</p>
          <p><strong>Passengers:</strong> ${task.pax || 'Not specified'}</p>
          <p><strong>Affected Days:</strong> ${affectedDaysDisplay}</p>
          <p><strong>Authority:</strong> ${authority}</p>
        </div>

        <div style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          <p>This is an automated message from ZAF AAMS Aircraft Task System. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Create plain text version as fallback
    const textContent = `
      ${subject}: ${task.task_number}

      Date of Flight: ${formattedDate}
      Status: ${task.task_status.toUpperCase()}
      Aircraft Type: ${task.aircraft_type || 'Not specified'}
      ETD: ${task.estimated_time_of_departure || 'Not specified'}
      Route: ${task.route || 'Not specified'}
      Purpose: ${task.purpose || 'Not specified'}
      Crew: ${task.crew || 'Not specified'}
      Passengers: ${task.pax || 'Not specified'}
      Affected Days: ${affectedDaysDisplay}
      Authority: ${authority}

      This is an automated message from the ZAF AAMS Aircraft Task System. Please do not reply to this email.
    `;

    const mailOptions = {
      from: `"ZAF AHQ CITY OPERATIONS" <${config.emailFrom}>`,
      to: recipients.join(','),
      subject: `${subject}: ${task.task_number}`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

/**
 * Email rate limiter middleware for Express
 * Prevents sending too many emails in a short period
 */
export const emailLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: 'Too many emails sent from this IP, please try again after 15 minutes',
  keyGenerator: (req) => {
    return req.ip; // Use the IP address as the key
  },
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many emails sent. Please try again later.' });
  },
  skip: (req) => {
    // Optional: Skip the rate limiter for certain routes or conditions
    return false;
  },
  // Keep track of sent emails
  emails: new Map(),
  // Check if rate limit is exceeded
  isRateLimited: function(ip) {
    const now = Date.now();
    // Clean up old entries
    for (const [key, time] of this.emails.entries()) {
      if (now - time > this.windowMs) {
        this.emails.delete(key);
      }
    }

    // Count emails from this IP
    let count = 0;
    for (const [key, _] of this.emails.entries()) {
      if (key.startsWith(ip)) {
        count++;
      }
    }

    return count >= this.maxRequests;
  },
  // Record a new email
  recordEmail: function(ip) {
    const key = `${ip}:${Date.now()}`;
    this.emails.set(key, Date.now());
  },
  // Express middleware function
  middleware: function(req, res, next) {
    const ip = this.keyGenerator(req);

    if (this.skip(req)) {
      return next();
    }

    if (this.isRateLimited(ip)) {
      return this.handler(req, res);
    }

    this.recordEmail(ip);
    next();
  }
};

// Convert emailLimiter object to Express middleware
export const emailLimiterMiddleware = (req, res, next) => {
  emailLimiter.middleware(req, res, next);
};