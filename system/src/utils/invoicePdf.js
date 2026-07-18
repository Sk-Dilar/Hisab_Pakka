import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/HIsab_logo.png';

// jsPDF's built-in fonts can't render the ₹ glyph, so PDFs use a plain "Rs." prefix.
const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── minimal palette: ink + muted greys + a single restrained accent ──
const INK = [30, 34, 48];
const MUTED = [120, 128, 145];
const RULE = [226, 232, 240];
const LIGHT_BG = [246, 248, 251];
const ACCENT = [130, 200, 60];
const ACCENT_DARK = [58, 122, 30];
const PAID_BG = [219, 234, 254];
const PAID_TEXT = [30, 64, 175];

const loadImageAsDataUrl = (url) =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    )
    .catch(() => null);

// Builds the jsPDF document for an invoice. Kept separate from save/preview so the
// same layout can be downloaded (generateInvoicePdf) or rendered live (previewInvoicePdf).
const buildInvoiceDoc = async (invoice, user) => {
  const doc = new jsPDF();
  const client = invoice.clientId || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;

  // ── header — name + tagline, no heavy colored band (clean & minimal) ──
  let y = 24;
  doc.setTextColor(...INK);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(22);
  doc.text(user?.name || 'Invoice', marginX, y);

  if (user?.tagline) {
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(user.tagline, marginX, y);
  }

  // right-aligned invoice meta
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text('INVOICE', pageWidth - marginX, 22, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`No: ${invoice.invoiceNumber}`, pageWidth - marginX, 28.5, { align: 'right' });
  doc.text(`Date: ${fmtDate(invoice.createdAt)}`, pageWidth - marginX, 33.5, { align: 'right' });
  doc.text(String(invoice.status || ''), pageWidth - marginX, 38.5, { align: 'right' });

  // signature of the minimal look: a single thin accent rule under the header
  const ruleY = Math.max(y, 40) + 6;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line(marginX, ruleY, pageWidth - marginX, ruleY);
  doc.setLineWidth(0.2);

  // ── bill to (left) / from (right) ──
  const colY = ruleY + 12;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('BILL TO', marginX, colY);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  let by = colY + 7;
  doc.text(client.name || '—', marginX, by);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  if (client.companyName) { by += 5.5; doc.text(client.companyName, marginX, by); }
  if (client.email) { by += 5.5; doc.text(client.email, marginX, by); }
  if (client.phone) { by += 5.5; doc.text(client.phone, marginX, by); }

  // FROM column — right-aligned to the page margin, mirroring BILL TO on the left
  const hasFrom = user?.email || user?.phone;
  const fromX = pageWidth - marginX;
  let fy = colY + 7;
  if (hasFrom) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('FROM', fromX, colY, { align: 'right' });
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(user?.name || '—', fromX, fy, { align: 'right' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    if (user?.email) { fy += 5.5; doc.text(user.email, fromX, fy, { align: 'right' }); }
    if (user?.phone) { fy += 5.5; doc.text(user.phone, fromX, fy, { align: 'right' }); }
  }

  // ── items table — minimal: no header fill, only hairline separators ──
  autoTable(doc, {
    startY: Math.max(by, fy) + 12,
    head: [['Description', 'Project', 'Qty', 'Rate', 'Amount']],
    body: (invoice.items || []).map((item) => [
      item.title,
      item.projectTitle || '—',
      String(item.quantity),
      fmt(item.rate),
      fmt(item.totalAmount),
    ]),
    theme: 'plain',
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9.5, cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 }, textColor: INK },
    headStyles: { textColor: MUTED, fontStyle: 'bold', fontSize: 8, cellPadding: { top: 0, bottom: 3.5, left: 2, right: 2 } },
    columnStyles: {
      1: { textColor: MUTED },
      2: { halign: 'right', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 34, fontStyle: 'bold' },
    },
    // force the numeric column HEADINGS to right-align too, so they sit directly
    // above their values (columnStyles.halign alone wasn't applying to the head row)
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index >= 2) {
        data.cell.styles.halign = 'right';
      }
    },
    // draw a bold rule under the header and a hairline under each body row
    didDrawCell: (data) => {
      if (data.column.index !== 0) return;
      const lineY = data.cell.y + data.cell.height;
      const startX = marginX;
      const endX = pageWidth - marginX;
      if (data.section === 'head') {
        doc.setDrawColor(...INK);
        doc.setLineWidth(0.4);
      } else {
        doc.setDrawColor(...RULE);
        doc.setLineWidth(0.2);
      }
      doc.line(startX, lineY, endX, lineY);
      doc.setLineWidth(0.2);
    },
  });

  // ── totals — right-aligned stack, only Amount Due is emphasized ──
  const boxWidth = 84;
  const boxX = pageWidth - marginX - boxWidth;
  const rowH = 7;
  const rows = [
    { label: 'Subtotal', value: fmt(invoice.totalAmount) },
    // Discount and Paid rows only appear when they carry a value
    ...(invoice.discount > 0 ? [{ label: 'Discount', value: `- ${fmt(invoice.discount)}` }] : []),
    { label: 'Final Amount', value: fmt(invoice.finalAmount), bold: true },
    ...(invoice.paidAmount > 0 ? [{ label: 'Paid', value: fmt(invoice.paidAmount) }] : []),
  ];

  let ty = doc.lastAutoTable.finalY + 10;
  // Page-break guard: jsPDF doesn't auto-paginate manual text/rect calls, so on a
  // long invoice the totals stack + Amount Due bar can render off the page bottom.
  // Push them to a fresh page if they wouldn't fit (mirrors the payment-info guard).
  const totalsHeight = rows.length * rowH + (rowH + 3) + 6;
  if (ty + totalsHeight > pageHeight - 22) {
    doc.addPage();
    ty = 24;
  }
  rows.forEach(({ label, value, bold }) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10.5 : 9.5);
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(label, boxX, ty);
    doc.text(value, pageWidth - marginX, ty, { align: 'right' });
    if (bold) {
      doc.setDrawColor(...RULE);
      doc.line(boxX, ty - 5, pageWidth - marginX, ty - 5);
    }
    ty += rowH;
  });

  // Amount Due / Paid in Full — the single highlighted element on the page
  const dueRowH = rowH + 3;
  const dueTop = ty + 1;
  const isDue = invoice.dueAmount > 0;
  doc.setFillColor(...(isDue ? ACCENT : PAID_BG));
  doc.roundedRect(boxX, dueTop, boxWidth, dueRowH, 2, 2, 'F');
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...(isDue ? ACCENT_DARK : PAID_TEXT));
  const dueTextY = dueTop + dueRowH / 2 + 3.2;
  doc.text(isDue ? 'AMOUNT DUE' : 'PAID IN FULL', boxX + 6, dueTextY);
  doc.text(fmt(invoice.dueAmount), pageWidth - marginX - 6, dueTextY, { align: 'right' });

  // ── payment info + thank-you note ──
  let infoTop = dueTop + dueRowH + 16;
  const infoBlockHeight = 30;
  if (infoTop + infoBlockHeight > pageHeight - 22) {
    doc.addPage();
    infoTop = 24;
  }

  if (user?.upiId) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('PAYMENT INFO', marginX, infoTop);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(`UPI ID: ${user.upiId}`, marginX, infoTop + 6.5);
  }

  doc.setFont(undefined, 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(
    'Thank you for your business — looking forward to working with you again!',
    pageWidth / 2,
    infoTop + 22,
    { align: 'center' },
  );

  // ── footer (every page) — Hisab Pakka's own branding, kept small and last ──
  const logoDataUrl = await loadImageAsDataUrl(logoUrl);
  const pageCount = doc.internal.getNumberOfPages();
  const logoH = 7;
  const logoW = logoH * 1.385; // native aspect ratio of the Hisab Pakka logo

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const lineY = pageHeight - 18;
    const brandTextY = pageHeight - 6; // baseline of "Generated by Hisab Pakka"
    const rightEdge = pageWidth - marginX;

    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(marginX, lineY, rightEdge, lineY);

    // brand block in the bottom-right corner: logo stacked above the caption
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Generated by Hisab Pakka', rightEdge, brandTextY, { align: 'right' });

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', rightEdge - logoW, brandTextY - logoH - 3, logoW, logoH);
      } catch {
        /* logo failed to embed — footer caption still renders without it */
      }
    }

    // page number kept in the bottom-left corner
    doc.text(`Page ${i} of ${pageCount}`, marginX, brandTextY);
  }

  return doc;
};

export const generateInvoicePdf = async (invoice, user) => {
  const doc = await buildInvoiceDoc(invoice, user);
  doc.save(`${invoice.invoiceNumber}.pdf`);
};

// Returns a blob URL for the generated PDF — used by the live design-preview page so the
// layout can be iterated on without downloading a file each time. Caller must revoke it.
export const previewInvoicePdf = async (invoice, user) => {
  const doc = await buildInvoiceDoc(invoice, user);
  return doc.output('bloburl');
};
