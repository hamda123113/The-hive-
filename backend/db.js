const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hive_db',
  password: process.env.DB_PASSWORD || '123',
  port: Number(process.env.DB_PORT || 5432),
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

async function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  try {
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

module.exports = { pool, initializeSchema };
