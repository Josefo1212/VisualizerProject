import { Routes } from '@angular/router';
import { AuthTransition } from './components/auth-transition/AuthTransition';
import { DashboardComponent } from './components/dashboard/Dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: AuthTransition },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
