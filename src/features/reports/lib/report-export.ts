'use client';

import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Shared download helper
// ---------------------------------------------------------------------------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadText(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

export function metricsToCSV(
  metrics: AnalyticsMetrics,
  title: string
): string {
  const rows: string[] = [];
  const ts = new Date().toISOString();
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

  rows.push(`${esc('Report')},${esc(title)}`);
  rows.push(`${esc('Generated')},${esc(ts)}`);
  rows.push('');

  rows.push(`${esc('Metric')},${esc('Value')}`);
  rows.push(`${esc('Total Conversations')},${metrics.totalConversations}`);
  rows.push(`${esc('Resolved')},${metrics.totalResolved}`);
  rows.push(`${esc('Escalated')},${metrics.totalEscalated}`);
  rows.push(`${esc('Active')},${metrics.totalActive}`);
  rows.push(
    `${esc('Resolution Rate')},${esc((metrics.resolutionRate * 100).toFixed(1) + '%')}`
  );
  rows.push(
    `${esc('Avg Confidence')},${esc((metrics.avgConfidence * 100).toFixed(1) + '%')}`
  );
  rows.push(
    `${esc('First Response Median')},${esc(metrics.firstResponse.median.toFixed(1) + ' min')}`
  );
  rows.push(
    `${esc('Resolution Time Median')},${esc(metrics.resolutionTime.median.toFixed(1) + ' min')}`
  );
  rows.push(`${esc('CSAT Avg')},${metrics.csat.avgScore.toFixed(2)}`);
  rows.push('');

  // Timeseries
  rows.push(
    `${esc('Date')},${esc('Total')},${esc('Resolved')},${esc('Escalated')}`
  );
  for (const p of metrics.timeseries) {
    rows.push(`${esc(p.date)},${p.total},${p.resolved},${p.escalated}`);
  }
  rows.push('');

  // Channels
  if (metrics.channelStats.length > 0) {
    rows.push(
      ['Channel', 'Volume', 'Resolved', 'Resolution %', 'CSAT']
        .map(esc)
        .join(',')
    );
    for (const c of metrics.channelStats) {
      rows.push(
        `${esc(c.channel)},${c.volume},${c.resolved},${c.resolutionRate.toFixed(1)}%,${c.avgCsat.toFixed(2)}`
      );
    }
    rows.push('');
  }

  // Agents
  if (metrics.agentStats.length > 0) {
    rows.push(
      ['Agent', 'Resolved', 'Avg Res Time', 'CSAT', 'Active']
        .map(esc)
        .join(',')
    );
    for (const a of metrics.agentStats) {
      rows.push(
        `${esc(a.agent)},${a.resolved},${a.avgResolutionTime.toFixed(1)},${a.avgCsat.toFixed(2)},${a.active}`
      );
    }
    rows.push('');
  }

  // Topics
  if (metrics.topTopics.length > 0) {
    rows.push(['Topic', 'Count', 'Avg Confidence'].map(esc).join(','));
    for (const t of metrics.topTopics) {
      rows.push(
        `${esc(t.topic)},${t.count},${(t.avgConfidence * 100).toFixed(0)}%`
      );
    }
  }

  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// PDF (via jsPDF + jspdf-autotable)
// ---------------------------------------------------------------------------

export async function exportPDF(
  metrics: AnalyticsMetrics,
  title: string,
  filename: string
) {
  const { default: jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  doc.setTextColor(0);
  y += 10;

  // KPI summary
  doc.setFontSize(11);
  doc.text('Summary', 14, y);
  y += 2;

  const kpiData = [
    ['Total Conversations', String(metrics.totalConversations)],
    ['Resolved', String(metrics.totalResolved)],
    ['Escalated', String(metrics.totalEscalated)],
    ['Active', String(metrics.totalActive)],
    ['Resolution Rate', `${(metrics.resolutionRate * 100).toFixed(1)}%`],
    ['Avg Confidence', `${(metrics.avgConfidence * 100).toFixed(1)}%`],
    [
      'First Response (median)',
      `${metrics.firstResponse.median.toFixed(1)} min`
    ],
    [
      'Resolution Time (median)',
      `${metrics.resolutionTime.median.toFixed(1)} min`
    ],
    ['CSAT Avg', metrics.csat.avgScore.toFixed(2)]
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: kpiData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [40, 40, 40] },
    margin: { left: 14, right: 14 },
    theme: 'grid'
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Channel stats
  if (metrics.channelStats.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(11);
    doc.text('Channel Statistics', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Channel', 'Volume', 'Resolved', 'Resolution %', 'CSAT']],
      body: metrics.channelStats.map((c) => [
        c.channel,
        String(c.volume),
        String(c.resolved),
        `${c.resolutionRate.toFixed(1)}%`,
        c.avgCsat.toFixed(2)
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Agent stats
  if (metrics.agentStats.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(11);
    doc.text('Agent Performance', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Agent', 'Resolved', 'Avg Res Time', 'CSAT', 'Active']],
      body: metrics.agentStats.map((a) => [
        a.agent,
        String(a.resolved),
        `${a.avgResolutionTime.toFixed(1)} min`,
        a.avgCsat.toFixed(2),
        String(a.active)
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Timeseries (last 14 rows)
  const ts = metrics.timeseries.slice(-14);
  if (ts.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(11);
    doc.text('Daily Volume (recent)', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Total', 'Resolved', 'Escalated']],
      body: ts.map((p) => [p.date, String(p.total), String(p.resolved), String(p.escalated)]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `${title} — Page ${i} of ${totalPages}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

// ---------------------------------------------------------------------------
// DOCX (via docx package)
// ---------------------------------------------------------------------------

export async function exportDOCX(
  metrics: AnalyticsMetrics,
  title: string,
  filename: string
) {
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    HeadingLevel,
    BorderStyle
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const noBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  };

  const cell = (text: string, bold = false) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold, size: 18 })]
        })
      ],
      borders: noBorder
    });

  const headerCell = (text: string) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })]
        })
      ],
      borders: noBorder,
      shading: { fill: '282828' }
    });

  // KPI table
  const kpiRows = [
    ['Total Conversations', String(metrics.totalConversations)],
    ['Resolved', String(metrics.totalResolved)],
    ['Escalated', String(metrics.totalEscalated)],
    ['Active', String(metrics.totalActive)],
    ['Resolution Rate', `${(metrics.resolutionRate * 100).toFixed(1)}%`],
    ['Avg Confidence', `${(metrics.avgConfidence * 100).toFixed(1)}%`],
    ['First Response (median)', `${metrics.firstResponse.median.toFixed(1)} min`],
    ['Resolution Time (median)', `${metrics.resolutionTime.median.toFixed(1)} min`],
    ['CSAT Avg', metrics.csat.avgScore.toFixed(2)]
  ];

  const kpiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Metric'), headerCell('Value')] }),
      ...kpiRows.map(
        ([m, v]) => new TableRow({ children: [cell(m), cell(v)] })
      )
    ]
  });

  const _sections: (typeof Paragraph | typeof Table)[] = [];
  const children: InstanceType<typeof Paragraph | typeof Table>[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleString()}`,
          size: 18,
          color: '888888'
        })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
    kpiTable,
    new Paragraph({ text: '' })
  ];

  // Channels
  if (metrics.channelStats.length > 0) {
    children.push(
      new Paragraph({
        text: 'Channel Statistics',
        heading: HeadingLevel.HEADING_2
      })
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              headerCell('Channel'),
              headerCell('Volume'),
              headerCell('Resolved'),
              headerCell('Resolution %'),
              headerCell('CSAT')
            ]
          }),
          ...metrics.channelStats.map(
            (c) =>
              new TableRow({
                children: [
                  cell(c.channel),
                  cell(String(c.volume)),
                  cell(String(c.resolved)),
                  cell(`${c.resolutionRate.toFixed(1)}%`),
                  cell(c.avgCsat.toFixed(2))
                ]
              })
          )
        ]
      })
    );
    children.push(new Paragraph({ text: '' }));
  }

  // Agents
  if (metrics.agentStats.length > 0) {
    children.push(
      new Paragraph({
        text: 'Agent Performance',
        heading: HeadingLevel.HEADING_2
      })
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              headerCell('Agent'),
              headerCell('Resolved'),
              headerCell('Avg Res Time'),
              headerCell('CSAT'),
              headerCell('Active')
            ]
          }),
          ...metrics.agentStats.map(
            (a) =>
              new TableRow({
                children: [
                  cell(a.agent),
                  cell(String(a.resolved)),
                  cell(`${a.avgResolutionTime.toFixed(1)} min`),
                  cell(a.avgCsat.toFixed(2)),
                  cell(String(a.active))
                ]
              })
          )
        ]
      })
    );
    children.push(new Paragraph({ text: '' }));
  }

  // Top topics
  if (metrics.topTopics.length > 0) {
    children.push(
      new Paragraph({ text: 'Top Topics', heading: HeadingLevel.HEADING_2 })
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              headerCell('Topic'),
              headerCell('Count'),
              headerCell('Avg Confidence')
            ]
          }),
          ...metrics.topTopics.map(
            (t) =>
              new TableRow({
                children: [
                  cell(t.topic),
                  cell(String(t.count)),
                  cell(`${(t.avgConfidence * 100).toFixed(0)}%`)
                ]
              })
          )
        ]
      })
    );
  }

  const doc = new Document({
    sections: [{ children }]
  });

  const buf = await Packer.toBlob(doc);
  saveAs(buf, filename);
}

// ---------------------------------------------------------------------------
// Unified export functions
// ---------------------------------------------------------------------------

export function exportCSV(
  metrics: AnalyticsMetrics,
  title: string,
  slug?: string
) {
  const s = slug ?? title.toLowerCase().replace(/\s+/g, '-');
  const stamp = new Date().toISOString().split('T')[0];
  const filename = `${s}-${stamp}.csv`;
  downloadText(
    metricsToCSV(metrics, title),
    filename,
    'text/csv;charset=utf-8;'
  );
  toast.success('Exported', { description: filename });
}

export function exportJSON(
  metrics: AnalyticsMetrics,
  title: string,
  slug?: string
) {
  const s = slug ?? title.toLowerCase().replace(/\s+/g, '-');
  const stamp = new Date().toISOString().split('T')[0];
  const filename = `${s}-${stamp}.json`;
  downloadText(
    JSON.stringify(metrics, null, 2),
    filename,
    'application/json'
  );
  toast.success('Exported', { description: filename });
}

export async function exportAsPDF(
  metrics: AnalyticsMetrics,
  title: string,
  slug?: string
) {
  const s = slug ?? title.toLowerCase().replace(/\s+/g, '-');
  const stamp = new Date().toISOString().split('T')[0];
  const filename = `${s}-${stamp}.pdf`;
  await exportPDF(metrics, title, filename);
  toast.success('Exported', { description: filename });
}

export async function exportAsDOCX(
  metrics: AnalyticsMetrics,
  title: string,
  slug?: string
) {
  const s = slug ?? title.toLowerCase().replace(/\s+/g, '-');
  const stamp = new Date().toISOString().split('T')[0];
  const filename = `${s}-${stamp}.docx`;
  await exportDOCX(metrics, title, filename);
  toast.success('Exported', { description: filename });
}
