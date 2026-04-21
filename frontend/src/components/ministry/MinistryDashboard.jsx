import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import MarketStats from './MarketStats';
import UserValidation from './UserValidation';
import CategoryManager from './CategoryManager';
import OfficialPriceManager from './OfficialPriceManager';
import Reports from './Reports';
import MinistryProfile from './MinistryProfile';

import MinistryHero from './MinistryHero';

const MinistryDashboard = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans">
      <div className="w-full pt-0 pb-8">
        
        {/* Ministry Hero Section */}
        <MinistryHero />

        {/* Main Content Area */}
        <main className="w-full">
          <div className="bg-[#faf8f0] rounded-none p-0 lg:p-10 shadow-sm border border-gray-50 min-h-[40vh]">
            <Routes>
              <Route path="/" element={<MarketStats />} />
              <Route path="/users" element={<UserValidation />} />
              <Route path="/categories" element={<CategoryManager />} />
              <Route path="/prices" element={<OfficialPriceManager />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<MinistryProfile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MinistryDashboard;