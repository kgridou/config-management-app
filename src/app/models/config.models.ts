export interface Application {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Environment {
  id: number;
  name: string;
  description?: string;
  priority: number;
  created_at: string;
  is_active: boolean;
}

export interface ConfigGroup {
  id: number;
  name: string;
  application_id: number;
  description?: string;
  created_at: string;
}

export interface ConfigKey {
  id: number;
  key_name: string;
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
}

export interface ConfigValue {
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

export interface ConfigHistory {
  id: number;
  config_value_id: number;
  old_value?: string;
  new_value?: string;
  change_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
  changed_by: string;
  change_reason?: string;
  changed_at: string;
  config_values?: {
    config_keys: ConfigKey;
  };
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  priority?: number;
}

export interface CreateConfigGroupRequest {
  name: string;
  application_id: number;
  description?: string;
}

export interface CreateConfigKeyRequest {
  key_name: string;
  application_id: number;
  group_id?: number;
  data_type: 'string' | 'integer' | 'boolean' | 'json' | 'encrypted';
  description?: string;
  default_value?: string;
  is_required?: boolean;
  is_sensitive?: boolean;
  validation_regex?: string;
}

export interface CreateConfigValueRequest {
  config_key_id: number;
  environment_id: number;
  value?: string;
  created_by?: string;
}