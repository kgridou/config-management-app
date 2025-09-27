-- Seed data for Configuration Management System
-- Run this after the main schema has been created and RLS policies are set up
-- This will populate your database with sample applications, environments, and configurations

-- Insert sample user
INSERT INTO users (email, full_name, avatar_url, last_login, is_active) VALUES
    ('admin@company.com', 'System Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', timezone('utc'::text, now()), true),
    ('john.doe@company.com', 'John Doe', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', timezone('utc'::text, now()) - interval '2 hours', true),
    ('jane.smith@company.com', 'Jane Smith', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', timezone('utc'::text, now()) - interval '1 day', true);

-- Insert sample applications
INSERT INTO applications (name, description) VALUES
    ('e-commerce-api', 'Main e-commerce REST API service'),
    ('user-service', 'User authentication and profile management service'),
    ('notification-service', 'Email and SMS notification service'),
    ('payment-gateway', 'Payment processing and billing service'),
    ('analytics-service', 'Data analytics and reporting service'),
    ('admin-dashboard', 'Administrative web dashboard application');

-- Insert environments with priorities
INSERT INTO environments (name, description, priority) VALUES
    ('development', 'Local development environment', 1),
    ('testing', 'Automated testing environment', 2),
    ('staging', 'Pre-production staging environment', 3),
    ('production', 'Live production environment', 4);

-- Get application IDs for reference
DO $$
DECLARE
    ecommerce_id BIGINT;
    user_service_id BIGINT;
    notification_id BIGINT;
    payment_id BIGINT;
    analytics_id BIGINT;
    admin_id BIGINT;

    dev_env_id BIGINT;
    test_env_id BIGINT;
    staging_env_id BIGINT;
    prod_env_id BIGINT;
BEGIN
    -- Get application IDs
    SELECT id INTO ecommerce_id FROM applications WHERE name = 'e-commerce-api';
    SELECT id INTO user_service_id FROM applications WHERE name = 'user-service';
    SELECT id INTO notification_id FROM applications WHERE name = 'notification-service';
    SELECT id INTO payment_id FROM applications WHERE name = 'payment-gateway';
    SELECT id INTO analytics_id FROM applications WHERE name = 'analytics-service';
    SELECT id INTO admin_id FROM applications WHERE name = 'admin-dashboard';

    -- Get environment IDs
    SELECT id INTO dev_env_id FROM environments WHERE name = 'development';
    SELECT id INTO test_env_id FROM environments WHERE name = 'testing';
    SELECT id INTO staging_env_id FROM environments WHERE name = 'staging';
    SELECT id INTO prod_env_id FROM environments WHERE name = 'production';

    -- Create configuration groups for e-commerce-api
    INSERT INTO config_groups (name, config_file_id, description) VALUES
        ('database', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), 'Database connection settings'),
        ('redis', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), 'Redis cache configuration'),
        ('api', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), 'API configuration and limits'),
        ('security', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id), 'Security and authentication settings'),
        ('external-services', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), 'Third-party service integrations');

    -- Create configuration groups for user-service
    INSERT INTO config_groups (name, config_file_id, description) VALUES
        ('database', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id), 'User database configuration'),
        ('auth', (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id), 'Authentication providers'),
        ('session', (SELECT id FROM config_files WHERE name = 'session.env' AND application_id = user_service_id), 'Session management'),
        ('security', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = user_service_id), 'Security policies');

    -- Create configuration groups for notification-service
    INSERT INTO config_groups (name, config_file_id, description) VALUES
        ('email', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), 'Email service configuration'),
        ('sms', (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id), 'SMS provider settings'),
        ('templates', (SELECT id FROM config_files WHERE name = 'templates.yaml' AND application_id = notification_id), 'Message templates'),
        ('queue', (SELECT id FROM config_files WHERE name = 'queue.json' AND application_id = notification_id), 'Message queue settings');

    -- Create configuration groups for payment-gateway
    INSERT INTO config_groups (name, config_file_id, description) VALUES
        ('providers', (SELECT id FROM config_files WHERE name = 'providers.json' AND application_id = payment_id), 'Payment provider configurations'),
        ('security', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = payment_id), 'PCI compliance and security'),
        ('webhooks', (SELECT id FROM config_files WHERE name = 'webhooks.yaml' AND application_id = payment_id), 'Webhook configurations'),
        ('limits', (SELECT id FROM config_files WHERE name = 'limits.json' AND application_id = payment_id), 'Transaction limits and rules');

    -- Create configuration files for e-commerce-api
    INSERT INTO config_files (name, application_id, file_format, description) VALUES
        ('database.json', ecommerce_id, 'json', 'Database configuration settings'),
        ('api.yaml', ecommerce_id, 'yaml', 'API configuration and limits'),
        ('security.env', ecommerce_id, 'env', 'Security and authentication settings'),
        ('external-services.json', ecommerce_id, 'json', 'Third-party service integrations');

    -- Create configuration files for user-service
    INSERT INTO config_files (name, application_id, file_format, description) VALUES
        ('database.json', user_service_id, 'json', 'User database configuration'),
        ('auth.yaml', user_service_id, 'yaml', 'Authentication providers'),
        ('session.env', user_service_id, 'env', 'Session management'),
        ('security.json', user_service_id, 'json', 'Security policies');

    -- Create configuration files for notification-service
    INSERT INTO config_files (name, application_id, file_format, description) VALUES
        ('email.json', notification_id, 'json', 'Email service configuration'),
        ('sms.yaml', notification_id, 'yaml', 'SMS provider settings'),
        ('templates.json', notification_id, 'json', 'Message templates'),
        ('queue.env', notification_id, 'env', 'Message queue settings');

    -- Create configuration files for payment-gateway
    INSERT INTO config_files (name, application_id, file_format, description) VALUES
        ('providers.json', payment_id, 'json', 'Payment provider configurations'),
        ('security.env', payment_id, 'env', 'PCI compliance and security'),
        ('webhooks.yaml', payment_id, 'yaml', 'Webhook configurations'),
        ('limits.json', payment_id, 'json', 'Transaction limits and rules');

    -- Create configuration keys for e-commerce-api
    INSERT INTO config_keys (key_name, config_file_id, group_id, application_id, data_type, description, default_value, is_required, is_sensitive) VALUES
        -- Database group (database.json)
        ('db.host', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'Database hostname', 'localhost', true, false),
        ('db.port', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Database port', '5432', true, false),
        ('db.name', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'Database name', 'ecommerce', true, false),
        ('db.username', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'Database username', 'postgres', true, false),
        ('db.password', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'Database password', null, true, true),
        ('db.ssl_mode', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'SSL connection mode', 'require', true, false),
        ('db.pool_size', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Connection pool size', '10', false, false),

        -- Redis group (api.yaml)
        ('redis.host', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'redis' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'Redis hostname', 'localhost', true, false),
        ('redis.port', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'redis' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Redis port', '6379', true, false),
        ('redis.password', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'redis' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'Redis password', null, false, true),
        ('redis.db_index', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'redis' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Redis database index', '0', false, false),
        ('redis.ttl', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'redis' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Default TTL in seconds', '3600', false, false),

        -- API group (api.yaml)
        ('api.port', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'api' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'API server port', '3000', true, false),
        ('api.rate_limit', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'api' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Requests per minute', '1000', true, false),
        ('api.timeout', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'api' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Request timeout in seconds', '30', false, false),
        ('api.cors_origins', (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'api' AND config_file_id = (SELECT id FROM config_files WHERE name = 'api.yaml' AND application_id = ecommerce_id)), ecommerce_id, 'json', 'Allowed CORS origins', '["*"]', true, false),

        -- Security group (security.env)
        ('jwt.secret', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'security' AND config_file_id = (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'JWT signing secret', null, true, true),
        ('jwt.expiry', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'security' AND config_file_id = (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'JWT token expiry', '24h', true, false),
        ('bcrypt.rounds', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'security' AND config_file_id = (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id)), ecommerce_id, 'integer', 'Bcrypt hash rounds', '12', true, false),
        ('session.secret', (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'security' AND config_file_id = (SELECT id FROM config_files WHERE name = 'security.env' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'Session secret key', null, true, true),

        -- External services group (external-services.json)
        ('stripe.public_key', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'external-services' AND config_file_id = (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'Stripe publishable key', null, true, false),
        ('stripe.secret_key', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'external-services' AND config_file_id = (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'Stripe secret key', null, true, true),
        ('aws.region', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'external-services' AND config_file_id = (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id)), ecommerce_id, 'string', 'AWS region', 'us-east-1', true, false),
        ('aws.access_key', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'external-services' AND config_file_id = (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'AWS access key', null, true, true),
        ('aws.secret_key', (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id), (SELECT id FROM config_groups WHERE name = 'external-services' AND config_file_id = (SELECT id FROM config_files WHERE name = 'external-services.json' AND application_id = ecommerce_id)), ecommerce_id, 'encrypted', 'AWS secret key', null, true, true);

    -- Create configuration keys for user-service
    INSERT INTO config_keys (key_name, config_file_id, group_id, application_id, data_type, description, default_value, is_required, is_sensitive) VALUES
        -- Database group (database.json)
        ('db.host', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id)), user_service_id, 'string', 'User database hostname', 'localhost', true, false),
        ('db.port', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id)), user_service_id, 'integer', 'User database port', '5432', true, false),
        ('db.name', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id)), user_service_id, 'string', 'User database name', 'users', true, false),
        ('db.password', (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'database' AND config_file_id = (SELECT id FROM config_files WHERE name = 'database.json' AND application_id = user_service_id)), user_service_id, 'encrypted', 'User database password', null, true, true),

        -- Auth group (auth.yaml)
        ('oauth.google.client_id', (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'auth' AND config_file_id = (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id)), user_service_id, 'string', 'Google OAuth client ID', null, false, false),
        ('oauth.google.client_secret', (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'auth' AND config_file_id = (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id)), user_service_id, 'encrypted', 'Google OAuth client secret', null, false, true),
        ('oauth.github.client_id', (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'auth' AND config_file_id = (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id)), user_service_id, 'string', 'GitHub OAuth client ID', null, false, false),
        ('oauth.github.client_secret', (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'auth' AND config_file_id = (SELECT id FROM config_files WHERE name = 'auth.yaml' AND application_id = user_service_id)), user_service_id, 'encrypted', 'GitHub OAuth client secret', null, false, true),

        -- Session group (session.env)
        ('session.timeout', (SELECT id FROM config_files WHERE name = 'session.env' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'session' AND config_file_id = (SELECT id FROM config_files WHERE name = 'session.env' AND application_id = user_service_id)), user_service_id, 'integer', 'Session timeout in minutes', '60', true, false),
        ('session.cleanup_interval', (SELECT id FROM config_files WHERE name = 'session.env' AND application_id = user_service_id), (SELECT id FROM config_groups WHERE name = 'session' AND config_file_id = (SELECT id FROM config_files WHERE name = 'session.env' AND application_id = user_service_id)), user_service_id, 'integer', 'Session cleanup interval in minutes', '15', false, false);

    -- Create configuration keys for notification-service
    INSERT INTO config_keys (key_name, config_file_id, group_id, application_id, data_type, description, default_value, is_required, is_sensitive) VALUES
        -- Email group (email.json)
        ('smtp.host', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'email' AND config_file_id = (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id)), notification_id, 'string', 'SMTP server hostname', 'smtp.gmail.com', true, false),
        ('smtp.port', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'email' AND config_file_id = (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id)), notification_id, 'integer', 'SMTP server port', '587', true, false),
        ('smtp.username', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'email' AND config_file_id = (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id)), notification_id, 'string', 'SMTP username', null, true, false),
        ('smtp.password', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'email' AND config_file_id = (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id)), notification_id, 'encrypted', 'SMTP password', null, true, true),
        ('email.from_address', (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'email' AND config_file_id = (SELECT id FROM config_files WHERE name = 'email.json' AND application_id = notification_id)), notification_id, 'string', 'Default from email address', 'noreply@company.com', true, false),

        -- SMS group (sms.yaml)
        ('sms.provider', (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'sms' AND config_file_id = (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id)), notification_id, 'string', 'SMS provider (twilio/aws)', 'twilio', true, false),
        ('twilio.account_sid', (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'sms' AND config_file_id = (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id)), notification_id, 'string', 'Twilio Account SID', null, false, false),
        ('twilio.auth_token', (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'sms' AND config_file_id = (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id)), notification_id, 'encrypted', 'Twilio Auth Token', null, false, true),
        ('twilio.phone_number', (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id), (SELECT id FROM config_groups WHERE name = 'sms' AND config_file_id = (SELECT id FROM config_files WHERE name = 'sms.yaml' AND application_id = notification_id)), notification_id, 'string', 'Twilio phone number', null, false, false);

    -- Now create configuration values for different environments
    -- Development environment values
    INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
        -- E-commerce API - Development
        ((SELECT id FROM config_keys WHERE key_name = 'db.host' AND application_id = ecommerce_id), dev_env_id, 'localhost', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.port' AND application_id = ecommerce_id), dev_env_id, '5432', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.name' AND application_id = ecommerce_id), dev_env_id, 'ecommerce_dev', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.username' AND application_id = ecommerce_id), dev_env_id, 'dev_user', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.password' AND application_id = ecommerce_id), dev_env_id, 'dev_password_123', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.ssl_mode' AND application_id = ecommerce_id), dev_env_id, 'disable', 'john.doe@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.pool_size' AND application_id = ecommerce_id), dev_env_id, '5', 'jane.smith@company.com'),

        ((SELECT id FROM config_keys WHERE key_name = 'redis.host' AND application_id = ecommerce_id), dev_env_id, 'localhost', 'jane.smith@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.port' AND application_id = ecommerce_id), dev_env_id, '6379', 'jane.smith@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.db_index' AND application_id = ecommerce_id), dev_env_id, '0', 'jane.smith@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.ttl' AND application_id = ecommerce_id), dev_env_id, '1800', 'jane.smith@company.com'),

        ((SELECT id FROM config_keys WHERE key_name = 'api.port' AND application_id = ecommerce_id), dev_env_id, '3000', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.rate_limit' AND application_id = ecommerce_id), dev_env_id, '5000', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.timeout' AND application_id = ecommerce_id), dev_env_id, '60', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.cors_origins' AND application_id = ecommerce_id), dev_env_id, '["http://localhost:3000", "http://localhost:4200"]', 'admin@company.com'),

        ((SELECT id FROM config_keys WHERE key_name = 'jwt.secret' AND application_id = ecommerce_id), dev_env_id, 'dev-jwt-secret-key-123', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'jwt.expiry' AND application_id = ecommerce_id), dev_env_id, '7d', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'bcrypt.rounds' AND application_id = ecommerce_id), dev_env_id, '10', 'admin@company.com'),
        ((SELECT id FROM config_keys WHERE key_name = 'session.secret' AND application_id = ecommerce_id), dev_env_id, 'dev-session-secret-456', 'admin@company.com');

    -- Production environment values (more secure)
    INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
        -- E-commerce API - Production
        ((SELECT id FROM config_keys WHERE key_name = 'db.host' AND application_id = ecommerce_id), prod_env_id, 'prod-db.company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.port' AND application_id = ecommerce_id), prod_env_id, '5432', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.name' AND application_id = ecommerce_id), prod_env_id, 'ecommerce_prod', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.username' AND application_id = ecommerce_id), prod_env_id, 'prod_api_user', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.password' AND application_id = ecommerce_id), prod_env_id, '***PRODUCTION_DB_PASSWORD***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.ssl_mode' AND application_id = ecommerce_id), prod_env_id, 'require', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.pool_size' AND application_id = ecommerce_id), prod_env_id, '20', 'seed-script'),

        ((SELECT id FROM config_keys WHERE key_name = 'redis.host' AND application_id = ecommerce_id), prod_env_id, 'prod-redis.company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.port' AND application_id = ecommerce_id), prod_env_id, '6379', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.password' AND application_id = ecommerce_id), prod_env_id, '***REDIS_PASSWORD***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.db_index' AND application_id = ecommerce_id), prod_env_id, '1', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'redis.ttl' AND application_id = ecommerce_id), prod_env_id, '3600', 'seed-script'),

        ((SELECT id FROM config_keys WHERE key_name = 'api.port' AND application_id = ecommerce_id), prod_env_id, '8080', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.rate_limit' AND application_id = ecommerce_id), prod_env_id, '1000', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.timeout' AND application_id = ecommerce_id), prod_env_id, '30', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.cors_origins' AND application_id = ecommerce_id), prod_env_id, '["https://app.company.com", "https://admin.company.com"]', 'seed-script'),

        ((SELECT id FROM config_keys WHERE key_name = 'jwt.secret' AND application_id = ecommerce_id), prod_env_id, '***PRODUCTION_JWT_SECRET***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'jwt.expiry' AND application_id = ecommerce_id), prod_env_id, '24h', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'bcrypt.rounds' AND application_id = ecommerce_id), prod_env_id, '12', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'session.secret' AND application_id = ecommerce_id), prod_env_id, '***PRODUCTION_SESSION_SECRET***', 'seed-script'),

        ((SELECT id FROM config_keys WHERE key_name = 'stripe.public_key' AND application_id = ecommerce_id), prod_env_id, 'pk_live_***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'stripe.secret_key' AND application_id = ecommerce_id), prod_env_id, 'sk_live_***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'aws.region' AND application_id = ecommerce_id), prod_env_id, 'us-east-1', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'aws.access_key' AND application_id = ecommerce_id), prod_env_id, '***AWS_ACCESS_KEY***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'aws.secret_key' AND application_id = ecommerce_id), prod_env_id, '***AWS_SECRET_KEY***', 'seed-script');

    -- Staging environment values
    INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
        -- E-commerce API - Staging
        ((SELECT id FROM config_keys WHERE key_name = 'db.host' AND application_id = ecommerce_id), staging_env_id, 'staging-db.company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.name' AND application_id = ecommerce_id), staging_env_id, 'ecommerce_staging', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.username' AND application_id = ecommerce_id), staging_env_id, 'staging_user', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.password' AND application_id = ecommerce_id), staging_env_id, '***STAGING_DB_PASSWORD***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.port' AND application_id = ecommerce_id), staging_env_id, '3000', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'api.rate_limit' AND application_id = ecommerce_id), staging_env_id, '2000', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'stripe.public_key' AND application_id = ecommerce_id), staging_env_id, 'pk_test_***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'stripe.secret_key' AND application_id = ecommerce_id), staging_env_id, 'sk_test_***', 'seed-script');

    -- User Service configurations
    INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
        -- User Service - Development
        ((SELECT id FROM config_keys WHERE key_name = 'db.host' AND application_id = user_service_id), dev_env_id, 'localhost', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.port' AND application_id = user_service_id), dev_env_id, '5432', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.name' AND application_id = user_service_id), dev_env_id, 'users_dev', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.password' AND application_id = user_service_id), dev_env_id, 'dev_password_123', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'session.timeout' AND application_id = user_service_id), dev_env_id, '120', 'seed-script'),

        -- User Service - Production
        ((SELECT id FROM config_keys WHERE key_name = 'db.host' AND application_id = user_service_id), prod_env_id, 'users-db.company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.name' AND application_id = user_service_id), prod_env_id, 'users_prod', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'db.password' AND application_id = user_service_id), prod_env_id, '***USER_DB_PASSWORD***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'session.timeout' AND application_id = user_service_id), prod_env_id, '60', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'oauth.google.client_id' AND application_id = user_service_id), prod_env_id, '123456789.apps.googleusercontent.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'oauth.google.client_secret' AND application_id = user_service_id), prod_env_id, '***GOOGLE_CLIENT_SECRET***', 'seed-script');

    -- Notification Service configurations
    INSERT INTO config_values (config_key_id, environment_id, value, created_by) VALUES
        -- Notification Service - Development
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.host' AND application_id = notification_id), dev_env_id, 'localhost', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.port' AND application_id = notification_id), dev_env_id, '1025', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.username' AND application_id = notification_id), dev_env_id, 'dev@company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.password' AND application_id = notification_id), dev_env_id, 'dev_email_pass', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'email.from_address' AND application_id = notification_id), dev_env_id, 'dev@company.com', 'seed-script'),

        -- Notification Service - Production
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.host' AND application_id = notification_id), prod_env_id, 'smtp.sendgrid.net', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.port' AND application_id = notification_id), prod_env_id, '587', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.username' AND application_id = notification_id), prod_env_id, 'apikey', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'smtp.password' AND application_id = notification_id), prod_env_id, '***SENDGRID_API_KEY***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'email.from_address' AND application_id = notification_id), prod_env_id, 'noreply@company.com', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'sms.provider' AND application_id = notification_id), prod_env_id, 'twilio', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'twilio.account_sid' AND application_id = notification_id), prod_env_id, 'AC***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'twilio.auth_token' AND application_id = notification_id), prod_env_id, '***TWILIO_AUTH_TOKEN***', 'seed-script'),
        ((SELECT id FROM config_keys WHERE key_name = 'twilio.phone_number' AND application_id = notification_id), prod_env_id, '+1234567890', 'seed-script');

END $$;

-- Display summary of seeded data
SELECT 'Seeding completed!' as status;

SELECT
    'Applications created:' as type,
    COUNT(*) as count
FROM applications;

SELECT
    'Environments created:' as type,
    COUNT(*) as count
FROM environments;

SELECT
    'Configuration groups created:' as type,
    COUNT(*) as count
FROM config_groups;

SELECT
    'Configuration keys created:' as type,
    COUNT(*) as count
FROM config_keys;

SELECT
    'Configuration values created:' as type,
    COUNT(*) as count
FROM config_values;

-- Show sample data overview
SELECT
    a.name as application,
    COUNT(DISTINCT cg.id) as groups,
    COUNT(DISTINCT ck.id) as keys,
    COUNT(DISTINCT cv.id) as values
FROM applications a
LEFT JOIN config_files cf ON a.id = cf.application_id
LEFT JOIN config_groups cg ON cf.id = cg.config_file_id
LEFT JOIN config_keys ck ON a.id = ck.application_id
LEFT JOIN config_values cv ON ck.id = cv.config_key_id
GROUP BY a.id, a.name
ORDER BY a.name;