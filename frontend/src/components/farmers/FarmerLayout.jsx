import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FarmerHero from './FarmerHero';

const FarmerLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const getHeroContent = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { title: 'Farmer Dashboard', subtitle: 'Manage your farm, analytics, and overview.' };
    if (path.includes('/products')) return { title: 'My Products', subtitle: 'Manage your inventory and listing fresh items.' };
    if (path.includes('/orders')) return { title: 'My Orders', subtitle: 'Track and oversee your customer orders.' };
    if (path.includes('/sales')) return { title: 'My Sales', subtitle: 'Deep dive into your farm revenue and growth.' };
    if (path.includes('/farms')) return { title: 'My Farms', subtitle: 'Configure and monitor your active estate units.' };
    if (path.includes('/profile')) return { title: 'Farmer Profile', subtitle: 'Manage your professional identity and credentials.' };
    if (path.includes('/settings')) return { title: 'Portal Settings', subtitle: 'Update your farmer preferences.' };
    return { title: 'Farmer Portal', subtitle: 'Empowering agriculture through technology.' };
  };

  const { title, subtitle } = getHeroContent();

  return (
    <div className="min-h-[300px] w-full flex flex-col bg-[#F8FAF9] font-sans selection:bg-[#112a1a] selection:text-white">
      {/* Main Content Scroll Area */}
      <main className="flex-grow overflow-y-auto custom-scrollbar pt-0 scroll-smooth flex flex-col">
        
  
          {/* Dynamic Hero Section */}
          <FarmerHero 
            title={title} 
            subtitle={subtitle} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery} 
          />
  
          <div className="flex-grow">
            <Outlet context={{ searchQuery }} />
          </div>
      </main>
    </div>
  );
};

export default FarmerLayout;
