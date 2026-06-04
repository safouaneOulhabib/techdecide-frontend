import { Component, input } from '@angular/core';
import { DecisionStatus } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-decision-status-badge',
  standalone: true,
  templateUrl: './decision-status-badge.html',
  styleUrls: ['./decision-status-badge.scss'],
})
export class DecisionStatusBadge {
  status = input.required<DecisionStatus>();

  get badgeClass(): string {
    return `badge badge-${this.status().toLowerCase()}`;
  }
}