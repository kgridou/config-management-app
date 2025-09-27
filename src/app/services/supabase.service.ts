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
  async getConfigGroups(applicationId: number) {
    const { data, error } = await this.supabase
      .from('config_groups')
      .select('*')
      .eq('application_id', applicationId)
      .order('name');

    if (error) throw error;
    return data;
  }

  async createConfigGroup(group: { name: string; application_id: number; description?: string }) {
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
}