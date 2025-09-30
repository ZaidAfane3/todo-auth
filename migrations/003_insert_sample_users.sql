-- Migration: 003_insert_sample_users
-- Description: Insert sample users for testing (with proper bcrypt hashes)

-- Insert sample users with proper bcrypt hashes for password 'password123'
-- These hashes were generated using: node generate-hash.js password123
INSERT INTO users (username, password_hash, email) VALUES
    ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com'),
    ('user1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user1@example.com'),
    ('testuser', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'test@example.com')
ON CONFLICT (username) DO NOTHING;
