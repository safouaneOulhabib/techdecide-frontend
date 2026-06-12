import { Component, computed, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TeamMemberStore } from '@features/teams/store/team-member.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { AvailableUser, TeamMember } from '@features/teams/models/team-member.model';
import { TeamMemberList } from '@features/teams/components/team-member-list/team-member-list';
import { TeamMemberAdd } from '@features/teams/components/team-member-add/team-member-add';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-members-page',
  standalone: true,
  imports: [ButtonModule, MessageModule, TeamMemberList, TeamMemberAdd,FormsModule],
  templateUrl: './team-members-page.container.html',
  styleUrl: './team-members-page.container.scss',
})
export class TeamMembersPageContainer implements OnInit, OnDestroy {
  private readonly store = inject(TeamMemberStore);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly members: Signal<TeamMember[]> = this.store.members;
  readonly availableUsers: Signal<AvailableUser[]> = this.store.availableUsers;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  readonly currentUserId = computed(() => this.authStore.user()?.id ?? 0);
  readonly isAppAdmin = this.authStore.isAppAdmin;
  readonly isTeamAdminOrAppAdmin = this.authStore.isTeamAdminOrAppAdmin;

  readonly statsTotal = computed(() => this.store.members().length);
  readonly statsTeamAdmins = computed(() =>
    this.store.members().filter(m => m.teamRole === 'TEAM_ADMIN').length
  );
  readonly hasTeamAdmin = computed(() =>
    this.store.members().some(m => m.teamRole === 'TEAM_ADMIN')
  );

  readonly searchTerm = signal('');
  readonly roleFilter = signal('ALL');

  readonly filteredMembers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const role = this.roleFilter();
    return this.store.members().filter(m =>
      (m.name.toLowerCase().includes(search) ||
       m.email.toLowerCase().includes(search)) &&
      (role === 'ALL' || m.teamRole === role)
    );
  });

  private teamId = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (!this.authStore.isTeamAdminOrAppAdmin()) {
        this.router.navigate(['/decisions']);
        return;
      }
      this.teamId = Number(params.get('id'));
      this.store.loadMembers(this.teamId);
      this.store.loadAvailableUsers(this.teamId);
    });
  }

  goBack() {
    this.location.back();
  }

  onAssign(event: { userId: number }) {
    this.store.assignMember(this.teamId, event.userId);
  }

  onRemove(userId: number) {
    this.store.removeMember(this.teamId, userId);
  }

  onRoleChange(event: { userId: number; role: string }) {
    this.store.changeRole(this.teamId, event.userId, event.role);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarStyle(teamRole: string): string {
    if (teamRole === 'TEAM_ADMIN') return 'background:#E6F1FB; color:#0C447C';
    return 'background:var(--surface-100); color:var(--text-color-secondary)';
  }

  getRoleBadgeStyle(teamRole: string): string {
    if (teamRole === 'TEAM_ADMIN')
      return 'background:#E6F1FB; color:#0C447C; border:0.5px solid #85B7EB';
    return 'background:var(--surface-100); color:var(--text-color-secondary); border:0.5px solid var(--surface-border)';
  }

  ngOnDestroy() {
    this.store.clearMembers();
  }
}
