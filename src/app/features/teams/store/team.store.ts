import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TeamService } from '@features/teams/services/team.service';
import { Team, CreateTeamRequest } from '@features/teams/models/team.model';

export type TeamState = {
  teams: Team[];
  loading: boolean;
  error: string | null;
};

const initialState: TeamState = {
  teams: [],
  loading: false,
  error: null
};

export const TeamStore = signalStore(
  { providedIn: 'root' },
  withState<TeamState>(initialState),
  withMethods((store, service = inject(TeamService)) => ({
    loadAll() {
      patchState(store, { loading: true, error: null });
      service.getAll().subscribe({
        next: (teams) => patchState(store, { teams, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load teams',
          loading: false
        })
      });
    },

    create(request: CreateTeamRequest) {
      patchState(store, { loading: true, error: null });
      service.create(request).subscribe({
        next: (team) => patchState(store, {
          teams: [...store.teams(), team],
          loading: false
        }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to create team',
          loading: false
        })
      });
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, {
          teams: store.teams().filter(t => t.id !== id)
        }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete team'
        })
      });
    }
  }))
);
