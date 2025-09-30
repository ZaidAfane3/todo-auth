-- Rollback: 003_insert_sample_users
-- Description: Remove sample users

-- Remove sample users
DELETE FROM users WHERE username IN ('admin', 'user1', 'testuser');
