const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'auth_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Helper function to generate session ID
const generateSessionId = () => uuidv4();

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Helper function to create session in database
const createSession = async (sessionId, userId, username) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
    [sessionId, userId, expiresAt]
  );
  
  return {
    userId,
    username,
    createdAt: new Date(),
    expiresAt
  };
};

// Helper function to get session from database
const getSession = async (sessionId) => {
  const result = await pool.query(
    'SELECT s.id, s.user_id, s.created_at, s.expires_at, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.expires_at > NOW()',
    [sessionId]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    userId: row.user_id,
    username: row.username,
    createdAt: row.created_at,
    expiresAt: row.expires_at
  };
};

// Helper function to delete session from database
const deleteSession = async (sessionId) => {
  await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
};

// Helper function to clean up expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    console.log(`Cleaned up ${result.rowCount} expired sessions`);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

// Clean up expired sessions on startup and every hour
cleanupExpiredSessions();
setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Every hour

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Query user from database
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate session ID
    const sessionId = generateSessionId();
    
    // Store session in database
    await createSession(sessionId, user.id, user.username);

    // Set cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Logout endpoint
app.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.clearCookie('sessionId');
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Check if user is logged in
app.get('/is-logged-in', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Not logged in',
        isLoggedIn: false
      });
    }

    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Not logged in',
        isLoggedIn: false
      });
    }
    
    res.json({
      success: true,
      message: 'User is logged in',
      isLoggedIn: true,
      user: {
        id: session.userId,
        username: session.username
      }
    });

  } catch (error) {
    console.error('Is logged in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  console.log('Sessions are now persistent and stored in PostgreSQL database');
});

module.exports = app;