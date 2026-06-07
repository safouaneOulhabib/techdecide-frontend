import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReportItem } from '@features/reports/models/report.model';
import { DecisionStatusBadge } from '@features/decisions/components/decision-status-badge/decision-status-badge';
import { DecisionStatus } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [DatePipe, RouterLink, DecisionStatusBadge],
  templateUrl: './report-item-card.html',
  styleUrl: './report-item-card.scss'
})
export class ReportItemCard {
  item = input.required<ReportItem>();
  position = input.required<number>();

  get statusAsDecisionStatus(): DecisionStatus {
    return this.item().decisionStatus as DecisionStatus;
  }
}
