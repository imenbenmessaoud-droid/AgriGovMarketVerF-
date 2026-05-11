import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaList, FaUserCircle, FaTruck, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isFarmer = user.user_type === 'farmer';
  const isTransporter = user.user_type === 'transporter';

  const farmerLinks = [
    { name: 'Home', path: '/farmer/dashboard', icon: <FaHome size={20} /> },
    { name: 'Products', path: '/farmer/products', icon: <FaBox size={20} /> },
    { name: 'Orders', path: '/farmer/orders', icon: <FaList size={20} /> },
    { name: 'Profile', path: '/farmer/profile', icon: <FaUserCircle size={20} /> },
  ];

  const transporterLinks = [
    { name: 'Home', path: '/transporter', icon: <FaHome size={20} /> },
    { name: 'Hub', path: '/transporter/hub', icon: <FaTruck size={20} /> },
    { name: 'Fleet', path: '/transporter/fleet', icon: <FaBox size={20} /> },
    { name: 'Profile', path: '/transporter/profile', icon: <FaUserCircle size={20} /> },
  ];

  const links = isFarmer ? farmerLinks : isTransporter ? transporterLinks : [];

  if (links.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          {link.icon}
          <span className="text-[10px] mt-1 font-medium">{link.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
