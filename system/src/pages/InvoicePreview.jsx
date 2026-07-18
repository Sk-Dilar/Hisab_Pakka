import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FiRefreshCw } from 'react-icons/fi';
import { previewInvoicePdf } from '../utils/invoicePdf';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY design-preview page. Renders the invoice PDF live in an iframe with
// editable sample data so the layout in ../utils/invoicePdf.js can be iterated on
// without generating a real invoice. Reachable at /app/invoice-preview.
// Remove once the invoice design is finalized.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_INVOICE = {
  invoiceNumber: 'INV-0002',
  createdAt: '2026-07-18',
  status: 'Unpaid',
  clientId: {
    name: 'suman',
    companyName: 'rekhapat',
    email: 'suman@example.com',
    phone: '+91 90000 00000',
  },
  items: [
    { title: 'Illustration', projectTitle: 'book2', quantity: 9, rate: 250, totalAmount: 2250 },
    { title: 'Cover', projectTitle: 'book3', quantity: 1, rate: 800, totalAmount: 800 },
  ],
  totalAmount: 3050,
  discount: 0,
  finalAmount: 3050,
  paidAmount: 0,
  dueAmount: 3050,
};

const InvoicePreview = () => {
  const { user } = useSelector((state) => state.auth);
  const [url, setUrl] = useState(null);
  const [invoice, setInvoice] = useState(SAMPLE_INVOICE);
  const [tagline, setTagline] = useState(user?.tagline || 'Freelance Graphic Designer & Illustrator');

  const render = useCallback(async () => {
    const previewUser = { ...user, tagline };
    const blobUrl = await previewInvoicePdf(invoice, previewUser);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blobUrl;
    });
  }, [invoice, user, tagline]);

  useEffect(() => { render(); }, [render]);

  useEffect(() => () => setUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; }), []);

  const patch = (changes) => setInvoice((inv) => ({ ...inv, ...changes }));

  const scenarios = [
    { label: 'Unpaid (due)', changes: { status: 'Unpaid', paidAmount: 0, dueAmount: 3050 } },
    { label: 'Paid in full', changes: { status: 'Paid', paidAmount: 3050, dueAmount: 0 } },
    { label: 'With discount', changes: { status: 'Unpaid', discount: 550, finalAmount: 2500, paidAmount: 0, dueAmount: 2500 } },
    {
      label: 'Many items (2 pages)',
      changes: {
        items: Array.from({ length: 22 }, (_, i) => ({
          title: `Line item ${i + 1}`, projectTitle: `book${i + 1}`, quantity: i + 1, rate: 250, totalAmount: (i + 1) * 250,
        })),
      },
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1f36]">Invoice PDF — Design Preview</h1>
        <p className="text-xs text-slate-400">Temporary page for iterating on the invoice layout. Edit sample data below and re-render.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="(empty to hide)"
            className="w-80 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2e4ed2]/30"
          />
        </div>
        {scenarios.map((s) => (
          <button
            key={s.label}
            onClick={() => patch(s.changes)}
            className="border border-slate-200 text-slate-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={render}
          className="flex items-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] text-white text-sm font-semibold px-4 py-2 rounded-lg ml-auto"
        >
          <FiRefreshCw size={14} /> Re-render
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: '80vh' }}>
        {url ? (
          <iframe title="Invoice preview" src={url} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Rendering…</div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
