import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ProjectStore } from '@features/projects/store/project.store';
import { TagStore } from '@features/tags/store/tag.store';
import { DecisionForm, DecisionFormData } from '@features/decisions/components/decision-form/decision-form';
import { ProjectSummary, ProjectTeam } from '@features/projects/models/project.model';
import { Tag } from '@features/tags/models/tag.model';

@Component({
  selector: 'app-decision-create',
  standalone: true,
  imports: [ButtonModule, MessageModule, DecisionForm],
  templateUrl: './decision-create.container.html',
  styleUrl: './decision-create.container.scss'
})
export class DecisionCreateContainer implements OnInit {
  private readonly decisionStore = inject(DecisionStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly tagStore = inject(TagStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly loading: Signal<boolean> = this.decisionStore.loading;
  readonly error: Signal<string | null> = this.decisionStore.error;
  readonly projects: Signal<ProjectSummary[]> = this.projectStore.projects;
  readonly projectTeams: Signal<ProjectTeam[]> = this.projectStore.projectTeams;
  readonly tags: Signal<Tag[]> = this.tagStore.tags;
  readonly hasTeam = this.authStore.hasTeam;
  readonly ownTeamId = this.authStore.user;

  get currentTeamId(): number | null {
    return this.authStore.user()?.teamId ?? null;
  }

  ngOnInit() {
    if (!this.hasTeam()) {
      this.router.navigate(['/decisions']);
      return;
    }
    this.projectStore.loadAll();
    this.tagStore.loadAll();
  }

  onProjectChange(projectId: number) {
    this.projectStore.loadTeams(projectId);
  }

  onFormSubmit(data: DecisionFormData) {
    this.decisionStore.create({
      title: data.title,
      context: data.context,
      decision: data.decision,
      consequences: data.consequences,
      projectId: data.projectId,
      teamIds: data.teamIds,
      tagIds: data.tagIds,
      alternatives: data.alternatives
    }).subscribe({
      next: () => this.router.navigate(['/decisions'])
    });
  }

  onFormCancel() {
    this.router.navigate(['/decisions']);
  }
}
