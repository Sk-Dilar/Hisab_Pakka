import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiMail, FiPhone, FiBriefcase, FiCalendar, FiPlus,
  FiBriefcase as FiProject, FiFileText,
} from 'react-icons/fi';
import { useGetClientQuery, useGetProjectsQuery, useGetInvoicesQuery } from '../store/api/apiSlice';
import EditClientModal from '../components/EditClientModal';
import CreateProjectModal from '../components/CreateProjectModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const BalanceBadge = ({ amount }) => {
  if (amount > 0)  return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-600">{fmt(amount)} due</span>;
  if (amount < 0)  return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">{fmt(Math.abs(amount))} advance</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-500">{fmt(0)}</span>;
};

const statusChip = (paid, finalAmt) => {
  if (paid === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-600' };
  if (paid < finalAmt) return { text: 'Partial', color: 'bg-amber-100 text-amber-700' };
  return { text: 'Paid', color: 'bg-emerald-100 text-emerald-700' };
};

const ClientDetails = () => {
  const { id } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const { data: client, isLoading: clientLoading } = useGetClientQuery(id, { skip: !id });
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery({ clientId: id, limit: 5 }, { skip: !id });
  const { data: invoicesData, isLoading: invoicesLoading } = useGetInvoicesQuery({ clientId: id, limit: 5 }, { skip: !id });

  if (clientLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!client) return <p className="text-slate-500">Client not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/app/clients" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
          <FiArrowLeft size={12} /> Clients
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{client.name}</span>
      </nav>

      {/* info card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1f36] text-[#a9fd6e] flex items-center justify-center font-bold text-lg flex-shrink-0">
              {client.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1a1f36] leading-snug">{client.name}</h1>
              {client.companyName && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <FiBriefcase size={13} /> {client.companyName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BalanceBadge amount={client.currentBalance} />
            <button onClick={() => setIsEditOpen(true)} className="p-2 text-slate-400 hover:text-[#2e4ed2] hover:bg-blue-50 rounded-lg transition-colors" title="Edit Client">
              <FiEdit2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiMail size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="font-semibold text-[#1a1f36]">{client.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiPhone size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="font-semibold text-[#1a1f36]">{client.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiCalendar size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Client Since</p>
              <p className="font-semibold text-[#1a1f36]">
                {new Date(client.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* projects */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36] flex items-center gap-2"><FiProject size={16} /> Projects</h2>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#1a1f36] hover:bg-[#242a45] text-white px-3 py-1.5 rounded-xl transition-colors"
            >
              <FiPlus size={13} /> New Project
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {projectsLoading ? (
              <div className="p-5 text-sm text-slate-400">Loading...</div>
            ) : projectsData?.projects?.length > 0 ? (
              projectsData.projects.map((project) => (
                <Link key={project._id} to={`/app/projects/${project._id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                  <span className="font-medium text-[#1a1f36]">{project.title}</span>
                  <span className="text-xs font-semibold text-slate-400">{project.status}</span>
                </Link>
              ))
            ) : (
              <div className="p-5 text-sm text-slate-400 text-center">No projects yet.</div>
            )}
          </div>
        </div>

        {/* invoices */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-[#1a1f36] flex items-center gap-2"><FiFileText size={16} /> Invoices</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {invoicesLoading ? (
              <div className="p-5 text-sm text-slate-400">Loading...</div>
            ) : invoicesData?.invoices?.length > 0 ? (
              invoicesData.invoices.map((invoice) => {
                const chip = statusChip(invoice.paidAmount, invoice.finalAmount);
                return (
                  <Link key={invoice._id} to={`/app/invoices/${invoice._id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                    <span className="font-medium text-[#1a1f36]">{invoice.invoiceNumber}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{fmt(invoice.finalAmount)}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chip.color}`}>{chip.text}</span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-5 text-sm text-slate-400 text-center">No invoices yet.</div>
            )}
          </div>
        </div>
      </div>

      <EditClientModal open={isEditOpen} onClose={() => setIsEditOpen(false)} client={client} />

      <CreateProjectModal
        open={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        presetClient={client}
      />
    </div>
  );
};

export default ClientDetails;
