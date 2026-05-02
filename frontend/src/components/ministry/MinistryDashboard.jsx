import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import MarketStats from './MarketStats';
import UserValidation from './UserValidation';
import CategoryManager from './CategoryManager';
import OfficialPriceManager from './OfficialPriceManager';
import Reports from './Reports';
import MinistryProfile from './MinistryProfile';
import AdminOrders from './AdminOrders';

import MinistrySidebar from './MinistrySidebar';
import MinistryTopBar from './MinistryTopBar';

const MinistryDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAF9] font-sans overflow-hidden">
      {/* Sidebar */}
      <MinistrySidebar isVisible={isSidebarVisible} />

      {/* Main Content Area - Flex Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar - Fixed Top of Content Area */}
        <MinistryTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#fcfdfd] w-full">
          <div className="bg-[#faf8f0] rounded-none p-0 lg:px-6 pt-2 lg:pb-10 min-h-full">
            <Routes>
              <Route path="/" element={<MarketStats searchQuery={searchQuery} />} />
              <Route path="/users" element={<UserValidation searchQuery={searchQuery} />} />
              <Route path="/categories" element={<CategoryManager searchQuery={searchQuery} />} />
              <Route path="/prices" element={<OfficialPriceManager searchQuery={searchQuery} />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<MinistryProfile />} />
              <Route path="/orders" element={<AdminOrders searchQuery={searchQuery} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MinistryDashboard;