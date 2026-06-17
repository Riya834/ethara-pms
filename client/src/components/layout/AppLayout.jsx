import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar — hidden on mobile, visible on desktop as static column */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-[240px]">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Mobile sidebar — overlay only, no space taken in layout */}
      <div className="lg:hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content — takes remaining space naturally */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AppLayout;