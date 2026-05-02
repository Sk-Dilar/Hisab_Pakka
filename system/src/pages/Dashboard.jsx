import React from 'react';
import { FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp, FiHome, FiArrowUpRight } from 'react-icons/fi';
import { useGetDashboardStatsQuery } from '../store/api/apiSlice';
import { Link } from 'react-router-dom';

/* ── tiny helpers ─────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const StatusBadge = ({ label }) => {
  const map = {
    Paid:    'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100  text-amber-700',
    Overdue: 'bg-red-100    text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[label] ?? 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
};

/* ── stat card ────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, accent, delta, loading }) => (
  <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-1 text-2xl font-extrabold text-[#1a1f36] leading-tight">
          {loading ? <span className="block h-7 w-28 rounded bg-slate-200 animate-pulse" /> : value}
        </p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={20} />
      </div>
    </div>
    {delta && !loading && (
      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
        <FiArrowUpRight size={13} /> {delta}
      </p>
    )}
  </div>
);

/* ── main ─────────────────────────────────────────── */
const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  const stats = [
    {
      title: 'Total Balance',
      value: fmt(data?.totalBalance),
      icon: FiDollarSign,
      accent: 'bg-[#a9fd6e]/20 text-[#4a7c10]',
      delta: '+12.5% vs last month',
    },
    {
      title: 'Total Clients',
      value: data?.clientCount ?? 0,
      icon: FiUsers,
      accent: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Projects',
      value: data?.activeProjectsCount ?? 0,
      icon: FiBriefcase,
      accent: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Recent Activity',
      value: data?.recentWorkItems?.length ?? 0,
      icon: FiTrendingUp,
      accent: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <FiHome size={12} />
          <span>Dashboard</span>
        </nav>
        <h1 className="text-2xl font-extrabold text-[#1a1f36]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} loading={isLoading} />
        ))}
      </div>

      {/* two-col content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Projects */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36]">Pending Projects</h2>
            <Link to="/app/projects" className="text-xs text-[#2e4ed2] font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))
            ) : data?.pendingProjects?.length > 0 ? (
              data.pendingProjects.map((p) => (
                <div key={p._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f36] truncate">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.clientId?.name}</p>
                  </div>
                  <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex-shrink-0">
                    {p.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No pending projects 🎉</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36]">Recent Activity</h2>
            <Link to="/app/clients" className="text-xs text-[#2e4ed2] font-semibold hover:underline">View all →</Link>
          </div>

          {/* table-like header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Task</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Amount</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Date</span>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))
            ) : data?.recentWorkItems?.length > 0 ? (
              data.recentWorkItems.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1f36] truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.clientId?.name}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1a1f36]">{fmt(item.totalAmount)}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
