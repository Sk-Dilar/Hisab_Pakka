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

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();

  const navItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/app/dashboard' },
    { name: 'Clients', icon: <FiUsers />, path: '/app/clients' },
    { name: 'Projects', icon: <FiBriefcase />, path: '/app/projects' },
    { name: 'Invoices', icon: <FiFileText />, path: '/app/invoices' },
    { name: 'Payments', icon: <FiDollarSign />, path: '/app/payments' },
    { name: 'Settings', icon: <FiSettings />, path: '/app/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hisab Pakka Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-primary">Hisab Pakka</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
            <FiX size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
