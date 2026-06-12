import { Component, inject, OnInit, Signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { TeamStore } from '@features/teams/store/team.store';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { Team, CreateTeamRequest } from '@features/teams/models/team.model';
import { Organization } from '@features/organizations/models/organization.model';
import { ConfirmService } from '@core/services/confirm.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    SkeletonModule
  ],
  templateUrl: './team-list.container.html',
  styleUrl: './team-list.container.scss'
})
export class TeamListContainer implements OnInit {
  private readonly teamStore = inject(TeamStore);
  private readonly orgStore = inject(OrganizationStore);
  private readonly router = inject(Router);

  readonly teams: Signal<Team[]> = this.teamStore.teams;
  readonly loading: Signal<boolean> = this.teamStore.loading;
  readonly error: Signal<string | null> = this.teamStore.error;
  readonly organizations: Signal<Organization[]> = this.orgStore.organizations;
  private readonly confirmService = inject(ConfirmService);

  dialogVisible = false;
  newTeamName = '';
  selectedOrgId: number | null = null;

  ngOnInit() {
    this.teamStore.loadAll();
    this.orgStore.loadAll();
  }

  openDialog() {
    this.newTeamName = '';
    this.selectedOrgId = null;
    this.dialogVisible = true;
  }

  onSubmit() {
    if (!this.newTeamName.trim() || this.selectedOrgId === null) return;
    const req: CreateTeamRequest = {
      name: this.newTeamName.trim(),
      organizationId: this.selectedOrgId
    };
    this.teamStore.create(req);
    this.dialogVisible = false;
  }

  onViewMembers(id: number) {
    this.router.navigate(['/teams', id, 'members']);
  }

  onDelete(id: number) {
    this.confirmService.confirm(
      'Are you sure you want to delete this team?',
      () => this.teamStore.remove(id)
    );
  }
}
