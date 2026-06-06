import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, Signal } from '@angular/core';
import { tap } from 'rxjs';
import { DecisionService } from '@features/decisions/services/decision.service';
import {
  Decision,
  CreateDecisionRequest,
  UpdateDecisionRequest,
  DecisionStatus
} from '@features/decisions/models/decision.model';

export type DecisionState = {
  decisions: Decision[];
  selectedDecision: Decision | null;
  loading: boolean;
  error: string | null;
};

const initialState: DecisionState = {
  decisions: [],
  selectedDecision: null,
  loading: false,
  error: null
};

export const DecisionStore = signalStore(
  { providedIn: 'root' },

  withState<DecisionState>(initialState),

  withComputed((store) => ({
    totalDecisions: computed(() => store.decisions().length),
    approvedDecisions: computed(() =>
      store.decisions().filter(d => d.status === 'APPROVED')
    ),
    draftDecisions: computed(() =>
      store.decisions().filter(d => d.status === 'DRAFT')
    )
  })),

  withMethods((store, service = inject(DecisionService)) => ({

    loadAll() {
      patchState(store, { loading: true, error: null });
      service.getAll().subscribe({
        next: (decisions) => patchState(store, { decisions, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load decisions',
          loading: false
        })
      });
    },

    loadById(id: number) {
      patchState(store, { loading: true, error: null });
      service.getById(id).subscribe({
        next: (decision) => patchState(store, {
          selectedDecision: decision,
          loading: false
        }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Decision not found',
          loading: false
        })
      });
    },

    create(request: CreateDecisionRequest) {
      patchState(store, { loading: true, error: null });
      return service.create(request).pipe(
        tap({
          next: (decision) => patchState(store, (state) => ({
            decisions: [...state.decisions, decision],
            loading: false
          })),
          error: (err) => patchState(store, {
            error: err.error?.message || 'Failed to create decision',
            loading: false
          })
        })
      );
    },

    update(id: number, request: UpdateDecisionRequest) {
      patchState(store, { loading: true, error: null });
      return service.update(id, request).pipe(
        tap((updated) => {
          patchState(store, (state) => ({
            decisions: state.decisions.map(d => d.id === id ? updated : d),
            selectedDecision: updated,
            loading: false
          }));
        })
      );
    },

    updateStatus(id: number, status: DecisionStatus, supersededById?: number) {
      service.updateStatus(id, status, supersededById).subscribe({
        next: (updated) => patchState(store, (state) => ({
          decisions: state.decisions.map(d =>
            d.id === id ? updated : d
          ),
          selectedDecision: updated
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to update status'
        })
      });
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, (state) => ({
          decisions: state.decisions.filter(d => d.id !== id)
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete decision'
        })
      });
    },

    search(keyword: string) {
      patchState(store, { loading: true, error: null });
      service.search(keyword).subscribe({
        next: (decisions) => patchState(store, { decisions, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Search failed',
          loading: false
        })
      });
    },

    clearSelected() {
      patchState(store, { selectedDecision: null });
    }
  }))
);