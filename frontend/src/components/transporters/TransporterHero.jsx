import React from 'react';
import { FaSearch } from 'react-icons/fa';

const TransporterHero = ({ title = 'Logistics Portal', subtitle = 'Fast Agri Logistics System', searchQuery = '', onSearchChange }) => {
  const heroBg = 'https://i.pinimg.com/736x/4e/9c/29/4e9c290f3951e20ad11daa67e03fcbae.jpg';

  return (
    <div 
      className="relative  w-full overflow-hidden flex flex-col items-center justify-center  text-center text-white"
      style={{ 
        height: '400px',
        minHeight: '400px',
        backgroundColor: '#f4f5f0'
      }}
    >
      {/* Background Image Container with Blur and Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          zIndex: 0,
          filter: 'blur(2px) brightness(0.7)' // Subtle blur and darkening matching reference
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div> 
      </div>
      
      {/* Content Layout */}
      <div className="relative h-full w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center text-white" style={{ zIndex: 2 }}>
        <h1 className="text-4xl md:text-5xl font-normal mb-4 animate-fadeIn text-white uppercase ">
          {title}
        </h1>
        <p className="text-xs md:text-sm font-normal text-white/90 max-w-2xl animate-fadeIn uppercase tracking-[0.2em] mb-12" style={{ animationDelay: '0.2s' }}>
          {subtitle}
        </p>

        {/* Specific Search Bar Style from Reference Image */}
        <div className="w-full max-w-3xl relative animate-fadeIn group" style={{ animationDelay: '0.4s' }}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search for delivery jobs..."
              className="w-full h-14 pl-8 pr-16 bg-white text-gray-800 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/20 border-none transition-all placeholder:text-gray-400 placeholder:italic text-sm font-normal"
            />
            {/* Search Icon on the Right side as per image */}
            <div className="absolute right-6 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInHero {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { 
          animation: fadeInHero 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
      `}} />
    </div>
  );
};

export default TransporterHero;
