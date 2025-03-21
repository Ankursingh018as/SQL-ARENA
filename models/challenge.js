const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Challenge = sequelize.define('Challenge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('HACKER', 'REVERSE', 'ESCAPE', 'TIMEBOMB'),
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT'),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timeLimit: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true
    },
    initialQuery: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expectedQuery: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    testCases: {
      type: DataTypes.JSON,
      allowNull: false
    },
    hints: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Challenge;
}; 