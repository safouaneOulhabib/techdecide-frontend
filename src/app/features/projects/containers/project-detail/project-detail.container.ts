import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ProjectStore } from '@features/projects/store/project.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { Project, ProjectTeam } from '@features/projects/models/project.model';
import { ProjectTeamRow } from '@features/projects/components/project-team-row/project-team-row';
import { ProjectTeamAdd } from '@features/projects/components/project-team-add/project-team-add';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [ButtonModule, MessageModule, SkeletonModule, TableModule, ProjectTeamRow, ProjectTeamAdd],
  templateUrl: './project-detail.container.html',
  styleUrl: './project-detail.container.scss',
})
export class ProjectDetailContainer implements OnInit, OnDestroy {
  private readonly store = inject(ProjectStore);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  readonly project: Signal<Project | null> = this.store.selectedProject;
  readonly projectTeams: Signal<ProjectTeam[]> = this.store.projectTeams;
  readonly availableTeams: Signal<ProjectTeam[]> = this.store.availableTeams;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;
  readonly isAppAdmin = this.authStore.isAppAdmin;

  private projectId = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      this.store.loadById(this.projectId);
      this.store.loadTeams(this.projectId);
      if (this.authStore.isAppAdmin()) {
        this.store.loadAvailableTeams(this.projectId);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  onAssign(teamId: number) {
    this.store.assignTeam(this.projectId, teamId);
  }

  onRemove(teamId: number) {
    this.store.removeTeam(this.projectId, teamId);
  }

  ngOnDestroy() {
    this.store.clearSelected();
  }
}
