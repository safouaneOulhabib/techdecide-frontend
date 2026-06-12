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
  readonly isAdmin = computed(() => this.authStore.user()?.role === 'ADMIN');
  readonly isAdminOrTechLead = computed(() => {
    const role = this.authStore.user()?.role;
    return role === 'ADMIN' || role === 'TECH_LEAD';
  });

  readonly statsTotal = computed(() => this.store.members().length);
  readonly statsTechLeads = computed(() =>
    this.store.members().filter(m => m.role === 'TECH_LEAD').length
  );
  readonly statsAdmins = computed(() =>
    this.store.members().filter(m => m.role === 'ADMIN').length
  );

  readonly searchTerm = signal('');
  readonly roleFilter = signal('ALL');

  readonly filteredMembers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const role = this.roleFilter();
    return this.store.members().filter(m =>
      (m.name.toLowerCase().includes(search) ||
       m.email.toLowerCase().includes(search)) &&
      (role === 'ALL' || m.role === role)
    );
  });

  private teamId = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const role = this.authStore.user()?.role;
      if (role === 'MEMBER') {
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

  onAssign(event: { userId: number; role: string }) {
    this.store.assignMember(this.teamId, event.userId, event.role);
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

  getAvatarStyle(role: string): string {
    if (role === 'ADMIN') return 'background:#EEEDFE; color:#3C3489';
    if (role === 'TECH_LEAD') return 'background:#E6F1FB; color:#0C447C';
    return 'background:var(--surface-100); color:var(--text-color-secondary)';
  }

  getRoleBadgeStyle(role: string): string {
    if (role === 'ADMIN')
      return 'background:#EEEDFE; color:#3C3489; border:0.5px solid #AFA9EC';
    if (role === 'TECH_LEAD')
      return 'background:#E6F1FB; color:#0C447C; border:0.5px solid #85B7EB';
    return 'background:var(--surface-100); color:var(--text-color-secondary); border:0.5px solid var(--surface-border)';
  }

  ngOnDestroy() {
    this.store.clearMembers();
  }
}