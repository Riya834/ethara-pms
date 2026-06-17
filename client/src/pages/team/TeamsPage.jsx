import { useState, useEffect } from 'react';
import { getTeams, createTeam, deleteTeam, addTeamMembers, removeTeamMember } from '../../api/team.api';
import { getUsers } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Trash2, Loader2, Building2, UserPlus, X, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', department: '' });
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const canManage = ['team_leader', 'hr'].includes(user?.role);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [teamsRes, usersRes] = await Promise.all([getTeams(), getUsers()]);
        setTeams(teamsRes.data.data || []);
        setUsers(usersRes.data.data || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Team name is required'); return; }
    setCreating(true);
    try {
      const res = await createTeam({ name: form.name, department: form.department, leadId: user._id, memberIds: [] });
      setTeams(prev => [...prev, res.data.data]);
      setForm({ name: '', department: '' });
      setShowForm(false);
      toast.success('Team created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    try {
      await deleteTeam(id);
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('Team deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddMember = async (teamId, userId) => {
    if (!userId) return;
    try {
      const res = await addTeamMembers(teamId, [userId]);
      setTeams(prev => prev.map(t => t._id === teamId ? res.data.data : t));
      setActiveTeamId(null);
      toast.success('Member added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!confirm('Remove member?')) return;
    try {
      const res = await removeTeamMember(teamId, userId);
      setTeams(prev => prev.map(t => t._id === teamId ? res.data.data : t));
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return (
    <div className="animate-pulse space-y-10 max-w-[1400px]">
      <div className="h-20 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-8 border-b border-white/[0.03]">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Operational <span className="gradient-text">Squads</span></h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Scale your organizational capacity</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
            <Plus className="w-5 h-5" /> Assemble Squad
          </button>
        )}
      </div>

      {/* Assemble Form */}
      {showForm && (
        <div className="premium-card p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Squad Formation Protocol</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Squad Designation</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. ALPHA_FORCE"
                className="w-full bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Department Sector</label>
              <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. OPERATIONS"
                className="w-full bg-[#0b0b18] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating}
                className="flex-1 bg-white text-black py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                {creating ? 'Assembling...' : 'Assemble'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-3.5 bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="premium-card py-32 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
            <Users className="w-10 h-10 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-widest">No Active Squads</h3>
            <p className="text-slate-500 font-medium text-sm max-w-xs">Initialize your first squad to begin collaborative operations.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {teams.map(team => (
            <div key={team._id} className="premium-card p-8 group relative flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-white/[0.03] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{team.name}</h3>
                    {team.department && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{team.department}</p>}
                  </div>
                </div>
                {canManage && user?.role === 'team_leader' && (
                  <button onClick={() => handleDelete(team._id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {team.lead && (
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.03] mb-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Command Lead</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">
                      {team.lead.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-tight">{team.lead.name}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{team.members?.length || 0} Operators Active</span>
                  </div>
                  {canManage && (
                    <button onClick={() => setActiveTeamId(activeTeamId === team._id ? null : team._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTeamId === team._id ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                      {activeTeamId === team._id ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} Add Member
                    </button>
                  )}
                </div>

                {activeTeamId === team._id && (
                  <div className="premium-card p-4 bg-[#0b0b18] border-indigo-500/30 flex gap-3 animate-in slide-in-from-top-2 duration-300">
                    <select 
                      className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.4)\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px' }}
                      onChange={(e) => handleAddMember(team._id, e.target.value)}
                      value=""
                    >
                      <option value="" disabled className="bg-[#16162a]">Select Candidate...</option>
                      {users
                        .filter(u => !team.members?.find(m => m._id === u._id) && u._id !== team.lead?._id)
                        .map(u => (
                          <option key={u._id} value={u._id} className="bg-[#16162a]">{u.name} [{u.role?.toUpperCase()}]</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                {(team.members || []).map((m) => (
                  <div key={m._id} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-3 group/member hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 font-black flex-shrink-0 group-hover/member:bg-purple-500 group-hover/member:text-white transition-all duration-300">
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 truncate tracking-tight">{m.name}</span>
                    </div>
                    {canManage && (
                      <button onClick={() => handleRemoveMember(team._id, m._id)} 
                        className="opacity-0 group-hover/member:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {(!team.members || team.members.length === 0) && (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Awaiting Recruitment</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
