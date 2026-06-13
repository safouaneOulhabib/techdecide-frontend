import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DecisionStatus } from '@features/decisions/models/decision.model';
import { allowedTransitions } from '@features/decisions/utils/decision-governance';

@Component({
  selector: 'app-decision-status-selector',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './decision-status-selector.html',
  styleUrl: './decision-status-selector.scss'
})
export class DecisionStatusSelector {
  currentStatus = input.required<DecisionStatus>();
  teamRole = input<string | null>(null);
  appRole = input<string>('USER');
  statusChange = output<DecisionStatus>();

  statusOptions: { label: string; value: DecisionStatus; severity: string }[] = [
    { label: 'Draft',     value: 'DRAFT',      severity: 'secondary' },
    { label: 'Proposed',  value: 'PROPOSED',   severity: 'info'      },
    { label: 'Approved',  value: 'APPROVED',   severity: 'success'   },
    { label: 'Rejected',  value: 'REJECTED',   severity: 'danger'    },
  ];

  visibleOptions = computed(() => {
    const current = this.currentStatus();
    const allowed = allowedTransitions(current, this.teamRole(), this.appRole());
    return this.statusOptions.filter(
      opt => opt.value === current || allowed.includes(opt.value)
    );
  });

  hasTransitions = computed(() =>
    allowedTransitions(this.currentStatus(), this.teamRole(), this.appRole()).length > 0
  );

  onStatusChange(newStatus: DecisionStatus) {
    if (newStatus !== this.currentStatus()) {
      this.statusChange.emit(newStatus);
    }
  }
}
