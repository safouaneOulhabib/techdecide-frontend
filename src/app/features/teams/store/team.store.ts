import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TeamService } from '@features/teams/services/team.service';
import { Team } from '@features/teams/models/team.model';

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
    }
  }))
);