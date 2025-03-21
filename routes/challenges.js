const express = require('express');
const { Challenge, UserChallenge, User } = require('../models');
const { executeQuery } = require('../utils/queryExecutor');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to validate query results
async function validateQueryResult(result, expectedQuery) {
  try {
    const expectedResult = await executeQuery(expectedQuery);
    return JSON.stringify(result) === JSON.stringify(expectedResult);
  } catch (error) {
    console.error('Error validating query result:', error);
    return false;
  }
}

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { isActive: true },
      attributes: { exclude: ['expectedQuery'] }
    });
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Error fetching challenges' });
  }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id, {
      attributes: { exclude: ['expectedQuery'] }
    });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Error fetching challenge' });
  }
});

// Get challenges by type
router.get('/types/:type', async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: {
        type: req.params.type,
        isActive: true
      },
      attributes: { exclude: ['expectedQuery'] }
    });
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges by type:', error);
    res.status(500).json({ error: 'Error fetching challenges' });
  }
});

// Submit solution (protected route)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const challengeId = req.params.id; // Don't parse as integer since it's a UUID
    const { query } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    // Get challenge
    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if user has already completed this challenge
    const existingAttempt = await UserChallenge.findOne({
      where: {
        UserId: userId,
        ChallengeId: challengeId,
        status: 'COMPLETED'
      }
    });

    if (existingAttempt) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    // Execute and validate query
    const startTime = Date.now();
    const result = await executeQuery(query, challenge.testCases);
    const executionTime = Date.now() - startTime;

    // Check if query matches expected result
    const isCorrect = await validateQueryResult(result, challenge.expectedQuery);

    // Create or update user challenge attempt
    const [userChallenge, created] = await UserChallenge.findOrCreate({
      where: {
        UserId: userId,
        ChallengeId: challengeId
      },
      defaults: {
        submittedQuery: query,
        executionTime,
        attempts: 1,
        status: isCorrect ? 'COMPLETED' : 'FAILED'
      }
    });

    if (!created) {
      userChallenge.attempts += 1;
      userChallenge.submittedQuery = query;
      userChallenge.executionTime = executionTime;
      userChallenge.status = isCorrect ? 'COMPLETED' : 'FAILED';
    }

    if (isCorrect) {
      userChallenge.pointsEarned = calculatePoints(challenge.points, executionTime, challenge.timeLimit);
      userChallenge.completedAt = new Date();

      // Update user stats
      const user = await User.findByPk(userId);
      if (user) {
        user.xp += userChallenge.pointsEarned;
        user.totalPoints += userChallenge.pointsEarned;
        user.challengesCompleted += 1;
        user.averageTime = (user.averageTime * (user.challengesCompleted - 1) + executionTime) / user.challengesCompleted;
        
        // Level up if enough XP
        const newLevel = Math.floor(Math.sqrt(user.xp / 1000)) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }

        await user.save();
      }
    }

    await userChallenge.save();

    res.json({
      success: isCorrect,
      executionTime,
      pointsEarned: userChallenge.pointsEarned,
      message: isCorrect ? 'Challenge completed successfully!' : 'Incorrect solution, try again!'
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid submission data' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }
    res.status(500).json({ error: 'Error submitting solution' });
  }
});

// Helper function to calculate points based on execution time
function calculatePoints(basePoints, executionTime, timeLimit) {
  if (!timeLimit) return basePoints;
  
  const timeBonus = Math.max(0, timeLimit - (executionTime / 1000)); // Convert ms to seconds
  const bonusMultiplier = 1 + (timeBonus / timeLimit);
  
  return Math.round(basePoints * bonusMultiplier);
}

module.exports = router; 