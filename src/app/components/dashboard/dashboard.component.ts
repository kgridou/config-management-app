import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalApplications: number;
  totalEnvironments: number;
  totalConfigurations: number;
  recentChanges: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Configuration Management</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Welcome, {{ user?.user_metadata?.full_name || user?.email }}</span>
              <button
                (click)="signOut()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Welcome Section -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
              <p class="text-gray-600 mb-6">
                Manage your application configurations across different environments
              </p>

              <!-- Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" *ngIf="stats">
                <div class="bg-blue-50 p-6 rounded-lg">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-blue-600">Total Applications</p>
                      <p class="text-2xl font-bold text-blue-900">{{ stats.totalApplications }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-green-50 p-6 rounded-lg">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-green-600">Environments</p>
                      <p class="text-2xl font-bold text-green-900">{{ stats.totalEnvironments }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-purple-50 p-6 rounded-lg">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-purple-600">Total Configurations</p>
                      <p class="text-2xl font-bold text-purple-900">{{ stats.totalConfigurations }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Manage Applications</h3>
                  <p class="text-gray-600 mb-4">View and manage your applications and their configurations</p>
                  <a
                    routerLink="/applications"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Applications
                  </a>
                </div>

                <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Environment Settings</h3>
                  <p class="text-gray-600 mb-4">Configure development, staging, and production environments</p>
                  <button
                    (click)="viewEnvironments()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    View Environments
                  </button>
                </div>

                <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Configuration Audit</h3>
                  <p class="text-gray-600 mb-4">Review recent changes and configuration history</p>
                  <button
                    (click)="viewAuditLog()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    View Audit Log
                  </button>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="mt-8" *ngIf="stats?.recentChanges?.length">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul class="divide-y divide-gray-200">
                    <li *ngFor="let change of stats!.recentChanges.slice(0, 5)" class="px-6 py-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-2 w-2 bg-green-400 rounded-full"></div>
                          <div class="ml-4">
                            <p class="text-sm font-medium text-gray-900">
                              Configuration changed: {{ change.config_values?.config_keys?.key_name }}
                            </p>
                            <p class="text-sm text-gray-500">
                              Changed by {{ change.changed_by }} • {{ formatDate(change.changed_at) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  user: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Get current user
    this.user = this.authService.currentUser;

    // Load dashboard statistics
    await this.loadDashboardStats();
  }

  async loadDashboardStats() {
    try {
      const [applications, environments, recentChanges] = await Promise.all([
        this.supabaseService.getApplications(),
        this.supabaseService.getEnvironments(),
        this.supabaseService.getConfigHistory()
      ]);

      // Count total configurations across all applications
      let totalConfigurations = 0;
      for (const app of applications) {
        const configs = await this.supabaseService.getConfigValues(app.id);
        totalConfigurations += configs.length;
      }

      this.stats = {
        totalApplications: applications.length,
        totalEnvironments: environments.length,
        totalConfigurations,
        recentChanges: recentChanges || []
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  async signOut() {
    await this.authService.signOut();
  }

  viewEnvironments() {
    // TODO: Navigate to environments page when implemented
    alert('Environments management coming soon!');
  }

  viewAuditLog() {
    // TODO: Navigate to audit log page when implemented
    alert('Audit log page coming soon!');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}