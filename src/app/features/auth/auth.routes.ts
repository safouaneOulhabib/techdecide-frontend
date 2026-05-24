import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./containers/login/login.container')
        .then(m => m.LoginContainer)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./containers/register/register.container')
        .then(m => m.RegisterContainer)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];