const { Pool } = require('pg');
require('dotenv').config();

class DatabaseSetup {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'auth_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  async connect() {
    try {
      await this.pool.query('SELECT 1');
      console.log('📊 Connected to PostgreSQL database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async createDatabase() {
    try {
      // Connect to postgres database to create auth_db
      const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
      });

      await adminPool.query('CREATE DATABASE auth_db');
      console.log('✅ Database auth_db created successfully');
      await adminPool.end();
    } catch (error) {
      if (error.code === '42P04') {
        console.log('ℹ️  Database auth_db already exists');
      } else {
        console.error('❌ Failed to create database:', error.message);
        throw error;
      }
    }
  }

  async testConnection() {
    try {
      const result = await this.pool.query('SELECT version()');
      console.log('✅ Database connection test successful');
      console.log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);
    } catch (error) {
      console.error('❌ Database connection test failed:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  
  const setup = new DatabaseSetup();
  
  try {
    switch (command) {
      case 'create':
        await setup.createDatabase();
        break;
      case 'test':
        await setup.connect();
        await setup.testConnection();
        break;
      case 'setup':
        await setup.createDatabase();
        await setup.connect();
        await setup.testConnection();
        break;
      default:
        console.log('Usage: node setup-db.js [create|test|setup]');
        console.log('  create - Create auth_db database');
        console.log('  test   - Test database connection');
        console.log('  setup  - Create database and test connection');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await setup.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = DatabaseSetup;
