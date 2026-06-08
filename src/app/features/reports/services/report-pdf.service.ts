import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Report, ReportItem } from '@features/reports/models/report.model';

type Rgb = [number, number, number];

const PAGE_MARGIN = 18;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const PAGE_HEIGHT = 297; // A4 mm
const BOTTOM_MARGIN = 24;

const COLORS = {
  ink: [30, 41, 59] as Rgb,
  muted: [100, 116, 139] as Rgb,
  soft: [148, 163, 184] as Rgb,
  line: [226, 232, 240] as Rgb,
  panel: [248, 250, 252] as Rgb,
  primary: [99, 102, 241] as Rgb,
  primarySoft: [238, 242, 255] as Rgb,
};

@Injectable({ providedIn: 'root' })
export class ReportPdfService {

  generateReportPdf(report: Report): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 20;

    const ensureSpace = (needed: number): void => {
      if (y + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
        doc.addPage();
        y = 20;
      }
    };

    const addWrappedText = (
      text: string,
      x: number,
      fontSize: number,
      color: Rgb,
      bold = false,
      lineHeightFactor = 1.4,
      maxWidth = PAGE_MARGIN + CONTENT_WIDTH - x,
    ): void => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = (fontSize * 0.352778) * lineHeightFactor;

      for (const line of lines) {
        ensureSpace(lineHeight);
        doc.text(line as string, x, y);
        y += lineHeight;
      }
    };

    const addSectionText = (label: string, text: string | null): void => {
      if (!text) return;

      ensureSpace(14);
      doc.setFontSize(7.6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(label.toUpperCase(), PAGE_MARGIN + 8, y);
      y += 4.5;

      addWrappedText(text, PAGE_MARGIN + 8, 9, COLORS.ink, false, 1.5, CONTENT_WIDTH - 16);
      y += 2.5;
    };

    const addStatusPill = (status: string, x: number, pillY: number): void => {
      const palette = this.statusPalette(status);
      const statusText = status.toUpperCase();

      doc.setFontSize(7.2);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(statusText);
      const width = textWidth + 5.5;

      doc.setFillColor(...palette.fill);
      doc.roundedRect(x, pillY - 4.4, width, 6.2, 3, 3, 'F');
      doc.setTextColor(...palette.text);
      doc.text(statusText, x + 2.75, pillY);
    };

    const addReportHeader = (): void => {
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(PAGE_MARGIN, y, 12, 12, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('TD', PAGE_MARGIN + 3, y + 7.7);

      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('TECHDECIDE REPORT', PAGE_MARGIN + 17, y + 4.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.muted);
      doc.text(`${report.items.length} decision snapshot${report.items.length === 1 ? '' : 's'}`, PAGE_MARGIN + 17, y + 9.3);
      y += 20;

      addWrappedText(report.title, PAGE_MARGIN, 22, COLORS.ink, true, 1.18, CONTENT_WIDTH - 10);
      y += 3;

      const subtitle =
        `Prepared by ${report.authorName} • Created ${this.formatDate(report.createdAt)}` +
        (report.updatedAt ? ` • Last edited ${this.formatDate(report.updatedAt)}` : '');
      addWrappedText(subtitle, PAGE_MARGIN, 8.8, COLORS.muted, false, 1.45);
      y += 7;

      if (report.introduction) {
        ensureSpace(24);
        doc.setFillColor(...COLORS.panel);
        doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 22, 3, 3, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('INTRODUCTION', PAGE_MARGIN + 5, y + 6);

        const introLines = doc.splitTextToSize(report.introduction, CONTENT_WIDTH - 10);
        doc.setFontSize(9.4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.ink);
        doc.text(introLines, PAGE_MARGIN + 5, y + 12);
        y += Math.max(24, 13 + introLines.length * 4.3);
      }

      y += 6;
    };

    const addDecision = (item: ReportItem, idx: number): void => {
      ensureSpace(50);

      doc.setDrawColor(...COLORS.line);
      doc.setLineWidth(0.25);
      doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
      y += 10;

      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      doc.line(PAGE_MARGIN, y - 1, PAGE_MARGIN, y + 25);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.primary);
      doc.text(String(idx + 1).padStart(2, '0'), PAGE_MARGIN + 4, y);

      addWrappedText(item.decisionTitle, PAGE_MARGIN + 12, 13.4, COLORS.ink, true, 1.25, CONTENT_WIDTH - 52);
      addStatusPill(item.decisionStatus, PAGE_MARGIN + CONTENT_WIDTH - 35, y - 1);
      y += 1.5;

      const meta: string[] = [];
      if (item.decisionTeamName) meta.push(item.decisionTeamName);
      if (item.decisionAuthorName) meta.push(item.decisionAuthorName);
      if (item.decisionCreatedAt) meta.push(this.formatDate(item.decisionCreatedAt));
      if (meta.length) {
        addWrappedText(meta.join('  •  '), PAGE_MARGIN + 12, 8.2, COLORS.muted, false, 1.35, CONTENT_WIDTH - 20);
        y += 5;
      }

      addSectionText('Context', item.decisionContext);
      addSectionText('Decision', item.decisionContent);
      addSectionText('Consequences', item.decisionConsequences);

      if (item.alternatives.length > 0) {
        ensureSpace(28);
        doc.setFontSize(7.6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('ALTERNATIVES CONSIDERED', PAGE_MARGIN + 8, y);
        y += 3;

        autoTable(doc, {
          startY: y,
          head: [['Alternative', 'Reason Rejected']],
          body: item.alternatives.map(a => [a.name, a.rejectionReason ?? '']),
          margin: { left: PAGE_MARGIN + 8, right: PAGE_MARGIN },
          styles: {
            fontSize: 8,
            cellPadding: { top: 2.4, right: 2, bottom: 2.4, left: 2 },
            textColor: COLORS.ink,
            lineColor: COLORS.line,
            lineWidth: 0.15,
          },
          headStyles: {
            fillColor: COLORS.primarySoft,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 7.5,
          },
          alternateRowStyles: {
            fillColor: COLORS.panel,
          },
          columnStyles: {
            0: { cellWidth: CONTENT_WIDTH * 0.32 },
            1: { cellWidth: CONTENT_WIDTH * 0.58 },
          },
          theme: 'grid',
        });

        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
      }

      y += 5;
    };

    addReportHeader();
    report.items.forEach((item, idx) => addDecision(item, idx));

    this.addFooters(doc, report);

    return doc;
  }


  generateBlob(report: Report): Blob {
    return this.generateReportPdf(report).output('blob');
  }

  generateBlobUrl(report: Report): string {
    return URL.createObjectURL(this.generateBlob(report));
  }

  download(report: Report): void {
    this.generateReportPdf(report).save(`${this.slugify(report.title)}.pdf`);
  }

  revokeBlobUrl(url: string | null): void {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  private slugify(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return slug || 'report';
  }

  private formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private statusPalette(status: string): { fill: Rgb; text: Rgb } {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return { fill: [220, 252, 231], text: [22, 163, 74] };
      case 'REJECTED':
        return { fill: [254, 226, 226], text: [220, 38, 38] };
      case 'SUPERSEDED':
        return { fill: [255, 237, 213], text: [234, 88, 12] };
      case 'PROPOSED':
        return { fill: [219, 234, 254], text: [37, 99, 235] };
      default:
        return { fill: COLORS.primarySoft, text: COLORS.primary };
    }
  }

  private addFooters(doc: jsPDF, report: Report): void {
    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setDrawColor(...COLORS.line);
      doc.setLineWidth(0.2);
      doc.line(PAGE_MARGIN, PAGE_HEIGHT - 16, PAGE_MARGIN + CONTENT_WIDTH, PAGE_HEIGHT - 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.soft);
      doc.text('TechDecide', PAGE_MARGIN, PAGE_HEIGHT - 10);

      const footerTitle = doc.splitTextToSize(report.title, 90)[0] as string;
      doc.text(footerTitle, PAGE_MARGIN + 38, PAGE_HEIGHT - 10);
      doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
    }
  }
}
