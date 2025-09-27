import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/applications',
    pathMatch: 'full'
  },
  {
    path: 'applications',
    loadComponent: () => import('./components/application-list/application-list.component').then(m => m.ApplicationListComponent)
  },
  {
    path: 'apps/:id/configs',
    loadComponent: () => import('./components/config-management/config-management.component').then(m => m.ConfigManagementComponent)
  },
  {
    path: 'apps/:id/keys',
    loadComponent: () => import('./components/config-keys/config-keys.component').then(m => m.ConfigKeysComponent)
  },
  {
    path: '**',
    redirectTo: '/applications'
  }
];
