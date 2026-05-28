import { Component, inject, OnInit, Signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TeamStore } from '@features/teams/store/team.store';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { Team, CreateTeamRequest } from '@features/teams/models/team.model';
import { Organization } from '@features/organizations/models/organization.model';

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
    MessageModule
  ],
  templateUrl: './team-list.container.html',
  styleUrl: './team-list.container.scss'
})
export class TeamListContainer implements OnInit {
  private readonly teamStore = inject(TeamStore);
  private readonly orgStore = inject(OrganizationStore);

  readonly teams: Signal<Team[]> = this.teamStore.teams;
  readonly loading: Signal<boolean> = this.teamStore.loading;
  readonly error: Signal<string | null> = this.teamStore.error;
  readonly organizations: Signal<Organization[]> = this.orgStore.organizations;

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

  onDelete(id: number) {
    this.teamStore.remove(id);
  }
}
