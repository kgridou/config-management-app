import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Application, CreateApplicationRequest } from '../../models/config.models';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Applications</h1>
        <button
          (click)="showCreateForm = !showCreateForm"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {{ showCreateForm ? 'Cancel' : 'Add Application' }}
        </button>
      </div>

      <!-- Create Application Form -->
      <div *ngIf="showCreateForm" class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-4">Create New Application</h2>
        <form (ngSubmit)="createApplication()" #appForm="ngForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="newApplication.name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., web-api"
              >
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                [(ngModel)]="newApplication.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              >
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button
              type="submit"
              [disabled]="!appForm.form.valid || isLoading"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
            >
              {{ isLoading ? 'Creating...' : 'Create Application' }}
            </button>
            <button
              type="button"
              (click)="resetForm()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ errorMessage }}
      </div>

      <!-- Applications Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let app of applications"
          class="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ app.name }}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <p *ngIf="app.description" class="text-gray-600 mb-4">{{ app.description }}</p>

          <div class="text-sm text-gray-500 mb-4">
            <p>Created: {{ app.created_at | date:'short' }}</p>
            <p>Updated: {{ app.updated_at | date:'short' }}</p>
          </div>

          <div class="flex gap-2">
            <a
              [routerLink]="['/apps', app.id, 'configs']"
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Manage Configs
            </a>
            <a
              [routerLink]="['/apps', app.id, 'keys']"
              class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Config Keys
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="applications.length === 0 && !isLoading" class="text-center py-12">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5a2 2 0 00-2 2v10a2 2 0 002 2h14m-5-12l2-2m-2 2l2 2m7-2h14a2 2 0 012 2v10a2 2 0 01-2 2H21m7-12l-2-2m2 2l-2 2" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No applications</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first application.</p>
      </div>
    </div>
  `
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  showCreateForm = false;
  isLoading = false;
  errorMessage = '';

  newApplication: CreateApplicationRequest = {
    name: '',
    description: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadApplications();
  }

  async loadApplications() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.applications = await this.supabaseService.getApplications();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load applications';
      console.error('Error loading applications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async createApplication() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await this.supabaseService.createApplication(this.newApplication);
      await this.loadApplications();
      this.resetForm();
      this.showCreateForm = false;
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create application';
      console.error('Error creating application:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm() {
    this.newApplication = {
      name: '',
      description: ''
    };
  }
}