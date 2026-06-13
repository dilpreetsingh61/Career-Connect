const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'My Resume',
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parsed_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ai_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ai_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'resumes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Resume;
