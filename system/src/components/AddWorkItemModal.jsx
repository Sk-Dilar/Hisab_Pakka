import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiHash, FiDollarSign, FiFileText, FiBriefcase } from 'react-icons/fi';
import { useAddWorkItemMutation, useGetProjectsQuery } from '../store/api/apiSlice';

const AddWorkItemModal = ({ open, onClose, projectId, clientId }) => {
  const needsProjectPicker = !projectId;
  const [formData, setFormData] = useState({ title: '', quantity: 1, rate: 0, projectId: projectId || '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [addWorkItem, { isLoading }] = useAddWorkItemMutation();

  // Only ongoing projects can receive new billable work
  const { data: projectsData } = useGetProjectsQuery(
    { status: 'Ongoing', limit: 100 },
    { skip: !open || !needsProjectPicker },
  );

  useEffect(() => {
    if (open) { setFormData({ title: '', quantity: 1, rate: 0, projectId: projectId || '' }); setErrorMsg(''); }
  }, [open, projectId]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'projectId') {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.quantity <= 0 || formData.rate < 0) {
      setErrorMsg('Please fill all fields correctly'); return;
    }

    const resolvedProjectId = projectId || formData.projectId;
    if (!resolvedProjectId) { setErrorMsg('Please select a project'); return; }

    let resolvedClientId = clientId;
    if (!resolvedClientId) {
      const project = projectsData?.projects?.find((p) => p._id === resolvedProjectId);
      resolvedClientId = project?.clientId?._id || project?.clientId;
    }
    if (!resolvedClientId) { setErrorMsg('Could not determine the client for this project'); return; }

    try {
      await addWorkItem({
        title: formData.title,
        quantity: formData.quantity,
        rate: formData.rate,
        projectId: resolvedProjectId,
        clientId: resolvedClientId,
      }).unwrap();
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to add work item');
    }
  };

  const total = (formData.quantity * formData.rate).toFixed(2);
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-slide-up overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#1a1f36]">Log Work Item</h3>
            <p className="text-xs text-slate-400">
              {needsProjectPicker ? 'Record billable work for an ongoing project' : 'Record billable work for this project'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                <FiAlertCircle size={15} /> {errorMsg}
              </div>
            )}

            {/* project picker (only when not launched from a project's own page) */}
            {needsProjectPicker && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project *</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  <select
                    name="projectId" value={formData.projectId} onChange={handleChange} required
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select an ongoing project...</option>
                    {projectsData?.projects?.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}{p.clientId?.name ? ` — ${p.clientId.name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {projectsData?.projects?.length === 0 && (
                  <p className="text-[11px] text-slate-400">No ongoing projects — create one first.</p>
                )}
              </div>
            )}

            {/* description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Description *</label>
              <div className="relative">
                <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Homepage design" required autoFocus
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all"
                />
              </div>
            </div>

            {/* qty + rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity *</label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number" name="quantity" value={formData.quantity} onChange={handleChange}
                    min="1" step="1" required
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate (₹) *</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number" name="rate" value={formData.rate} onChange={handleChange}
                    min="0" step="0.01" required
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* total preview */}
            <div className="bg-[#1a1f36] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Estimated Total</p>
                <p className="text-[#a9fd6e] text-2xl font-extrabold mt-0.5">{fmt(total)}</p>
              </div>
              <div className="text-white/30 text-xs text-right">
                <p>{formData.quantity} × {fmt(formData.rate)}</p>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-50 text-white rounded-xl transition-colors">
              {isLoading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Add Work Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkItemModal;
