import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ReportStore } from '@features/reports/store/report.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ReportCard } from '@features/reports/components/report-card/report-card';
import { ReportSummary } from '@features/reports/models/report.model';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [ButtonModule, MessageModule, SkeletonModule, ReportCard],
  templateUrl: './report-list.container.html',
  styleUrl: './report-list.container.scss'
})
export class ReportListContainer implements OnInit {
  private readonly reportStore = inject(ReportStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly reports: Signal<ReportSummary[]> = this.reportStore.reports;
  readonly loading: Signal<boolean> = this.reportStore.loading;
  readonly error: Signal<string | null> = this.reportStore.error;

  readonly currentUserName = computed(() => this.authStore.user()?.name ?? '');

  isOwner(report: ReportSummary): boolean {
    return this.authStore.user()?.name === report.authorName;
  }

  ngOnInit() {
    this.reportStore.loadAll();
  }

  onView(id: number) {
    this.router.navigate(['/reports', id]);
  }

  onDelete(id: number) {
    this.reportStore.remove(id);
  }

  onCreateNew() {
    this.router.navigate(['/reports/new']);
  }
}
