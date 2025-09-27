# Configuration Snapshots

Configuration Snapshots provide point-in-time captures of your application configurations, enabling backup, restore, and environment promotion workflows.

## Overview

Snapshots capture the complete state of configuration values for a specific application and environment at a particular moment in time. This includes:

- All configuration keys and their values
- Metadata about when and who created the snapshot
- Denormalized data for historical accuracy (preserved even if keys are later deleted)
- Support for sensitive data handling

## Core Concepts

### Snapshot Types

- **MANUAL**: User-created snapshots for backup or testing purposes
- **AUTOMATIC**: System-generated snapshots (future enhancement)
- **DEPLOYMENT**: Snapshots created during deployment processes
- **BACKUP**: Scheduled backup snapshots

### Data Structure

Each snapshot consists of:
- **Metadata**: Name, description, type, creator, timestamps
- **Configuration Data**: Complete set of config values at snapshot time
- **Denormalized Fields**: Key names, file names, group names preserved for history

## Features

### Creating Snapshots

1. Navigate to any application's configuration management page
2. Click the "Snapshots" tab
3. Click "Create Snapshot"
4. Fill in the required information:
   - **Name**: Descriptive name for the snapshot
   - **Description**: Optional detailed description
   - **Environment**: Which environment to snapshot
   - **Type**: Manual, Deployment, or Backup

### Viewing Snapshots

Snapshots are displayed with:
- Creation date and creator information
- Environment and type indicators
- Configuration count and file organization
- Actions for viewing, restoring, or deleting

### Restoring from Snapshots

1. Find the desired snapshot
2. Click "Restore"
3. Select the target environment
4. Confirm the restoration

**Note**: Restoration will overwrite existing configuration values in the target environment.

### Snapshot Data Organization

When viewing snapshot contents, configurations are organized by:
- **Config File**: Grouped by the configuration file they belong to
- **Config Group**: Sub-grouped by configuration groups within files
- **Sensitive Data**: Marked as `[SENSITIVE]` instead of showing actual values

## API Reference

### Snapshot Service Methods

#### `getSnapshots(applicationId: number, environmentId?: number)`
Retrieve snapshots for an application, optionally filtered by environment.

```typescript
const snapshots = await supabaseService.getSnapshots(1, 2);
```

#### `createSnapshot(request: CreateSnapshotRequest)`
Create a new snapshot of the current configuration state.

```typescript
const snapshot = await supabaseService.createSnapshot({
  name: "Pre-deployment backup",
  description: "Backup before v2.1.0 deployment",
  application_id: 1,
  environment_id: 2,
  snapshot_type: "DEPLOYMENT"
});
```

#### `getSnapshotData(snapshotId: number)`
Retrieve the detailed configuration data for a specific snapshot.

```typescript
const data = await supabaseService.getSnapshotData(123);
```

#### `deleteSnapshot(snapshotId: number)`
Soft delete a snapshot (marks as inactive).

```typescript
await supabaseService.deleteSnapshot(123);
```

#### `restoreFromSnapshot(snapshotId: number, targetEnvironmentId: number)`
Restore configuration values from a snapshot to a target environment.

```typescript
await supabaseService.restoreFromSnapshot(123, 3);
```

## Database Schema

### config_snapshots Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | VARCHAR(200) | Snapshot display name |
| description | TEXT | Optional description |
| application_id | BIGINT | Application reference |
| environment_id | BIGINT | Environment reference |
| snapshot_type | VARCHAR(20) | Type of snapshot |
| created_by | VARCHAR(100) | Creator identifier |
| created_at | TIMESTAMP | Creation timestamp |
| is_active | BOOLEAN | Active status flag |
| tags | JSONB | Optional tags for categorization |
| metadata | JSONB | Additional metadata |

### config_snapshot_data Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| snapshot_id | BIGINT | Snapshot reference |
| config_key_id | BIGINT | Config key reference (nullable) |
| key_name | VARCHAR(200) | Denormalized key name |
| config_file_name | VARCHAR(100) | Denormalized file name |
| group_name | VARCHAR(100) | Denormalized group name |
| value | TEXT | Configuration value |
| encrypted_value | BYTEA | Encrypted sensitive value |
| data_type | VARCHAR(20) | Data type |
| is_sensitive | BOOLEAN | Sensitive flag |
| created_at | TIMESTAMP | Creation timestamp |

## Best Practices

### When to Create Snapshots

1. **Before Major Changes**: Create snapshots before significant configuration updates
2. **Pre-Deployment**: Capture current state before deploying new versions
3. **Environment Promotion**: Snapshot production configs for staging/development
4. **Scheduled Backups**: Regular snapshots for disaster recovery

### Naming Conventions

Use descriptive names that include:
- Purpose: "Pre-deployment", "Backup", "Hotfix"
- Version: "v2.1.0", "Release-March-2024"
- Environment: "Production", "Staging"

Examples:
- "Production v2.1.0 Pre-deployment"
- "Staging Backup 2024-03-15"
- "Hotfix Rollback Point"

### Retention Policy

Consider implementing:
- Keep deployment snapshots indefinitely
- Retain manual snapshots for 90 days
- Archive backup snapshots after 30 days
- Clean up test/development snapshots weekly

## Security Considerations

### Sensitive Data Handling

- Sensitive configuration values are stored encrypted in snapshots
- UI displays `[SENSITIVE]` instead of actual values
- Access to snapshot data requires appropriate permissions
- Restoration of sensitive values maintains encryption

### Access Control

- Snapshot creation requires configuration write permissions
- Snapshot viewing requires configuration read permissions
- Restoration requires write permissions to target environment
- Deletion requires administrative permissions

## Troubleshooting

### Common Issues

**Snapshot Creation Fails**
- Verify user has proper permissions
- Check that the target environment exists and is active
- Ensure configuration keys exist for the application

**Restoration Incomplete**
- Some configuration keys may have been deleted since snapshot creation
- Check logs for specific restoration errors
- Verify target environment is accessible

**Performance Considerations**
- Large configurations (1000+ keys) may take longer to snapshot
- Consider creating snapshots during low-traffic periods
- Monitor database storage for snapshot data growth

## Migration Guide

### From Previous Versions

If upgrading from a version without snapshots:

1. Run the database migration scripts in order:
   - `supabase-schema.sql` (includes snapshot tables)
   - `seed.sql` (if setting up new environment)

2. Update application dependencies:
   - Ensure latest snapshot models are imported
   - Update service layer with snapshot methods

3. UI Updates:
   - Snapshot tab will automatically appear in config management
   - No additional configuration required

## Future Enhancements

Planned features for future releases:

- **Automatic Snapshots**: Triggered by configuration changes
- **Snapshot Comparison**: Diff views between snapshots
- **Bulk Operations**: Restore multiple snapshots at once
- **Export/Import**: Snapshot portability between systems
- **Scheduled Snapshots**: Cron-based automatic backups
- **Retention Policies**: Automatic cleanup based on age/count