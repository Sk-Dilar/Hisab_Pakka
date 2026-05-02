import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useCreateClientMutation } from '../store/api/apiSlice';

/* shared input */
const Field = ({ label, error, helper, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-all
          ${error
            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
            : 'border-slate-200 focus:ring-2 focus:ring-[#2e4ed2]/25 focus:border-[#2e4ed2]'
          }`}
      />
    </div>
    {(helper || error) && (
      <p className={`text-[11px] ${error ? 'text-red-500' : 'text-slate-400'}`}>{error || helper}</p>
    )}
  </div>
);

const CreateClientModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', companyName: '' });
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [createClient, { isLoading }] = useCreateClientMutation();

  // reset when modal opens
  useEffect(() => {
    if (open) { setFormData({ name: '', email: '', phone: '', companyName: '' }); setErrorMsg(''); setSuccessMsg(''); }
  }, [open]);

  if (!open) return null;

  const phoneErr  = formData.phone  && !/^[6-9]\d{9}$/.test(formData.phone)  ? 'Valid 10-digit Indian number required' : '';
  const emailErr  = formData.email  && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email address' : '';
  const isValid   = formData.name.trim() && !phoneErr && !emailErr;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return;
    if (name === 'phone' && value.length > 10) return;
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setErrorMsg('Client name is required'); return; }
    if (phoneErr) { setErrorMsg(phoneErr); return; }
    try {
      await createClient(formData).unwrap();
      setSuccessMsg('Client created successfully!');
      setTimeout(() => { setSuccessMsg(''); onClose(); }, 1800);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to create client');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#1a1f36]">Create New Client</h3>
            <p className="text-xs text-slate-400">Fill in the client's details below</p>
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
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl">
                <FiCheckCircle size={15} /> {successMsg}
              </div>
            )}

            <Field label="Client Name *" icon={FiUser} name="name" value={formData.name}
              onChange={handleChange} placeholder="Ravi Kumar" required />

            <Field label="Email Address" icon={FiMail} type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="ravi@example.com" error={emailErr} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" icon={FiPhone} name="phone" value={formData.phone}
                onChange={handleChange} placeholder="98765 43210" error={phoneErr} />
              <Field label="Company" icon={FiBriefcase} name="companyName" value={formData.companyName}
                onChange={handleChange} placeholder="Acme Pvt Ltd" />
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !isValid}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-50 text-white rounded-xl transition-colors">
              {isLoading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;
