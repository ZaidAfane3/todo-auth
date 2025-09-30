-- Auth Service Database Setup Script
-- Database: auth_db

-- Create database (run this as superuser)
-- CREATE DATABASE auth_db;

-- Connect to auth_db before running the rest

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert sample users (passwords are 'password123' hashed with bcrypt)
-- NOTE: These are placeholder hashes. To generate real hashes, run:
-- node generate-hash.js password123
-- Then replace the hash values below with the generated hashes

-- For now, these placeholder hashes won't work. After setting up the service:
-- 1. Run: npm install
-- 2. Run: node generate-hash.js password123
-- 3. Replace the hashes below with the output
-- 4. Re-run this SQL script

INSERT INTO users (username, password_hash, email) VALUES
    ('admin', '$2b$10$PLACEHOLDER_HASH_REPLACE_AFTER_NPM_INSTALL', 'admin@example.com'),
    ('user1', '$2b$10$PLACEHOLDER_HASH_REPLACE_AFTER_NPM_INSTALL', 'user1@example.com'),
    ('testuser', '$2b$10$PLACEHOLDER_HASH_REPLACE_AFTER_NPM_INSTALL', 'test@example.com')
ON CONFLICT (username) DO NOTHING;

-- Alternative: Insert users without hashes first, then update with proper hashes
-- Or use the application to create users programmatically

-- Create sessions table (optional - for persistent session storage)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
