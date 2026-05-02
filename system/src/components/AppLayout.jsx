import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-10 flex-shrink-0 shadow-sm">
          {/* Left: hamburger + page title area */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100"
            >
              <FiMenu size={20} />
            </button>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              <FiBell size={19} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200" />

            {/* User pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.plan || 'Free'}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#1a1f36] flex items-center justify-center text-[#a9fd6e] font-bold text-sm flex-shrink-0">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
