const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  interview_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  meeting_link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'interviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Interview;
