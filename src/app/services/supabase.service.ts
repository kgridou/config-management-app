import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const config = await this.configService.getConfig();
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );

    if (config.features.enableLogging) {
      console.log('Supabase client initialized with config:', {
        url: config.supabase.url,
        hasAnonKey: !!config.supabase.anonKey
      });
    }
  }

  get client() {
    return this.supabase;
  }

  // Applications
  async getApplications() {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  async createApplication(application: { name: string; description?: string }) {
    const { data, error } = await this.supabase
      .from('applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Environments
  async getEnvironments() {
    const { data, error } = await this.supabase
      .from('environments')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createEnvironment(environment: { name: string; description?: string; priority?: number }) {
    const { data, error } = await this.supabase
      .from('environments')
      .insert(environment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Config Groups
  async getConfigGroups(configFileId: number) {
    const { data, error } = await this.supabase
      .from('config_groups')
      .select('*')
      .eq('config_file_id', configFileId)
      .order('name');

    if (error) throw error;
    return data;
  }

  async createConfigGroup(group: { name: string; config_file_id: number; description?: string }) {
    const { data, error } = await this.supabase
      .from('config_groups')
      .insert(group)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Config Files
  async getConfigFiles(applicationId: number) {
    const { data, error } = await this.supabase
      .from('config_files')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  async createConfigFile(configFile: {
    name: string;
    application_id: number;
    file_format?: string;
    description?: string;
  }) {
    const { data, error } = await this.supabase
      .from('config_files')
      .insert(configFile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Config Keys
  async getConfigKeys(applicationId: number, configFileId?: number) {
    let query = this.supabase
      .from('config_keys')
      .select(`
        *,
        config_groups:group_id (name),
        config_files:config_file_id (name, file_format)
      `)
      .eq('application_id', applicationId);

    if (configFileId) {
      query = query.eq('config_file_id', configFileId);
    }

    const { data, error } = await query.order('key_name');

    if (error) throw error;
    return data;
  }

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
  }) {
    const { data, error } = await this.supabase
      .from('config_keys')
      .insert(configKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Config Values
  async getConfigValues(applicationId: number, environmentId?: number) {
    let query = this.supabase
      .from('config_values')
      .select(`
        *,
        config_keys!inner (
          key_name,
          data_type,
          is_sensitive,
          application_id,
          config_groups:group_id (name)
        ),
        environments!inner (name)
      `)
      .eq('config_keys.application_id', applicationId)
      .eq('is_active', true);

    if (environmentId) {
      query = query.eq('environment_id', environmentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Sort the data client-side by key_name since PostgREST doesn't support ordering by joined columns
    return data?.sort((a, b) => {
      const keyNameA = a.config_keys?.key_name || '';
      const keyNameB = b.config_keys?.key_name || '';
      return keyNameA.localeCompare(keyNameB);
    }) || [];
  }

  async createConfigValue(configValue: {
    config_key_id: number;
    environment_id: number;
    value?: string;
    created_by?: string;
  }) {
    // Get current user email for created_by if not provided
    const { data: { user } } = await this.supabase.auth.getUser();
    const valueToInsert = {
      ...configValue,
      created_by: configValue.created_by || user?.email || 'unknown'
    };

    const { data, error } = await this.supabase
      .from('config_values')
      .insert(valueToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConfigValue(id: number, updates: {
    value?: string;
    created_by?: string;
  }) {
    // Get current user email for created_by if not provided
    const { data: { user } } = await this.supabase.auth.getUser();
    const updatesToApply = {
      ...updates,
      created_by: updates.created_by || user?.email || 'unknown'
    };

    const { data, error } = await this.supabase
      .from('config_values')
      .update(updatesToApply)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Config History
  async getConfigHistory(configValueId?: number, keyName?: string) {
    let query = this.supabase
      .from('config_history')
      .select(`
        *,
        config_values!inner (
          config_keys!inner (key_name)
        )
      `);

    if (configValueId) {
      query = query.eq('config_value_id', configValueId);
    }

    if (keyName) {
      query = query.eq('config_values.config_keys.key_name', keyName);
    }

    const { data, error } = await query
      .order('changed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  // Snapshots
  async getSnapshots(applicationId: number, environmentId?: number) {
    let query = this.supabase
      .from('config_snapshots')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_active', true);

    if (environmentId) {
      query = query.eq('environment_id', environmentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createSnapshot(request: {
    name: string;
    description?: string;
    application_id: number;
    environment_id: number;
    snapshot_type?: 'MANUAL' | 'AUTOMATIC' | 'DEPLOYMENT' | 'BACKUP';
    tags?: any;
    metadata?: any;
  }) {
    // Get current user email for created_by
    const { data: { user } } = await this.supabase.auth.getUser();
    const snapshotToInsert = {
      ...request,
      created_by: user?.email || 'unknown'
    };

    const { data: snapshot, error: snapshotError } = await this.supabase
      .from('config_snapshots')
      .insert(snapshotToInsert)
      .select()
      .single();

    if (snapshotError) throw snapshotError;

    // Get current config values for this application and environment
    const { data: configValues, error: valuesError } = await this.supabase
      .from('config_values')
      .select(`
        *,
        config_keys!inner (
          key_name,
          data_type,
          is_sensitive,
          config_files!inner (name),
          config_groups (name)
        )
      `)
      .eq('config_keys.application_id', request.application_id)
      .eq('environment_id', request.environment_id)
      .eq('is_active', true);

    if (valuesError) throw valuesError;

    // Create snapshot data entries
    const snapshotData = configValues.map(cv => ({
      snapshot_id: snapshot.id,
      config_key_id: cv.config_key_id,
      key_name: cv.config_keys?.key_name || '',
      config_file_name: cv.config_keys?.config_files?.name || '',
      group_name: cv.config_keys?.config_groups?.name || null,
      value: cv.config_keys?.is_sensitive ? null : cv.value,
      encrypted_value: cv.config_keys?.is_sensitive ? cv.encrypted_value : null,
      data_type: cv.config_keys?.data_type || 'string',
      is_sensitive: cv.config_keys?.is_sensitive || false
    }));

    if (snapshotData.length > 0) {
      const { error: dataError } = await this.supabase
        .from('config_snapshot_data')
        .insert(snapshotData);

      if (dataError) throw dataError;
    }

    return snapshot;
  }

  async getSnapshotData(snapshotId: number) {
    const { data, error } = await this.supabase
      .from('config_snapshot_data')
      .select('*')
      .eq('snapshot_id', snapshotId)
      .order('config_file_name', { ascending: true })
      .order('group_name', { ascending: true })
      .order('key_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async deleteSnapshot(snapshotId: number) {
    const { error } = await this.supabase
      .from('config_snapshots')
      .update({ is_active: false })
      .eq('id', snapshotId);

    if (error) throw error;
  }

  async restoreFromSnapshot(snapshotId: number, targetEnvironmentId: number) {
    // Get snapshot data
    const snapshotData = await this.getSnapshotData(snapshotId);

    // Get current user email
    const { data: { user } } = await this.supabase.auth.getUser();
    const userEmail = user?.email || 'unknown';

    for (const item of snapshotData) {
      if (item.config_key_id) {
        // Check if config value exists for this key and environment
        const { data: existingValue } = await this.supabase
          .from('config_values')
          .select('id')
          .eq('config_key_id', item.config_key_id)
          .eq('environment_id', targetEnvironmentId)
          .eq('is_active', true)
          .single();

        if (existingValue) {
          // Update existing value
          await this.updateConfigValue(existingValue.id, {
            value: item.value || undefined,
            created_by: userEmail
          });
        } else {
          // Create new value
          await this.createConfigValue({
            config_key_id: item.config_key_id,
            environment_id: targetEnvironmentId,
            value: item.value || undefined,
            created_by: userEmail
          });
        }
      }
    }
  }
}