-- Configuration Management Database Schema
-- This schema supports hierarchical configuration management with versioning and environment separation

-- Applications/Services that have configurations
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Different environments (dev, staging, prod, etc.)
CREATE TABLE environments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    priority INTEGER DEFAULT 0, -- Higher priority overrides lower
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Configuration files for grouping related configs into downloadable files
CREATE TABLE config_files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., database.json, api.yaml, auth.env
    application_id INTEGER NOT NULL,
    file_format VARCHAR(20) DEFAULT 'json' CHECK (file_format IN ('json', 'yaml', 'env', 'properties')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(name, application_id)
);

-- Configuration groups for organizing related configs
CREATE TABLE config_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    application_id INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(name, application_id)
);

-- Configuration keys (templates/definitions)
CREATE TABLE config_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(200) NOT NULL,
    config_file_id INTEGER NOT NULL,
    group_id INTEGER,
    application_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'integer', 'boolean', 'json', 'encrypted')),
    description TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE, -- For passwords, API keys, etc.
    validation_regex VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_file_id) REFERENCES config_files(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES config_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(key_name, config_file_id)
);

-- Actual configuration values per environment
CREATE TABLE config_values (
    id SERIAL PRIMARY KEY,
    config_key_id INTEGER NOT NULL,
    environment_id INTEGER NOT NULL,
    value TEXT, -- Store all values as text, convert based on data_type
    encrypted_value BYTEA, -- For sensitive data
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_key_id) REFERENCES config_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
);

-- Configuration change history for audit trail
CREATE TABLE config_history (
    id SERIAL PRIMARY KEY,
    config_value_id INTEGER NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE')),
    changed_by VARCHAR(100) NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_value_id) REFERENCES config_values(id) ON DELETE CASCADE
);

-- Configuration deployments/releases
CREATE TABLE config_deployments (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL,
    environment_id INTEGER NOT NULL,
    deployment_tag VARCHAR(100), -- e.g., v1.2.3, release-2024-01
    deployed_by VARCHAR(100) NOT NULL,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ROLLED_BACK', 'ARCHIVED')),
    notes TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
);

-- Snapshot of config values at deployment time
CREATE TABLE config_deployment_snapshots (
    id SERIAL PRIMARY KEY,
    deployment_id INTEGER NOT NULL,
    config_key_id INTEGER NOT NULL,
    value_at_deployment TEXT,
    FOREIGN KEY (deployment_id) REFERENCES config_deployments(id) ON DELETE CASCADE,
    FOREIGN KEY (config_key_id) REFERENCES config_keys(id) ON DELETE CASCADE
);

-- Configuration templates for easy setup of new environments
CREATE TABLE config_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    application_id INTEGER NOT NULL,
    description TEXT,
    template_data JSONB, -- Store key-value pairs as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_config_values_key_env ON config_values(config_key_id, environment_id);
CREATE INDEX idx_config_values_active ON config_values(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_config_history_value_id ON config_history(config_value_id);
CREATE INDEX idx_config_history_changed_at ON config_history(changed_at);
CREATE INDEX idx_config_keys_app_id ON config_keys(application_id);
CREATE INDEX idx_config_keys_sensitive ON config_keys(is_sensitive) WHERE is_sensitive = TRUE;

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_keys_updated_at BEFORE UPDATE ON config_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_values_updated_at BEFORE UPDATE ON config_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for audit trail
CREATE OR REPLACE FUNCTION log_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.id, OLD.value, NEW.value, 'UPDATE', NEW.created_by, 'Value updated');
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.id, NULL, NEW.value, 'CREATE', NEW.created_by, 'Value created');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO config_history(config_value_id, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (OLD.id, OLD.value, NULL, 'DELETE', OLD.created_by, 'Value deleted');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER config_values_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON config_values
    FOR EACH ROW EXECUTE FUNCTION log_config_changes();

-- Sample data for demonstration
INSERT INTO applications (name, description) VALUES 
    ('web-api', 'Main web API service'),
    ('worker-service', 'Background job processing service'),
    ('frontend-app', 'React frontend application');

INSERT INTO environments (name, description, priority) VALUES 
    ('development', 'Development environment', 1),
    ('staging', 'Staging environment', 2),
    ('production', 'Production environment', 3);

INSERT INTO config_files (name, application_id, file_format, description) VALUES
    ('database.json', 1, 'json', 'Database configuration settings'),
    ('api.yaml', 1, 'yaml', 'API configuration and limits'),
    ('security.env', 1, 'env', 'Security and authentication settings'),
    ('cache.json', 1, 'json', 'Cache configuration');

INSERT INTO config_groups (name, application_id, description) VALUES
    ('database', 1, 'Database configuration'),
    ('api', 1, 'API configuration'),
    ('security', 1, 'Security settings'),
    ('cache', 1, 'Cache settings');

INSERT INTO config_keys (key_name, config_file_id, group_id, application_id, data_type, description, is_required, is_sensitive) VALUES
    ('host', 1, 1, 1, 'string', 'Database hostname', TRUE, FALSE),
    ('port', 1, 1, 1, 'integer', 'Database port', TRUE, FALSE),
    ('password', 1, 1, 1, 'encrypted', 'Database password', TRUE, TRUE),
    ('username', 1, 1, 1, 'string', 'Database username', TRUE, FALSE),
    ('rate_limit', 2, 2, 1, 'integer', 'API rate limit per minute', TRUE, FALSE),
    ('timeout', 2, 2, 1, 'integer', 'API timeout in seconds', FALSE, FALSE),
    ('jwt_secret', 3, 3, 1, 'encrypted', 'JWT signing secret', TRUE, TRUE),
    ('session_timeout', 3, 3, 1, 'integer', 'Session timeout in minutes', FALSE, FALSE),
    ('redis_host', 4, 4, 1, 'string', 'Redis cache hostname', TRUE, FALSE),
    ('redis_port', 4, 4, 1, 'integer', 'Redis cache port', TRUE, FALSE);

-- Sample config values for demonstration
INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
    -- Database config values
    (1, 1, 'localhost', 'admin'),      -- host for dev
    (1, 2, 'staging-db.example.com', 'admin'),  -- host for staging
    (1, 3, 'prod-db.example.com', 'admin'),     -- host for production
    (2, 1, '5432', 'admin'),           -- port for dev
    (2, 2, '5432', 'admin'),           -- port for staging
    (2, 3, '5432', 'admin'),           -- port for production
    (3, 1, 'dev_password', 'admin'),   -- password for dev
    (3, 2, 'staging_password', 'admin'), -- password for staging
    (3, 3, 'prod_password', 'admin'),  -- password for production
    (4, 1, 'dev_user', 'admin'),       -- username for dev
    (4, 2, 'staging_user', 'admin'),   -- username for staging
    (4, 3, 'prod_user', 'admin'),      -- username for production

    -- API config values
    (5, 1, '1000', 'admin'),           -- rate_limit for dev
    (5, 2, '500', 'admin'),            -- rate_limit for staging
    (5, 3, '100', 'admin'),            -- rate_limit for production
    (6, 1, '30', 'admin'),             -- timeout for dev
    (6, 2, '20', 'admin'),             -- timeout for staging
    (6, 3, '10', 'admin'),             -- timeout for production

    -- Security config values
    (7, 1, 'dev_jwt_secret_key', 'admin'),     -- jwt_secret for dev
    (7, 2, 'staging_jwt_secret_key', 'admin'), -- jwt_secret for staging
    (7, 3, 'prod_jwt_secret_key', 'admin'),    -- jwt_secret for production
    (8, 1, '60', 'admin'),             -- session_timeout for dev
    (8, 2, '30', 'admin'),             -- session_timeout for staging
    (8, 3, '15', 'admin'),             -- session_timeout for production

    -- Cache config values
    (9, 1, 'localhost', 'admin'),      -- redis_host for dev
    (9, 2, 'staging-redis.example.com', 'admin'), -- redis_host for staging
    (9, 3, 'prod-redis.example.com', 'admin'),    -- redis_host for production
    (10, 1, '6379', 'admin'),          -- redis_port for dev
    (10, 2, '6379', 'admin'),          -- redis_port for staging
    (10, 3, '6379', 'admin');          -- redis_port for production

-- Common queries you might use:

-- Get all active configurations for an application in a specific environment
/*
SELECT
    a.name as app_name,
    e.name as environment,
    cf.name as config_file,
    cg.name as group_name,
    ck.key_name,
    cv.value,
    ck.data_type,
    ck.is_sensitive
FROM config_values cv
JOIN config_keys ck ON cv.config_key_id = ck.id
JOIN config_files cf ON ck.config_file_id = cf.id
JOIN applications a ON ck.application_id = a.id
JOIN environments e ON cv.environment_id = e.id
LEFT JOIN config_groups cg ON ck.group_id = cg.id
WHERE a.name = 'web-api'
    AND e.name = 'production'
    AND cv.is_active = TRUE
    AND cf.name = 'database.json'
ORDER BY cf.name, cg.name, ck.key_name;
*/

-- Get all config files for an application
/*
SELECT
    cf.name,
    cf.file_format,
    cf.description,
    COUNT(ck.id) as key_count
FROM config_files cf
LEFT JOIN config_keys ck ON cf.id = ck.config_file_id
WHERE cf.application_id = 1 AND cf.is_active = TRUE
GROUP BY cf.id, cf.name, cf.file_format, cf.description
ORDER BY cf.name;
*/

-- Get configuration change history for a specific key
/*
SELECT
    ch.changed_at,
    ch.change_type,
    ch.changed_by,
    ch.old_value,
    ch.new_value,
    ch.change_reason,
    cf.name as config_file,
    ck.key_name
FROM config_history ch
JOIN config_values cv ON ch.config_value_id = cv.id
JOIN config_keys ck ON cv.config_key_id = ck.id
JOIN config_files cf ON ck.config_file_id = cf.id
WHERE ck.key_name = 'rate_limit' AND cf.name = 'api.yaml'
ORDER BY ch.changed_at DESC;
*/

-- Export configuration for a specific file and environment (for download functionality)
/*
SELECT
    cf.name as file_name,
    cf.file_format,
    ck.key_name,
    cv.value,
    ck.data_type,
    ck.description,
    ck.is_required,
    ck.is_sensitive,
    ck.default_value,
    cg.name as group_name
FROM config_keys ck
JOIN config_files cf ON ck.config_file_id = cf.id
LEFT JOIN config_values cv ON ck.id = cv.config_key_id AND cv.environment_id = 3 -- production
LEFT JOIN config_groups cg ON ck.group_id = cg.id
WHERE cf.id = 1 -- database.json
    AND ck.application_id = 1
    AND cv.is_active = TRUE
ORDER BY cg.name, ck.key_name;
*/