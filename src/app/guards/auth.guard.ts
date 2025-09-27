import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.loading) {
          return false; // Still loading, don't allow access yet
        }

        if (authState.user) {
          return true; // User is authenticated
        }

        // User is not authenticated, redirect to login
        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.loading) {
          return false; // Still loading
        }

        if (!authState.user) {
          return true; // User is not authenticated, allow access to guest pages
        }

        // User is authenticated, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
}