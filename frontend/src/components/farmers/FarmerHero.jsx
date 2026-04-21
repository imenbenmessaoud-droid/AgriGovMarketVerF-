import React from 'react';
import { FaSearch } from 'react-icons/fa';


const FarmerHero = ({ title = 'Farmer Dashboard', subtitle = 'Welcome to your portal', searchQuery = '', onSearchChange }) => {
  return (
   <div className="relative w-full min-h-[350px] overflow-hidden flex flex-col items-center justify-center text-center text-white">
      {/* Background Image Container with Overlay - Modern Blur & Darken */}
      <div
        className="absolute inset-0 bg-cover bg-center overflow-hidden transition-transform duration-1000 group-hover:scale-105"
       style={{
      backgroundImage: `url('https://i.pinimg.com/736x/53/d1/26/53d126869c22748dc2823d2caa1ef61a.jpg')`,
          zIndex: 0,
      filter: 'brightness(0.7)'
      }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
      </div>

      {/* Content Layout - White Text */}
      <div className="relative h-full w-full max-w-4xl mx-auto px-8 flex flex-col items-center justify-center text-center text-white" style={{ zIndex: 2 }}>
        <h1 className="text-2xl md:text-4xl font-normal mb-4 animate-fadeIn text-white capitalize tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl font-normal text-white max-w-2xl animate-fadeIn capitalize leading-relaxed mb-12" style={{ animationDelay: '0.2s' }}>
          {subtitle}
        </p>

        {/* Specific Search Bar Style from Reference Image - Premium Pill shape */}
        <div className="w-full max-w-xl relative animate-fadeIn group" style={{ animationDelay: '0.4s' }}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for fresh products, orders or farms..."
              className="w-full h-12 pl-10 pr-12 bg-white text-gray-800 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/20 border-none transition-all placeholder:text-gray-400 placeholder:italic text-base font-normal"
            />
            {/* Search Icon on the Right side as per image */}
            <div className="absolute right-6 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-green-800 transition-colors" size={24} />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInHero {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { 
          animation: fadeInHero 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
      `}} />
    </div>
  );
};

export default FarmerHero;
