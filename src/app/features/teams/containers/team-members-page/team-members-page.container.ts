import { Component, computed, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TeamMemberStore } from '@features/teams/store/team-member.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { TeamMember } from '@features/teams/models/team-member.model';
import { TeamMemberList } from '@features/teams/components/team-member-list/team-member-list';
import { TeamMemberAdd } from '@features/teams/components/team-member-add/team-member-add';

@Component({
  selector: 'app-team-members-page',
  standalone: true,
  imports: [ButtonModule, MessageModule, TeamMemberList, TeamMemberAdd],
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
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  readonly currentUserId = computed(() => this.authStore.user()?.id ?? 0);
  readonly isAdmin = computed(() => this.authStore.user()?.role === 'ADMIN');
  readonly isAdminOrTechLead = computed(() => {
    const role = this.authStore.user()?.role;
    return role === 'ADMIN' || role === 'TECH_LEAD';
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
    });
  }

  goBack() {
    this.location.back();
  }

  onAssign(userId: number) {
    this.store.assignMember(this.teamId, userId);
  }

  onRemove(userId: number) {
    this.store.removeMember(this.teamId, userId);
  }

  onRoleChange(event: { userId: number; role: string }) {
    this.store.changeRole(this.teamId, event.userId, event.role);
  }

  ngOnDestroy() {
    this.store.clearMembers();
  }
}
