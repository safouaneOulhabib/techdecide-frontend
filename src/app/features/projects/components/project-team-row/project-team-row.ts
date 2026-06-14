import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectTeam } from '@features/projects/models/project.model';

@Component({
  selector: '[app-project-team-row]',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './project-team-row.html',
  styleUrl: './project-team-row.scss',
})
export class ProjectTeamRow {
  team = input.required<ProjectTeam>();
  isAppAdmin = input.required<boolean>();

  onRemove = output<number>();
}
