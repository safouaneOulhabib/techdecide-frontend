import { Component, effect, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { Report } from '@features/reports/models/report.model';
import { ReportPdfService } from '@features/reports/services/report-pdf.service';
import { ReportStore } from '@features/reports/store/report.store';

@Component({
  selector: 'app-report-pdf-preview',
  standalone: true,
  imports: [ButtonModule, MessageModule, SkeletonModule],
  templateUrl: './report-pdf-preview.container.html',
  styleUrl: './report-pdf-preview.container.scss'
})
export class ReportPdfPreviewContainer implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly reportStore = inject(ReportStore);
  private readonly reportPdfService = inject(ReportPdfService);

  readonly report: Signal<Report | null> = this.reportStore.selectedReport;
  readonly loading: Signal<boolean> = this.reportStore.loading;
  readonly error: Signal<string | null> = this.reportStore.error;

  pdfUrl = signal<SafeResourceUrl | null>(null);
  downloadingPdf = signal(false);

  private reportId = 0;
  private rawPdfUrl: string | null = null;
  private generatedForReportId: number | null = null;

  constructor() {
    effect(() => {
      const report = this.report();
      if (!report || report.id !== this.reportId || this.generatedForReportId === report.id) {
        return;
      }

      this.setPdfUrl(this.reportPdfService.generateBlobUrl(report), report.id);
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.reportId = Number(params.get('id'));
      this.clearPdfUrl();
      this.reportStore.loadById(this.reportId);
    });
  }

  backToReport() {
    this.router.navigate(['/reports', this.reportId]);
  }

  downloadPdf() {
    const report = this.report();
    if (!report) return;

    this.downloadingPdf.set(true);
    try {
      this.reportPdfService.download(report);
    } finally {
      this.downloadingPdf.set(false);
    }
  }

  ngOnDestroy() {
    this.clearPdfUrl();
    this.reportStore.clearSelected();
  }

  private setPdfUrl(url: string, reportId: number): void {
    this.clearPdfUrl();
    this.rawPdfUrl = url;
    this.generatedForReportId = reportId;
    this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  private clearPdfUrl(): void {
    this.reportPdfService.revokeBlobUrl(this.rawPdfUrl);
    this.rawPdfUrl = null;
    this.generatedForReportId = null;
    this.pdfUrl.set(null);
  }
}
