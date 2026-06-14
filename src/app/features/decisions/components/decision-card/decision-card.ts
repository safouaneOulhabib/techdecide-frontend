import { Component, computed, inject, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Decision, TeamRef } from '@features/decisions/models/decision.model';
import { DatePipe, SlicePipe } from '@angular/common';
import { DecisionStatusBadge } from '../decision-status-badge/decision-status-badge';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmService } from '@core/services/confirm.service';

@Component({
  selector: 'app-decision-card',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, DatePipe, SlicePipe, DecisionStatusBadge, TooltipModule],
  templateUrl: './decision-card.html',
  styleUrl: './decision-card.scss'
})
export class DecisionCard {
  decision = input.required<Decision>();
  onDelete = output<number>();
  onView = output<number>();

  private readonly confirmService = inject(ConfirmService);

  visibleTeams = computed((): TeamRef[] => this.decision().teams.slice(0, 2));
  hiddenTeamCount = computed((): number => Math.max(0, this.decision().teams.length - 2));

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.confirmService.confirm(
      'Are you sure you want to delete this decision ?',
      () => this.onDelete.emit(this.decision().id)
    );
  }
}
