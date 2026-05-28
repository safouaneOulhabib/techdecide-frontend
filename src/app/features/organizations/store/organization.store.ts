import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { OrganizationService } from '@features/organizations/services/organization.service';
import { Organization, CreateOrganizationRequest } from '@features/organizations/models/organization.model';

export type OrganizationState = {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
};

const initialState: OrganizationState = {
  organizations: [],
  loading: false,
  error: null
};

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withState<OrganizationState>(initialState),
  withMethods((store, service = inject(OrganizationService)) => ({
    loadAll() {
      patchState(store, { loading: true, error: null });
      service.getAll().subscribe({
        next: (organizations) => patchState(store, { organizations, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load organizations',
          loading: false
        })
      });
    },

    create(request: CreateOrganizationRequest) {
      patchState(store, { loading: true, error: null });
      service.create(request).subscribe({
        next: (organization) => patchState(store, (state) => ({
          organizations: [...state.organizations, organization],
          loading: false
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to create organization',
          loading: false
        })
      });
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, (state) => ({
          organizations: state.organizations.filter(o => o.id !== id)
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete organization'
        })
      });
    }
  }))
);
