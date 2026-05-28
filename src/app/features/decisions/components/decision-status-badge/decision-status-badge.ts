import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { DecisionStatus } from '@features/decisions/models/decision.model';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;

@Component({
  selector: 'app-decision-status-badge',
  standalone: true,
  imports: [TagModule],
  templateUrl: './decision-status-badge.html'
})
export class DecisionStatusBadge {
  status = input.required<DecisionStatus>();

  get severity(): TagSeverity {
    const map: Record<DecisionStatus, TagSeverity> = {
      DRAFT: 'secondary',
      PROPOSED: 'info',
      APPROVED: 'success',
      REJECTED: 'danger',
      SUPERSEDED: 'warn'
    };
    return map[this.status()];
  }
}