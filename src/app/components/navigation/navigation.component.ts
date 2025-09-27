import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" class="text-xl font-bold text-gray-900">
                Config Manager
              </a>
            </div>
            <div *ngIf="authService.isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                routerLink="/applications"
                routerLinkActive="border-blue-500 text-gray-900"
                [routerLinkActiveOptions]="{exact: false}"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Applications
              </a>
            </div>
          </div>

          <div class="flex items-center">
            <!-- Loading state -->
            <div *ngIf="authService.isLoading" class="flex items-center space-x-2">
              <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm text-gray-500">Loading...</span>
            </div>

            <!-- Authenticated user menu -->
            <div *ngIf="!authService.isLoading && authService.isAuthenticated" class="relative ml-3">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">
                  Welcome, {{ authService.userDisplayName }}
                </span>

                <div class="relative">
                  <button
                    (click)="showUserMenu = !showUserMenu"
                    class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span class="sr-only">Open user menu</span>
                    <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ authService.userInitials }}
                      </span>
                    </div>
                  </button>

                  <!-- User dropdown menu -->
                  <div
                    *ngIf="showUserMenu"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div class="py-1">
                      <a
                        href="#"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </a>
                      <a
                        href="#"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                      <button
                        (click)="signOut()"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Not authenticated - show auth buttons -->
            <div *ngIf="!authService.isLoading && !authService.isAuthenticated" class="flex items-center space-x-4">
              <a
                routerLink="/auth/login"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Sign in
              </a>
              <a
                routerLink="/auth/register"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="sm:hidden">
        <button
          (click)="showMobileMenu = !showMobileMenu"
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <span class="sr-only">Open main menu</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <div *ngIf="showMobileMenu" class="sm:hidden bg-white border-b border-gray-200">
      <div class="pt-2 pb-3 space-y-1">
        <a
          *ngIf="authService.isAuthenticated"
          routerLink="/applications"
          routerLinkActive="bg-blue-50 border-blue-500 text-blue-700"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-base font-medium"
        >
          Applications
        </a>
      </div>

      <div *ngIf="authService.isAuthenticated" class="pt-4 pb-3 border-t border-gray-200">
        <div class="px-4">
          <div class="text-base font-medium text-gray-800">{{ authService.userDisplayName }}</div>
          <div class="text-sm font-medium text-gray-500">{{ authService.currentUser?.email }}</div>
        </div>
        <div class="mt-3 space-y-1">
          <button
            (click)="signOut()"
            class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  `
})
export class NavigationComponent implements OnInit {
  showUserMenu = false;
  showMobileMenu = false;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showUserMenu = false;
      }
    });
  }

  async signOut() {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    await this.authService.signOut();
  }
}