import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft, FiDownload, FiEdit2, FiUser, FiCalendar, FiHash } from 'react-icons/fi';
import { useGetInvoiceQuery } from '../store/api/apiSlice';
import EditDiscountModal from '../components/EditDiscountModal';
import { generateInvoicePdf } from '../utils/invoicePdf';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const statusConfig = {
  Unpaid:  { color: 'bg-red-100 text-red-600' },
  Partial: { color: 'bg-amber-100 text-amber-700' },
  Paid:    { color: 'bg-emerald-100 text-emerald-700' },
};

const InvoiceDetails = () => {
  const { id } = useParams();
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);

  const { data: invoice, isLoading } = useGetInvoiceQuery(id, { skip: !id });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!invoice) return <p className="text-slate-500">Invoice not found.</p>;

  const cfg = statusConfig[invoice.status] || statusConfig.Unpaid;
  const client = invoice.clientId || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/app/invoices" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
          <FiArrowLeft size={12} /> Invoices
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{invoice.invoiceNumber}</span>
      </nav>

      {/* header card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-[#1a1f36] leading-snug">{invoice.invoiceNumber}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <FiUser size={13} /> {client.name}{client.companyName ? ` · ${client.companyName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {invoice.paidAmount === 0 && (
              <button
                onClick={() => setIsDiscountOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                <FiEdit2 size={14} /> Edit Discount
              </button>
            )}
            <button
              onClick={() => generateInvoicePdf(invoice, user)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1a1f36] hover:bg-[#242a45] px-4 py-2 rounded-xl transition-colors"
            >
              <FiDownload size={14} /> Download PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiCalendar size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="font-semibold text-[#1a1f36]">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiHash size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Items</p>
              <p className="font-semibold text-[#1a1f36]">{invoice.items?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* items + totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36]">Line Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Rate</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5 font-medium text-[#1a1f36]">{item.title}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{fmt(item.rate)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#1a1f36]">{fmt(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* totals card */}
        <div className="bg-[#1a1f36] rounded-2xl shadow-card p-6 space-y-3 h-fit">
          <Row label="Subtotal" value={fmt(invoice.totalAmount)} />
          <Row label="Discount" value={`- ${fmt(invoice.discount)}`} />
          <div className="border-t border-white/10 pt-3">
            <Row label="Final Amount" value={fmt(invoice.finalAmount)} bold />
          </div>
          <Row label="Paid" value={fmt(invoice.paidAmount)} />
          <div className="border-t border-white/10 pt-3">
            <Row label="Due" value={fmt(invoice.dueAmount)} bold accent />
          </div>
        </div>
      </div>

      <EditDiscountModal open={isDiscountOpen} onClose={() => setIsDiscountOpen(false)} invoice={invoice} />
    </div>
  );
};

const Row = ({ label, value, bold, accent }) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm ${bold ? 'font-bold text-white' : 'text-white/60'}`}>{label}</span>
    <span className={`text-sm ${bold ? (accent ? 'font-extrabold text-[#a9fd6e] text-lg' : 'font-bold text-white') : 'text-white/80'}`}>{value}</span>
  </div>
);

export default InvoiceDetails;
