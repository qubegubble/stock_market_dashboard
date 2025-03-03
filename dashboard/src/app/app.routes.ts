import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { authGuard, loginGuard } from './auth.guard';

export const routes: Routes = [
  // Changed default route to point to home
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Added home route with lazy loading
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    // No guard here so it's publicly accessible
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  // Other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes), RegisterComponent, LoginComponent, DashboardComponent, BrowserModule, CommonModule, FormsModule],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule {}
