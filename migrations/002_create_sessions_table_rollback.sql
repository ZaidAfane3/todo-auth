-- Rollback: 002_create_sessions_table
-- Description: Remove sessions table and related indexes

-- Drop indexes
DROP INDEX IF EXISTS idx_sessions_created_at;
DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_sessions_user_id;

-- Drop sessions table
DROP TABLE IF EXISTS sessions;
