import { useState, useEffect } from 'react';
import { getMyTasks, updateTaskStatus } from '../../api/task.api';
import { Link } from 'react-router-dom';
import { CheckSquare, Circle, Clock, AlertTriangle, Loader2, Calendar, FolderKanban } from 'lucide-react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = {
  todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const priorityColors = { low: 'text-slate-400', medium: 'text-blue-400', high: 'text-yellow-400', critical: 'text-red-400' };

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyTasks();
        setTasks(res.data.data || []);
      } catch { toast.error('Failed to load tasks'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTask = tasks.find(t => t._id === taskId);
    const originalStatus = originalTask?.status;
    
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: originalStatus } : t));
    }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    if (filter === 'active') return ['todo', 'in_progress', 'review', 'blocked'].includes(t.status);
    return true;
  });

  const counts = {
    all: tasks.length,
    active: tasks.filter(t => t.status !== 'done').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done').length,
  };

  return (
    <div className="max-w-[1000px] space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Tasks</h1>
        <p className="text-slate-500 font-medium text-sm tracking-wide">Manage your individual mission objectives and system status.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#16162a]/60 border border-white/5 rounded-2xl w-fit shadow-inner">
        {[
          { key: 'all', label: 'All Operations', icon: Circle },
          { key: 'active', label: 'Active', icon: Clock },
          { key: 'done', label: 'Completed', icon: CheckSquare },
          { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all duration-300 ${filter === key ? 'bg-gray-600 px-3.5 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-md font-black ${filter === key ? 'bg-gray-600 text-white' : 'bg-white/10 text-slate-500'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-[24px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#16162a]/40 border border-white/5 rounded-[32px] py-32 text-center shadow-2xl">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckSquare className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">All systems green!</h3>
          <p className="text-slate-500 mt-3 font-medium text-sm">No tasks currently require your attention in this sector.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} className={`premium-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all hover:scale-[1.01] ${isOverdue ? 'border-red-500/20 bg-red-500/[0.02]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-white/5 border border-white/5 ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Priority Hazard
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{task.title}</h3>
                  {task.project && (
                    <div className="flex items-center gap-3 mt-4 text-slate-500">
                      <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <FolderKanban className="w-3 h-3 text-indigo-400" />
                      </div>
                      <Link to={`/projects/${task.project._id}`} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
                        {task.project.title}
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-10 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/[0.03]">
                  {task.dueDate && (
                    <div className={`flex flex-col items-end gap-1.5 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">System Deadline</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[13px] font-black tracking-tight">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  )}
                  <div className="relative flex-1 md:flex-initial">
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                      className="w-full md:w-44 bg-[#1e1e35] border border-white/10 rounded-[16px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer shadow-2xl shadow-black/40 hover:bg-[#252540] transition-colors"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.4)\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '44px' }}
                    >
                      {['todo','in_progress','review','done','blocked'].map(s => (
                        <option key={s} value={s} className="bg-[#16162a]">{s.replace('_',' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
