import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCalendar, FiCreditCard, FiFileText } from 'react-icons/fi';
import { useGetPaymentQuery } from '../store/api/apiSlice';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const statusConfig = {
  Unpaid:  { color: 'bg-red-100 text-red-600' },
  Partial: { color: 'bg-amber-100 text-amber-700' },
  Paid:    { color: 'bg-emerald-100 text-emerald-700' },
};

const PaymentDetails = () => {
  const { id } = useParams();
  const { data: payment, isLoading } = useGetPaymentQuery(id, { skip: !id });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!payment) return <p className="text-slate-500">Payment not found.</p>;

  const client = payment.clientId || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/app/payments" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
          <FiArrowLeft size={12} /> Payments
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">Payment</span>
      </nav>

      {/* header card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <FiUser size={13} /> {client.name}{client.companyName ? ` · ${client.companyName}` : ''}
            </p>
            <h1 className="text-3xl font-extrabold text-emerald-600 leading-snug mt-1">+{fmt(payment.amount)}</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <FiCreditCard size={13} /> {payment.method}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiCalendar size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="font-semibold text-[#1a1f36]">
                {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {payment.note && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <FiFileText size={14} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Note</p>
                <p className="font-semibold text-[#1a1f36]">{payment.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* allocations */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-[#1a1f36]">Applied To</h2>
          <p className="text-xs text-slate-400 mt-0.5">Invoices this payment was allocated to (FIFO order)</p>
        </div>
        <div className="divide-y divide-slate-100">
          {payment.allocations?.length > 0 ? (
            payment.allocations.map((alloc, i) => {
              const inv = alloc.invoiceId || {};
              const chip = statusConfig[inv.status] || statusConfig.Unpaid;
              return (
                <Link
                  key={inv._id || i}
                  to={inv._id ? `/app/invoices/${inv._id}` : '#'}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="font-medium text-[#1a1f36]">{inv.invoiceNumber || 'Invoice'}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-emerald-600">{fmt(alloc.appliedAmount)}</span>
                    {inv.status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chip.color}`}>{inv.status}</span>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-5 text-sm text-slate-400 text-center">No allocations recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
