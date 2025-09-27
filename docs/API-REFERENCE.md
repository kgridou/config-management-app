# API Reference

This document provides comprehensive API documentation for the Configuration Management System.

## Table of Contents

- [Authentication](#authentication)
- [Applications](#applications)
- [Environments](#environments)
- [Configuration Files](#configuration-files)
- [Configuration Groups](#configuration-groups)
- [Configuration Keys](#configuration-keys)
- [Configuration Values](#configuration-values)
- [Configuration History](#configuration-history)
- [Snapshots](#snapshots)

## Authentication

All API calls require authentication through Supabase Auth. The system uses Row Level Security (RLS) to ensure users can only access authorized data.

### Getting User Context

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## Applications

### Get Applications

Retrieve all active applications.

```typescript
async getApplications(): Promise<Application[]>
```

**Returns:** Array of Application objects

**Example:**
```typescript
const applications = await supabaseService.getApplications();
```

### Create Application

Create a new application.

```typescript
async createApplication(application: { name: string; description?: string }): Promise<Application>
```

**Parameters:**
- `name` (string, required): Application name
- `description` (string, optional): Application description

**Example:**
```typescript
const app = await supabaseService.createApplication({
  name: "my-api-service",
  description: "Main API service for the platform"
});
```

## Environments

### Get Environments

Retrieve all active environments ordered by priority.

```typescript
async getEnvironments(): Promise<Environment[]>
```

**Returns:** Array of Environment objects ordered by priority (descending)

### Create Environment

Create a new environment.

```typescript
async createEnvironment(environment: {
  name: string;
  description?: string;
  priority?: number
}): Promise<Environment>
```

**Parameters:**
- `name` (string, required): Environment name
- `description` (string, optional): Environment description
- `priority` (number, optional): Environment priority (higher = more important)

## Configuration Files

### Get Configuration Files

Retrieve configuration files for an application.

```typescript
async getConfigFiles(applicationId: number): Promise<ConfigFile[]>
```

**Parameters:**
- `applicationId` (number): Application ID

### Create Configuration File

Create a new configuration file.

```typescript
async createConfigFile(configFile: {
  name: string;
  application_id: number;
  file_format?: string;
  description?: string;
}): Promise<ConfigFile>
```

**Parameters:**
- `name` (string): File name (e.g., "database.json")
- `application_id` (number): Application ID
- `file_format` (string, optional): File format ("json", "yaml", "env", "properties")
- `description` (string, optional): File description

## Configuration Groups

### Get Configuration Groups

Retrieve groups for a configuration file.

```typescript
async getConfigGroups(configFileId: number): Promise<ConfigGroup[]>
```

**Parameters:**
- `configFileId` (number): Configuration file ID

### Create Configuration Group

Create a new configuration group.

```typescript
async createConfigGroup(group: {
  name: string;
  config_file_id: number;
  description?: string
}): Promise<ConfigGroup>
```

**Parameters:**
- `name` (string): Group name
- `config_file_id` (number): Configuration file ID
- `description` (string, optional): Group description

## Configuration Keys

### Get Configuration Keys

Retrieve configuration keys for an application.

```typescript
async getConfigKeys(applicationId: number, configFileId?: number): Promise<ConfigKey[]>
```

**Parameters:**
- `applicationId` (number): Application ID
- `configFileId` (number, optional): Filter by configuration file

**Returns:** Array of ConfigKey objects with joined group and file information

### Create Configuration Key

Create a new configuration key definition.

```typescript
async createConfigKey(configKey: {
  key_name: string;
  application_id: number;
  group_id?: number;
  data_type: string;
  description?: string;
  default_value?: string;
  is_required?: boolean;
  is_sensitive?: boolean;
  validation_regex?: string;
}): Promise<ConfigKey>
```

**Parameters:**
- `key_name` (string): Configuration key name
- `application_id` (number): Application ID
- `group_id` (number, optional): Configuration group ID
- `data_type` (string): Data type ("string", "integer", "boolean", "json", "encrypted")
- `description` (string, optional): Key description
- `default_value` (string, optional): Default value
- `is_required` (boolean, optional): Whether key is required
- `is_sensitive` (boolean, optional): Whether key contains sensitive data
- `validation_regex` (string, optional): Validation regex pattern

## Configuration Values

### Get Configuration Values

Retrieve configuration values for an application and environment.

```typescript
async getConfigValues(applicationId: number, environmentId?: number): Promise<ConfigValue[]>
```

**Parameters:**
- `applicationId` (number): Application ID
- `environmentId` (number, optional): Filter by environment

**Returns:** Array of ConfigValue objects with joined key and environment information, sorted by key name

### Create Configuration Value

Create a new configuration value.

```typescript
async createConfigValue(configValue: {
  config_key_id: number;
  environment_id: number;
  value?: string;
  created_by?: string;
}): Promise<ConfigValue>
```

**Parameters:**
- `config_key_id` (number): Configuration key ID
- `environment_id` (number): Environment ID
- `value` (string, optional): Configuration value
- `created_by` (string, optional): Creator (defaults to current user)

### Update Configuration Value

Update an existing configuration value.

```typescript
async updateConfigValue(id: number, updates: {
  value?: string;
  created_by?: string;
}): Promise<ConfigValue>
```

**Parameters:**
- `id` (number): Configuration value ID
- `updates` (object): Fields to update
  - `value` (string, optional): New value
  - `created_by` (string, optional): Updated by (defaults to current user)

## Configuration History

### Get Configuration History

Retrieve change history for configuration values.

```typescript
async getConfigHistory(configValueId?: number, keyName?: string): Promise<ConfigHistory[]>
```

**Parameters:**
- `configValueId` (number, optional): Filter by specific config value
- `keyName` (string, optional): Filter by key name

**Returns:** Array of ConfigHistory objects ordered by change date (most recent first), limited to 50 records

## Snapshots

### Get Snapshots

Retrieve snapshots for an application.

```typescript
async getSnapshots(applicationId: number, environmentId?: number): Promise<ConfigSnapshot[]>
```

**Parameters:**
- `applicationId` (number): Application ID
- `environmentId` (number, optional): Filter by environment

**Returns:** Array of active ConfigSnapshot objects ordered by creation date (most recent first)

### Create Snapshot

Create a new configuration snapshot.

```typescript
async createSnapshot(request: {
  name: string;
  description?: string;
  application_id: number;
  environment_id: number;
  snapshot_type?: 'MANUAL' | 'AUTOMATIC' | 'DEPLOYMENT' | 'BACKUP';
  tags?: any;
  metadata?: any;
}): Promise<ConfigSnapshot>
```

**Parameters:**
- `name` (string): Snapshot name
- `description` (string, optional): Snapshot description
- `application_id` (number): Application ID
- `environment_id` (number): Environment ID to snapshot
- `snapshot_type` (string, optional): Snapshot type (defaults to "MANUAL")
- `tags` (object, optional): JSON tags for categorization
- `metadata` (object, optional): Additional JSON metadata

**Behavior:**
- Automatically captures all active configuration values for the specified application and environment
- Creates corresponding entries in config_snapshot_data
- Sensitive values are stored encrypted
- Creator is automatically set to current authenticated user

### Get Snapshot Data

Retrieve detailed configuration data for a snapshot.

```typescript
async getSnapshotData(snapshotId: number): Promise<ConfigSnapshotData[]>
```

**Parameters:**
- `snapshotId` (number): Snapshot ID

**Returns:** Array of ConfigSnapshotData objects ordered by file name, group name, and key name

### Delete Snapshot

Soft delete a snapshot (marks as inactive).

```typescript
async deleteSnapshot(snapshotId: number): Promise<void>
```

**Parameters:**
- `snapshotId` (number): Snapshot ID to delete

**Behavior:**
- Sets `is_active` to false instead of hard deletion
- Preserves historical data for audit purposes

### Restore from Snapshot

Restore configuration values from a snapshot to a target environment.

```typescript
async restoreFromSnapshot(snapshotId: number, targetEnvironmentId: number): Promise<void>
```

**Parameters:**
- `snapshotId` (number): Source snapshot ID
- `targetEnvironmentId` (number): Target environment ID

**Behavior:**
- Updates existing configuration values where they exist
- Creates new configuration values where they don't exist
- Only processes snapshot data that has valid config_key_id references
- Automatically sets updated_by to current authenticated user
- Triggers audit history entries for all changes

## Error Handling

All API methods throw errors that should be caught and handled appropriately:

```typescript
try {
  const result = await supabaseService.getApplications();
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## Data Types

### Application
```typescript
interface Application {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

### Environment
```typescript
interface Environment {
  id: number;
  name: string;
  description?: string;
  priority: number;
  created_at: string;
  is_active: boolean;
}
```

### ConfigFile
```typescript
interface ConfigFile {
  id: number;
  name: string;
  application_id: number;
  file_format: 'json' | 'yaml' | 'env' | 'properties';
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

### ConfigGroup
```typescript
interface ConfigGroup {
  id: number;
  name: string;
  config_file_id: number;
  description?: string;
  created_at: string;
}
```

### ConfigKey
```typescript
interface ConfigKey {
  id: number;
  key_name: string;
  config_file_id: number;
  group_id?: number;
  application_id: number;
  data_type: 'string' | 'integer' | 'boolean' | 'json' | 'encrypted';
  description?: string;
  default_value?: string;
  is_required: boolean;
  is_sensitive: boolean;
  validation_regex?: string;
  created_at: string;
  updated_at: string;
  config_groups?: { name: string };
  config_files?: { name: string; file_format: string };
}
```

### ConfigValue
```typescript
interface ConfigValue {
  id: number;
  config_key_id: number;
  environment_id: number;
  value?: string;
  encrypted_value?: Uint8Array;
  version: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  config_keys?: ConfigKey;
  environments?: Environment;
}
```

### ConfigSnapshot
```typescript
interface ConfigSnapshot {
  id: number;
  name: string;
  description?: string;
  application_id: number;
  environment_id: number;
  snapshot_type: 'MANUAL' | 'AUTOMATIC' | 'DEPLOYMENT' | 'BACKUP';
  created_by: string;
  created_at: string;
  is_active: boolean;
  tags?: any;
  metadata?: any;
}
```

### ConfigSnapshotData
```typescript
interface ConfigSnapshotData {
  id: number;
  snapshot_id: number;
  config_key_id?: number;
  key_name: string;
  config_file_name: string;
  group_name?: string;
  value?: string;
  encrypted_value?: Uint8Array;
  data_type: 'string' | 'integer' | 'boolean' | 'json' | 'encrypted';
  is_sensitive: boolean;
  created_at: string;
}
```