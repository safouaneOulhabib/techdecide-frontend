import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectSummary } from '@features/projects/models/project.model';

@Component({
  selector: '[app-project-card]',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  project = input.required<ProjectSummary>();
  isAppAdmin = input.required<boolean>();

  onView = output<number>();
  onDelete = output<number>();
}
