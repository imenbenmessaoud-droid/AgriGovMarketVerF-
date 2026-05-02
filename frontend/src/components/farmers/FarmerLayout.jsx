import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import FarmerSidebar from './FarmerSidebar';
import FarmerTopBar from './FarmerTopBar';

const FarmerLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAF9] font-sans overflow-hidden gap-1">
      {/* Sidebar - Fixed Left with Transition */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-60' : 'w-0'}`}>
        <FarmerSidebar isVisible={isSidebarVisible} />
      </div>

      {/* Main Content Area - Flex Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden farmer-compact-mode">
        {/* Top Bar - Fixed Top of Content Area */}
        <FarmerTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAF9]">
          <div className="min-h-full">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Breathable Layout Overrides for Farmer Portal */
        .farmer-compact-mode { 
          font-size: 0.825rem;
          zoom: 0.9; /* Standard scaling for Chrome as requested */
        }
        .farmer-compact-mode .p-8 { padding: 2rem !important; }
        .farmer-compact-mode .py-8 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
        .farmer-compact-mode .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        .farmer-compact-mode .p-6 { padding: 1.5rem !important; }
        .farmer-compact-mode .p-5 { padding: 1.25rem !important; }
        .farmer-compact-mode .p-4 { padding: 1rem !important; }
        .farmer-compact-mode .mb-8 { margin-bottom: 2.5rem !important; }
        .farmer-compact-mode .mb-6 { margin-bottom: 1.5rem !important; }
        .farmer-compact-mode .gap-6 { gap: 2rem !important; }
        .farmer-compact-mode .gap-4 { gap: 1.5rem !important; }
        .farmer-compact-mode .space-y-8 { margin-top: 2.5rem !important; }
        .farmer-compact-mode .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem !important; }
        .farmer-compact-mode .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem !important; }
        .farmer-compact-mode .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem !important; }
        .farmer-compact-mode .text-2xl { font-size: 1.5rem !important; }
        .farmer-compact-mode h1.text-2xl { font-size: 1.75rem !important; }
        .farmer-compact-mode .text-xl { font-size: 1.1rem !important; }
        .farmer-compact-mode .w-10.h-10 { width: 2.5rem !important; height: 2.5rem !important; }
        .farmer-compact-mode .w-8.h-8 { width: 2rem !important; height: 2rem !important; }
        .farmer-compact-mode .rounded-xl { border-radius: 1rem !important; }
        .farmer-compact-mode .rounded-2xl { border-radius: 1.25rem !important; }
        .farmer-compact-mode .max-w-7xl { max-width: 100% !important; padding-left: 2rem; padding-right: 2rem; }
        .farmer-compact-mode button { padding-top: 0.8rem !important; padding-bottom: 0.8rem !important; }
        
        /* Card Aesthetics Enhancement */
        .farmer-compact-mode .bg-white { 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }

        /* Product Card specific reductions */
        .farmer-compact-mode .h-48, 
        .farmer-compact-mode .aspect-square,
        .farmer-compact-mode .aspect-video { height: 160px !important; }
        .farmer-compact-mode .text-lg { font-size: 1rem !important; }

        /* Scrollbar Hiding Utility */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default FarmerLayout;
