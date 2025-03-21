const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

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
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Health check endpoint (BEFORE database connection)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use(cors(corsOptions));
app.use(express.json());

// Log environment details
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  ALLOWED_ORIGINS: allowedOrigins,
  DATABASE_URL: process.env.MYSQL_URL ? 'Set' : 'Not Set'
});

// Routes (only load after database connection)
const setupRoutes = () => {
  const authRoutes = require('./routes/auth');
  const challengeRoutes = require('./routes/challenges');
  const leaderboardRoutes = require('./routes/leaderboard');
  const userChallengeRoutes = require('./routes/userChallenges');

  app.use('/api/auth', authRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/user-challenges', userChallengeRoutes);

  // Test route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SQL Arena API' });
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server without waiting for database
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Health check endpoint available at /api/health');
});

// Connect to database after server is running
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    setupRoutes();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Don't exit process, just log the error
    console.log('Server will continue running without database connection');
  }
};

initDatabase(); 