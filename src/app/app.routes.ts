import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'decisions',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('@layout/auth-layout/auth-layout')
        .then(m => m.AuthLayout),
    canActivate: [guestGuard],
    loadChildren: () =>
      import('@features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () =>
      import('@layout/main-layout/main-layout')
        .then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'decisions',
        loadChildren: () =>
          import('@features/decisions/decisions.routes')
            .then(m => m.DECISION_ROUTES)
      },
      {
        path: 'organizations',
        loadChildren: () =>
          import('@features/organizations/organizations.routes')
            .then(m => m.ORGANIZATION_ROUTES)
      },
      {
        path: 'teams',
        loadChildren: () =>
          import('@features/teams/teams.routes')
            .then(m => m.TEAM_ROUTES)
      },
      {
        path: 'tags',
        loadChildren: () =>
          import('@features/tags/tags.routes')
            .then(m => m.TAG_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'decisions'
  }
];