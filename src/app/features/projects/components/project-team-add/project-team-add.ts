import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProjectTeam } from '@features/projects/models/project.model';

@Component({
  selector: 'app-project-team-add',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule],
  templateUrl: './project-team-add.html',
  styleUrl: './project-team-add.scss',
})
export class ProjectTeamAdd {
  availableTeams = input.required<ProjectTeam[]>();

  onAssign = output<number>();

  selectedTeamId = signal<number | null>(null);

  submit() {
    const teamId = this.selectedTeamId();
    if (teamId == null) return;
    this.onAssign.emit(teamId);
    this.selectedTeamId.set(null);
  }
}
