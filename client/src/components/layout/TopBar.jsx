import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../api/notification.api';
import NotificationDropdown from '../notifications/NotificationDropdown';

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnread(res.data.data.count);
      } catch { }
    };
    if (user) fetchUnread();
  }, [user]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block w-56 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
            )}
          </button>
          {showNotifs && (
            <NotificationDropdown
              onClose={() => setShowNotifs(false)}
              onRead={() => setUnread(prev => Math.max(0, prev - 1))}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-black leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;