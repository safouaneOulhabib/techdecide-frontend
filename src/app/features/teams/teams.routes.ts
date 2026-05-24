import { Routes } from '@angular/router';

export const TEAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/team-list/team-list.container')
        .then(m => m.TeamListContainer)
  }
];