import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, archiveProject } from '../../api/project.api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, FolderKanban, Calendar, Archive } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusConfig = {
  planning: { color: 'bg-gray-100 text-gray-500', label: 'Planning' },
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  on_hold: { color: 'bg-yellow-100 text-yellow-700', label: 'On Hold' },
  completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
  archived: { color: 'bg-gray-100 text-gray-400', label: 'Archived' },
};

const priorityConfig = {
  low: { color: 'text-gray-400', label: 'Low' },
  medium: { color: 'text-blue-500', label: 'Medium' },
  high: { color: 'text-yellow-600', label: 'High' },
  critical: { color: 'text-red-500', label: 'Critical' },
};

const ProjectsListPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const canCreate = ['team_leader', 'project_manager'].includes(user?.role);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getProjects(params);
      setProjects(res.data.data || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [search, statusFilter]);

  const handleArchive = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Archive this project?')) return;
    try {
      await archiveProject(id);
      toast.success('Project archived');
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-[1400px] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">All your active and planned projects.</p>
        </div>
        {canCreate && (
          <Link to="/projects/new"
            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:border-gray-400 transition-colors">
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-24 text-center">
          <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-black">No projects found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {canCreate ? 'Create your first project to get started.' : 'You have no projects assigned yet.'}
          </p>
          {canCreate && (
            <Link to="/projects/new"
              className="mt-6 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => {
            const sc = statusConfig[p.status] || statusConfig.planning;
            const pc = priorityConfig[p.priority] || priorityConfig.medium;
            return (
              <Link key={p._id} to={`/projects/${p._id}`}
                className="bg-white border border-gray-200 rounded-xl p-6 group hover:border-gray-300 hover:shadow-sm transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${sc.color}`}>
                    {sc.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${pc.color}`}>{pc.label}</span>
                    {user?.role === 'team_leader' && !p.isArchived && (
                      <button onClick={(e) => handleArchive(e, p._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-black mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-5 flex-1">
                  {p.description || 'No description provided.'}
                </p>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Progress</span>
                    <span className="text-xs font-semibold text-black">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-black transition-all duration-500"
                      style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">
                      {p.deadline ? format(new Date(p.deadline), 'MMM d, yyyy') : 'No deadline'}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {(p.members || []).slice(0, 3).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg bg-black border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {p.members?.length > 3 && (
                      <div className="w-7 h-7 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                        +{p.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;