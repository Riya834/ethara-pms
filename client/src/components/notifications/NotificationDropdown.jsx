import { useState, useEffect, useRef } from 'react';
import { getNotifications, markRead, markAllRead } from '../../api/notification.api';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose, onRead }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications({ limit: 10 });
        setNotifs(res.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchNotifs();

    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      onRead?.();
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const typeColors = {
    task_assigned: 'bg-indigo-500',
    task_overdue: 'bg-red-500',
    project_invite: 'bg-emerald-500',
    comment_mention: 'bg-purple-500',
  };

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 bg-[#1e1e35] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="font-semibold text-white text-sm">Notifications</h3>
        <button onClick={handleMarkAll} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <CheckCheck className="w-3 h-3" /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No notifications</div>
        ) : (
          notifs.map(n => (
            <div key={n._id}
              className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColors[n.type] || 'bg-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
