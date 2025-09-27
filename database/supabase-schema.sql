-- Configuration Management Database Schema for Supabase
-- This schema supports hierarchical configuration management with versioning and environment separation

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Users table for application users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Applications/Services that have configurations
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Different environments (dev, staging, prod, etc.)
CREATE TABLE environments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    priority INTEGER DEFAULT 0, -- Higher priority overrides lower
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Configuration files for grouping related configs into downloadable files
CREATE TABLE config_files (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., database.json, api.yaml, auth.env
    application_id BIGINT NOT NULL,
    file_format VARCHAR(20) DEFAULT 'json' CHECK (file_format IN ('json', 'yaml', 'env', 'properties')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(name, application_id)
);

-- Configuration groups for organizing related configs
CREATE TABLE config_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    application_id BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(name, application_id)
);

-- Configuration keys (templates/definitions)
CREATE TABLE config_keys (
    id BIGSERIAL PRIMARY KEY,
    key_name VARCHAR(200) NOT NULL,
    config_file_id BIGINT NOT NULL,
    group_id BIGINT,
    application_id BIGINT NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'integer', 'boolean', 'json', 'encrypted')),
    description TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE, -- For passwords, API keys, etc.
    validation_regex VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (config_file_id) REFERENCES config_files(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES config_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(key_name, config_file_id)
);

-- Actual configuration values per environment
CREATE TABLE config_values (
    id BIGSERIAL PRIMARY KEY,
    config_key_id BIGINT NOT NULL,
    environment_id BIGINT NOT NULL,
    value TEXT, -- Store all values as text, convert based on data_type
    encrypted_value BYTEA, -- For sensitive data
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (config_key_id) REFERENCES config_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
);

-- Configuration change history for audit trail
CREATE TABLE config_history (
    id BIGSERIAL PRIMARY KEY,
    config_value_id BIGINT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE')),
    changed_by VARCHAR(100) NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (config_value_id) REFERENCES config_values(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_config_values_key_env ON config_values(config_key_id, environment_id);
CREATE INDEX idx_config_values_active ON config_values(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_config_history_value_id ON config_history(config_value_id);
CREATE INDEX idx_config_history_changed_at ON config_history(changed_at);
CREATE INDEX idx_config_keys_app_id ON config_keys(application_id);
CREATE INDEX idx_config_keys_sensitive ON config_keys(is_sensitive) WHERE is_sensitive = TRUE;

-- Function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER handle_updated_at_applications
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_config_keys
    BEFORE UPDATE ON config_keys
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_config_values
    BEFORE UPDATE ON config_values
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger for audit trail
CREATE OR REPLACE FUNCTION log_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.id, OLD.value, NEW.value, 'UPDATE', COALESCE(NEW.created_by, 'system'), 'Value updated');
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.id, NULL, NEW.value, 'CREATE', COALESCE(NEW.created_by, 'system'), 'Value created');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (OLD.id, OLD.value, NULL, 'DELETE', COALESCE(OLD.created_by, 'system'), 'Value deleted');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER config_values_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON config_values
    FOR EACH ROW EXECUTE FUNCTION log_config_changes();

-- Row Level Security Policies (enable RLS for all tables)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON applications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON environments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON config_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON config_keys FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON config_values FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON config_history FOR ALL TO authenticated USING (true);

-- Schema setup complete
-- To populate with sample data, run the seed.sql script after this schema is created