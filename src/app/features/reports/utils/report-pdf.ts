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
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export async function buildPdf(report: Report): Promise<void> {
  // Lazy-load pdfmake to avoid bloating the initial bundle (~500 KB minified)
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts')
  ]);
  const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule;
  const pdfFonts = (pdfFontsModule as any).default ?? pdfFontsModule;
  pdfMake.vfs = pdfFonts.vfs;

  const subtitle = `By ${report.authorName} · Created ${formatDate(report.createdAt)}` +
    (report.updatedAt ? ` · Last edited ${formatDate(report.updatedAt)}` : '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [
    { text: report.title, style: 'reportTitle' },
    { text: subtitle, style: 'subtitle', margin: [0, 4, 0, 16] },
  ];

  if (report.introduction) {
    content.push({ text: report.introduction, style: 'intro', margin: [0, 0, 0, 16] });
  }

  content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 24] });

  report.items.forEach((item, idx) => {
    content.push({ text: `${idx + 1}. ${item.decisionTitle}`, style: 'itemTitle', margin: [0, 0, 0, 6] });
    content.push({ text: `Status: ${item.decisionStatus}`, style: 'statusLabel', margin: [0, 0, 0, 4] });

    const meta: string[] = [];
    if (item.decisionTeamName) meta.push(`Team: ${item.decisionTeamName}`);
    if (item.decisionAuthorName) meta.push(`Author: ${item.decisionAuthorName}`);
    if (item.decisionCreatedAt) meta.push(`Originally created ${formatDate(item.decisionCreatedAt)}`);
    if (meta.length) {
      content.push({ text: meta.join(' · '), style: 'meta', margin: [0, 0, 0, 12] });
    }

    if (item.decisionContext) {
      content.push({ text: 'Context', style: 'sectionHeading' });
      content.push({ text: item.decisionContext, style: 'body', margin: [0, 4, 0, 10] });
    }

    if (item.decisionContent) {
      content.push({ text: 'Decision', style: 'sectionHeading' });
      content.push({ text: item.decisionContent, style: 'body', margin: [0, 4, 0, 10] });
    }

    if (item.decisionConsequences) {
      content.push({ text: 'Consequences', style: 'sectionHeading' });
      content.push({ text: item.decisionConsequences, style: 'body', margin: [0, 4, 0, 10] });
    }

    if (item.alternatives.length > 0) {
      content.push({ text: 'Alternatives Considered', style: 'sectionHeading' });
      item.alternatives.forEach(alt => {
        content.push({
          columns: [
            { text: alt.name, style: 'altName', width: '*' },
            { text: alt.rejectionReason ?? '', style: 'altReason', width: '*' }
          ],
          margin: [0, 2, 0, 2]
        });
      });
      content.push({ text: '', margin: [0, 0, 0, 8] });
    }

    if (idx < report.items.length - 1) {
      content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }], margin: [0, 12, 0, 20] });
    }
  });

  const docDef = {
    content,
    styles: {
      reportTitle: { fontSize: 22, bold: true, color: '#1e293b' },
      subtitle: { fontSize: 10, color: '#64748b' },
      intro: { fontSize: 11, color: '#334155', lineHeight: 1.5 },
      itemTitle: { fontSize: 14, bold: true, color: '#1e293b' },
      statusLabel: { fontSize: 9, bold: true, color: '#4f46e5', background: '#eef2ff' },
      meta: { fontSize: 9, color: '#64748b' },
      sectionHeading: { fontSize: 10, bold: true, color: '#475569', margin: [0, 0, 0, 0] as [number, number, number, number] },
      body: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
      altName: { fontSize: 10, bold: true, color: '#334155' },
      altReason: { fontSize: 10, color: '#64748b' },
    },
    defaultStyle: { font: 'Roboto' },
    info: {
      title: report.title,
      author: report.authorName,
    }
  };

  pdfMake.createPdf(docDef).download(`${slugify(report.title)}.pdf`);
}
