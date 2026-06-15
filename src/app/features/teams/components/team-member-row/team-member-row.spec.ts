import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamMemberRow } from './team-member-row';
import { TeamMember } from '@features/teams/models/team-member.model';

const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  userId: 1, name: 'Alice Smith', email: 'alice@test.com',
  teamRole: 'MEMBER', teamId: 1, createdAt: '2024-01-01T00:00:00',
  ...overrides,
});

describe('TeamMemberRow — computed logic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeamMemberRow],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(opts: {
    member?: TeamMember;
    currentUserId?: number;
    isAppAdmin?: boolean;
    isTeamAdminOrAppAdmin?: boolean;
    hasTeamAdmin?: boolean;
  }) {
    const fixture = TestBed.createComponent(TeamMemberRow);
    fixture.componentRef.setInput('member', opts.member ?? makeMember());
    fixture.componentRef.setInput('currentUserId', opts.currentUserId ?? 99);
    fixture.componentRef.setInput('isAppAdmin', opts.isAppAdmin ?? false);
    fixture.componentRef.setInput('isTeamAdminOrAppAdmin', opts.isTeamAdminOrAppAdmin ?? false);
    fixture.componentRef.setInput('hasTeamAdmin', opts.hasTeamAdmin ?? false);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('isSelf', () => {
    it('returns true when currentUserId matches member.userId', () => {
      const comp = create({ member: makeMember({ userId: 5 }), currentUserId: 5 });
      expect(comp.isSelf).toBe(true);
    });

    it('returns false when IDs differ', () => {
      const comp = create({ member: makeMember({ userId: 1 }), currentUserId: 2 });
      expect(comp.isSelf).toBe(false);
    });
  });

  describe('computedRoleOptions', () => {
    it('TEAM_ADMIN option is not disabled when no existing TEAM_ADMIN', () => {
      const comp = create({ hasTeamAdmin: false });
      const adminOpt = comp.computedRoleOptions.find(o => o.value === 'TEAM_ADMIN')!;
      expect(adminOpt.disabled).toBe(false);
    });

    it('TEAM_ADMIN option is disabled when another member is already TEAM_ADMIN', () => {
      // hasTeamAdmin=true and current member is MEMBER (not TEAM_ADMIN)
      const comp = create({ hasTeamAdmin: true, member: makeMember({ teamRole: 'MEMBER' }) });
      const adminOpt = comp.computedRoleOptions.find(o => o.value === 'TEAM_ADMIN')!;
      expect(adminOpt.disabled).toBe(true);
    });

    it('TEAM_ADMIN option is not disabled for the current TEAM_ADMIN themselves', () => {
      const comp = create({ hasTeamAdmin: true, member: makeMember({ teamRole: 'TEAM_ADMIN' }) });
      const adminOpt = comp.computedRoleOptions.find(o => o.value === 'TEAM_ADMIN')!;
      expect(adminOpt.disabled).toBe(false);
    });

    it('MEMBER option is never disabled', () => {
      const comp = create({ hasTeamAdmin: true });
      const memberOpt = comp.computedRoleOptions.find(o => o.value === 'MEMBER')!;
      expect(memberOpt.disabled).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('returns two uppercase initials', () => {
      const comp = create({});
      expect(comp.getInitials('Alice Smith')).toBe('AS');
    });

    it('returns single initial for one-word name', () => {
      const comp = create({});
      expect(comp.getInitials('Bob')).toBe('B');
    });
  });

  describe('getRoleSeverity', () => {
    it('returns info for TEAM_ADMIN', () => {
      const comp = create({});
      expect(comp.getRoleSeverity('TEAM_ADMIN')).toBe('info');
    });

    it('returns secondary for MEMBER', () => {
      const comp = create({});
      expect(comp.getRoleSeverity('MEMBER')).toBe('secondary');
    });

    it('returns secondary for unknown role', () => {
      const comp = create({});
      expect(comp.getRoleSeverity('UNKNOWN')).toBe('secondary');
    });
  });
});
