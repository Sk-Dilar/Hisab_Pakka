import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiDollarSign, 
  FiLogOut,
  FiX,
  FiSettings
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/HIsab_logo.png';

const navItems = [
  { name: 'Dashboard', icon: FiHome, path: '/app/dashboard' },
  { name: 'Clients',   icon: FiUsers,     path: '/app/clients' },
  { name: 'Projects',  icon: FiBriefcase, path: '/app/projects' },
  { name: 'Invoices',  icon: FiFileText,  path: '/app/invoices' },
  { name: 'Payments',  icon: FiDollarSign,path: '/app/payments' },
  { name: 'Settings',  icon: FiSettings,  path: '/app/settings' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-[#1a1f36] shadow-sidebar
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#a9fd6e] flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="Hisab Pakka" className="h-5 w-auto" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Hisab Pakka</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">
            Main Menu
          </p>
          {navItems.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-[#a9fd6e] text-[#1a1f36] font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#1a1f36]' : 'text-white/50 group-hover:text-white'}
                  />
                  {name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
