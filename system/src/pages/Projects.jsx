import React, { useState } from 'react';
import { FiSearch, FiPlus, FiEye, FiHome, FiBriefcase, FiCalendar } from 'react-icons/fi';
import { useGetProjectsQuery } from '../store/api/apiSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import { useNavigate, Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const statusStyles = {
  Ongoing:  'bg-blue-100 text-blue-700',
  Finished: 'bg-emerald-100 text-emerald-700',
  'On Hold':'bg-amber-100 text-amber-700',
};

const ProjectCard = ({ project, onView }) => (
  <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden group">
    {/* card accent stripe */}
    <div className={`h-1 w-full ${project.status === 'Finished' ? 'bg-emerald-400' : project.status === 'On Hold' ? 'bg-amber-400' : 'bg-[#2e4ed2]'}`} />
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[project.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {project.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <FiCalendar size={11} />
          {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <h3 className="font-bold text-[#1a1f36] text-base leading-snug mb-1 truncate">{project.title}</h3>
      <p className="text-sm font-medium text-[#2e4ed2] mb-2">{project.clientId?.name}</p>
      <p className="text-sm text-slate-400 line-clamp-2 flex-1">
        {project.description || 'No description provided.'}
      </p>
    </div>
    <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
      <button
        onClick={onView}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#2e4ed2] hover:text-[#1a1f36] transition-colors"
      >
        <FiEye size={14} /> View Details
      </button>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-card p-5 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-5 w-20 rounded-full bg-slate-200" />
      <div className="h-4 w-24 rounded bg-slate-100" />
    </div>
    <div className="h-5 w-3/4 rounded bg-slate-200" />
    <div className="h-4 w-1/2 rounded bg-slate-100" />
    <div className="h-3 w-full rounded bg-slate-100" />
    <div className="h-3 w-2/3 rounded bg-slate-100" />
  </div>
);

const Projects = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useGetProjectsQuery({ page, search: debouncedSearch, limit: 9 });

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
            <FiBriefcase size={12} /> Projects
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1a1f36]">Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <FiPlus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"
        />
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          : data?.projects?.length > 0
            ? data.projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onView={() => navigate(`/app/projects/${project._id}`)}
                />
              ))
            : (
              <div className="col-span-full py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <FiBriefcase size={36} className="text-slate-300" />
                <p className="text-slate-400 font-medium">No projects found.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-[#2e4ed2] font-semibold hover:underline"
                >
                  Create your first project →
                </button>
              </div>
            )
        }
      </div>

      {/* pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {[...Array(data.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-[#1a1f36] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <CreateProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Projects;
