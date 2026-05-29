import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DecisionStatus } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-decision-status-selector',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './decision-status-selector.html',
  styleUrl: './decision-status-selector.scss'
})
export class DecisionStatusSelector {
  currentStatus = input.required<DecisionStatus>();
  statusChange = output<DecisionStatus>();

  statusOptions: { label: string; value: DecisionStatus; severity: string }[] = [
    { label: 'Draft', value: 'DRAFT', severity: 'secondary' },
    { label: 'Proposed', value: 'PROPOSED', severity: 'info' },
    { label: 'Approved', value: 'APPROVED', severity: 'success' },
    { label: 'Rejected', value: 'REJECTED', severity: 'danger' },
    { label: 'Superseded', value: 'SUPERSEDED', severity: 'warn' }
  ];

  onStatusChange(newStatus: DecisionStatus) {
    if (newStatus !== this.currentStatus()) {
      this.statusChange.emit(newStatus);
    }
  }
}