import { Component, input, output } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TeamMember } from '@features/teams/models/team-member.model';
import { TeamMemberRow } from '@features/teams/components/team-member-row/team-member-row';

@Component({
  selector: 'app-team-member-list',
  standalone: true,
  imports: [SkeletonModule, TeamMemberRow],
  templateUrl: './team-member-list.html',
  styleUrl: './team-member-list.scss',
})
export class TeamMemberList {
  members = input.required<TeamMember[]>();
  currentUserId = input.required<number>();
  isAppAdmin = input.required<boolean>();
  isTeamAdminOrAppAdmin = input.required<boolean>();
  hasTeamAdmin = input.required<boolean>();
  loading = input.required<boolean>();

  onRemove = output<number>();
  onRoleChange = output<{ userId: number; role: string }>();
}
