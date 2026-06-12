import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TeamMemberService } from '@features/teams/services/team-member.service';
import { TeamMember } from '@features/teams/models/team-member.model';

export type TeamMemberState = {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
};

const initialState: TeamMemberState = {
  members: [],
  loading: false,
  error: null,
};

export const TeamMemberStore = signalStore(
  { providedIn: 'root' },
  withState<TeamMemberState>(initialState),
  withMethods((store, service = inject(TeamMemberService)) => ({

    loadMembers(teamId: number) {
      patchState(store, { loading: true, error: null });
      service.getMembers(teamId).subscribe({
        next: (members) => patchState(store, (s) => ({ ...s, members, loading: false })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to load members',
          loading: false,
        })),
      });
    },

    assignMember(teamId: number, userId: number) {
      patchState(store, { loading: true, error: null });
      service.assignMember(teamId, { userId }).subscribe({
        next: (member) => patchState(store, (s) => ({
          ...s,
          members: [...s.members.filter(m => m.userId !== member.userId), member],
          loading: false,
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to assign member',
          loading: false,
        })),
      });
    },

    removeMember(teamId: number, userId: number) {
      service.removeMember(teamId, userId).subscribe({
        next: () => patchState(store, (s) => ({
          ...s,
          members: s.members.filter(m => m.userId !== userId),
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to remove member',
        })),
      });
    },

    changeRole(teamId: number, userId: number, role: string) {
      service.changeRole(teamId, userId, { role }).subscribe({
        next: (updated) => patchState(store, (s) => ({
          ...s,
          members: s.members.map(m => m.userId === userId ? updated : m),
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to change role',
        })),
      });
    },

    clearMembers() {
      patchState(store, initialState);
    },
  }))
);
