import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiHome, FiSettings, FiSave, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileAsync, clearSuccessMessage, clearError } from '../store/slices/authSlice';

const InputField = ({ label, icon: Icon, error, helper, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all
          ${props.disabled
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : error
              ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
              : 'border-slate-200 focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2]'
          }`}
      />
    </div>
    {helper && <p className="text-xs text-slate-400">{helper}</p>}
  </div>
);

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => () => { dispatch(clearSuccessMessage()); dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfileAsync({ name: formData.name, phone: formData.phone }));
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <Link to="/app/dashboard" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
            <FiHome size={12} /> Dashboard
          </Link>
          <span>/</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <FiSettings size={12} /> Settings
          </span>
        </nav>
        <h1 className="text-2xl font-extrabold text-[#1a1f36]">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* profile form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          {/* card header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-[#1a1f36] text-[#a9fd6e] flex items-center justify-center font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-[#1a1f36]">Profile Information</h2>
              <p className="text-xs text-slate-400">Update your account details and contact info.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {successMessage && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                <FiShield size={15} /> {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                icon={FiUser}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
              <InputField
                label="Email Address"
                icon={FiMail}
                name="email"
                type="email"
                value={formData.email}
                disabled
                helper="Email cannot be changed"
              />
              <InputField
                label="Phone Number"
                icon={FiPhone}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <FiSave size={15} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* plan card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36]">Current Plan</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-[#1a1f36] rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#a9fd6e] text-[#1a1f36] text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                  {user?.plan || 'Free'}
                </span>
              </div>
              <p className="text-sm text-white/70 mt-2">Professional billing tools for your business.</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              {['Unlimited invoices', 'Client management', 'Payment tracking', 'Export reports'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full border-2 border-[#1a1f36] text-[#1a1f36] font-semibold text-sm py-2.5 rounded-xl hover:bg-[#1a1f36] hover:text-white transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
