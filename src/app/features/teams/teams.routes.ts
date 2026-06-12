import { Routes } from '@angular/router';

export const TEAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/team-list/team-list.container')
        .then(m => m.TeamListContainer)
  },
  {
    path: ':id/members',
    loadComponent: () =>
      import('./containers/team-members-page/team-members-page.container')
        .then(m => m.TeamMembersPageContainer)
  }
];