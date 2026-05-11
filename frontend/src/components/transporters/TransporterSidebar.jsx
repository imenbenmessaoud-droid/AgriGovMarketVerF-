import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdLocalShipping,
  MdAssignment,
  MdSettings,
  MdLogout,
  MdAttachMoney,
  MdChatBubbleOutline,
  MdBarChart,
  MdHeadsetMic
} from 'react-icons/md';
import { FaComments } from 'react-icons/fa';
import logoImg from '../../assets/logo_main.png';

const TransporterSidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: <MdDashboard size={18} /> },
    { id: 'hub', name: 'Deliveries', icon: <MdAssignment size={18} /> },
    { id: 'fleet', name: 'Fleet', icon: <MdLocalShipping size={18} /> },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="hidden md:flex w-56 bg-[#0f172a] text-white flex-col h-screen sticky top-0 shadow-2xl border-r border-white/5 font-sans transition-all duration-300 overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?q=80&w=2000&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f172a]/70 via-[#0f172a]/50 to-[#0f172a]/90" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section - Clickable as requested */}
        <div
          onClick={() => navigate('/')}
          className="p-5 flex items-center gap-2.5 cursor-pointer hover:bg-white/5 transition-colors group/logo"
        >
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 group-hover/logo:scale-105 transition-transform">
            <img src={logoImg} alt="AgriSouk" className="w-5 h-5 object-contain" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-normal tracking-tight leading-tight text-white truncate group-hover/logo:text-[#10b981] transition-colors">AgriSouk DZ</h1>
            <p className="text-[9px] text-[#10b981] font-normal uppercase tracking-[0.05em] truncate">Transporter Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-2.5 overflow-y-auto custom-scrollbar pt-2 space-y-6">
          {/* Primary Nav */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative ${activeTab === item.id
                  ? 'bg-transparent text-white border border-white/40 shadow-sm font-normal'
                  : 'text-white/60 hover:text-white hover:bg-white/5 font-normal'
                  }`}
              >
                <span className={`${activeTab === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="text-[13.5px]">{item.name}</span>
              </button>
            ))}


          </nav>
        </div>

        {/* Bottom Section - Fixed */}
        <div className="mt-auto px-2.5 py-4 space-y-1 border-t border-white/10">
          <button
            onClick={() => onTabChange('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group ${activeTab === 'profile'
              ? 'bg-transparent text-white border border-white/40 shadow-sm font-normal'
              : 'text-white/60 hover:text-white hover:bg-white/5 font-normal'
              }`}
          >
            <MdSettings size={18} className={`${activeTab === 'profile' ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
            <span className="text-[13.5px]">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <MdLogout size={18} className="group-hover:text-red-400 transition-colors" />
            <span className="text-[13.5px]">Logout</span>
          </button>
        </div>

        {/* Footer Branding */}
        <div className="p-4 pt-2 border-t border-white/5 text-center">
          <p className="text-[8px] text-white/20 font-normal leading-relaxed uppercase tracking-widest">
            © 2026 AgriSouk DZ<br />Logistics Management
          </p>
        </div>
      </div>
    </aside>
  );
};

export default TransporterSidebar;
