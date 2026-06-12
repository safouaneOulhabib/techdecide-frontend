import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TeamMember } from '@features/teams/models/team-member.model';

type TagSeverity = 'success' | 'danger' | 'secondary' | 'info' | 'warn' | 'contrast' | null | undefined;

@Component({
  selector: 'app-team-member-row',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, TagModule],
  templateUrl: './team-member-row.html',
  styleUrl: './team-member-row.scss',
})
export class TeamMemberRow {
  member = input.required<TeamMember>();
  currentUserId = input.required<number>();
  isAdmin = input.required<boolean>();

  onRemove = output<number>();
  onRoleChange = output<{ userId: number; role: string }>();

  readonly roleOptions = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Tech Lead', value: 'TECH_LEAD' },
    { label: 'Member', value: 'MEMBER' },
  ];

  get isSelf(): boolean {
    return this.member().userId === this.currentUserId();
  }

  getRoleSeverity(role: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      ADMIN: 'danger',
      TECH_LEAD: 'warn',
      MEMBER: 'secondary',
    };
    return map[role] ?? 'secondary';
  }

  onRoleSelect(role: string) {
    this.onRoleChange.emit({ userId: this.member().userId, role });
  }
}
