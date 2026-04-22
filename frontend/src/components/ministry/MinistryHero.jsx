import React, { useState } from 'react';
import { FaSearch, FaShieldAlt, FaGlobe, FaChartLine } from 'react-icons/fa';
import heroBg from '../../assets/images/ministry-hero-bg.png';

const MinistryHero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert(`Search results for "${searchQuery}" have been filtered in the dashboard.`);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden min-h-[480px] flex items-center rounded-none mb-12 shadow-2xl group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(17,42,26,0.2)]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="absolute inset-0 bg-[#112a1a]/85 backdrop-blur-[1px]"></div>
        {/* Subtle light effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 w-full px-8 lg:px-16 py-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl transition-all duration-700 delay-100 flex flex-col items-center">
          <h1 className="text-3xl lg:text-5xl font-normal tracking-tight text-white mb-6 leading-tight animate-slideUp">
            Agricultural <br />
            <span className="font-normal text-white">Oversight & Grow</span>
          </h1>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl leading-relaxed font-normal animate-fadeIn delay-300 mx-auto">
            Empowering national food security through high-precision data metrics and  market transparency.
          </p>

          {/* Premium Search Bar - Centered */}
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl group/search animate-fadeIn delay-500 mx-auto">
             <div className="absolute -inset-1 bg-gradient-to-r from-solum-mint/10 to-transparent blur-3xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-700"></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, specific prices, or official reports..."
              className="relative w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[28px] py-6 pl-8 pr-24 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-normal shadow-2xl"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-3 top-3 bottom-3 px-8 bg-white text-[#112a1a] rounded-[22px] hover:bg-solum-mint hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-lg font-normal"
            >
              {isSearching ? (
                 <div className="w-5 h-5 border-2 border-[#112a1a] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <FaSearch size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Visual Decorations */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-solum-mint/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default MinistryHero;
