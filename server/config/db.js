const { Sequelize } = require('sequelize');
require('pg'); // Explicitly required for Vercel Serverless trace bundling
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use connection string for cloud DBs like Neon
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Use individual env vars for local DB
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'careerconnect',
    port: process.env.DB_PORT || 5432,
    logging: false,
  });
}

module.exports = sequelize;
