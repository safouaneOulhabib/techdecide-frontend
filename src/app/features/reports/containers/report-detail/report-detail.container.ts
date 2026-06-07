import { Component, computed, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';
import { ReportStore } from '@features/reports/store/report.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ConfirmService } from '@core/services/confirm.service';
import { ReportItemCard } from '@features/reports/components/report-item-card/report-item-card';
import { Report } from '@features/reports/models/report.model';
import { buildPdf } from '@features/reports/utils/report-pdf';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [
    ButtonModule,
    MessageModule,
    InputTextModule,
    TextareaModule,
    SkeletonModule,
    FormsModule,
    DatePipe,
    ReportItemCard
  ],
  templateUrl: './report-detail.container.html',
  styleUrl: './report-detail.container.scss'
})
export class ReportDetailContainer implements OnInit, OnDestroy {
  private readonly reportStore = inject(ReportStore);
  private readonly authStore = inject(AuthStore);
  private readonly confirmService = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly report: Signal<Report | null> = this.reportStore.selectedReport;
  readonly loading: Signal<boolean> = this.reportStore.loading;
  readonly error: Signal<string | null> = this.reportStore.error;

  private reportId = 0;

  isEditMode = signal(false);
  editTitle = signal('');
  editIntroduction = signal('');
  exportingPdf = signal(false);

  isOwner = computed(() => {
    const user = this.authStore.user();
    const report = this.report();
    if (!user || !report) return false;
    return user.id === report.authorId;
  });

  sortedItems = computed(() => {
    const r = this.report();
    if (!r) return [];
    return [...r.items].sort((a, b) => a.position - b.position);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.reportId = Number(params.get('id'));
      this.reportStore.loadById(this.reportId);
    });
  }

  goBack() {
    this.location.back();
  }

  enterEditMode() {
    const r = this.report();
    if (!r) return;
    this.editTitle.set(r.title);
    this.editIntroduction.set(r.introduction ?? '');
    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  saveEdit() {
    this.reportStore.update(this.reportId, {
      title: this.editTitle().trim(),
      introduction: this.editIntroduction().trim() || null
    }).subscribe({
      next: () => this.isEditMode.set(false),
      error: () => {}
    });
  }

  onDelete() {
    this.confirmService.confirm(
      'Are you sure you want to delete this report?',
      () => {
        this.reportStore.remove(this.reportId);
        this.router.navigate(['/reports']);
      }
    );
  }

  async onExportPdf() {
    const r = this.report();
    if (!r) return;
    this.exportingPdf.set(true);
    try {
      await buildPdf(r);
    } finally {
      this.exportingPdf.set(false);
    }
  }

  ngOnDestroy() {
    this.reportStore.clearSelected();
  }
}
