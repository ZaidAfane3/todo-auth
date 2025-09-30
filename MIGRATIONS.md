# Auth Service Database Migrations

This document explains how to set up and manage the PostgreSQL database for the auth service using the migration system.

## Quick Setup

### 1. Using Docker Compose (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Wait for database to be ready, then run migrations
npm run migrate
```

### 2. Manual Setup

```bash
# Install dependencies
npm install

# Create database
npm run db:create

# Test connection
npm run db:test

# Run migrations
npm run migrate
```

## Migration Commands

### Available Scripts

```bash
# Database setup
npm run db:setup      # Create database and test connection
npm run db:create     # Create auth_db database only
npm run db:test       # Test database connection

# Migration management
npm run migrate       # Run all pending migrations
npm run migrate:status # Show migration status
npm run migrate:rollback # Rollback last migration
```

### Direct Script Usage

```bash
# Migration commands
node scripts/migrate.js migrate           # Run migrations
node scripts/migrate.js status           # Show status
node scripts/migrate.js rollback         # Rollback last migration
node scripts/migrate.js rollback 001     # Rollback specific migration

# Database setup
node scripts/setup-db.js setup           # Full setup
node scripts/setup-db.js create          # Create database
node scripts/setup-db.js test            # Test connection
```

## Migration Files

### Current Migrations

1. **000_create_migrations_table.sql** - Creates migration tracking table
2. **001_create_users_table.sql** - Creates users table with authentication fields
3. **002_create_sessions_table.sql** - Creates sessions table for persistent storage
4. **003_insert_sample_users.sql** - Inserts sample users for testing

### Migration Structure

Each migration has two files:
- `XXX_migration_name.sql` - Forward migration
- `XXX_migration_name_rollback.sql` - Rollback migration

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

### Migrations Table
```sql
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(255)
);
```

## Sample Users

The migration system includes sample users for testing:

| Username | Password | Email |
|----------|----------|-------|
| admin | password123 | admin@example.com |
| user1 | password123 | user1@example.com |
| testuser | password123 | test@example.com |

## Environment Variables

Create a `.env` file with your database configuration:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Docker Setup

### Development
```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run migrate

# Start auth service
npm run dev
```

### Production
```bash
# Start full stack
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test connection
npm run db:test
```

#### 2. Migration Already Exists
```bash
# Check migration status
npm run migrate:status

# If migration is partially applied, you may need to rollback
npm run migrate:rollback
```

#### 3. Permission Denied
```bash
# Make sure you have proper database permissions
# Check your .env file for correct credentials
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
npm run migrate
```

## Adding New Migrations

### 1. Create Migration Files

```bash
# Create new migration (example: 004_add_user_roles.sql)
touch migrations/004_add_user_roles.sql
touch migrations/004_add_user_roles_rollback.sql
```

### 2. Write Migration SQL

**004_add_user_roles.sql:**
```sql
-- Migration: 004_add_user_roles
-- Description: Add role field to users table

ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

**004_add_user_roles_rollback.sql:**
```sql
-- Rollback: 004_add_user_roles
-- Description: Remove role field from users table

DROP INDEX IF EXISTS idx_users_role;
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

### 3. Run Migration

```bash
npm run migrate
```

## Best Practices

1. **Always create rollback files** - Every migration should have a corresponding rollback
2. **Test migrations** - Test both forward and rollback migrations
3. **Use transactions** - The migration runner uses transactions for safety
4. **Version control** - Keep migration files in version control
5. **Backup before major changes** - Always backup before running migrations in production

## Production Deployment

### 1. Database Setup
```bash
# Create production database
npm run db:create

# Run migrations
npm run migrate

# Verify setup
npm run migrate:status
```

### 2. Docker Deployment
```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Health Check
```bash
# Check service health
curl http://localhost:3001/health

# Check database connection
npm run db:test
```
