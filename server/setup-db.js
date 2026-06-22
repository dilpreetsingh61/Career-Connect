const sequelize = require('./config/db');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
    console.log('⏳ Running schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await sequelize.query(schema);
    console.log('✅ Schema created.');

    console.log('⏳ Running seed.sql...');
    const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
    await sequelize.query(seed);
    console.log('✅ Data seeded.');

  } catch (err) {
    console.error('❌ Setup Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

setup();
