import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getProjectStats, addMembers, removeMember } from '../../api/project.api';
import { getTeams } from '../../api/team.api';
import { getTasks, createTask, updateTaskStatus } from '../../api/task.api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Plus, Loader2, Users, CheckSquare, X, Clock, TrendingUp, Calendar, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusCols = [
  { id: 'todo', label: 'To Do', color: 'border-slate-500' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'review', label: 'Review', color: 'border-yellow-500' },
  { id: 'done', label: 'Done', color: 'border-emerald-500' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-500' },
];

const priorityColors = { low: 'text-slate-400', medium: 'text-blue-400', high: 'text-yellow-400', critical: 'text-red-400' };

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-[#1e1e35] border border-white/5 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-indigo-500/40 transition-all hover:bg-white/[0.02] shadow-sm group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-white font-bold leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">{task.title}</p>
        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${priorityColors[task.priority]} bg-white/5 border border-white/5`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                {task.assignee.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate max-w-[80px]">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Unassigned</span>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-tight">{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanColumn = ({ status, tasks, color }) => {
  return (
    <div className={`flex-shrink-0 w-80 bg-[#16162a]/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col h-full min-h-[600px]`}>
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color.replace('border-', 'bg-')} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{statusCols.find(s => s.id === status)?.label}</h3>
        </div>
        <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-500">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {tasks.map(task => <TaskCard key={task._id} task={task} />)}
          {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Plus className="w-4 h-4 opacity-20" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Empty Sector</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '', assignee: '' });
  const [creating, setCreating] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showAssignTeam, setShowAssignTeam] = useState(false);

  const canManage = ['team_leader', 'project_manager'].includes(user?.role);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pRes, tRes, sRes, tmRes] = await Promise.all([
          getProjectById(id),
          getTasks({ projectId: id, limit: 100 }),
          getProjectStats(id),
          getTeams()
        ]);
        setProject(pRes.data.data);
        setTasks(tRes.data.data || []);
        setStats(sRes.data.data);
        setTeams(tmRes.data.data || []);
      } catch { toast.error('Failed to load project'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const targetStatus = statusCols.find(s => over.id === s.id || tasks.find(t => t._id === over.id && t.status === s.id))?.id;
    if (!targetStatus || targetStatus === task.status) return;
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));
    try {
      await updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      toast.error('Failed to update status');
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const payload = { ...newTask, projectId: id };
      if (payload.assignee) payload.assigneeId = payload.assignee;
      const res = await createTask(payload);
      setTasks(prev => [...prev, res.data.data]);
      setNewTask({ title: '', priority: 'medium', dueDate: '', assignee: '' });
      setShowTaskForm(false);
      toast.success('Task created');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleAssignTeam = async (teamId) => {
    if (!teamId) return;
    try {
      const selectedTeam = teams.find(t => t._id === teamId);
      if (!selectedTeam) return;
      const newMembers = [];
      if (selectedTeam.lead && !project.members?.find(m => m.user?._id === selectedTeam.lead._id)) {
        newMembers.push({ userId: selectedTeam.lead._id, role: 'team_leader' });
      }
      (selectedTeam.members || []).forEach(tm => {
        if (!project.members?.find(m => m.user?._id === tm._id)) {
          newMembers.push({ userId: tm._id, role: 'team_member' });
        }
      });
      if (newMembers.length === 0) {
        toast.error('Team already assigned');
        setShowAssignTeam(false);
        return;
      }
      const res = await addMembers(id, newMembers);
      setProject(res.data.data);
      setShowAssignTeam(false);
      toast.success('Team synchronized!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove member?')) return;
    try {
      await removeMember(id, userId);
      setProject(prev => ({ ...prev, members: prev.members.filter(m => m.user?._id !== userId) }));
      toast.success('Member removed');
    } catch (err) { toast.error('Failed to remove'); }
  };

  const statusColors = {
    planning: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    on_hold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    completed: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    archived: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  };

  if (loading) return (
    <div className="animate-pulse space-y-10">
      <div className="h-20 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[...Array(3)].map((_, i) => <div key={i} className="w-80 h-[600px] bg-white/5 rounded-3xl flex-shrink-0" />)}
      </div>
    </div>
  );

  if (!project) return <div className="text-slate-400">Project not found.</div>;

  const tasksByStatus = {};
  statusCols.forEach(s => { tasksByStatus[s.id] = tasks.filter(t => t.status === s.id); });

  return (
    <div className="space-y-10 max-w-[1600px]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-8 border-b border-white/[0.03]">
        <div className="flex items-center gap-6">
          <Link to="/projects" className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-2xl text-white font-black shadow-2xl shadow-indigo-500/20">
            {project.title?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{project.title}</h1>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${statusColors[project.status]}`}>
                {project.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <TrendingUp className="w-4 h-4" />
                <span>{project.progress || 0}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
              <Plus className="w-5 h-5" /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      {showTaskForm && (
        <div className="premium-card p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Task Objective</label>
              <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Describe the task..."
                className="w-full bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Assignee</label>
              <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                className="w-full bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50">
                <option value="" className="bg-[#16162a]">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m.user?._id} value={m.user?._id} className="bg-[#16162a]">{m.user?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating}
                className="flex-1 bg-white text-black hover:bg-slate-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                {creating ? 'Deploying...' : 'Deploy'}
              </button>
              <button type="button" onClick={() => setShowTaskForm(false)}
                className="px-4 py-3 bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pipeline Tasks', val: tasks.length, color: 'text-indigo-400' },
          { label: 'Completed', val: tasks.filter(t => t.status === 'done').length, color: 'text-emerald-400' },
          { label: 'In Progress', val: tasks.filter(t => t.status === 'in_progress').length, color: 'text-blue-400' },
          { label: 'Blocked', val: tasks.filter(t => t.status === 'blocked').length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="premium-card p-6 border-l-2 border-l-transparent hover:border-l-indigo-500/50 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Project Pipeline</h2>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board View</span>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-8 scrollbar-hide">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex gap-8" style={{ minWidth: 'max-content' }}>
              {statusCols.map(col => (
                <KanbanColumn key={col.id} status={col.id} tasks={tasksByStatus[col.id] || []} color={col.color} />
              ))}
            </div>
          </DndContext>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Operational Squad</h2>
          </div>
          {canManage && (
            <button onClick={() => setShowAssignTeam(!showAssignTeam)}
              className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all">
              + Assign Team
            </button>
          )}
        </div>

        {showAssignTeam && (
          <div className="premium-card p-4 flex gap-4 max-w-md animate-in fade-in slide-in-from-top-2 border-indigo-500/30">
            <select 
              className="flex-1 bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              onChange={(e) => handleAssignTeam(e.target.value)}
              value=""
            >
              <option value="" disabled>Select Squad Formation...</option>
              {teams.map(t => (
                <option key={t._id} value={t._id} className="bg-[#16162a]">{t.name}</option>
              ))}
            </select>
            <button onClick={() => setShowAssignTeam(false)} className="p-2.5 text-slate-500 hover:text-white bg-white/5 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {(project.members || []).map((m, i) => (
            <div key={i} className="premium-card p-5 group flex items-center justify-between hover:bg-indigo-500/[0.03]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-xs text-white font-black shadow-lg shadow-indigo-500/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {m.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{m.user?.name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{m.role?.replace('_', ' ')}</p>
                </div>
              </div>
              {canManage && m.user?._id !== project.owner?._id && (
                <button onClick={() => handleRemoveMember(m.user?._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
