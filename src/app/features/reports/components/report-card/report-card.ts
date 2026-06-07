import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportSummary } from '@features/reports/models/report.model';
import { ConfirmService } from '@core/services/confirm.service';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './report-card.html',
  styleUrl: './report-card.scss'
})
export class ReportCard {
  report = input.required<ReportSummary>();
  isOwner = input.required<boolean>();
  onView = output<number>();
  onDelete = output<number>();

  private readonly confirmService = inject(ConfirmService);

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.confirmService.confirm(
      'Are you sure you want to delete this report?',
      () => this.onDelete.emit(this.report().id)
    );
  }
}
