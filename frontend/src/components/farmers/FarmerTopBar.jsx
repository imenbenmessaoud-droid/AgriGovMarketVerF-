import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaBell, 
  FaUserCircle, 
  FaTimes, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaEdit, 
  FaSignOutAlt,
  FaBox,
  FaSignInAlt
} from 'react-icons/fa';
import { HiMenuAlt2 } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FarmerTopBar = ({ searchQuery, onSearchChange, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isLoggedIn, logout } = useAuth();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const notificationsRef = useRef(null);
  const sidebarRef = useRef(null);

  // Reusing logic from Header.jsx
  const fetchNotifications = async () => {
    try {
      const response = await api.get('users/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.user-icon-button')) {
        setIsSidebarOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) && !event.target.closest('.notification-button')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.patch(`users/notifications/${notif.id}/mark_read/`);
        fetchNotifications();
      }
      setIsNotificationsOpen(false);
      if (notif.notification_type === 'order') {
        navigate('/farmer/orders');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('users/notifications/mark_all_read/');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsSidebarOpen(false);
    navigate('/farmer/profile');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const userProfile = authUser || {
    name: 'Farmer Constantine',
    role: 'Verified Partner',
    email: 'farmer@agrisouk.dz',
    phone: '+213 550 12 34 56',
    wilaya: '25 - Constantine',
    memberSince: '2024',
    avatar: null
  };

  const userInitials = userProfile.name.charAt(0) + (userProfile.name.split(' ')[1]?.charAt(0) || '');

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 ml-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <HiMenuAlt2 size={22} />
        </button>

        <div className="flex-1 relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, orders, customers..."
            className="w-full h-10 pl-5 pr-12 bg-gray-50/50 text-gray-800 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600/20 focus:bg-white transition-all placeholder:text-gray-400 text-sm font-normal"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <FaSearch className="text-gray-300 group-focus-within:text-green-600 transition-colors" size={14} />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors relative group notification-button text-gray-500"
          >
            <FaBell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white font-medium shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown - Exact same as Header.jsx */}
          {isNotificationsOpen && (
            <div
              ref={notificationsRef}
              className="absolute top-full right-0 mt-4 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-zoomIn"
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-gray-800 font-normal text-sm">Notifications</h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-green-600 font-normal hover:text-green-700 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-green-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notif.notification_type === 'delivery' ? 'bg-blue-100 text-blue-600' :
                          notif.notification_type === 'registration' ? 'bg-green-100 text-green-600' :
                          notif.notification_type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                          notif.notification_type === 'status' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {notif.notification_type === 'delivery' ? <FaBox size={14} /> :
                            notif.notification_type === 'registration' ? <FaUserCircle size={14} /> :
                              notif.notification_type === 'order' ? <FaBox size={14} /> :
                                notif.notification_type === 'status' ? <FaBox size={14} /> : <FaBell size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-normal text-gray-800">{notif.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1.5 block">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.is_read && <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0 shadow-sm shadow-green-200"></div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaBell className="text-gray-300" size={20} />
                    </div>
                    <p className="text-gray-400 text-xs">No notifications yet</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button
                  onClick={() => navigate('/farmer/dashboard')}
                  className="text-[11px] text-gray-600 font-normal hover:text-gray-800 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile/Account Section */}
        <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-gray-200 user-icon-button" onClick={() => setIsSidebarOpen(true)}>
          <div className="flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-medium text-gray-900 leading-tight">Farmer</p>
            <p className="text-xs text-gray-500">{userProfile.wilaya.split('-')[1]?.trim() || userProfile.wilaya}</p>
          </div>
          <div className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white text-sm font-normal shadow-sm overflow-hidden">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Account Sidebar Drawer - Exact same as Header.jsx */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[300] transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div
            ref={sidebarRef}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[301] flex flex-col animate-slideInRight overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6 text-center relative">
              {isLoggedIn ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 ring-3 ring-white/30 overflow-hidden">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <FaUserCircle className="text-white text-3xl" />
                    )}
                  </div>
                  <h2 className="text-base font-normal text-white">{userProfile.name}</h2>
                  <div className="inline-flex px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-[9px] font-normal mt-1 uppercase tracking-wider">
                    {userProfile.role}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <FaUserCircle className="text-white/40 text-4xl" />
                  </div>
                  <h2 className="text-white font-normal mb-4">Welcome to AgriSouk</h2>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-gray-800 px-8 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <FaSignInAlt size={14} />
                    Sign In
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Informations du compte */}
            <div className="flex-1 py-5 px-5">
              {isLoggedIn && (
                <>
                  <h3 className="text-base font-normal text-gray-800 mb-4">My Account</h3>

                  <div className="space-y-3">
                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Email</p>
                          <p className="text-sm text-gray-800">{userProfile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaPhoneAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Phone</p>
                          <p className="text-sm text-gray-800">{userProfile.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaMapMarkerAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Region</p>
                          <p className="text-sm text-gray-800">{userProfile.wilaya || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaCalendarAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Member Since</p>
                          <p className="text-sm text-gray-800">
                            {userProfile.created_at
                              ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric' })
                              : userProfile.memberSince}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center justify-center gap-2 w-full px-5 py-2 bg-gray-800 text-white rounded-xl text-xs font-normal hover:bg-gray-700 transition-all duration-300"
                    >
                      <FaEdit size={12} />
                      Edit My Information
                    </button>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-5 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-normal hover:bg-red-50 transition-all duration-300"
                    >
                      <FaSignOutAlt size={12} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}} />
    </header>
  );
};

export default FarmerTopBar;
