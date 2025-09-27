import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  public authState$ = this.authState.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabaseService.client.auth.getSession();

      if (error) throw error;

      this.authState.next({
        user: session?.user ?? null,
        session: session,
        loading: false
      });

      // Listen for auth changes
      this.supabaseService.client.auth.onAuthStateChange((event, session) => {
        this.authState.next({
          user: session?.user ?? null,
          session: session,
          loading: false
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.authState.next({
        user: null,
        session: null,
        loading: false
      });
    }
  }

  async signUp(email: string, password: string, userData?: { full_name?: string }) {
    try {
      const { data, error } = await this.supabaseService.client.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error: error as AuthError };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error: error as AuthError };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabaseService.client.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as AuthError };
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await this.supabaseService.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error: error as AuthError };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await this.supabaseService.client.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error: error as AuthError };
    }
  }

  async updateProfile(userData: { full_name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await this.supabaseService.client.auth.updateUser({
        data: userData
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Convenience getters
  get currentUser(): User | null {
    return this.authState.value.user;
  }

  get currentSession(): Session | null {
    return this.authState.value.session;
  }

  get isAuthenticated(): boolean {
    return !!this.authState.value.user;
  }

  get isLoading(): boolean {
    return this.authState.value.loading;
  }

  // Get user display name
  get userDisplayName(): string {
    const user = this.currentUser;
    if (!user) return '';

    return user.user_metadata?.full_name ||
           user.email?.split('@')[0] ||
           'User';
  }

  // Get user initials for avatar
  get userInitials(): string {
    const displayName = this.userDisplayName;
    const names = displayName.split(' ');

    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }

    return displayName.substring(0, 2).toUpperCase();
  }
}