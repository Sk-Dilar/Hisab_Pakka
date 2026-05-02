import React, { useState } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiEye, FiHome, FiUsers, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetClientsQuery, useDeleteClientMutation, useRestoreClientMutation } from '../store/api/apiSlice';
import CreateClientModal from '../components/CreateClientModal';
import { useDebounce } from '../hooks/useDebounce';

/* ── helpers ─────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const BalanceBadge = ({ amount }) => {
  if (amount > 0)  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">{fmt(amount)}</span>;
  if (amount < 0)  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{fmt(Math.abs(amount))} adv.</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">{fmt(0)}</span>;
};

const Avatar = ({ name }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div className="w-8 h-8 rounded-xl bg-[#1a1f36] text-[#a9fd6e] flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
};

/* ── confirm modal ───────────────────────────────── */
const ConfirmModal = ({ title, message, onConfirm, onCancel, danger }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
      <h3 className="font-bold text-lg text-[#1a1f36] mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a1f36] hover:bg-[#242a45]'}`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

/* ── main ─────────────────────────────────────────── */
const Clients = () => {
  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm]   = useState('');
  const [status, setStatus]           = useState('active');
  const debouncedSearch               = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteClient]                = useDeleteClientMutation();
  const [restoreClient]               = useRestoreClientMutation();
  const [confirm, setConfirm]         = useState(null);

  const { data, isLoading } = useGetClientsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    status,
  });

  const askConfirm = ({ title, message, onConfirm, danger }) =>
    setConfirm({ title, message, onConfirm, danger });

  const handleDelete = (id) =>
    askConfirm({
      title: 'Delete Client',
      message: 'This will mark the client as inactive. Are you sure?',
      danger: true,
      onConfirm: async () => {
        try { await deleteClient(id).unwrap(); } catch (e) { alert(e.data?.message || 'Failed'); }
        setConfirm(null);
      },
    });

  const handleRestore = (id) =>
    askConfirm({
      title: 'Restore Client',
      message: 'This will restore the client to active status.',
      danger: false,
      onConfirm: async () => {
        try { await restoreClient(id).unwrap(); } catch (e) { alert(e.data?.message || 'Failed'); }
        setConfirm(null);
      },
    });

  const totalPages = Math.ceil((data?.total || 0) / rowsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* breadcrumb + header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <Link to="/app/dashboard" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
            <FiHome size={12} /> Dashboard
          </Link>
          <span>/</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <FiUsers size={12} /> Clients
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1a1f36]">Clients</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <FiPlus size={16} /> Create Client
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"
          />
        </div>
        {/* status tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                status === s ? 'bg-[#1a1f36] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Client</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Company</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Phone</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Balance</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 rounded bg-slate-200" style={{ width: `${60 + j * 5}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.clients?.length > 0 ? (
                data.clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.name} />
                        <div>
                          <p className="font-semibold text-[#1a1f36] leading-tight">{client.name}</p>
                          {client.status === 'inactive' && (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Inactive</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{client.companyName || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{client.email || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{client.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <BalanceBadge amount={client.currentBalance} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#2e4ed2] hover:bg-blue-50 transition-colors"
                        >
                          <FiEye size={15} />
                        </button>
                        {client.status === 'inactive' ? (
                          <button
                            title="Restore"
                            onClick={() => handleRestore(client._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <FiRefreshCw size={15} />
                          </button>
                        ) : (
                          <button
                            title="Delete"
                            onClick={() => handleDelete(client._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            {data?.total ? `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, data.total)} of ${data.total}` : '0 clients'}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none bg-white text-slate-600"
            >
              {[5, 10, 25].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500 font-medium">{page} / {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <CreateClientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
          danger={confirm.danger}
        />
      )}
    </div>
  );
};

export default Clients;
