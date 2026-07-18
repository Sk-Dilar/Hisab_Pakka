import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiHome, FiCheckSquare } from 'react-icons/fi';
import { useGetWorkItemsQuery, useGetProjectsQuery, useDeleteWorkItemMutation } from '../store/api/apiSlice';
import AddWorkItemModal from '../components/AddWorkItemModal';
import EditWorkItemModal from '../components/EditWorkItemModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const BILLED_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unbilled', label: 'Unbilled' },
  { key: 'billed', label: 'Billed' },
];

const WorkItems = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [projectFilter, setProjectFilter] = useState('');
  const [billedFilter, setBilledFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteWorkItem] = useDeleteWorkItemMutation();

  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });
  const { data, isLoading } = useGetWorkItemsQuery({
    page,
    limit: rowsPerPage,
    ...(projectFilter && { projectId: projectFilter }),
    ...(billedFilter !== 'all' && { billed: billedFilter === 'billed' }),
  });

  const handleDelete = async (id) => {
    if (window.confirm('Delete this work item? This will revert the client balance.')) {
      try { await deleteWorkItem(id).unwrap(); }
      catch (err) { alert(err.data?.message || 'Failed to delete work item'); }
    }
  };

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
            <FiCheckSquare size={12} /> Work Items
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1a1f36]">Work Items</h1>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <FiPlus size={16} /> Add Work Item
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white text-slate-600 shadow-sm min-w-[200px]"
        >
          <option value="">All Projects</option>
          {projectsData?.projects?.map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {BILLED_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setBilledFilter(key); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                billedFilter === key ? 'bg-[#1a1f36] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Project</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Client</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Qty</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Rate</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3.5 rounded bg-slate-200" style={{ width: `${50 + j * 5}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : data?.workItems?.length > 0 ? (
                data.workItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1a1f36]">{item.title}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                      {item.projectId ? (
                        <Link to={`/app/projects/${item.projectId._id}`} className="text-[#2e4ed2] hover:underline">
                          {item.projectId.title}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{item.clientId?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{fmt(item.rate)}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#1a1f36]">{fmt(item.totalAmount)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.billed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.billed ? 'Billed' : 'Unbilled'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {!item.billed && (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#2e4ed2] hover:bg-blue-50 transition-colors" title="Edit">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                    No work items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            {data?.total ? `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, data.total)} of ${data.total}` : '0 items'}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500 font-medium">{page} / {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <AddWorkItemModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <EditWorkItemModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        workItem={editingItem}
      />
    </div>
  );
};

export default WorkItems;
