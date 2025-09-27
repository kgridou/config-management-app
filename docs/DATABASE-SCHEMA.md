# Database Schema Documentation

This document provides comprehensive documentation for the Configuration Management System database schema.

## Overview

The database is designed to support hierarchical configuration management with versioning, environment separation, audit trails, and snapshot functionality. The schema uses PostgreSQL with Supabase for real-time features and Row Level Security.

## Entity Relationship Diagram

```
Users (1) ←→ (many) Config History
Applications (1) ←→ (many) Config Files (1) ←→ (many) Config Groups
Applications (1) ←→ (many) Config Keys (many) ←→ (1) Config Groups
Applications (1) ←→ (many) Config Snapshots
Config Keys (1) ←→ (many) Config Values (many) ←→ (1) Environments
Config Values (1) ←→ (many) Config History
Config Snapshots (1) ←→ (many) Config Snapshot Data
```

## Core Tables

### users

Stores application user information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| full_name | VARCHAR(255) | | User display name |
| avatar_url | TEXT | | Profile picture URL |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Account creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |
| last_login | TIMESTAMP WITH TIME ZONE | | Last login timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |

### applications

Defines applications/services that have configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique application identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Application name |
| description | TEXT | | Application description |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Application active status |

### environments

Defines deployment environments with priority ordering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique environment identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Environment name |
| description | TEXT | | Environment description |
| priority | INTEGER | DEFAULT 0 | Environment priority (higher overrides lower) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Environment active status |

## Configuration Structure

### config_files

Groups related configurations into downloadable files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique file identifier |
| name | VARCHAR(100) | NOT NULL | File name (e.g., database.json) |
| application_id | BIGINT | NOT NULL, FK → applications(id) | Application reference |
| file_format | VARCHAR(20) | DEFAULT 'json', CHECK | File format (json, yaml, env, properties) |
| description | TEXT | | File description |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | File active status |

**Constraints:**
- `UNIQUE(name, application_id)` - File names must be unique per application
- `CHECK (file_format IN ('json', 'yaml', 'env', 'properties'))`

### config_groups

Organizes related configurations within files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique group identifier |
| name | VARCHAR(100) | NOT NULL | Group name |
| config_file_id | BIGINT | NOT NULL, FK → config_files(id) | Configuration file reference |
| description | TEXT | | Group description |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |

**Constraints:**
- `UNIQUE(name, config_file_id)` - Group names must be unique per file

### config_keys

Defines configuration parameter templates/definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique key identifier |
| key_name | VARCHAR(200) | NOT NULL | Configuration key name |
| config_file_id | BIGINT | NOT NULL, FK → config_files(id) | Configuration file reference |
| group_id | BIGINT | FK → config_groups(id) | Optional group reference |
| application_id | BIGINT | NOT NULL, FK → applications(id) | Application reference |
| data_type | VARCHAR(20) | NOT NULL, CHECK | Data type constraint |
| description | TEXT | | Key description |
| default_value | TEXT | | Default value |
| is_required | BOOLEAN | DEFAULT FALSE | Required flag |
| is_sensitive | BOOLEAN | DEFAULT FALSE | Sensitive data flag |
| validation_regex | VARCHAR(500) | | Validation regex pattern |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |

**Constraints:**
- `UNIQUE(key_name, config_file_id)` - Key names must be unique per file
- `CHECK (data_type IN ('string', 'integer', 'boolean', 'json', 'encrypted'))`

### config_values

Stores actual configuration values per environment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique value identifier |
| config_key_id | BIGINT | NOT NULL, FK → config_keys(id) | Configuration key reference |
| environment_id | BIGINT | NOT NULL, FK → environments(id) | Environment reference |
| value | TEXT | | Configuration value (as text) |
| encrypted_value | BYTEA | | Encrypted sensitive data |
| version | INTEGER | DEFAULT 1 | Value version number |
| is_active | BOOLEAN | DEFAULT TRUE | Value active status |
| created_by | VARCHAR(100) | | Creator identifier |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |

## Audit and History

### config_history

Tracks all configuration changes for audit purposes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique history entry identifier |
| config_value_id | BIGINT | NOT NULL, FK → config_values(id) | Configuration value reference |
| old_value | TEXT | | Previous value |
| new_value | TEXT | | New value |
| change_type | VARCHAR(20) | NOT NULL, CHECK | Type of change |
| changed_by | VARCHAR(100) | NOT NULL | User who made the change |
| change_reason | TEXT | | Optional reason for change |
| changed_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Change timestamp |

**Constraints:**
- `CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE'))`

## Snapshot System

### config_snapshots

Stores snapshot metadata for point-in-time configuration captures.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique snapshot identifier |
| name | VARCHAR(200) | NOT NULL | Snapshot display name |
| description | TEXT | | Snapshot description |
| application_id | BIGINT | NOT NULL, FK → applications(id) | Application reference |
| environment_id | BIGINT | NOT NULL, FK → environments(id) | Environment reference |
| snapshot_type | VARCHAR(20) | DEFAULT 'MANUAL', CHECK | Snapshot type |
| created_by | VARCHAR(100) | NOT NULL | Snapshot creator |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Snapshot active status |
| tags | JSONB | | JSON tags for categorization |
| metadata | JSONB | | Additional JSON metadata |

**Constraints:**
- `UNIQUE(name, application_id, environment_id)` - Snapshot names must be unique per app/env
- `CHECK (snapshot_type IN ('MANUAL', 'AUTOMATIC', 'DEPLOYMENT', 'BACKUP'))`

### config_snapshot_data

Stores the actual configuration values captured in snapshots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique snapshot data identifier |
| snapshot_id | BIGINT | NOT NULL, FK → config_snapshots(id) | Snapshot reference |
| config_key_id | BIGINT | FK → config_keys(id) | Config key reference (nullable) |
| key_name | VARCHAR(200) | NOT NULL | Denormalized key name |
| config_file_name | VARCHAR(100) | NOT NULL | Denormalized file name |
| group_name | VARCHAR(100) | | Denormalized group name |
| value | TEXT | | Configuration value |
| encrypted_value | BYTEA | | Encrypted sensitive value |
| data_type | VARCHAR(20) | NOT NULL | Data type |
| is_sensitive | BOOLEAN | DEFAULT FALSE | Sensitive data flag |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Creation timestamp |

**Notes:**
- `config_key_id` can be NULL to preserve snapshot data even if keys are deleted
- Denormalized fields ensure snapshot data remains intact regardless of schema changes

## Indexes

Performance indexes for common query patterns:

```sql
-- Config Values
CREATE INDEX idx_config_values_key_env ON config_values(config_key_id, environment_id);
CREATE INDEX idx_config_values_active ON config_values(is_active) WHERE is_active = TRUE;

-- Config History
CREATE INDEX idx_config_history_value_id ON config_history(config_value_id);
CREATE INDEX idx_config_history_changed_at ON config_history(changed_at);

-- Config Keys
CREATE INDEX idx_config_keys_app_id ON config_keys(application_id);
CREATE INDEX idx_config_keys_sensitive ON config_keys(is_sensitive) WHERE is_sensitive = TRUE;

-- Snapshots
CREATE INDEX idx_config_snapshots_app_env ON config_snapshots(application_id, environment_id);
CREATE INDEX idx_config_snapshots_created_at ON config_snapshots(created_at);
CREATE INDEX idx_config_snapshots_active ON config_snapshots(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_config_snapshot_data_snapshot_id ON config_snapshot_data(snapshot_id);
CREATE INDEX idx_config_snapshot_data_key_id ON config_snapshot_data(config_key_id);
```

## Functions and Triggers

### Automatic Timestamp Updates

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Applied to tables with `updated_at` columns:
- `applications`
- `config_keys`
- `config_values`

### Audit Trail Automation

```sql
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
```

Applied to `config_values` table to automatically track all changes.

## Row Level Security (RLS)

All tables have RLS enabled with policies allowing authenticated users full access. In production, these policies should be refined based on specific security requirements.

```sql
-- Enable RLS on all tables
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (adjust for production)
CREATE POLICY "Allow all operations for authenticated users"
ON [table_name] FOR ALL TO authenticated USING (true);
```

## Data Types and Constraints

### Configuration Data Types

| Type | Description | Storage | Example |
|------|-------------|---------|---------|
| string | Text values | TEXT | "localhost" |
| integer | Numeric values | TEXT (parsed as int) | "5432" |
| boolean | True/false values | TEXT | "true" |
| json | JSON objects/arrays | TEXT | '{"key": "value"}' |
| encrypted | Sensitive data | BYTEA | [encrypted blob] |

### Validation

- **Key Names**: Must be unique within each configuration file
- **File Formats**: Restricted to json, yaml, env, properties
- **Data Types**: Enforced through CHECK constraints
- **Environment Priority**: Numeric ordering for conflict resolution
- **Snapshot Types**: Controlled vocabulary for categorization

## Migration Strategy

### Schema Updates

1. Use Supabase migrations for schema changes
2. Always backup before major schema updates
3. Test migrations on staging environment first
4. Consider backward compatibility for API changes

### Data Migration

1. Use SQL scripts for bulk data operations
2. Preserve audit trails during migrations
3. Validate data integrity after migrations
4. Document migration procedures

## Performance Considerations

### Query Optimization

- Use indexes for common query patterns
- Consider partitioning for large history tables
- Monitor query performance in production
- Use EXPLAIN ANALYZE for query optimization

### Storage

- Consider archiving old history records
- Implement snapshot retention policies
- Monitor database size growth
- Use appropriate data types for storage efficiency

### Caching

- Cache frequently accessed configuration values
- Implement cache invalidation on updates
- Consider Redis for high-performance caching
- Use Supabase real-time for cache invalidation

## Security Considerations

### Sensitive Data

- Encrypt sensitive values using BYTEA columns
- Never store encryption keys in the database
- Use application-level encryption for sensitive data
- Audit access to sensitive configurations

### Access Control

- Implement proper RLS policies for production
- Use environment-specific access controls
- Log all configuration access and changes
- Implement role-based permissions

### Backup and Recovery

- Regular automated backups
- Test restoration procedures
- Geographic backup distribution
- Point-in-time recovery capabilities