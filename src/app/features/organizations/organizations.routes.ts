import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/organization-list/organization-list.container')
        .then(m => m.OrganizationListContainer)
  }
];