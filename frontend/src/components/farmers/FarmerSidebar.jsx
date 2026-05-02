import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdSettings, 
  MdLogout,
  MdBarChart
} from 'react-icons/md';
import { 
  FaBox, 
  FaClipboardList, 
  FaTractor, 
  FaUserCircle 
} from 'react-icons/fa';
import logoImg from '../../assets/logo_main.png';
import sidebarBg from '../../assets/sidebar_bg.png';

const FarmerSidebar = ({ isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <MdDashboard size={20} />, path: '/farmer/dashboard' },
    { id: 'products', name: 'Products', icon: <FaBox size={18} />, path: '/farmer/products' },
    { id: 'orders', name: 'Orders', icon: <FaClipboardList size={18} />, path: '/farmer/orders' },
    { id: 'statistics', name: 'Statistics', icon: <MdBarChart size={20} />, path: '/farmer/sales' },
    { id: 'farms', name: 'Farms', icon: <FaTractor size={18} />, path: '/farmer/farms' },
  ];

  const bottomItems = [
    { id: 'settings', name: 'Settings', icon: <FaUserCircle size={18} />, path: '/farmer/profile' },
  ];

  const handleLogout = () => {
    // We'll let the TopBar handle the main logout logic or use a global one
    // For now, just navigate home or to login
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`w-60 bg-[#062C1D] text-white flex flex-col h-screen sticky top-0 font-sans overflow-hidden relative transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${sidebarBg})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#062C1D]/90 via-[#062C1D]/30 to-[#062C1D]/90" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div 
          onClick={() => navigate('/')}
          className="p-6 mb-5 flex items-center gap-3 cursor-pointer group/logo"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 group-hover/logo:scale-105 transition-transform">
            <img src={logoImg} alt="AgriSouk" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-normal tracking-tight leading-tight text-white group-hover/logo:text-[#10b981] transition-colors">AgriSouk DZ</h1>
            <p className="text-[10px] text-[#10b981] font-normal uppercase tracking-[0.1em]">Farmer Portal</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative ${isActive(item.path)
                  ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className={`${isActive(item.path) ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-normal text-[13px] whitespace-nowrap">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Secondary Actions - Fixed Bottom */}
        <div className="mt-auto px-3 py-4 space-y-1 border-t border-white/10">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative ${isActive(item.path)
                  ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className={`${isActive(item.path) ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-normal text-[13px] whitespace-nowrap">{item.name}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <MdLogout size={18} className="text-white/60 group-hover:text-red-400" />
            <span className="font-normal text-[13px] whitespace-nowrap">Logout</span>
          </button>
        </div>

        {/* Footer Branding */}
        <div className="p-6 pt-2 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 font-normal leading-relaxed uppercase tracking-widest">
            © 2026 AgriSouk DZ<br />Farmer Management
          </p>
        </div>
      </div>

    </aside>
  );
};

export default FarmerSidebar;
