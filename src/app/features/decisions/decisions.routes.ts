import { Routes } from '@angular/router';

export const DECISION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/decision-list/decision-list.container')
        .then(m => m.DecisionListContainer)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./containers/decision-create/decision-create.container')
        .then(m => m.DecisionCreateContainer)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/decision-detail/decision-detail.container')
        .then(m => m.DecisionDetailContainer)
  }
];