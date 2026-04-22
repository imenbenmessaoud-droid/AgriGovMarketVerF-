import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Earnings from './Earnings';
import TransporterProfile from './TransporterProfile';
import VehicleManager from './VehicleManager';
import DeliveryJobs from './DeliveryJobs';
import TransporterHero from './TransporterHero';

const ordersBg = 'https://i.pinimg.com/736x/34/be/ad/34beadbeaf117b0414dad08c204b8d1d.jpg';

const TransporterDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname.includes('/hub')) setActiveTab('hub');
    else if (location.pathname.includes('/fleet')) setActiveTab('fleet');
    else if (location.pathname.includes('/profile')) setActiveTab('profile');
    else setActiveTab('overview');
  }, [location.pathname]);

  const dashTabs = [
    { id: 'overview', name: 'DASHBOARD OVERVIEW' },
    { id: 'hub', name: 'DELIVERIES HUB' },
    { id: 'fleet', name: 'FLEET MANAGEMENT' },
    { id: 'profile', name: 'PROFILE SETTINGS' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-84px)] overflow-hidden bg-[#f4f5f0] font-sans antialiased text-[#224233]">

      {/* Modern Logistics Hero Section with Search bar */}
      <TransporterHero
        title={activeTab === 'overview' ? 'Logistics Portal' : activeTab === 'hub' ? 'Deliveries Hub' : activeTab === 'fleet' ? 'Fleet Management' : 'Fleet Profile'}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />


      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#faf8f0] relative z-0">
        <div className="max-w-5xl mx-auto px-4 lg:px-5 py-16 min-h-[38vh]">
          {activeTab === 'overview' && <Earnings />}
          {activeTab === 'hub' && <DeliveryJobs searchQuery={searchQuery} onNavigate={setActiveTab} />}
          {activeTab === 'fleet' && <VehicleManager onNavigate={setActiveTab} />}
          {activeTab === 'profile' && <TransporterProfile />}
        </div>
      </main>
    </div>
  );


};

export default TransporterDashboard;