import { Component, computed, inject, input, output } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { ReportSummary } from '@features/reports/models/report.model';
import { ConfirmService } from '@core/services/confirm.service';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './report-card.html',
  styleUrl: './report-card.scss'
})
export class ReportCard {
  report = input.required<ReportSummary>();
  isOwner = input.required<boolean>();
  onView = output<number>();
  onDelete = output<number>();

  private readonly confirmService = inject(ConfirmService);

  statusBadges = computed(() => {
    const counts = this.report().statusCounts;
    if (!counts) return [];
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        label: `${count} ${status.charAt(0) + status.slice(1).toLowerCase()}`
      }));
  });

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.confirmService.confirm(
      'Are you sure you want to delete this report?',
      () => this.onDelete.emit(this.report().id)
    );
  }
}