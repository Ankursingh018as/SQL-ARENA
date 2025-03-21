const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserChallenge = sequelize.define('UserChallenge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ChallengeId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ATTEMPTED', 'COMPLETED', 'FAILED'),
      defaultValue: 'ATTEMPTED'
    },
    submittedQuery: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    executionTime: {
      type: DataTypes.FLOAT, // in milliseconds
      allowNull: true
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return UserChallenge;
}; 