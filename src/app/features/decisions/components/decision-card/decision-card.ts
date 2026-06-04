import { Component, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Decision } from '@features/decisions/models/decision.model';
import { DatePipe, SlicePipe } from '@angular/common';
import { DecisionStatusBadge } from '../decision-status-badge/decision-status-badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-decision-card',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, DatePipe, SlicePipe, DecisionStatusBadge, TooltipModule ],
  templateUrl: './decision-card.html',
  styleUrl: './decision-card.scss'
})
export class DecisionCard {
  decision = input.required<Decision>();
  onDelete = output<number>();
  onView = output<number>();
}