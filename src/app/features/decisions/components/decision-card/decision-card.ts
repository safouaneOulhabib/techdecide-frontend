import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Decision } from '@features/decisions/models/decision.model';
import { DecisionStatusBadge } from '../decision-status-badge/decision-status-badge';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-decision-card',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule, TagModule, DecisionStatusBadge, DatePipe, SlicePipe],
  templateUrl: './decision-card.html',
  styleUrl: './decision-card.scss'
})
export class DecisionCard {
  decision = input.required<Decision>();
  onDelete = output<number>();
  onView = output<number>();
}