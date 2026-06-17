import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navConfig = {
  team_leader: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/projects', label: 'Projects' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/teams', label: 'Teams' },
    { to: '/members', label: 'Members' },
    { to: '/settings', label: 'Settings' },
  ],
  project_manager: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/projects', label: 'My Projects' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/teams', label: 'Teams' },
    { to: '/settings', label: 'Settings' },
  ],
  team_member: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tasks', label: 'My Tasks' },
    { to: '/projects', label: 'My Projects' },
    { to: '/settings', label: 'Settings' },
  ],
  hr: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/members', label: 'Members' },
    { to: '/teams', label: 'Teams' },
    { to: '/settings', label: 'Settings' },
  ],
};

const roleLabels = {
  team_leader: 'Team Leader',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  hr: 'HR',
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navConfig[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        h-full w-[240px] bg-white border-r border-gray-200 flex flex-col
        lg:static lg:translate-x-0 lg:z-auto
        fixed top-0 left-0 z-50
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo — more bottom padding for breathing room */}
        <div className="px-6 pt-8 pb-8 border-b border-gray-100">
          <h1 className="text-xl font-black text-black tracking-tight">Task</h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-semibold mt-1">
            Management
          </p>
        </div>

        <div className="flex-1 px-4 py-8 overflow-y-auto">
  <nav className="flex flex-col gap-4 p-3">
    {navItems.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onClose}
        className={({ isActive }) => `
          flex items-center px-4 py-4 text-base font-medium
          transition-all duration-200
          ${
            isActive
              ? 'bg-black text-white px-6 py-6'
              : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }
        `}
      >
        {label}
      </NavLink>
    ))}
  </nav>
</div>

        {/* User card */}
        <div className="px-4 pb-6">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium mt-0.5">
                  {roleLabels[user?.role] || 'Team Member'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full text-left px-2 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;