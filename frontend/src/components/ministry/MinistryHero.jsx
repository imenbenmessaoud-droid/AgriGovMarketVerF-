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
        <div className="absolute inset-0 bg-gradient-to-r from-[#112a1a]/95 via-[#112a1a]/85 to-[#112a1a]/40"></div>
        {/* Subtle light effect */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-solum-mint/5 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 w-full px-8 lg:px-16 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          <div className="max-w-2xl text-center lg:text-left transition-all duration-700 delay-100">
            <h1 className="text-2xl lg:text-4xl font-normal tracking-tight text-white mb-6 leading-[1.1] animate-slideUp">
              Agricultural <br />
              <span className="font-normal text-solum-mint drop-shadow-sm">Oversight & Grow</span>
            </h1>
            <p className="text-gray-300 text-lg mb-10 max-w-xl leading-relaxed font-normal animate-fadeIn delay-300">
              Empowering national food security through high-precision data metrics, market transparency, and sustainable agricultural governance models.
            </p>

            {/* Premium Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto lg:mx-0 group/search animate-fadeIn delay-500">
               <div className="absolute -inset-1 bg-gradient-to-r from-solum-mint/20 to-transparent blur-2xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-700"></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, specific prices, or official reports..."
                className="relative w-full bg-white/10 border border-white/20 backdrop-blur-2xl rounded-[28px] py-6 pl-8 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solum-mint/30 transition-all font-normal shadow-2xl"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-3.5 top-3.5 bottom-3.5 px-7 bg-solum-mint text-[#112a1a] rounded-[22px] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-lg font-normal"
              >
                {isSearching ? (
                   <div className="w-5 h-5 border-2 border-[#112a1a] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   <FaSearch size={20} />
                )}
              </button>
            </form>
          </div>

          {/* Glassmorphic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto">
           

            
          </div>

        </div>
      </div>
      
      {/* Visual Decorations */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-solum-mint/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default MinistryHero;
