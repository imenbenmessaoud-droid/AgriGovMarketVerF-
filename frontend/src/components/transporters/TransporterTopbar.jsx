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

const TransporterTopbar = ({ searchQuery, onSearchChange, activeTab, onToggleSidebar }) => {
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
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-1.5 text-gray-500 hover:bg-gray-50 rounded-md transition-colors relative ${isNotificationsOpen ? 'bg-gray-50 text-[#008456]' : ''}`}
          >
            <MdNotificationsNone size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-2xl overflow-hidden z-50 animate-zoomIn pb-1">
              <div className="p-3 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-gray-700 font-normal text-sm">Notifications</h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-[#008456] font-normal hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-2.5 items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#fff4cc] flex items-center justify-center flex-shrink-0">
                        <MdNotifications className="text-[#f1b44c]" size={18} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-[13px] font-normal text-gray-800 leading-tight pr-2 truncate">{notif.title}</p>
                          {!notif.is_read && <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full mt-1 flex-shrink-0"></div>}
                        </div>
                        <p className="text-[11px] text-gray-500 font-normal leading-tight line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block font-normal">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 text-[11px] font-normal">No notifications yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>

        {/* Account Trigger */}
        <div
          onClick={() => setIsAccountSidebarOpen(true)}
          className="flex items-center gap-2.5 pl-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors group account-trigger"
        >
          <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[#112a1a] shadow-sm overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <MdPerson size={18} />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-normal text-[#112a1a] leading-none mb-0.5">{user?.name || 'Transporter'}</p>
            <p className="text-[9px] text-gray-500 font-normal leading-none">Logistics Partner</p>
          </div>
          <MdKeyboardArrowDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Account Sidebar (Drawer) */}
      {isAccountSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[100] transition-opacity animate-fadeIn" onClick={() => setIsAccountSidebarOpen(false)} />
          <div
            ref={accountSidebarRef}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-[101] flex flex-col animate-slideInRight"
          >
            {/* Sidebar Header */}
            <div className="bg-[#343a40] pt-7 pb-5 px-4 text-center relative">
              <button
                onClick={() => setIsAccountSidebarOpen(false)}
                className="absolute top-2.5 right-2.5 text-white/70 hover:text-white transition-colors"
              >
                <MdClose size={18} />
              </button>
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full border-2 border-white/10 overflow-hidden mb-2.5 shadow-lg">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#343a40] bg-gray-100">
                    <MdPerson size={32} />
                  </div>
                )}
              </div>
              <h2 className="text-white text-[15px] font-normal mb-0.5">{user?.name || 'User Name'}</h2>
              <div className="w-5 h-[1.5px] bg-[#10b981] mx-auto opacity-70"></div>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
              <h3 className="text-gray-700 text-[13px] font-normal mb-1">My Account</h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 group border-b border-gray-50 pb-2.5">
                  <MdEmail size={15} className="text-gray-400" />
                  <div className="overflow-hidden">
                    <p className="text-[8px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-[11.5px] text-gray-800 font-normal truncate max-w-[150px]">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group border-b border-gray-50 pb-2.5">
                  <MdPhone size={15} className="text-gray-400" />
                  <div>
                    <p className="text-[8px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="text-[11.5px] text-gray-800 font-normal">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group border-b border-gray-50 pb-2.5">
                  <MdLocationOn size={15} className="text-gray-400" />
                  <div>
                    <p className="text-[8px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Region</p>
                    <p className="text-[11.5px] text-gray-800 font-normal">{user?.wilaya || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <MdCalendarToday size={14} className="text-gray-400" />
                  <div>
                    <p className="text-[8px] text-gray-400 font-normal uppercase tracking-widest mb-0.5">Member Since</p>
                    <p className="text-[11.5px] text-gray-800 font-normal">
                      {user?.created_at ? new Date(user.created_at).getFullYear() : '2026'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setIsAccountSidebarOpen(false); navigate('/transporter/profile'); }}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#23272b] text-white rounded-lg text-[12px] font-normal hover:bg-[#1a1e21] transition-all shadow-sm"
                >
                  <MdEdit size={14} />
                  Edit My Information
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-red-100 text-red-500 rounded-lg text-[12px] font-normal hover:bg-red-50 transition-all"
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
