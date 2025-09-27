import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import {
  Application,
  ConfigKey,
  ConfigGroup,
  CreateConfigKeyRequest,
  CreateConfigGroupRequest
} from '../../models/config.models';

@Component({
  selector: 'app-config-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Configuration Keys
            <span *ngIf="application" class="text-blue-600"> - {{ application.name }}</span>
          </h1>
          <p *ngIf="application?.description" class="text-gray-600 mt-1">{{ application?.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="showCreateGroupForm = !showCreateGroupForm"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {{ showCreateGroupForm ? 'Cancel' : 'Add Group' }}
          </button>
          <button
            (click)="showCreateKeyForm = !showCreateKeyForm"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {{ showCreateKeyForm ? 'Cancel' : 'Add Config Key' }}
          </button>
        </div>
      </div>

      <!-- Create Group Form -->
      <div *ngIf="showCreateGroupForm" class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-4">Create New Configuration Group</h2>
        <form (ngSubmit)="createGroup()" #groupForm="ngForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="groupName" class="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                name="groupName"
                [(ngModel)]="newGroup.name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., database, api, security"
              >
            </div>
            <div>
              <label for="groupDescription" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="groupDescription"
                name="groupDescription"
                [(ngModel)]="newGroup.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this group"
              >
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button
              type="submit"
              [disabled]="!groupForm.form.valid || isLoading"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
            >
              {{ isLoading ? 'Creating...' : 'Create Group' }}
            </button>
            <button
              type="button"
              (click)="resetGroupForm()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Create Config Key Form -->
      <div *ngIf="showCreateKeyForm" class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-4">Create New Configuration Key</h2>
        <form (ngSubmit)="createConfigKey()" #keyForm="ngForm">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label for="keyName" class="block text-sm font-medium text-gray-700 mb-2">
                Key Name *
              </label>
              <input
                type="text"
                id="keyName"
                name="keyName"
                [(ngModel)]="newConfigKey.key_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., db.host, api.timeout"
              >
            </div>
            <div>
              <label for="dataType" class="block text-sm font-medium text-gray-700 mb-2">
                Data Type *
              </label>
              <select
                id="dataType"
                name="dataType"
                [(ngModel)]="newConfigKey.data_type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
                <option value="encrypted">Encrypted</option>
              </select>
            </div>
            <div>
              <label for="group" class="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                id="group"
                name="group"
                [(ngModel)]="newConfigKey.group_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Group</option>
                <option *ngFor="let group of configGroups" [value]="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                [(ngModel)]="newConfigKey.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this configuration"
              >
            </div>
            <div>
              <label for="defaultValue" class="block text-sm font-medium text-gray-700 mb-2">
                Default Value
              </label>
              <input
                type="text"
                id="defaultValue"
                name="defaultValue"
                [(ngModel)]="newConfigKey.default_value"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Optional default value"
              >
            </div>
          </div>

          <div class="mt-4 flex items-center space-x-6">
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="newConfigKey.is_required"
                name="isRequired"
                class="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2 text-sm text-gray-700">Required</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="newConfigKey.is_sensitive"
                name="isSensitive"
                class="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2 text-sm text-gray-700">Sensitive (password, API key, etc.)</span>
            </label>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              type="submit"
              [disabled]="!keyForm.form.valid || isLoading"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
            >
              {{ isLoading ? 'Creating...' : 'Create Config Key' }}
            </button>
            <button
              type="button"
              (click)="resetKeyForm()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm mb-6">
        {{ errorMessage }}
      </div>

      <!-- Config Groups -->
      <div *ngIf="configGroups.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Groups</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let group of configGroups"
            class="bg-white p-4 rounded-lg shadow-md border"
          >
            <h3 class="text-lg font-medium text-gray-900">{{ group.name }}</h3>
            <p *ngIf="group.description" class="text-gray-600 text-sm mt-1">{{ group.description }}</p>
            <p class="text-xs text-gray-500 mt-2">
              Created: {{ group.created_at | date:'short' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Config Keys Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Configuration Keys</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let key of configKeys" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ key.key_name }}</div>
                  <div *ngIf="key.description" class="text-sm text-gray-500">{{ key.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                        [class]="getDataTypeBadgeClass(key.data_type)">
                    {{ key.data_type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ key.config_groups?.name || 'No Group' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ key.default_value || 'Not set' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <span *ngIf="key.is_required"
                          class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                    <span *ngIf="key.is_sensitive"
                          class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
                      Sensitive
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ key.created_at | date:'short' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="configKeys.length === 0 && !isLoading" class="px-6 py-12 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H17a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No configuration keys</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating your first configuration key.</p>
        </div>
      </div>
    </div>
  `
})
export class ConfigKeysComponent implements OnInit {
  applicationId!: number;
  application: Application | null = null;
  configKeys: ConfigKey[] = [];
  configGroups: ConfigGroup[] = [];
  showCreateKeyForm = false;
  showCreateGroupForm = false;
  isLoading = false;
  errorMessage = '';

  newConfigKey: CreateConfigKeyRequest = {
    key_name: '',
    application_id: 0,
    data_type: 'string',
    description: '',
    default_value: '',
    is_required: false,
    is_sensitive: false
  };

  newGroup: CreateConfigGroupRequest = {
    name: '',
    application_id: 0,
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.newConfigKey.application_id = this.applicationId;
    this.newGroup.application_id = this.applicationId;
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.loadApplication(),
      this.loadConfigKeys(),
      this.loadConfigGroups()
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

  async loadConfigKeys() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.configKeys = await this.supabaseService.getConfigKeys(this.applicationId);
    } catch (error: any) {
      this.errorMessage = 'Failed to load configuration keys';
      console.error('Error loading config keys:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadConfigGroups() {
    try {
      this.configGroups = await this.supabaseService.getConfigGroups(this.applicationId);
    } catch (error: any) {
      this.errorMessage = 'Failed to load configuration groups';
      console.error('Error loading config groups:', error);
    }
  }

  async createConfigKey() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await this.supabaseService.createConfigKey(this.newConfigKey);
      await this.loadConfigKeys();
      this.resetKeyForm();
      this.showCreateKeyForm = false;
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create configuration key';
      console.error('Error creating config key:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async createGroup() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await this.supabaseService.createConfigGroup(this.newGroup);
      await this.loadConfigGroups();
      this.resetGroupForm();
      this.showCreateGroupForm = false;
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create configuration group';
      console.error('Error creating config group:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetKeyForm() {
    this.newConfigKey = {
      key_name: '',
      application_id: this.applicationId,
      data_type: 'string',
      description: '',
      default_value: '',
      is_required: false,
      is_sensitive: false
    };
  }

  resetGroupForm() {
    this.newGroup = {
      name: '',
      application_id: this.applicationId,
      description: ''
    };
  }

  getDataTypeBadgeClass(dataType: string): string {
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
}