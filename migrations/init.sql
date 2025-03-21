-- Users table
CREATE TABLE Users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    totalPoints INT DEFAULT 0,
    challengesCompleted INT DEFAULT 0,
    averageTime FLOAT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE Challenges (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    points INT NOT NULL,
    initialQuery TEXT,
    expectedQuery TEXT NOT NULL,
    testCases JSON,
    hints JSON,
    timeLimit INT DEFAULT 300,
    type VARCHAR(50) DEFAULT 'STANDARD',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UserChallenges table
CREATE TABLE UserChallenges (
    id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    ChallengeId VARCHAR(36) NOT NULL,
    status ENUM('STARTED', 'COMPLETED', 'FAILED') DEFAULT 'STARTED',
    submittedQuery TEXT,
    executionTime INT,
    pointsEarned INT DEFAULT 0,
    attempts INT DEFAULT 0,
    completedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (ChallengeId) REFERENCES Challenges(id) ON DELETE CASCADE
);

-- Add some sample challenges
INSERT INTO Challenges (id, title, description, difficulty, points, expectedQuery, testCases, hints) 
VALUES (UUID(), 'Select All Employees', 'Write a query to select all employees from the employees table', 'EASY', 100, 'SELECT * FROM employees', '[]', '["Start with the SELECT keyword", "Use * to select all columns"]');

INSERT INTO Challenges (id, title, description, difficulty, points, expectedQuery, testCases, hints) 
VALUES (UUID(), 'Filter by Department', 'Write a query to select employees from the IT department', 'MEDIUM', 200, 'SELECT * FROM employees WHERE department = "IT"', '[]', '["Use the WHERE clause", "Check the department column"]');

-- Create indexes for better performance
CREATE INDEX idx_user_challenges ON UserChallenges(UserId, ChallengeId);
CREATE INDEX idx_challenge_difficulty ON Challenges(difficulty);
CREATE INDEX idx_user_xp ON Users(xp); 