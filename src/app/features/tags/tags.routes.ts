import { Routes } from '@angular/router';

export const TAG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/tag-list/tag-list.container')
        .then(m => m.TagListContainer)
  }
];