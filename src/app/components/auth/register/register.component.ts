import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a routerLink="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </a>
          </p>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {{ successMessage }}
          </div>

          <div class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autocomplete="name"
                required
                [(ngModel)]="formData.fullName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              >
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                [(ngModel)]="formData.email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              >
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                [(ngModel)]="formData.password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Create a password"
              >
              <p class="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                [(ngModel)]="formData.confirmPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              >
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              [(ngModel)]="formData.agreeTerms"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
              and
              <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg *ngIf="!isLoading" class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                </svg>
                <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a routerLink="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  formData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    // Validation
    if (!this.formData.fullName || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (!this.formData.agreeTerms) {
      this.errorMessage = 'Please agree to the terms and conditions';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.authService.signUp(
        this.formData.email,
        this.formData.password,
        { full_name: this.formData.fullName }
      );

      if (error) {
        this.errorMessage = error.message || 'Failed to create account';
      } else if (data.user) {
        this.successMessage = 'Account created successfully! Please check your email to verify your account.';
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }
}