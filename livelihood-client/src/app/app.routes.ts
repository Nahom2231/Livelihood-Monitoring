import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'bookkeeping',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookkeeping/bookkeeping.component').then(m => m.BookkeepingComponent)
  },
  {
    path: 'cases',
    canActivate: [authGuard],
    loadComponent: () => import('./features/case-management/case-management.component').then(m => m.CaseManagementComponent)
  },
  {
    path: 'case-management',
    redirectTo: 'cases'
  },
  {
    path: 'planning',
    canActivate: [authGuard],
    loadComponent: () => import('./features/business-planning/business-planning.component').then(m => m.BusinessPlanningComponent)
  },
  {
    path: 'business-planning',
    redirectTo: 'planning'
  },
  {
    path: 'learning',
    canActivate: [authGuard],
    loadComponent: () => import('./features/learning/learning.component').then(m => m.LearningComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];