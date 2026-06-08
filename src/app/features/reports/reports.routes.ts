import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/report-list/report-list.container')
        .then(m => m.ReportListContainer)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./containers/report-builder/report-builder.container')
        .then(m => m.ReportBuilderContainer)
  },
  {
    path: ':id/pdf-preview',
    loadComponent: () =>
      import('./containers/report-pdf-preview/report-pdf-preview.container')
        .then(m => m.ReportPdfPreviewContainer)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/report-detail/report-detail.container')
        .then(m => m.ReportDetailContainer)
  }
];
