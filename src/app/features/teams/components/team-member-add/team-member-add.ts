import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { AvailableUser } from '@features/teams/models/team-member.model';

@Component({
  selector: 'app-team-member-add',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule],
  templateUrl: './team-member-add.html',
  styleUrl: './team-member-add.scss',
})
export class TeamMemberAdd {
  loading = input.required<boolean>();
  availableUsers = input.required<AvailableUser[]>();
  onAssign = output<{ userId: number; role: string }>();

  selectedUserId = signal<number | null>(null);
  selectedRole = signal<string>('MEMBER');

  readonly roleOptions = [
    { label: 'Member', value: 'MEMBER' },
    { label: 'Team Admin', value: 'TEAM_ADMIN' },
  ];

  submit() {
    const userId = this.selectedUserId();
    if (userId == null) return;
    this.onAssign.emit({ userId, role: this.selectedRole() });
    this.selectedUserId.set(null);
    this.selectedRole.set('MEMBER');
  }
}