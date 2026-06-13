const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  academic_marks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  course: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  projects: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  experience: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Profile;
