import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiPlus, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle, FiDollarSign, FiCalendar, FiUser
} from 'react-icons/fi';
import { 
  useGetProjectQuery, 
  useGetWorkItemsQuery, 
  useDeleteWorkItemMutation 
} from '../store/api/apiSlice';
import AddWorkItemModal from '../components/AddWorkItemModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const statusConfig = {
  Ongoing:  { color: 'bg-blue-100 text-blue-700',    icon: FiClock },
  Finished: { color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle },
  'On Hold':{ color: 'bg-amber-100 text-amber-700',  icon: FiAlertCircle },
};

const ProjectDetails = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(id);
  const { data: workItemsData, isLoading: workItemsLoading } = useGetWorkItemsQuery({ projectId: id });
  const [deleteWorkItem] = useDeleteWorkItemMutation();

  const handleDeleteWorkItem = async (itemId) => {
    if (window.confirm('Delete this work item? This will revert the client balance.')) {
      try { await deleteWorkItem(itemId).unwrap(); }
      catch (err) { alert(err.data?.message || 'Failed to delete work item'); }
    }
  };

  if (projectLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!project) return <p className="text-slate-500">Project not found.</p>;

  const totalValue = workItemsData?.workItems?.reduce((s, i) => s + i.totalAmount, 0) || 0;
  const cfg = statusConfig[project.status] || {};
  const StatusIcon = cfg.icon || FiClock;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/app/projects" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
          <FiArrowLeft size={12} /> Projects
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{project.title}</span>
      </nav>

      {/* top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* project info */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-200/60 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-xl font-extrabold text-[#1a1f36] leading-snug">{project.title}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
              <StatusIcon size={12} /> {project.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <FiUser size={14} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Client</p>
                <p className="font-semibold text-[#1a1f36]">{project.clientId?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <FiCalendar size={14} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="font-semibold text-[#1a1f36]">
                  {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* value card */}
        <div className="bg-[#1a1f36] rounded-2xl shadow-card p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[#a9fd6e]/20 flex items-center justify-center mb-1">
            <FiDollarSign size={22} className="text-[#a9fd6e]" />
          </div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Total Project Value</p>
          <p className="text-3xl font-extrabold text-white leading-tight">{fmt(totalValue)}</p>
          <p className="text-white/40 text-xs">{workItemsData?.workItems?.length || 0} work items</p>
        </div>
      </div>

      {/* work items */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-[#1a1f36]">Work Items</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#1a1f36] hover:bg-[#242a45] text-white px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={15} /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workItemsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3.5 w-2/3 rounded bg-slate-200" /></td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3.5 rounded bg-slate-100" /></td>
                    ))}
                  </tr>
                ))
              ) : workItemsData?.workItems?.length > 0 ? (
                workItemsData.workItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1a1f36]">{item.title}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{fmt(item.rate)}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#1a1f36]">{fmt(item.totalAmount)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.billed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.billed ? 'Billed' : 'Unbilled'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!item.billed && (
                        <button
                          onClick={() => handleDeleteWorkItem(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    No work items logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddWorkItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={project._id}
        clientId={project.clientId?._id}
      />
    </div>
  );
};

export default ProjectDetails;
