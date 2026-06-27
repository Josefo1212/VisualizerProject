import { Routes } from '@angular/router';
import { AuthTransition } from './components/AuthTransition/AuthTransition';
import { DashboardComponent } from './components/Dashboard/Dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: AuthTransition },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
