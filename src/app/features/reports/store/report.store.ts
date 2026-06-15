import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { tap } from 'rxjs';
import { ReportService } from '@features/reports/services/report.service';
import { Report, ReportSummary, CreateReportRequest, UpdateReportRequest } from '@features/reports/models/report.model';

export type ReportState = {
  reports: ReportSummary[];
  selectedReport: Report | null;
  loading: boolean;
  error: string | null;
};

const initialState: ReportState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null
};

export const ReportStore = signalStore(
  { providedIn: 'root' },

  withState<ReportState>(initialState),

  withMethods((store, service = inject(ReportService)) => ({

    loadAll() {
      patchState(store, { loading: true, error: null });
      service.getAll().subscribe({
        next: (reports) => patchState(store, { reports, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load reports',
          loading: false
        })
      });
    },

    loadById(id: number) {
      patchState(store, { loading: true, error: null });
      service.getById(id).subscribe({
        next: (report) => patchState(store, { selectedReport: report, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Report not found',
          loading: false
        })
      });
    },

    create(request: CreateReportRequest) {
      patchState(store, { loading: true, error: null });
      return service.create(request).pipe(
        tap({
          next: (report) => patchState(store, (state) => ({
            reports: [...state.reports, {
              id: report.id,
              title: report.title,
              introduction: report.introduction,
              authorId: report.authorId,
              authorName: report.authorName,
              projectId: report.projectId,
              projectName: report.projectName,
              createdAt: report.createdAt,
              updatedAt: report.updatedAt,
              itemCount: report.items.length,
              statusCounts: report.items.reduce((acc, item) => {
                acc[item.decisionStatus] = (acc[item.decisionStatus] ?? 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            }],
            loading: false
          })),
          error: (err) => patchState(store, {
            error: err.error?.message || 'Failed to create report',
            loading: false
          })
        })
      );
    },

    update(id: number, request: UpdateReportRequest) {
      patchState(store, { loading: true, error: null });
      return service.update(id, request).pipe(
        tap({
          next: (updated) => patchState(store, (state) => ({
            reports: state.reports.map(r => r.id === id
              ? { ...r, title: updated.title, updatedAt: updated.updatedAt }
              : r),
            selectedReport: updated,
            loading: false
          })),
          error: (err) => patchState(store, {
            error: err.error?.message || 'Failed to update report',
            loading: false
          })
        })
      );
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, (state) => ({
          reports: state.reports.filter(r => r.id !== id)
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete report'
        })
      });
    },

    clearSelected() {
      patchState(store, { selectedReport: null });
    }
  }))
);
