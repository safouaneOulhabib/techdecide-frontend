import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TeamMember } from '@features/teams/models/team-member.model';
import { DatePipe } from '@angular/common';

type TagSeverity = 'success' | 'danger' | 'secondary' | 'info' | 'warn' | 'contrast' | null | undefined;

@Component({
selector: '[app-team-member-row]',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, TagModule ,DatePipe],
  templateUrl: './team-member-row.html',
  styleUrl: './team-member-row.scss',
})
export class TeamMemberRow {
  member = input.required<TeamMember>();
  currentUserId = input.required<number>();
  isAppAdmin = input.required<boolean>();
  isTeamAdminOrAppAdmin = input.required<boolean>();
  hasTeamAdmin = input.required<boolean>();

  onRemove = output<number>();
  onRoleChange = output<{ userId: number; role: string }>();

  get computedRoleOptions() {
    const teamAdminTaken = this.hasTeamAdmin() && this.member().teamRole !== 'TEAM_ADMIN';
    return [
      { label: 'Team Admin', value: 'TEAM_ADMIN', disabled: teamAdminTaken },
      { label: 'Member', value: 'MEMBER', disabled: false },
    ];
  }

  get isSelf(): boolean {
    return this.member().userId === this.currentUserId();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarStyle(role: string): string {
    if (role === 'TEAM_ADMIN') return 'background:#E6F1FB; color:#0C447C';
    return 'background:var(--p-surface-100); color:var(--p-text-muted-color)';
  }

  getRoleBadgeStyle(role: string): string {
    if (role === 'TEAM_ADMIN')
      return 'background:#E6F1FB; color:#0C447C; border:0.5px solid #85B7EB';
    return 'background:var(--p-surface-100); color:var(--p-text-muted-color); border:0.5px solid var(--p-content-border-color)';
  }

  getRoleSeverity(role: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      TEAM_ADMIN: 'info',
      MEMBER: 'secondary',
    };
    return map[role] ?? 'secondary';
  }

  onRoleSelect(role: string) {
    this.onRoleChange.emit({ userId: this.member().userId, role });
  }
}