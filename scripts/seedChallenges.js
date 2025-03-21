const { Challenge } = require('../models');

const challenges = [
  // Hacker Mode Challenges
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
    initialQuery: 'SELECT * FROM orders WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
    expectedQuery: 'SELECT * FROM orders USE INDEX (idx_created_at) WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
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
  },

  // Reverse Query Mode Challenges
  {
    title: 'Guess the Query - Basic',
    description: 'Given the following table and output, write the SQL query that produces this result:\n\nTable: employees\nColumns: id, name, department, salary\n\nOutput:\n{ id: 1, name: "John", department: "IT", salary: 75000 }',
    type: 'REVERSE',
    difficulty: 'EASY',
    points: 150,
    timeLimit: 90,
    expectedQuery: 'SELECT * FROM employees WHERE id = 1',
    testCases: [
      {
        input: [],
        expected: [{ id: 1, name: 'John', department: 'IT', salary: 75000 }]
      }
    ],
    hints: [
      'Look at the output structure',
      'Consider the WHERE clause',
      'Think about filtering conditions'
    ]
  },
  {
    title: 'Guess the Query - Advanced',
    description: 'Given the following table and output, write the SQL query that produces this result:\n\nTable: orders\nColumns: id, customer_id, total_amount, status\n\nOutput:\n{ customer_id: 5, total_orders: 3, average_amount: 150.50 }',
    type: 'REVERSE',
    difficulty: 'HARD',
    points: 300,
    timeLimit: 180,
    expectedQuery: 'SELECT customer_id, COUNT(*) as total_orders, AVG(total_amount) as average_amount FROM orders GROUP BY customer_id HAVING customer_id = 5',
    testCases: [
      {
        input: [],
        expected: [{ customer_id: 5, total_orders: 3, average_amount: 150.50 }]
      }
    ],
    hints: [
      'Consider aggregation functions',
      'Look for grouping patterns',
      'Check for filtering conditions'
    ]
  },

  // Escape the Query Challenges
  {
    title: 'Fix the Syntax Error',
    description: 'The following query has syntax errors. Fix them to make it work correctly:\n\nSELECT * FROM users WHERE username = "admin" AND password = "password123"',
    type: 'ESCAPE',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 60,
    initialQuery: 'SELECT * FROM users WHERE username = "admin" AND password = "password123"',
    expectedQuery: 'SELECT * FROM users WHERE username = "admin" AND password = "password123"',
    testCases: [
      {
        input: [],
        expected: [{ id: 1, username: 'admin', email: 'admin@example.com' }]
      }
    ],
    hints: [
      'Check for proper string quotes',
      'Verify SQL syntax',
      'Look for missing semicolons'
    ]
  },
  {
    title: 'Fix the Performance Issue',
    description: 'The following query is causing performance issues. Optimize it:\n\nSELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
    type: 'ESCAPE',
    difficulty: 'MEDIUM',
    points: 200,
    timeLimit: 120,
    initialQuery: 'SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
    expectedQuery: 'SELECT o.id, o.order_date, c.name FROM orders o USE INDEX (idx_created_at) JOIN customers c ON o.customer_id = c.id WHERE o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
    testCases: [
      {
        input: [],
        expected: [{ id: 1, order_date: '2024-02-15', name: 'John Doe' }]
      }
    ],
    hints: [
      'Avoid SELECT *',
      'Use appropriate indexes',
      'Consider query optimization'
    ]
  },

  // Time Bomb Queries
  {
    title: 'Fastest Query Wins',
    description: 'Write a query to find the top 5 customers by total order amount. The query must execute within 2 seconds.',
    type: 'TIMEBOMB',
    difficulty: 'MEDIUM',
    points: 250,
    timeLimit: 2,
    expectedQuery: 'SELECT c.name, SUM(o.total_amount) as total FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name ORDER BY total DESC LIMIT 5',
    testCases: [
      {
        input: [],
        expected: [
          { name: 'John Doe', total: 1500.00 },
          { name: 'Jane Smith', total: 1200.00 },
          { name: 'Bob Johnson', total: 1000.00 },
          { name: 'Alice Brown', total: 800.00 },
          { name: 'Charlie Wilson', total: 600.00 }
        ]
      }
    ],
    hints: [
      'Use appropriate indexes',
      'Optimize JOIN operations',
      'Consider using subqueries'
    ]
  },
  {
    title: 'Race Against Time',
    description: 'Write a query to find all orders that were placed in the last hour and have a status of "pending". The query must execute within 1 second.',
    type: 'TIMEBOMB',
    difficulty: 'HARD',
    points: 300,
    timeLimit: 1,
    expectedQuery: 'SELECT * FROM orders USE INDEX (idx_status_created) WHERE status = "pending" AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    testCases: [
      {
        input: [],
        expected: [
          { id: 1, order_date: '2024-02-16 14:30:00', status: 'pending' },
          { id: 2, order_date: '2024-02-16 14:45:00', status: 'pending' }
        ]
      }
    ],
    hints: [
      'Use appropriate indexes',
      'Optimize WHERE conditions',
      'Consider query execution plan'
    ]
  }
];

async function seedChallenges() {
  try {
    // Clear existing challenges
    await Challenge.destroy({ where: {} });

    // Insert new challenges
    await Challenge.bulkCreate(challenges);

    console.log('Challenges seeded successfully!');
  } catch (error) {
    console.error('Error seeding challenges:', error);
  }
}

// Run the seeding function
seedChallenges(); 