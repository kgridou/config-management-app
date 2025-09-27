import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface AppConfig {
  production: boolean;
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    debugMode: boolean;
    enableLogging: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.http.get<AppConfig>('/assets/config/app-config.json')
      .pipe(shareReplay(1))
      .subscribe({
        next: (config) => {
          this.configSubject.next(config);
          if (config.features.enableLogging) {
            console.log('Configuration loaded:', config);
          }
        },
        error: (error) => {
          console.error('Failed to load configuration:', error);
          // Fallback to default config
          this.configSubject.next(this.getDefaultConfig());
        }
      });
  }

  private getDefaultConfig(): AppConfig {
    return {
      production: false,
      supabase: {
        url: 'https://bufybxbbtibyywoypkgl.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZnlieGJidGlieXl3b3lwa2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTM2MTYsImV4cCI6MjA3NDUyOTYxNn0.VDfO_PxuxhDkYjA_UoqIY0lrxWg-qaiulN8Co0Aa5YQ'
      },
      api: {
        baseUrl: 'http://localhost:3000',
        timeout: 30000
      },
      features: {
        debugMode: true,
        enableLogging: true
      }
    };
  }

  // Synchronous getter for current config (use with caution)
  get currentConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  // Async getter that waits for config to load
  async getConfig(): Promise<AppConfig> {
    return new Promise((resolve) => {
      const config = this.configSubject.value;
      if (config) {
        resolve(config);
      } else {
        const subscription = this.config$.subscribe(config => {
          if (config) {
            subscription.unsubscribe();
            resolve(config);
          }
        });
      }
    });
  }

  // Convenience getters
  get isProduction(): boolean {
    return this.currentConfig?.production ?? false;
  }

  get isDevelopment(): boolean {
    return !this.isProduction;
  }

  get supabaseConfig() {
    return this.currentConfig?.supabase;
  }

  get apiConfig() {
    return this.currentConfig?.api;
  }

  get featuresConfig() {
    return this.currentConfig?.features;
  }

  // Method to reload configuration
  reloadConfig(): void {
    this.loadConfig();
  }
}