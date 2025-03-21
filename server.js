const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sql-arena-aw3j.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Basic middleware
app.use(express.json());
app.use(cors(corsOptions));

// Log environment details
console.log('Starting server with config:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  ALLOWED_ORIGINS: allowedOrigins,
  DATABASE_URL: process.env.MYSQL_URL ? 'Set' : 'Not Set'
});

// Health check endpoint (before database connection)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to SQL Arena API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and routes
const initializeApp = async () => {
  try {
    // Import sequelize after dotenv is configured
    const { sequelize } = require('./models');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Import and setup routes only after successful database connection
    const authRoutes = require('./routes/auth');
    const challengeRoutes = require('./routes/challenges');
    const leaderboardRoutes = require('./routes/leaderboard');
    const userChallengeRoutes = require('./routes/userChallenges');

    app.use('/api/auth', authRoutes);
    app.use('/api/challenges', challengeRoutes);
    app.use('/api/leaderboard', leaderboardRoutes);
    app.use('/api/user-challenges', userChallengeRoutes);

    console.log('Routes initialized successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't exit - let the app continue running with basic routes
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server first
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Health check endpoint available at /api/health');
});

// Initialize app after server is running
initializeApp().catch(error => {
  console.error('Error during app initialization:', error);
}); 