import { Component, inject, OnInit, Signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { Organization, CreateOrganizationRequest } from '@features/organizations/models/organization.model';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './organization-list.container.html',
  styleUrl: './organization-list.container.scss'
})
export class OrganizationListContainer implements OnInit {
  private readonly store = inject(OrganizationStore);

  readonly organizations: Signal<Organization[]> = this.store.organizations;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  dialogVisible = false;
  newName = '';
  newDescription = '';

  ngOnInit() {
    this.store.loadAll();
  }

  openDialog() {
    this.newName = '';
    this.newDescription = '';
    this.dialogVisible = true;
  }

  onSubmit() {
    if (!this.newName.trim()) return;
    const req: CreateOrganizationRequest = {
      name: this.newName.trim(),
      description: this.newDescription.trim() || undefined
    };
    this.store.create(req);
    this.dialogVisible = false;
  }

  onDelete(id: number) {
    this.store.remove(id);
  }
}
