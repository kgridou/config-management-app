-- Reset Database Script
-- This script will completely reset the configuration management database
-- WARNING: This will delete ALL data and recreate the schema

-- Drop all tables in correct order (respects foreign keys)
DROP TABLE IF EXISTS config_history CASCADE;
DROP TABLE IF EXISTS config_values CASCADE;
DROP TABLE IF EXISTS config_keys CASCADE;
DROP TABLE IF EXISTS config_groups CASCADE;
DROP TABLE IF EXISTS environments CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_config_changes() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON applications;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON environments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON config_groups;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON config_keys;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON config_values;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON config_history;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;

-- Confirmation message
SELECT 'Database reset complete!' as status,
       'Next steps:' as action,
       '1. Run supabase-schema.sql' as step_1,
       '2. Run seed.sql' as step_2;