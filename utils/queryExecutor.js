const mysql = require('mysql2/promise');
const config = require('../config/database');

// Create a connection pool
const pool = mysql.createPool({
  ...config,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// List of forbidden SQL keywords and patterns
const FORBIDDEN_PATTERNS = [
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /UPDATE\s+.*\s+SET/i,
  /INSERT\s+INTO/i,
  /TRUNCATE\s+TABLE/i,
  /ALTER\s+TABLE/i,
  /CREATE\s+TABLE/i,
  /GRANT\s+/i,
  /REVOKE\s+/i,
  /SHUTDOWN/i,
  /KILL/i,
  /--/i, // SQL comments
  /\/\*/i, // Multi-line comments
  /UNION\s+ALL/i,
  /UNION\s+SELECT/i,
  /INTO\s+OUTFILE/i,
  /LOAD_FILE/i,
  /SLEEP\s*\(/i,
  /BENCHMARK\s*\(/i,
  /WAIT\s+FOR\s+DELAY/i
];

// Execute and validate SQL query
async function executeQuery(query, testCases) {
  try {
    // Validate query against forbidden patterns
    if (!isQuerySafe(query)) {
      throw new Error('Query contains forbidden patterns');
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      // Execute query
      const [results] = await connection.execute(query);

      // Validate results against test cases
      const isValid = validateResults(results, testCases);

      return {
        success: true,
        results,
        isValid
      };
    } finally {
      connection.release(); // Always release connection back to pool
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Validate query safety
function isQuerySafe(query) {
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(query)) {
      return false;
    }
  }

  // Additional safety checks
  if (query.length > 10000) { // Prevent extremely long queries
    return false;
  }

  return true;
}

// Validate query results against test cases
function validateResults(results, testCases) {
  if (!Array.isArray(testCases)) {
    return false;
  }

  // Convert results to string for comparison
  const resultsString = JSON.stringify(results);

  // Check if results match any of the test cases
  return testCases.some(testCase => {
    const expectedString = JSON.stringify(testCase.expected);
    return resultsString === expectedString;
  });
}

module.exports = {
  executeQuery,
  isQuerySafe,
  validateResults
}; 