import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

import Earnings from './Earnings';
import TransporterProfile from './TransporterProfile';
import VehicleManager from './VehicleManager';
import DeliveryJobs from './DeliveryJobs';
import TransporterSidebar from './TransporterSidebar';
import TransporterTopbar from './TransporterTopbar';
import BottomNav from '../common/BottomNav';
import useGeolocation from '../../hooks/useGeolocation';

const TransporterDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMissions, setActiveMissions] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  
  const { location: coords, error: geoError } = useGeolocation(isOnline, { throttleMs: 10000 });

  const fetchActiveMissions = async () => {
    try {
      const res = await api.get('deliveries/missions/my_missions/?status=assigned,in_transit,picked_up,out_for_delivery');
      setActiveMissions(res.data);
    } catch (err) {
      console.error('Failed to fetch active missions:', err);
    }
  };

  useEffect(() => {
    fetchActiveMissions();
    const interval = setInterval(fetchActiveMissions, 15000); // Poll for status changes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && coords) {
      const trackingMission = activeMissions.find(j => 
        ['assigned', 'in_transit', 'picked_up', 'out_for_delivery'].includes(j.delivery_status)
      );

      if (trackingMission) {
        api.patch(`deliveries/missions/${trackingMission.mission_number}/update_location/`, {
          latitude: coords.lat,
          longitude: coords.lng
        }).catch(err => console.error("Location sync failed", err));
      }
    }
  }, [coords, isOnline, activeMissions]);

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
        className="hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out flex-shrink-0 z-40"
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
            isOnline={isOnline}
            onToggleOnline={() => setIsOnline(!isOnline)}
          />
        </div>

        {/* Content Container - Uses window scroll to restore the "line" (scrollbar) */}
        <main className="flex-1" style={{ zoom: '0.95' }}>
          <div className="pt-0 px-6 pb-8 max-w-[1200px] mx-auto">
            {activeTab === 'overview' && (
              <Earnings 
                onNavigate={handleTabChange} 
                currentLocation={coords}
                activeMissions={activeMissions}
              />
            )}
            {activeTab === 'hub' && (
              <DeliveryJobs
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNavigate={handleTabChange}
                currentLocation={coords}
                activeMissions={activeMissions}
                onRefreshMissions={fetchActiveMissions}
              />
            )}
            {activeTab === 'fleet' && <VehicleManager onNavigate={handleTabChange} />}
            {activeTab === 'profile' && <TransporterProfile />}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default TransporterDashboard;