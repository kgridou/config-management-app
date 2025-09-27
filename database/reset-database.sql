-- Reset Database Script
-- This script will completely reset the configuration management database
-- WARNING: This will delete ALL data and tables

-- Drop all tables that might exist (handles any existing tables)
DROP TABLE IF EXISTS config_snapshot_data CASCADE;
DROP TABLE IF EXISTS config_snapshots CASCADE;
DROP TABLE IF EXISTS config_history CASCADE;
DROP TABLE IF EXISTS config_values CASCADE;
DROP TABLE IF EXISTS config_keys CASCADE;
DROP TABLE IF EXISTS config_groups CASCADE;
DROP TABLE IF EXISTS config_files CASCADE;
DROP TABLE IF EXISTS environments CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Also drop any other tables that might exist from previous versions
DROP TABLE IF EXISTS config_deployments CASCADE;
DROP TABLE IF EXISTS config_deployment_snapshots CASCADE;
DROP TABLE IF EXISTS config_templates CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_config_changes() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Note: Policies are automatically dropped when tables are dropped with CASCADE

-- Confirmation message
SELECT 'Database reset complete!' as status,
       'Next steps:' as action,
       '1. Run supabase-schema.sql' as step_1,
       '2. Run seed.sql' as step_2;