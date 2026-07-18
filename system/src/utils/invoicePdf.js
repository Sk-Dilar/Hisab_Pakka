import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/HIsab_logo.png';

// jsPDF's built-in fonts can't render the ₹ glyph, so PDFs use a plain "Rs." prefix.
const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const NAVY = [26, 31, 54];
const ACCENT = [130, 200, 60];
const GRAY = [100, 108, 125];
const LIGHT_BG = [246, 248, 251];

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

export const generateInvoicePdf = async (invoice, user) => {
  const doc = new jsPDF();
  const client = invoice.clientId || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // ── header band ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.text(user?.name || 'Invoice', marginX, 16);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 196, 214);
  let headerLeftY = 23;
  if (user?.email) { doc.text(user.email, marginX, headerLeftY); headerLeftY += 5.5; }
  if (user?.phone) { doc.text(user.phone, marginX, headerLeftY); }

  doc.setFont(undefined, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ACCENT);
  doc.text('INVOICE', pageWidth - marginX, 15, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 224, 235);
  doc.text(`No: ${invoice.invoiceNumber}`, pageWidth - marginX, 22, { align: 'right' });
  doc.text(`Date: ${fmtDate(invoice.createdAt)}`, pageWidth - marginX, 27.5, { align: 'right' });
  doc.text(`Status: ${invoice.status}`, pageWidth - marginX, 33, { align: 'right' });

  // ── bill to ──
  doc.setTextColor(...GRAY);
  doc.setFontSize(8.5);
  doc.text('BILL TO', marginX, 50);

  doc.setTextColor(...NAVY);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11.5);
  let y = 57;
  doc.text(client.name || '—', marginX, y);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  if (client.companyName) { y += 5.5; doc.text(client.companyName, marginX, y); }
  if (client.email) { y += 5.5; doc.text(client.email, marginX, y); }
  if (client.phone) { y += 5.5; doc.text(client.phone, marginX, y); }

  // ── items table ──
  autoTable(doc, {
    startY: y + 10,
    head: [['Description', 'Project', 'Qty', 'Rate', 'Amount']],
    body: (invoice.items || []).map((item) => [
      item.title,
      item.projectTitle || '—',
      String(item.quantity),
      fmt(item.rate),
      fmt(item.totalAmount),
    ]),
    theme: 'striped',
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9.5, cellPadding: 4, textColor: [40, 44, 58] },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      1: { textColor: [110, 118, 135] },
      2: { halign: 'right', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 34 },
    },
  });

  // ── totals box ──
  const boxWidth = 84;
  const boxX = pageWidth - marginX - boxWidth;
  const rowH = 7;
  const rows = [
    { label: 'Subtotal', value: fmt(invoice.totalAmount) },
    { label: 'Discount', value: `- ${fmt(invoice.discount)}` },
    { label: 'Final Amount', value: fmt(invoice.finalAmount), bold: true },
    { label: 'Paid', value: fmt(invoice.paidAmount) },
    { label: 'Amount Due', value: fmt(invoice.dueAmount), bold: true, accent: true },
  ];

  let boxTop = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(boxX, boxTop, boxWidth, rows.length * rowH + 6, 2, 2, 'F');

  let ty = boxTop + rowH;
  rows.forEach(({ label, value, bold, accent }) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10.5 : 9.5);
    doc.setTextColor(...(accent ? [30, 130, 76] : bold ? NAVY : GRAY));
    doc.text(label, boxX + 6, ty);
    doc.text(value, pageWidth - marginX - 6, ty, { align: 'right' });
    ty += rowH;
  });

  // ── footer (every page) ──
  const logoDataUrl = await loadImageAsDataUrl(logoUrl);
  const pageCount = doc.internal.getNumberOfPages();
  const logoH = 7;
  const logoW = logoH * 1.385; // native aspect ratio of the Hisab Pakka logo

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const lineY = pageHeight - 16;
    const textY = pageHeight - 10;

    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, lineY, pageWidth - marginX, lineY);

    let textX = marginX;
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', marginX, textY - logoH + 1.5, logoW, logoH);
        textX = marginX + logoW + 4;
      } catch {
        /* logo failed to embed — footer text still renders without it */
      }
    }

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('Generated by Hisab Pakka', textX, textY);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, textY, { align: 'right' });
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
};
