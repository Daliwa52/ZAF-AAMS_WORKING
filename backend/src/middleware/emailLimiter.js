import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware to prevent email notification abuse
 */
export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests, please try again later'
});