const express = require('express');
const { User, UserChallenge, Challenge } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get global leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'username',
        'xp',
        'level',
        'totalPoints',
        'challengesCompleted',
        'averageTime'
      ],
      order: [['xp', 'DESC']],
      limit: 100
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

// Get leaderboard by challenge type
router.get('/:type', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'username',
        'xp',
        'level'
      ],
      include: [{
        model: UserChallenge,
        include: [{
          model: Challenge,
          where: {
            type: req.params.type,
            isActive: true
          }
        }],
        where: {
          status: 'COMPLETED'
        }
      }],
      order: [[UserChallenge, 'pointsEarned', 'DESC']],
      limit: 100
    });

    // Transform the data to show only relevant information
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      completedChallenges: user.UserChallenges.length,
      totalPoints: user.UserChallenges.reduce((sum, uc) => sum + uc.pointsEarned, 0)
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching type-specific leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

// Get user's ranking
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: [
        'id',
        'username',
        'xp',
        'level',
        'totalPoints',
        'challengesCompleted',
        'averageTime'
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's rank
    const rank = await User.count({
      where: {
        xp: {
          [Op.gt]: user.xp
        }
      }
    }) + 1;

    // Get nearby users (5 above and 5 below)
    const nearbyUsers = await User.findAll({
      attributes: [
        'id',
        'username',
        'xp',
        'level'
      ],
      where: {
        xp: {
          [Op.between]: [
            user.xp - 1000,
            user.xp + 1000
          ]
        }
      },
      order: [['xp', 'DESC']],
      limit: 11
    });

    res.json({
      user,
      rank,
      nearbyUsers
    });
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    res.status(500).json({ error: 'Error fetching user ranking' });
  }
});

// Get user's challenge history
router.get('/user/:userId/challenges', async (req, res) => {
  try {
    const userChallenges = await UserChallenge.findAll({
      where: {
        userId: req.params.userId,
        status: 'COMPLETED'
      },
      include: [{
        model: Challenge,
        attributes: ['title', 'type', 'difficulty', 'points']
      }],
      order: [['completedAt', 'DESC']]
    });

    res.json(userChallenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Error fetching user challenges' });
  }
});

module.exports = router; 