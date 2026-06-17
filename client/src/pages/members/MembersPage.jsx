import { useState, useEffect } from 'react';
import { getUsers } from '../../api/user.api';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColors = {
  team_leader: 'bg-yellow-100 text-yellow-700',
  project_manager: 'bg-blue-100 text-blue-700',
  team_member: 'bg-green-100 text-green-700',
  hr: 'bg-pink-100 text-pink-700',
};

const MembersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getUsers({ search, limit: 50 });
        setUsers(res.data.data || []);
      } catch { toast.error('Failed to load members'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search]);

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Members</h1>
          <p className="text-sm text-gray-400 mt-1">All people in your organization.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search members..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-24 text-center">
          <p className="text-base font-semibold text-black">No members found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map(u => (
            <div key={u._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white text-base font-bold">
                    {u.avatar
                      ? <img src={u.avatar} alt={u.name} className="w-full h-full rounded-xl object-cover" />
                      : u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${u.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${roleColors[u.role]}`}>
                  {u.role?.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-black">{u.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{u.email}</p>

              {u.department && (
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-3 pt-3 border-t border-gray-100">
                  {u.department}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;