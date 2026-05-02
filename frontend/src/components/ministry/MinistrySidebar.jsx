import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdSettings,
  MdLogout,
  MdBarChart,
  MdPeople,
  MdCategory,
  MdAttachMoney,
  MdAssessment
} from 'react-icons/md';
import logoImg from '../../assets/logo_main.png';
import sidebarBg from '../../assets/sidebar_white_bg.png';
import { useAuth } from '../../context/AuthContext';

const MinistrySidebar = ({ isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'stats', name: 'Market stats', icon: <MdBarChart size={20} />, path: '/ministry' },
    { id: 'users', name: 'Users', icon: <MdPeople size={18} />, path: '/ministry/users' },
    { id: 'categories', name: 'Categories', icon: <MdCategory size={18} />, path: '/ministry/categories' },
    { id: 'prices', name: 'Prices', icon: <MdAttachMoney size={20} />, path: '/ministry/prices' },
    { id: 'reports', name: 'Reports', icon: <MdAssessment size={18} />, path: '/ministry/reports' },
  ];

  const bottomItems = [
    { id: 'settings', name: 'Settings', icon: <MdSettings size={18} />, path: '/ministry/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/ministry') {
      return location.pathname === '/ministry' || location.pathname === '/ministry/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`bg-gray-900 text-white flex flex-col h-screen sticky top-0 font-sans transition-all duration-300 ease-in-out ${isVisible ? 'w-60 border-r border-white/10' : 'w-0'} overflow-hidden relative`}>
      <div className="w-60 flex flex-col h-full shrink-0">
        <div
          className="absolute inset-0 z-0 opacity-100 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        />

        {/* Subtle overlay only if needed, but user said "no shadow", so I'll use a very light tint to ensure text pops */}
        <div className="absolute inset-0 z-0 bg-black/20" />

        <div className="relative z-10 flex flex-col h-full">
          <div
            onClick={() => navigate('/')}
            className="p-6 mb-2 flex items-center gap-3 cursor-pointer group/logo"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 group-hover/logo:scale-105 transition-all shadow-md border border-gray-100">
              <img src={logoImg} alt="AgriSouk" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-normal tracking-tight leading-tight text-white group-hover/logo:text-blue-200 transition-colors">AgriSouk DZ</h1>
              <p className="text-[10px] text-white font-normal uppercase tracking-[0.05em]">Ministry Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${isActive(item.path)
                  ? 'bg-white/20 backdrop-blur-md text-white font-normal border border-white/20 shadow-lg'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-white">
                  {item.icon}
                </span>
                <span className="text-[13px] font-normal whitespace-nowrap text-white">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto px-3 py-4 space-y-0.5 border-t border-white/10">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${isActive(item.path)
                  ? 'bg-white/20 backdrop-blur-md text-white font-normal border border-white/20 shadow-lg'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-white">
                  {item.icon}
                </span>
                <span className="text-[13px] font-normal whitespace-nowrap text-white">{item.name}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:text-red-300 hover:bg-red-500/20 transition-all duration-200 group"
            >
              <span className="text-white group-hover:text-red-300">
                <MdLogout size={18} />
              </span>
              <span className="text-[13px] font-normal whitespace-nowrap text-white">Log out</span>
            </button>
          </div>

          <div className="p-6 pt-2 border-t border-white/10 text-center">
            <p className="text-[9px] text-white font-normal leading-relaxed uppercase tracking-widest opacity-80">
              © 2026 AgriSouk DZ<br />Ministry Oversight
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MinistrySidebar;
