import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import {
  Application,
  Environment,
  ConfigValue,
  ConfigKey,
  CreateConfigValueRequest
} from '../../models/config.models';

interface ConfigMatrix {
  groupName: string;
  groupId: number | null;
  rows: ConfigRow[];
}

interface ConfigRow {
  key: ConfigKey;
  environment: Environment;
  configValue: ConfigValue | null;
}

@Component({
  selector: 'app-config-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Configuration Management
          <span *ngIf="application" class="text-blue-600"> - {{ application.name }}</span>
        </h1>
        <p *ngIf="application?.description" class="text-gray-600">{{ application?.description }}</p>
      </div>

      <!-- Environment Filter -->
      <div class="bg-white p-4 rounded-lg shadow-md mb-6">
        <label for="environment" class="block text-sm font-medium text-gray-700 mb-2">
          Environment Filter
        </label>
        <select
          id="environment"
          [(ngModel)]="selectedEnvironmentId"
          (change)="onEnvironmentChange()"
          class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Environments</option>
          <option *ngFor="let env of environments" [value]="env.id">
            {{ env.name }} (Priority: {{ env.priority }})
          </option>
        </select>
        <p class="text-sm text-gray-500 mt-1">
          Select an environment to view only its configurations, or leave blank to see all environments in matrix view
        </p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm mb-6">
        {{ errorMessage }}
      </div>

      <!-- Configuration Matrix -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Configuration Matrix</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ selectedEnvironmentId ? 'Single environment view' : 'All environments matrix view' }}
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Group
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Configuration Key
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Environment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <ng-container *ngFor="let group of configMatrix; trackBy: trackByGroup">
                <tr *ngFor="let row of group.rows; let rowIndex = index; trackBy: trackByRow"
                    class="hover:bg-gray-50">

                  <!-- Group Cell (with rowspan for first row in group) -->
                  <td *ngIf="rowIndex === 0"
                      [attr.rowspan]="group.rows.length"
                      class="px-6 py-4 align-top border-r border-gray-100 bg-gray-25">
                    <div class="text-sm font-medium text-gray-900">
                      {{ group.groupName }}
                    </div>
                  </td>

                  <!-- Key Cell (with rowspan for each key's environments) -->
                  <td *ngIf="isFirstRowForKey(group, rowIndex)"
                      [attr.rowspan]="getRowspanForKey(group, row.key)"
                      class="px-6 py-4 align-top border-r border-gray-100">
                    <div class="text-sm font-medium text-gray-900">
                      {{ row.key.key_name }}
                    </div>
                    <div *ngIf="row.key.description" class="text-xs text-gray-500 mt-1">
                      {{ row.key.description }}
                    </div>
                    <div class="flex items-center space-x-1 mt-2">
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium"
                            [class]="getDataTypeBadgeClass(row.key.data_type)">
                        {{ row.key.data_type }}
                      </span>
                      <span *ngIf="row.key.is_required"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                        Req
                      </span>
                      <span *ngIf="row.key.is_sensitive"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sen
                      </span>
                    </div>
                  </td>

                  <!-- Environment Cell -->
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="getEnvironmentBadgeClass(row.environment.name)">
                      {{ row.environment.name }}
                    </span>
                    <div class="text-xs text-gray-400 mt-1">
                      Priority: {{ row.environment.priority }}
                    </div>
                  </td>

                  <!-- Value Cell -->
                  <td class="px-6 py-4">
                    <div class="min-h-8">
                      <ng-container *ngIf="row.configValue as configValue; else noValue">
                        <!-- Editing Mode -->
                        <div *ngIf="editingConfigId === configValue.id" class="space-y-2">
                          <input
                            type="text"
                            [(ngModel)]="editingValue"
                            class="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm"
                            [placeholder]="row.key.default_value || 'Enter value'"
                          >
                          <div class="flex space-x-1">
                            <button
                              (click)="saveConfigValue(configValue.id)"
                              class="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              Save
                            </button>
                            <button
                              (click)="cancelEdit()"
                              class="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        <!-- Display Mode -->
                        <div *ngIf="editingConfigId !== configValue.id">
                          <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                              <span *ngIf="row.key.is_sensitive" class="text-gray-500 text-sm">
                                ••••••••
                              </span>
                              <span *ngIf="!row.key.is_sensitive" class="text-sm text-gray-900 break-words">
                                {{ configValue.value || 'Not set' }}
                              </span>
                              <div class="text-xs text-gray-400 mt-1">
                                v{{ configValue.version }}
                                <span *ngIf="configValue.created_by"> • {{ configValue.created_by }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ng-container>

                      <!-- No Value Template -->
                      <ng-template #noValue>
                        <div>
                          <span class="text-sm text-gray-400 italic">Not configured</span>
                          <div class="text-xs text-gray-300 mt-1">
                            Default: {{ row.key.default_value || 'None' }}
                          </div>
                        </div>
                      </ng-template>
                    </div>
                  </td>

                  <!-- Actions Cell -->
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <ng-container *ngIf="row.configValue as configValue; else createAction">
                      <button
                        *ngIf="editingConfigId !== configValue.id"
                        (click)="startEdit(configValue)"
                        class="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Edit
                      </button>
                    </ng-container>
                    <ng-template #createAction>
                      <button
                        (click)="createConfigValue(row.key.id, row.environment.id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Add
                      </button>
                    </ng-template>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="configMatrix.length === 0 && !isLoading" class="px-6 py-12 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5l7-7 7 7" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No configuration keys found</h3>
          <p class="mt-1 text-sm text-gray-500">
            Create configuration keys first to manage their values across environments
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center">
            <div class="shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5l7-7 7 7" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Configurations</dt>
                <dd class="text-lg font-medium text-gray-900">{{ configValues.length }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center">
            <div class="shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Environments</dt>
                <dd class="text-lg font-medium text-gray-900">{{ environments.length }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center">
            <div class="shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Sensitive Configs</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ getSensitiveConfigCount() }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfigManagementComponent implements OnInit {
  applicationId!: number;
  application: Application | null = null;
  environments: Environment[] = [];
  configValues: ConfigValue[] = [];
  configKeys: ConfigKey[] = [];
  configMatrix: ConfigMatrix[] = [];
  selectedEnvironmentId: number | null = null;
  editingConfigId: number | null = null;
  editingValue: string = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.loadApplication(),
      this.loadEnvironments(),
      this.loadConfigKeys()
    ]);
    await this.loadConfigValues();
    this.buildConfigMatrix();
  }

  async loadApplication() {
    try {
      const apps = await this.supabaseService.getApplications();
      this.application = apps.find(app => app.id === this.applicationId) || null;
    } catch (error: any) {
      this.errorMessage = 'Failed to load application details';
      console.error('Error loading application:', error);
    }
  }

  async loadEnvironments() {
    try {
      this.environments = await this.supabaseService.getEnvironments();
    } catch (error: any) {
      this.errorMessage = 'Failed to load environments';
      console.error('Error loading environments:', error);
    }
  }

  async loadConfigKeys() {
    try {
      this.configKeys = await this.supabaseService.getConfigKeys(this.applicationId);
    } catch (error: any) {
      this.errorMessage = 'Failed to load configuration keys';
      console.error('Error loading config keys:', error);
    }
  }

  async loadConfigValues() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.configValues = await this.supabaseService.getConfigValues(
        this.applicationId,
        this.selectedEnvironmentId || undefined
      );
    } catch (error: any) {
      this.errorMessage = 'Failed to load configuration values';
      console.error('Error loading config values:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onEnvironmentChange() {
    await this.loadConfigValues();
    this.buildConfigMatrix();
  }

  buildConfigMatrix() {
    const groupMap = new Map<string, ConfigMatrix>();

    // Filter environments based on selection
    const targetEnvironments = this.selectedEnvironmentId
      ? this.environments.filter(env => env.id === this.selectedEnvironmentId)
      : this.environments;

    // Process each config key
    this.configKeys.forEach(key => {
      const groupName = key.config_groups?.name || 'No Group';
      const groupId = key.group_id || null;

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          groupName,
          groupId,
          rows: []
        });
      }

      // Create a row for each environment for this key
      targetEnvironments.forEach(env => {
        const configValue = this.configValues.find(cv =>
          cv.config_key_id === key.id && cv.environment_id === env.id
        );

        groupMap.get(groupName)!.rows.push({
          key,
          environment: env,
          configValue: configValue || null
        });
      });
    });

    this.configMatrix = Array.from(groupMap.values());
  }

  startEdit(configValue: ConfigValue) {
    this.editingConfigId = configValue.id;
    this.editingValue = configValue.value || '';
  }

  async saveConfigValue(configId: number) {
    try {
      this.isLoading = true;
      await this.supabaseService.updateConfigValue(configId, {
        value: this.editingValue,
        created_by: 'current_user' // In a real app, get from auth
      });
      await this.loadConfigValues();
      this.cancelEdit();
    } catch (error: any) {
      this.errorMessage = 'Failed to update configuration value';
      console.error('Error updating config value:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancelEdit() {
    this.editingConfigId = null;
    this.editingValue = '';
  }

  viewHistory(configValueId: number) {
    // In a real app, navigate to history view or open modal
    console.log('View history for config value:', configValueId);
  }

  getEnvironmentBadgeClass(envName: string | undefined): string {
    switch (envName?.toLowerCase()) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDataTypeBadgeClass(dataType: string | undefined): string {
    switch (dataType) {
      case 'string':
        return 'bg-blue-100 text-blue-800';
      case 'integer':
        return 'bg-purple-100 text-purple-800';
      case 'boolean':
        return 'bg-green-100 text-green-800';
      case 'json':
        return 'bg-orange-100 text-orange-800';
      case 'encrypted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getSensitiveConfigCount(): number {
    return this.configValues.filter(cv => cv.config_keys?.is_sensitive).length;
  }


  trackByGroup(index: number, group: ConfigMatrix): string {
    return `${group.groupId}-${group.groupName}`;
  }

  trackByRow(index: number, row: ConfigRow): string {
    return `${row.key.id}-${row.environment.id}`;
  }

  isFirstRowForKey(group: ConfigMatrix, rowIndex: number): boolean {
    if (rowIndex === 0) return true;
    const currentRow = group.rows[rowIndex];
    const previousRow = group.rows[rowIndex - 1];
    return currentRow.key.id !== previousRow.key.id;
  }

  getRowspanForKey(group: ConfigMatrix, key: ConfigKey): number {
    return group.rows.filter(row => row.key.id === key.id).length;
  }

  async createConfigValue(keyId: number, environmentId: number) {
    try {
      this.isLoading = true;
      await this.supabaseService.createConfigValue({
        config_key_id: keyId,
        environment_id: environmentId,
        value: '',
        created_by: 'current_user' // In real app, get from auth
      });
      await this.loadConfigValues();
      this.buildConfigMatrix();
    } catch (error: any) {
      this.errorMessage = 'Failed to create configuration value';
      console.error('Error creating config value:', error);
    } finally {
      this.isLoading = false;
    }
  }
}