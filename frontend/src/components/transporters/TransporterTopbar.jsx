import React, { useState, useEffect, useRef } from 'react';
import {
  MdSearch,
  MdNotificationsNone,
  MdPerson,
  MdClose,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCalendarToday,
  MdEdit,
  MdLogout,
  MdNotifications,
  MdMenu,
  MdKeyboardArrowDown
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TransporterTopbar = ({ searchQuery, onSearchChange, activeTab, onToggleSidebar, isOnline, onToggleOnline }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const accountSidebarRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('users/notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (accountSidebarRef.current && !accountSidebarRef.current.contains(event.target) && !event.target.closest('.account-trigger')) {
        setIsAccountSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.patch(`users/notifications/${notif.id}/mark_read/`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      }
      setIsNotificationsOpen(false);
      if (notif.notification_type === 'delivery') {
        navigate('/transporter/hub');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('users/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Logistics Overview';
      case 'hub': return 'Deliveries Management';
      case 'fleet': return 'Fleet & Vehicles';
      case 'profile': return 'Account Settings';
      default: return 'Transporter Portal';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 sticky top-0 z-30 shadow-sm font-sans">
      <div className="flex items-center gap-5 flex-1">
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 hover:bg-gray-50 rounded-md"
        >
          <MdMenu size={22} />
        </button>

        <div className="relative flex-1 max-w-[400px] group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#008456] transition-colors">
            <MdSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search deliveries, missions, earnings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008456]/20 focus:bg-white focus:border-[#008456] transition-all text-[12px] font-normal"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Go Online Toggle */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={onToggleOnline}
            className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOnline ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-1.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors relative ${isNotificationsOpen ? 'bg-gray-50 text-[#008456]' : ''}`}
          >
            <MdNotificationsNone size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-1 min-w-[15px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center px-0.5 shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2.5 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-zoomIn pb-1">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-gray-800 font-normal text-[14px]">Notifications</h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#008456] font-normal hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start relative ${!notif.is_read ? 'bg-[#f8faf9]' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#fff4cc] flex items-center justify-center flex-shrink-0">
                        <MdNotifications className="text-[#f1b44c]" size={16} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-[12.5px] font-normal text-gray-900 leading-snug pr-4">{notif.title}</p>
                          {!notif.is_read && (
                            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-normal leading-relaxed mb-1 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 text-[11px] font-normal">No notifications yet</div>
                )}
              </div>
              
              <div className="p-2 border-t border-gray-50">
                <button 
                  onClick={() => { setIsNotificationsOpen(false); navigate('/transporter/hub'); }}
                  className="w-full py-1.5 text-[12px] text-gray-600 font-normal hover:bg-gray-50 rounded-lg transition-colors text-center"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>

        {/* Account Trigger */}
        <div
          onClick={() => setIsAccountSidebarOpen(true)}
          className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all group account-trigger"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-normal text-gray-800 leading-none mb-1">Transporter</p>
            <p className="text-[11px] text-gray-500 font-normal leading-none">{user?.wilaya || 'Region'}</p>
          </div>
          
          <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-[#112a1a] shadow-sm overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <MdPerson size={20} />
            )}
          </div>
          
          <MdKeyboardArrowDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Account Sidebar (Drawer) */}
      {isAccountSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity animate-fadeIn" onClick={() => setIsAccountSidebarOpen(false)} />
          <div
            ref={accountSidebarRef}
            className="fixed top-0 right-0 h-full w-[340px] bg-white shadow-2xl z-[101] flex flex-col animate-slideInRight"
          >
            {/* Sidebar Header - Wide & Compact Navy */}
            <div className="bg-[#2d3748] pt-6 pb-4 px-5 text-center relative">
              <button
                onClick={() => setIsAccountSidebarOpen(false)}
                className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1"
              >
                <MdClose size={18} />
              </button>
              
              <div className="w-14 h-14 mx-auto bg-white rounded-full border-[3px] border-white/10 overflow-hidden mb-2 shadow-xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2d3748] bg-gray-100">
                    <MdPerson size={28} />
                  </div>
                )}
              </div>
              <h2 className="text-white text-base font-normal mb-1.5">{user?.name || 'User Name'}</h2>
              <div className="w-4 h-[1.5px] bg-[#10b981] mx-auto rounded-full"></div>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 px-5 py-4 overflow-y-auto custom-scrollbar">
              <h3 className="text-gray-800 text-[13.5px] font-normal mb-4">My Account</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2.5">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                    <MdEmail size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[7.5px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-[11.5px] text-gray-700 font-normal truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-100 pb-2.5">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                    <MdPhone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[7.5px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="text-[11.5px] text-gray-700 font-normal">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-100 pb-2.5">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                    <MdLocationOn size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[7.5px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Region</p>
                    <p className="text-[11.5px] text-gray-700 font-normal">{user?.wilaya || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                    <MdCalendarToday size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[7.5px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Member Since</p>
                    <p className="text-[11.5px] text-gray-700 font-normal">
                      {user?.created_at ? new Date(user.created_at).getFullYear() : '2026'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => { setIsAccountSidebarOpen(false); navigate('/transporter/profile'); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1f2937] text-white rounded-lg text-[12px] font-normal hover:bg-[#111827] transition-all shadow-md group"
                >
                  <MdEdit size={14} />
                  Edit My Information
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-red-200 text-red-500 rounded-lg text-[12px] font-normal hover:bg-red-50 transition-all shadow-sm group"
                >
                  <MdLogout size={14} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-slideInRight { animation: slideInRight 0.35s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}} />
    </header>
  );
};

export default TransporterTopbar;
