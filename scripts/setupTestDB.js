const { sequelize, User, Challenge, UserChallenge } = require('../models');
const bcrypt = require('bcryptjs');

async function setupTestDB() {
  try {
    // Sync all models with database
    await sequelize.sync({ force: true });

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword
    });

    // Create sample challenges
    const challenges = [
      {
        title: 'SQL Injection Prevention',
        description: 'Write a query to safely retrieve user data without being vulnerable to SQL injection. The query should use parameterized queries.',
        type: 'HACKER',
        difficulty: 'EASY',
        points: 100,
        timeLimit: 60,
        initialQuery: 'SELECT * FROM users WHERE username = ?',
        expectedQuery: 'SELECT * FROM users WHERE username = ?',
        testCases: [
          {
            input: ['admin'],
            expected: [{ id: 1, username: 'admin', email: 'admin@example.com' }]
          },
          {
            input: ["' OR '1'='1"],
            expected: [] // Should return no results for malicious input
          }
        ],
        hints: [
          'Use parameterized queries with ?',
          'Never concatenate user input directly into SQL',
          'Consider using prepared statements'
        ]
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize the given query to improve its performance. The query should use proper indexing and avoid full table scans.',
        type: 'HACKER',
        difficulty: 'MEDIUM',
        points: 200,
        timeLimit: 120,
        initialQuery: 'SELECT * FROM orders WHERE createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)',
        expectedQuery: 'SELECT * FROM orders USE INDEX (idx_created_at) WHERE createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)',
        testCases: [
          {
            input: [],
            expected: [{ id: 1, order_date: '2024-02-15' }, { id: 2, order_date: '2024-02-16' }]
          }
        ],
        hints: [
          'Consider using appropriate indexes',
          'Avoid SELECT * when possible',
          'Use EXPLAIN to analyze query performance'
        ]
      }
    ];

    await Challenge.bulkCreate(challenges);

    console.log('Test database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
}

// Run the setup function
setupTestDB(); 