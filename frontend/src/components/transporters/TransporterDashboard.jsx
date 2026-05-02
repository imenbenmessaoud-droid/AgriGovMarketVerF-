import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Earnings from './Earnings';
import TransporterProfile from './TransporterProfile';
import VehicleManager from './VehicleManager';
import DeliveryJobs from './DeliveryJobs';
import TransporterSidebar from './TransporterSidebar';
import TransporterTopbar from './TransporterTopbar';

const TransporterDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync tab with URL if needed, but here we use state
  useEffect(() => {
    if (location.pathname.includes('/hub')) setActiveTab('hub');
    else if (location.pathname.includes('/fleet')) setActiveTab('fleet');
    else if (location.pathname.includes('/profile')) setActiveTab('profile');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#fdfcf5] font-sans antialiased text-[#224233]">
      {/* Left Sidebar - Fixed via sticky h-screen */}
      <div
        className="h-screen sticky top-0 transition-all duration-300 ease-in-out flex-shrink-0 z-40"
        style={{ marginLeft: isSidebarOpen ? '0' : '-14rem', width: '14rem' }}
      >
        <TransporterSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-[#fdfcf5]">
        {/* Top Bar - Also sticky to keep layout clean */}
        <div className="sticky top-0 z-30">
          <TransporterTopbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onToggleSidebar={toggleSidebar}
          />
        </div>

        {/* Content Container - Uses window scroll to restore the "line" (scrollbar) */}
        <main className="flex-1" style={{ zoom: '0.95' }}>
          <div className="pt-0 px-6 pb-8 max-w-[1200px] mx-auto">
            {activeTab === 'overview' && <Earnings onNavigate={handleTabChange} />}
            {activeTab === 'hub' && (
              <DeliveryJobs
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNavigate={handleTabChange}
              />
            )}
            {activeTab === 'fleet' && <VehicleManager onNavigate={handleTabChange} />}
            {activeTab === 'profile' && <TransporterProfile />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransporterDashboard;