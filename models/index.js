const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.user,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    logging: false,
  }
);

const User = require('./user')(sequelize);
const Challenge = require('./challenge')(sequelize);
const UserChallenge = require('./userChallenge')(sequelize);

// Define relationships
User.hasMany(UserChallenge);
UserChallenge.belongsTo(User);
Challenge.hasMany(UserChallenge);
UserChallenge.belongsTo(Challenge);

module.exports = {
  sequelize,
  User,
  Challenge,
  UserChallenge
}; 