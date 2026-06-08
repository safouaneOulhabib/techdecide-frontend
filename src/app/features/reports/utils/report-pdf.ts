import type { Report } from '@features/reports/models/report.model';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const PAGE_MARGIN = 14;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const PAGE_HEIGHT = 297; // A4 mm
const BOTTOM_MARGIN = 20;

export async function buildPdf(report: Report): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = PAGE_MARGIN;

  function ensureSpace(needed: number): void {
    if (y + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  }

  function addWrappedText(
    text: string,
    x: number,
    fontSize: number,
    color: [number, number, number],
    bold = false,
    lineHeightFactor = 1.4,
  ): void {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - (x - PAGE_MARGIN));
    const lineHeight = (fontSize * 0.352778) * lineHeightFactor; // pt → mm
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line as string, x, y);
      y += lineHeight;
    }
  }

  function addDivider(weight = 0.3): void {
    ensureSpace(4);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(weight);
    doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
    y += 4;
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  addWrappedText(report.title, PAGE_MARGIN, 20, [30, 41, 59], true);
  y += 2;

  // ── Subtitle ───────────────────────────────────────────────────────────────
  const subtitle =
    `By ${report.authorName} · Created ${formatDate(report.createdAt)}` +
    (report.updatedAt ? ` · Last edited ${formatDate(report.updatedAt)}` : '');
  addWrappedText(subtitle, PAGE_MARGIN, 9, [100, 116, 139]);
  y += 4;

  // ── Introduction ───────────────────────────────────────────────────────────
  if (report.introduction) {
    addWrappedText(report.introduction, PAGE_MARGIN, 10, [51, 65, 85], false, 1.5);
    y += 4;
  }

  addDivider(0.5);
  y += 4;

  // ── Items ──────────────────────────────────────────────────────────────────
  report.items.forEach((item, idx) => {
    ensureSpace(14);

    // Number + title
    addWrappedText(`${idx + 1}. ${item.decisionTitle}`, PAGE_MARGIN, 13, [30, 41, 59], true);
    y += 1;

    // Status badge (filled rounded rect behind text)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    const statusText = item.decisionStatus.toUpperCase();
    const textW = doc.getTextWidth(statusText);
    const padH = 1.2;
    const padV = 0.8;
    const rectH = 4.5;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(PAGE_MARGIN, y - rectH + padV, textW + padH * 2, rectH, 0.8, 0.8, 'F');
    doc.text(statusText, PAGE_MARGIN + padH, y);
    y += 3;

    // Meta line
    const meta: string[] = [];
    if (item.decisionTeamName) meta.push(`Team: ${item.decisionTeamName}`);
    if (item.decisionAuthorName) meta.push(`Author: ${item.decisionAuthorName}`);
    if (item.decisionCreatedAt) meta.push(`Created ${formatDate(item.decisionCreatedAt)}`);
    if (meta.length) {
      addWrappedText(meta.join(' · '), PAGE_MARGIN, 8.5, [100, 116, 139]);
      y += 2;
    }

    // Context
    if (item.decisionContext) {
      addWrappedText('Context', PAGE_MARGIN, 9, [71, 85, 105], true);
      y += 0.5;
      addWrappedText(item.decisionContext, PAGE_MARGIN, 9.5, [51, 65, 85], false, 1.5);
      y += 2;
    }

    // Decision
    if (item.decisionContent) {
      addWrappedText('Decision', PAGE_MARGIN, 9, [71, 85, 105], true);
      y += 0.5;
      addWrappedText(item.decisionContent, PAGE_MARGIN, 9.5, [51, 65, 85], false, 1.5);
      y += 2;
    }

    // Consequences
    if (item.decisionConsequences) {
      addWrappedText('Consequences', PAGE_MARGIN, 9, [71, 85, 105], true);
      y += 0.5;
      addWrappedText(item.decisionConsequences, PAGE_MARGIN, 9.5, [51, 65, 85], false, 1.5);
      y += 2;
    }

    // Alternatives table
    if (item.alternatives.length > 0) {
      addWrappedText('Alternatives Considered', PAGE_MARGIN, 9, [71, 85, 105], true);
      y += 1;

      autoTable(doc, {
        startY: y,
        head: [['Alternative', 'Reason Rejected']],
        body: item.alternatives.map(a => [a.name, a.rejectionReason ?? '']),
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        styles: {
          fontSize: 8.5,
          cellPadding: 2,
          textColor: [51, 65, 85] as [number, number, number],
        },
        headStyles: {
          fillColor: [238, 242, 255] as [number, number, number],
          textColor: [79, 70, 229] as [number, number, number],
          fontStyle: 'bold',
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH * 0.35 },
          1: { cellWidth: CONTENT_WIDTH * 0.65 },
        },
        theme: 'plain',
      });

      // jspdf-autotable stores the final Y on the doc instance
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
    }

    if (idx < report.items.length - 1) {
      y += 2;
      addDivider(0.3);
      y += 4;
    }
  });

  doc.save(`${slugify(report.title)}.pdf`);
}
