import { Routes } from '@angular/router';
import { AuthTransition } from './components/auth-transition/auth-transition';
import { WaitComponent } from './components/wait/wait';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: AuthTransition },
  { path: 'wait', component: WaitComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];