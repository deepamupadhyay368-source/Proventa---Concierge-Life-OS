/**
 * PROVENTA — Genuine Spec-Compliant PDF 1.4 Binary Report Generator
 * Zero native binary dependencies — produces valid, multi-page, Adobe/Chrome-readable
 * `%PDF-1.4` binary documents with structured typography, headers, metadata, metrics tables,
 * provenance citations, methodology, assumptions, limitations, and statutory disclaimers.
 */

import crypto from 'node:crypto';
import type { StructuredIntelligenceReport } from './report-generator';

function escapePdfText(input: string): string {
  // Strip non-ASCII chars to safe Latin-1 / ASCII equivalents for standard Type1 Helvetica
  const ascii = input
    .replace(/₹/g, 'INR ')
    .replace(/→/g, '->')
    .replace(/—/g, '--')
    .replace(/–/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, ' ');
  return ascii.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

interface PdfLine {
  text: string;
  font: 'F1' | 'F2'; // F1 = Helvetica, F2 = Helvetica-Bold
  size: number;
  spacing: number;
}

export function renderIntelligenceReportPdf(report: StructuredIntelligenceReport): {
  pdfBuffer: Buffer;
  sha256: string;
  pageCount: number;
} {
  const lines: PdfLine[] = [];

  const addHeading = (text: string) => {
    lines.push({ text: '', font: 'F1', size: 8, spacing: 8 });
    lines.push({ text: text.toUpperCase(), font: 'F2', size: 11, spacing: 16 });
  };
  const addBody = (text: string, font: 'F1' | 'F2' = 'F1', size = 9.5) => {
    for (const wrapped of wrapText(text, 88)) {
      lines.push({ text: wrapped, font, size, spacing: 13 });
    }
  };

  // Document Header
  lines.push({ text: 'PROVENTA -- REAL ESTATE INTELLIGENCE', font: 'F2', size: 15, spacing: 20 });
  lines.push({
    text: 'Know Every Property. Understand Every Market. | https://proventa.in',
    font: 'F1',
    size: 9,
    spacing: 16,
  });
  lines.push({
    text: `REPORT TYPE: ${report.reportType.replace(/_/g, ' ')}`,
    font: 'F2',
    size: 12,
    spacing: 18,
  });
  addBody(`Report Reference: ${report.reportReference}`, 'F2', 9.5);
  addBody(`Subject: ${report.subjectTitle}`, 'F1', 9.5);
  addBody(`Geography: ${report.geography}`, 'F1', 9.5);
  addBody(`Generated At (UTC): ${report.generatedAtIso}`, 'F1', 9.5);
  addBody(`Confidence Indicator: ${report.confidenceLevel}`, 'F2', 9.5);

  // Metrics Section
  addHeading('1. Verified Analytical Metrics');
  const metricEntries = Object.entries(report.metrics || {});
  if (metricEntries.length === 0) {
    addBody('No quantitative metrics recorded (INSUFFICIENT_DATA).');
  } else {
    for (const [k, v] of metricEntries) {
      const formattedVal = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? 'N/A');
      addBody(`- ${k}: ${formattedVal}`);
    }
  }

  // Methodology
  addHeading('2. Calculation Methodology');
  addBody(report.methodology);

  // Data Sources
  addHeading('3. Trusted Server-Side Data Sources');
  for (const src of report.dataSources) {
    addBody(`- ${src}`);
  }

  // Assumptions & Limitations
  addHeading('4. Assumptions & Limitations');
  for (const a of report.assumptions) {
    addBody(`[Assumption] ${a}`);
  }
  for (const l of report.limitations) {
    addBody(`[Limitation] ${l}`);
  }

  // Statutory Disclaimer
  addHeading('5. Mandatory Non-Certified Valuation & Legal Disclaimer');
  addBody(report.nonCertifiedDisclaimer, 'F2', 9);

  // Paginate lines (A4: 595 x 842 pt, top margin 790, bottom margin 60)
  const pages: PdfLine[][] = [];
  let currentPage: PdfLine[] = [];
  let y = 790;
  for (const line of lines) {
    if (y - line.spacing < 60) {
      pages.push(currentPage);
      currentPage = [];
      y = 790;
    }
    currentPage.push(line);
    y -= line.spacing;
  }
  if (currentPage.length > 0) pages.push(currentPage);

  // Build PDF objects
  // Obj 1: Catalog, Obj 2: Pages, Obj 3: Helvetica (F1), Obj 4: Helvetica-Bold (F2)
  // Then for each page p (0..N-1): Page obj = 5 + 2*p, Content stream obj = 6 + 2*p
  const objects: string[] = [];
  const pageObjIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    pageObjIds.push(5 + 2 * p);
  }

  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`;
  objects[3] = '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  objects[4] = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';

  pages.forEach((pageLines, idx) => {
    const pageId = 5 + 2 * idx;
    const contentId = 6 + 2 * idx;

    let stream = 'BT\n';
    let curY = 790;
    for (const ln of pageLines) {
      if (ln.text) {
        stream += `/${ln.font} ${ln.size} Tf\n1 0 0 1 50 ${curY} Tm\n(${escapePdfText(ln.text)}) Tj\n`;
      }
      curY -= ln.spacing;
    }
    // Footer
    stream += `/F1 8 Tf\n1 0 0 1 50 32 Tm\n(${escapePdfText(
      `PROVENTA Real Estate Intelligence | Ref: ${report.reportReference} | Page ${idx + 1} of ${pages.length}`
    )}) Tj\nET\n`;

    const streamByteLen = Buffer.byteLength(stream, 'utf8');
    objects[pageId] =
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`;
    objects[contentId] =
      `${contentId} 0 obj\n<< /Length ${streamByteLen} >>\nstream\n${stream}endstream\nendobj\n`;
  });

  // Assemble PDF with accurate byte xref table
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const chunks: Buffer[] = [Buffer.from(header, 'binary')];
  let offset = chunks[0].length;
  const xrefOffsets: number[] = [0];

  const maxObjId = objects.length - 1;
  for (let id = 1; id <= maxObjId; id++) {
    xrefOffsets[id] = offset;
    const buf = Buffer.from(objects[id], 'utf8');
    chunks.push(buf);
    offset += buf.length;
  }

  let xref = `xref\n0 ${maxObjId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxObjId; id++) {
    xref += `${String(xrefOffsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer =
    `trailer\n<< /Size ${maxObjId + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref + trailer, 'utf8'));

  const pdfBuffer = Buffer.concat(chunks);
  const sha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

  return { pdfBuffer, sha256, pageCount: pages.length };
}
