import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { TeamMemberStore } from './team-member.store';
import { TeamMemberService } from '../services/team-member.service';
import { TeamMember, AvailableUser } from '../models/team-member.model';

const mockMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  userId: 1, name: 'Alice', email: 'alice@test.com',
  teamRole: 'MEMBER', teamId: 1, createdAt: '2024-01-01T00:00:00',
  ...overrides,
});

const mockAvailableUser = (overrides: Partial<AvailableUser> = {}): AvailableUser => ({
  id: 10, name: 'Bob', email: 'bob@test.com', ...overrides,
});

const mockService = {
  getMembers: vi.fn(),
  getAvailableUsers: vi.fn(),
  assignMember: vi.fn(),
  removeMember: vi.fn(),
  changeRole: vi.fn(),
};

describe('TeamMemberStore', () => {
  let store: InstanceType<typeof TeamMemberStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        TeamMemberStore,
        { provide: TeamMemberService, useValue: mockService },
      ],
    });
    store = TestBed.inject(TeamMemberStore);
  });

  it('has correct initial state', () => {
    expect(store.members()).toEqual([]);
    expect(store.availableUsers()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadMembers', () => {
    it('populates members on success', () => {
      mockService.getMembers.mockReturnValue(of([mockMember(), mockMember({ userId: 2, name: 'Bob' })]));
      store.loadMembers(1);
      expect(store.members().length).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('sets error on failure', () => {
      mockService.getMembers.mockReturnValue(throwError(() => ({ error: { message: 'Forbidden' } })));
      store.loadMembers(1);
      expect(store.error()).toBe('Forbidden');
    });
  });

  describe('assignMember', () => {
    it('adds member to list and removes from availableUsers', () => {
      mockService.getAvailableUsers.mockReturnValue(of([mockAvailableUser({ id: 5 })]));
      store.loadAvailableUsers(1);
      const newMember = mockMember({ userId: 5 });
      mockService.assignMember.mockReturnValue(of(newMember));
      store.assignMember(1, 5);
      expect(store.members().some(m => m.userId === 5)).toBe(true);
      expect(store.availableUsers().some(u => u.id === 5)).toBe(false);
    });

    it('deduplicates if member already in list', () => {
      mockService.getMembers.mockReturnValue(of([mockMember({ userId: 1 })]));
      store.loadMembers(1);
      const updated = mockMember({ userId: 1, teamRole: 'TEAM_ADMIN' });
      mockService.assignMember.mockReturnValue(of(updated));
      store.assignMember(1, 1);
      expect(store.members().filter(m => m.userId === 1).length).toBe(1);
      expect(store.members()[0].teamRole).toBe('TEAM_ADMIN');
    });
  });

  describe('removeMember', () => {
    it('removes member from list', () => {
      mockService.getMembers.mockReturnValue(of([mockMember({ userId: 1 }), mockMember({ userId: 2 })]));
      store.loadMembers(1);
      mockService.removeMember.mockReturnValue(of(null));
      store.removeMember(1, 1);
      expect(store.members().some(m => m.userId === 1)).toBe(false);
      expect(store.members().length).toBe(1);
    });
  });

  describe('changeRole', () => {
    it('updates member role in list', () => {
      mockService.getMembers.mockReturnValue(of([mockMember({ userId: 1, teamRole: 'MEMBER' })]));
      store.loadMembers(1);
      const updated = mockMember({ userId: 1, teamRole: 'TEAM_ADMIN' });
      mockService.changeRole.mockReturnValue(of(updated));
      store.changeRole(1, 1, 'TEAM_ADMIN');
      expect(store.members()[0].teamRole).toBe('TEAM_ADMIN');
    });
  });

  describe('clearMembers', () => {
    it('resets to initial state', () => {
      mockService.getMembers.mockReturnValue(of([mockMember()]));
      store.loadMembers(1);
      store.clearMembers();
      expect(store.members()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});
