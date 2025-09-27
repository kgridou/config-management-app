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

      <!-- Environment Selector -->
      <div class="bg-white p-4 rounded-lg shadow-md mb-6">
        <label for="environment" class="block text-sm font-medium text-gray-700 mb-2">
          Select Environment
        </label>
        <select
          id="environment"
          [(ngModel)]="selectedEnvironmentId"
          (change)="onEnvironmentChange()"
          class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Environments</option>
          <option *ngFor="let env of environments" [value]="env.id">
            {{ env.name }} (Priority: {{ env.priority }})
          </option>
        </select>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ errorMessage }}
      </div>

      <!-- Configuration Values Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Configuration Values</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration Key
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Environment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let configValue of configValues" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ configValue.config_keys?.key_name }}
                  </div>
                  <div *ngIf="configValue.config_keys?.description" class="text-sm text-gray-500">
                    {{ configValue.config_keys?.description }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getEnvironmentBadgeClass(configValue.environments?.name)">
                    {{ configValue.environments?.name }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div *ngIf="editingConfigId === configValue.id" class="flex items-center space-x-2">
                    <input
                      type="text"
                      [(ngModel)]="editingValue"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      [placeholder]="configValue.config_keys?.default_value || 'Enter value'"
                    >
                    <button
                      (click)="saveConfigValue(configValue.id)"
                      class="text-green-600 hover:text-green-800 text-sm"
                    >
                      Save
                    </button>
                    <button
                      (click)="cancelEdit()"
                      class="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  <div *ngIf="editingConfigId !== configValue.id">
                    <span *ngIf="configValue.config_keys?.is_sensitive" class="text-gray-500">
                      ••••••••
                    </span>
                    <span *ngIf="!configValue.config_keys?.is_sensitive" class="text-sm text-gray-900">
                      {{ configValue.value || 'Not set' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                        [class]="getDataTypeBadgeClass(configValue.config_keys?.data_type)">
                    {{ configValue.config_keys?.data_type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ configValue.config_keys?.config_groups?.name || 'No Group' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    *ngIf="editingConfigId !== configValue.id"
                    (click)="startEdit(configValue)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    (click)="viewHistory(configValue.id)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    History
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="configValues.length === 0 && !isLoading" class="px-6 py-12 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5l7-7 7 7" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No configurations found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ selectedEnvironmentId ? 'No configurations for this environment' : 'No configurations available' }}
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center">
            <div class="flex-shrink-0">
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
            <div class="flex-shrink-0">
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
            <div class="flex-shrink-0">
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
      this.loadConfigValues()
    ]);
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
}