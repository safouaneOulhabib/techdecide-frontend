import { Component, inject, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ProjectStore } from '@features/projects/store/project.store';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ProjectSummary, CreateProjectRequest } from '@features/projects/models/project.model';
import { Organization } from '@features/organizations/models/organization.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ProjectCard } from '@features/projects/components/project-card/project-card';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    MessageModule,
    SkeletonModule,
    TextareaModule,
    ProjectCard,
  ],
  templateUrl: './project-list.container.html',
  styleUrl: './project-list.container.scss',
})
export class ProjectListContainer implements OnInit {
  private readonly projectStore = inject(ProjectStore);
  private readonly orgStore = inject(OrganizationStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmService);

  readonly projects: Signal<ProjectSummary[]> = this.projectStore.projects;
  readonly loading: Signal<boolean> = this.projectStore.loading;
  readonly error: Signal<string | null> = this.projectStore.error;
  readonly organizations: Signal<Organization[]> = this.orgStore.organizations;
  readonly isAppAdmin = this.authStore.isAppAdmin;
  readonly hasTeam = this.authStore.hasTeam;

  dialogVisible = false;
  newProjectName = '';
  newProjectDescription = '';
  selectedOrgId: number | null = null;

  ngOnInit() {
    this.projectStore.loadAll();
    if (this.isAppAdmin()) {
      this.orgStore.loadAll();
    }
  }

  openDialog() {
    this.newProjectName = '';
    this.newProjectDescription = '';
    this.selectedOrgId = null;
    this.dialogVisible = true;
  }

  onSubmit() {
    if (!this.newProjectName.trim() || this.selectedOrgId === null) return;
    const req: CreateProjectRequest = {
      name: this.newProjectName.trim(),
      description: this.newProjectDescription.trim() || null,
      organizationId: this.selectedOrgId,
    };
    this.projectStore.create(req);
    this.dialogVisible = false;
  }

  onView(id: number) {
    this.router.navigate(['/projects', id]);
  }

  onDelete(id: number) {
    this.confirmService.confirm(
      'Are you sure you want to delete this project?',
      () => this.projectStore.remove(id)
    );
  }
}
