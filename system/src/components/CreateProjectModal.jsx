import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiBriefcase, FiUsers, FiFileText, FiFlag } from 'react-icons/fi';
import { useCreateProjectMutation, useGetClientsQuery } from '../store/api/apiSlice';

const STATUS_OPTIONS = ['Ongoing', 'Finished', 'On Hold'];

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all";

const CreateProjectModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ clientId: '', title: '', description: '', status: 'Ongoing' });
  const [errorMsg, setErrorMsg] = useState('');
  const { data: clientsData } = useGetClientsQuery({ limit: 100 });
  const [createProject, { isLoading }] = useCreateProjectMutation();

  useEffect(() => {
    if (open) { setFormData({ clientId: '', title: '', description: '', status: 'Ongoing' }); setErrorMsg(''); }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setErrorMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title.trim()) { setErrorMsg('Client and project title are required'); return; }
    try {
      await createProject(formData).unwrap();
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#1a1f36]">Create New Project</h3>
            <p className="text-xs text-slate-400">Link a client and set project details</p>
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

            {/* client select */}
            <Field label="Client *">
              <div className="relative">
                <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <select name="clientId" value={formData.clientId} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all appearance-none cursor-pointer">
                  <option value="">Select a client...</option>
                  {clientsData?.clients?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.companyName ? ` (${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            {/* title */}
            <Field label="Project Title *">
              <div className="relative">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Website Redesign" required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all" />
              </div>
            </Field>

            {/* description */}
            <Field label="Description">
              <div className="relative">
                <FiFileText className="absolute left-3.5 top-3 text-slate-400" size={14} />
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={3} placeholder="Brief project description (optional)"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2] transition-all resize-none" />
              </div>
            </Field>

            {/* status */}
            <Field label="Status">
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      formData.status === s
                        ? s === 'Finished' ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : s === 'On Hold' ? 'bg-amber-100 text-amber-700 border-amber-300'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
