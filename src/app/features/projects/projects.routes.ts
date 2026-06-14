import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/project-list/project-list.container')
        .then(m => m.ProjectListContainer)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/project-detail/project-detail.container')
        .then(m => m.ProjectDetailContainer)
  }
];
