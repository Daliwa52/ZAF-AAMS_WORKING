import express from 'express';
import bcrypt from 'bcrypt';
import db from '../services/db.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Fetch user from the database
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length > 0) {
      const user = users[0];

      // Check if the password_hash field exists and has a value
      if (!user.password_hash) {
        // If password_hash doesn't exist yet (during transition to bcrypt)
        if (user.password === password) {
          // Generate hash from plain password and update the user record
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          try {
            await db.query('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, username]);
            console.log(`Updated password hash for user: ${username}`);
          } catch (updateErr) {
            console.error('Error updating password hash:', updateErr);
          }

          res.status(200).json({
            message: 'Login successful',
            access_level: user.access_level
          });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        // If password_hash exists, verify with bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (passwordMatch) {
          res.status(200).json({
            message: 'Login successful',
            access_level: user.access_level
          });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;