import { Component, computed, inject, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Decision } from '@features/decisions/models/decision.model';
import { DatePipe, SlicePipe } from '@angular/common';
import { DecisionStatusBadge } from '../decision-status-badge/decision-status-badge';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmService } from '@core/services/confirm.service';
import { canDelete } from '@features/decisions/utils/decision-governance';

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

  canDeleteCurrent = computed(() => canDelete(this.decision().status));


  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.confirmService.confirm(
      'Are you sure you want to delete this decision ?',
      () => this.onDelete.emit(this.decision().id)
    );
  }
}