import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const generateInvoicePdf = (invoice, user) => {
  const doc = new jsPDF();
  const client = invoice.clientId || {};

  // ── header ──
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(user?.name || 'Invoice', 14, 20);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (user?.email) doc.text(user.email, 14, 26);
  if (user?.phone) doc.text(user.phone, 14, 31);

  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 196, 20, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`No: ${invoice.invoiceNumber}`, 196, 27, { align: 'right' });
  doc.text(`Date: ${fmtDate(invoice.createdAt)}`, 196, 32, { align: 'right' });
  doc.text(`Status: ${invoice.status}`, 196, 37, { align: 'right' });

  // ── bill to ──
  let y = 46;
  doc.setFont(undefined, 'bold');
  doc.text('Bill To', 14, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.text(client.name || '—', 14, y);
  if (client.companyName) { y += 5; doc.text(client.companyName, 14, y); }
  if (client.email) { y += 5; doc.text(client.email, 14, y); }
  if (client.phone) { y += 5; doc.text(client.phone, 14, y); }

  // ── items table ──
  autoTable(doc, {
    startY: y + 10,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: (invoice.items || []).map((item) => [
      item.title,
      item.quantity,
      fmt(item.rate),
      fmt(item.totalAmount),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [26, 31, 54] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // ── totals ──
  let ty = doc.lastAutoTable.finalY + 10;
  const label = 150;
  const value = 196;
  const row = (text, amount, bold = false) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.text(text, label, ty);
    doc.text(amount, value, ty, { align: 'right' });
    ty += 6;
  };

  row('Subtotal', fmt(invoice.totalAmount));
  row('Discount', `- ${fmt(invoice.discount)}`);
  row('Final Amount', fmt(invoice.finalAmount), true);
  row('Paid', fmt(invoice.paidAmount));
  row('Due', fmt(invoice.dueAmount), true);

  doc.save(`${invoice.invoiceNumber}.pdf`);
};
