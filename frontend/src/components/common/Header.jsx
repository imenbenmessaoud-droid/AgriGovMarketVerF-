import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaBell, FaShoppingCart, FaTrash, FaUserCircle, FaBox, FaHeart, FaSignOutAlt, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaStore, FaCalendarAlt, FaEdit, FaBars, FaSignInAlt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo_main.png';
import api from '../../services/api';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const { user: authUser, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const interval = setInterval(fetchNotifications, 60000); // 1 minute polling
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.patch(`users/notifications/${notif.id}/mark_read/`);
        fetchNotifications();
      }
      setIsNotificationsOpen(false);
      if (notif.notification_type === 'delivery') {
        navigate('/transporter/hub');
      } else if (notif.notification_type === 'registration') {
        navigate('/ministry/users');
      } else if (notif.notification_type === 'system' && isMinistryPath) {
        navigate('/ministry/users');
      } else if (isFarmerPath) {
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isBuyerPath = location.pathname.startsWith('/buyer');
  const isTransporterPath = location.pathname.startsWith('/transporter');
  const isMinistryPath = location.pathname.startsWith('/ministry');
  const isFarmerPath = location.pathname.startsWith('/farmer');

  const isPublicPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/login' || location.pathname === '/register';
  const isHome = location.pathname === '/';

  // Dynamic colors based on path
  const textColor = isHome && !scrolled ? 'text-[#142e1d]' : 'text-white';
  const navHoverColor = isHome && !scrolled ? 'hover:text-[#2d6a4f]' : 'hover:text-white';
  const iconColor = isHome && !scrolled ? 'text-[#142e1d]' : 'text-white';
  const logoTextColor = isHome && !scrolled ? 'text-[#142e1d]' : 'text-white';

  const userProfile = authUser || {
    name: isTransporterPath ? 'Khaled Transport' : isMinistryPath ? 'Ministry Official' : isFarmerPath ? 'John Farmer' : 'Local Buyer',
    role: isTransporterPath ? 'Logistics Partner' : isMinistryPath ? 'Government Oversight' : isFarmerPath ? 'Verified Partner' : 'Buyer Account',
    email: isTransporterPath ? 'transport@agrisouk.dz' : isMinistryPath ? 'admin@agri.gov.dz' : isFarmerPath ? 'john.farmer@agrisouk.dz' : 'buyer@agrisouk.dz',
    phone: isFarmerPath ? '+213 550 12 34 56' : '+213 500 00 00 00',
    wilaya: isFarmerPath ? '16 - Alger' : '01 - Adrar',
    farmName: isTransporterPath ? 'Agri Logistics DZ' : isMinistryPath ? 'Ministry of Agriculture' : isFarmerPath ? 'Cooperative El Falah' : 'AgriSouk Farm',
    memberSince: '2024',
    avatar: null
  };

  const user = {
    name: userProfile.name,
    role: userProfile.role,
    initials: userProfile.name.charAt(0) + (userProfile.name.split(' ')[1]?.charAt(0) || '')
  };

  const buyerTabs = [
    { name: 'Dashboard', path: '/buyer' },
    { name: 'Products', path: '/buyer/products' },
    { name: 'My Orders', path: '/buyer/orders' },
    { name: 'Favorites', path: '/buyer/favorites' },
  ];

  const transporterTabs = [
    { name: 'Overview', path: '/transporter' },
    { name: 'My Delivery', path: '/transporter/hub' },
    { name: 'Fleet', path: '/transporter/fleet' },
  ];

  const ministryTabs = [
    { name: 'Market Stats', path: '/ministry' },
    { name: 'Users', path: '/ministry/users' },
    { name: 'Categories', path: '/ministry/categories' },
    { name: 'Prices', path: '/ministry/prices' },
    { name: 'Reports', path: '/ministry/reports' },
  ];

  const farmerTabs = [
    { name: 'Dashboard', path: '/farmer/dashboard' },
    { name: 'Products', path: '/farmer/products' },
    { name: 'Orders', path: '/farmer/orders' },
    { name: 'Sales', path: '/farmer/sales' },
    { name: 'Farms', path: '/farmer/farms' },
  ];

  const { cart, cartCount, toggleCart, isCartOpen, removeFromCart, updateQuantity, cartSubtotal } = useCart();

  const navItems = isFarmerPath ? farmerTabs : isBuyerPath ? buyerTabs : isTransporterPath ? transporterTabs : isMinistryPath ? ministryTabs : [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/buyer' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.user-icon-button')) {
        setIsSidebarOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) && !event.target.closest('.notification-button')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsSidebarOpen(false);
    if (isTransporterPath) {
      navigate('/transporter/profile');
    } else if (isMinistryPath) {
      navigate('/ministry/profile');
    } else if (isFarmerPath) {
      navigate('/farmer/profile');
    } else {
      navigate('/buyer/profile');
    }
  }; return (
    <>
      <div className={`w-full fixed top-0 z-50 px-4 sm:px-8 flex justify-center pointer-events-none transition-all duration-500 ${scrolled ? 'pt-2' : 'pt-6'}`}>
        <header className={`max-w-6xl w-full rounded-full px-8 flex justify-between items-center pointer-events-auto transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3 border border-gray-100' : 'bg-transparent py-2'}`}>

          <Link to="/" className={`flex items-center space-x-2 group ${logoTextColor}`}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden shadow-md">
              <img
                src={logoImg}
                alt="AgriSouk Logo"
                className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <div className={`hidden sm:flex flex-col`}>
              <span className={`text-sm  font-normal  leading-tight`}>AgriSouk DZ</span>
              {isTransporterPath && (
                <span className="text-[9px] font-normal tracking-[0.2em] opacity-70 uppercase -mt-0.5">Logistics</span>
              )}
              {isMinistryPath && (
                <span className="text-[9px] font-normal tracking-[0.2em] opacity-70 uppercase -mt-0.5 text-blue-300">Ministry Portal</span>
              )}
              {isFarmerPath && (
                <span className={`text-[9px] font-normal tracking-[0.2em] opacity-70 uppercase -mt-0.5 ${scrolled ? 'text-green-700' : 'text-green-300'}`}>Farmer Portal</span>
              )}
            </div>

          </Link>

          <div className="hidden lg:flex items-center space-x-10">
            <nav className="flex space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-base font-normal transition-colors relative py-1 ${location.pathname === item.path
                    ? (scrolled || (isHome && !scrolled) ? 'text-green-800' : 'text-white')
                    : (scrolled || (isHome && !scrolled) ? 'text-[#142e1d]/80 hover:text-green-800' : 'text-white/80 hover:text-white')
                    }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full animate-widthGrow ${scrolled || (isHome && !scrolled) ? 'bg-green-800' : 'bg-white'}`}></span>
                  )}
                </Link>
              ))}
            </nav>

          </div>

          <div className="flex items-center space-x-4">
            {!isTransporterPath && !isMinistryPath && !isFarmerPath && (
              <button
                onClick={() => toggleCart(true)}
                className={`p-2.5 rounded-full transition-colors relative ${scrolled || (isHome && !scrolled) ? 'text-green-800 hover:bg-black/5' : 'text-white hover:bg-white/20'}`}
              >
                <FaShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {(isTransporterPath || isMinistryPath || isFarmerPath) && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2.5 rounded-full transition-colors relative group notification-button ${scrolled ? 'text-green-800 hover:bg-black/5' : 'text-white hover:bg-white/20'}`}
                >
                  <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
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
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${notif.notification_type === 'delivery' ? 'bg-blue-100 text-blue-600' :
                                notif.notification_type === 'registration' ? 'bg-green-100 text-green-600' :
                                notif.notification_type === 'status' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {notif.notification_type === 'delivery' ? <FaBox size={14} /> :
                                  notif.notification_type === 'registration' ? <FaUserCircle size={14} /> :
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
                        onClick={() => navigate(isTransporterPath ? '/transporter/hub' : isMinistryPath ? '/ministry/users' : isFarmerPath ? '/farmer/dashboard' : '/notifications')}
                        className="text-[11px] text-gray-600 font-normal hover:text-gray-800 transition-colors"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoggedIn ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2.5 rounded-full transition-colors user-icon-button ${scrolled || (isHome && !scrolled) ? 'text-green-800 hover:bg-black/5' : 'text-white hover:bg-white/20'}`}
              >
                <FaUserCircle size={22} />
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-5 py-2 text-xs font-bold  uppercase tracking-widest hover:bg-white/10 rounded-full transition-all border border-white/30 ${scrolled || (isHome && !scrolled) ? 'text-green-800 border-green-800/30 hover:bg-black/5' : 'text-white border-white/30 hover:bg-white/10'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-bold bg-[#224233] text-white uppercase tracking-widest hover:bg-[#1a3328] rounded-full transition-all shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            {!isLoggedIn && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`sm:hidden p-2.5 rounded-full transition-colors user-icon-button ${scrolled || (isHome && !scrolled) ? 'text-green-800 hover:bg-black/5' : 'text-white hover:bg-white/20'}`}
              >
                <FaUserCircle size={22} />
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2.5 rounded-full transition-colors mobile-menu-button ${scrolled || (isHome && !scrolled) ? 'text-green-800 hover:bg-black/5' : 'text-white hover:bg-white/20'}`}
            >
              <FaBars size={20} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[400] transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-80 bg-[#f4f5f0] shadow-2xl z-[401] flex flex-col animate-slideInRight overflow-y-auto"
          >
            {/* Mobile Sidebar Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-50 shadow-sm overflow-hidden">
                  <img
                    src={logoImg}
                    alt="AgriSouk Logo"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-normal tracking-widest leading-tight text-gray-800">AgriSouk DZ</span>
                  <span className={`text-[9px] font-normal tracking-[0.2em] uppercase ${isMinistryPath ? 'text-blue-600' : 'text-green-600'}`}>
                    {isTransporterPath ? 'Logistics' : isMinistryPath ? 'Ministry' : isFarmerPath ? 'Farmer Portal' : 'Agriculture'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 py-8 px-6">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${location.pathname === item.path
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 shadow-sm'
                      }`}
                  >
                    <span className="text-sm font-normal tracking-wide uppercase">{item.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${location.pathname === item.path ? 'bg-green-400' : 'bg-transparent group-hover:bg-gray-300'
                      }`}></div>
                  </Link>
                ))}
              </nav>

              {/* Mobile Logout/Support */}
              <div className="mt-12 space-y-3">
                <div className="px-5 py-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100/50">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] mb-3 font-normal">Quick Support</p>
                  <div className="flex items-center gap-3 mb-3 text-gray-700 text-sm font-normal">
                    <FaPhoneAlt className="text-green-600 text-xs" />
                    <span>+213 500 00 00 00</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-normal">
                    <FaEnvelope className="text-green-600 text-xs" />
                    <span>support@agrisouk.dz</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-5 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-normal hover:bg-red-500 hover:text-white transition-all duration-500 border border-red-100 uppercase tracking-widest shadow-sm"
                >
                  <FaSignOutAlt size={14} />
                  Log Out
                </button>
              </div>
            </div>

            {/* Footer Text */}
            <div className="p-8 text-center bg-gray-50 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-normal leading-relaxed">
                Fast Agri Logistics System<br />Sustainable Distribution DZ
              </p>
            </div>
          </div>
        </>
      )}{/* Sidebar - My Account avec textes plus grands */}
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
                  <Link
                    to="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="bg-white text-gray-800 px-8 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <FaSignInAlt size={14} />
                    Sign In
                  </Link>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Informations du compte - Textes plus grands */}
            <div className="flex-1 py-5 px-5">
              {isLoggedIn && (
                <>
                  <h3 className="text-base font-normal text-gray-800 mb-4">My Account</h3>

                  <div className="space-y-3">
                    {/* Email */}
                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Email</p>
                          <p className="text-sm text-gray-800">{userProfile.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaPhoneAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Phone</p>
                          <p className="text-sm text-gray-800">{userProfile.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Wilaya */}
                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaMapMarkerAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Wilaya</p>
                          <p className="text-sm text-gray-800">{userProfile.wilaya}</p>
                        </div>
                      </div>
                    </div>{/* Farm Name */}
                    <div className="border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaStore className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">
                            {isTransporterPath ? 'Fleet Company' : isMinistryPath ? 'Department' : 'Farm Name'}
                          </p>
                          <p className="text-sm text-gray-800">{userProfile.farmName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <FaCalendarAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Member Since</p>
                          <p className="text-sm text-gray-800">{userProfile.memberSince}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit My Information Button - Texte plus grand */}
                  <div className="mt-6 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center justify-center gap-2 w-full px-5 py-2 bg-gray-800 text-white rounded-xl text-xs font-normal hover:bg-gray-700 transition-all duration-300"
                    >
                      <FaEdit size={12} />
                      Edit My Information
                    </button>
                  </div>

                  {/* Logout Button - Texte plus grand */}
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
      )}{/* Sidebar Cart */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[200] transition-opacity duration-300"
            onClick={() => toggleCart(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[201] flex flex-col animate-slideInRight">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-normal text-[#112a1a]">Your Basket</h2>
              <button onClick={() => toggleCart(false)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
                <FaTimes size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaShoppingCart size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">Your basket is empty</p>
                  <button onClick={() => { toggleCart(false); navigate('/buyer/products'); }} className="mt-4 text-[#224233] text-xs underline">Start Shopping</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._cartId || Math.random()} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl border border-gray-100 p-0.5 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center relative">
                      {item.product_image || item.image ? (
                        <img
                          src={item.product_image || item.image}
                          alt={item.product_name || item.name || 'Product'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaShoppingCart className="text-gray-300" size={24} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-normal text-[#112a1a] truncate">{item.product_name || item.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-normal">
                        {item.quantity} {item.unit || 'KG'} × {(item.product_price || item.price || 0).toLocaleString()} DZD
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item._cartId, parseFloat(Math.max(0.1, item.quantity - 1)))}
                          className="w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full hover:bg-green-600 hover:text-white transition-all text-xs shadow-sm hover:border-green-600 active:scale-95"
                        >
                          -
                        </button>
                        <span className="text-xs font-normal w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._cartId, parseFloat(item.quantity + 1))}
                          className="w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full hover:bg-green-600 hover:text-white transition-all text-xs shadow-sm hover:border-green-600 active:scale-95"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item._cartId)}
                          className="ml-auto p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Subtotal:</span>
                  <span className="text-normal text-[#112a1a]">{cartSubtotal} DZD</span>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { toggleCart(false); navigate('/buyer/cart'); }} className="px-3 py-1.5 text-center border border-[#224233] text-[#224233] rounded-full hover:bg-[#224233] hover:text-white transition-colors text-[10px] font-normal tracking-wider">VIEW BASKET</button>
                  <button onClick={() => { toggleCart(false); navigate('/buyer/checkout'); }} className="px-3 py-1.5 text-center bg-[#224233] text-white rounded-full hover:bg-[#112a1a] transition-colors text-[10px] font-normal tracking-wider">CHECKOUT</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}<style dangerouslySetInnerHTML={{
        __html: `
        @keyframes widthGrow { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-widthGrow { animation: widthGrow 0.3s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}} />
    </>
  );
};

export default Header;