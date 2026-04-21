
import React, { useState, useEffect } from 'react';
import {
   FaPlus, FaMapMarkerAlt, FaRulerCombined, FaUser, FaCamera,
   FaTimes, FaCheckCircle, FaExclamationTriangle, FaLeaf, FaTractor, FaSearch,
   FaRegSquare, FaCompressAlt, FaMoneyBillWave, FaShoppingCart, FaBoxOpen, FaChartLine
} from 'react-icons/fa';
import harvestHero from '../../assets/images/harvest_hero.png';

const initialFarms = [
   {
      id: 1,
      name: 'Biskra Oasis Palms',
      owner: 'Zermane Intissar',
      location: 'Biskra, Algeria (Sidi Okba)',
      size: '12.5 Hectares',
      status: 'Verified',
      type: 'Date Palm & Citrus',
      photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      description: 'High-yield palm expansion unit specializing in Deglet Nour dates and seasonal citrus integration.'
   },
   {
      id: 2,
      name: 'Blida Citrus Orchard',
      owner: 'Ahmed Benali',
      location: 'Blida, Mitidja Plain',
      size: '5.2 Hectares',
      status: 'Verified',
      type: 'Citrus & Greenhouse',
      photo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
      description: 'Modern greenhouse complex with automated irrigation systems for year-round citrus production.'
   }
];

const FarmerManagement = () => {
   const [farms, setFarms] = useState(() => {
      const saved = localStorage.getItem('farmerUnits');
      return saved ? JSON.parse(saved) : initialFarms;
   });

   const [dynamicStats, setDynamicStats] = useState({
      totalSales: 0,
      totalRevenue: 0,
      activeOrders: 0,
      productsListed: 0
   });

   useEffect(() => {
      const syncDynamicData = () => {
         const savedOrders = localStorage.getItem('farmerOrders');
         const savedProducts = localStorage.getItem('farmerProducts');

         const orders = savedOrders ? JSON.parse(savedOrders) : [
            { price: 25000, status: 'Completed' },
            { price: 9000, status: 'Pending' },
            { price: 125000, status: 'Completed' }
         ];

         const products = savedProducts ? JSON.parse(savedProducts) : [
            { id: 1 }, { id: 2 }, { id: 3 }
         ];

         const totalRevenue = orders.reduce((sum, o) => o.status === 'Completed' ? sum + Number(o.price) : sum, 0);
         const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Dispatch' || o.status === 'In Transit').length;

         setDynamicStats({
            totalSales: orders.length,
            totalRevenue: totalRevenue,
            activeOrders: activeOrders,
            productsListed: products.length
         });
      };

      syncDynamicData();
      window.addEventListener('storage', syncDynamicData);
      return () => window.removeEventListener('storage', syncDynamicData);
   }, []);

   const [editingFarm, setEditingFarm] = useState(null);
   const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   const filteredFarms = farms.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);
   const [isConfirmRegisterOpen, setIsConfirmRegisterOpen] = useState(false);
   const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

   const [newFarm, setNewFarm] = useState({
      name: '', owner: '', location: '', size: '', type: '', description: '', photo: ''
   });

   const saveFarms = (updatedFarms) => {
      setFarms(updatedFarms);
      localStorage.setItem('farmerUnits', JSON.stringify(updatedFarms));
   };

   const handleRegister = (e) => {
      if (e) e.preventDefault();
      const id = farms.length > 0 ? Math.max(...farms.map(f => f.id)) + 1 : 1;
      const farmToAdd = {
         ...newFarm,
         id,
         status: 'Pending Verification',
         photo: newFarm.photo || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80'
      };
      saveFarms([...farms, farmToAdd]);
      setIsConfirmRegisterOpen(false);
      setIsRegisterModalOpen(false);
      setNewFarm({ name: '', owner: '', location: '', size: '', type: '', description: '', photo: '' });
   };

   const handleUpdateFarm = () => {
      saveFarms(farms.map(f => f.id === editingFarm.id ? editingFarm : f));
      setIsConfirmUpdateOpen(false);
      setEditingFarm(null);
   };

   const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const photoURL = URL.createObjectURL(file);
         setEditingFarm({ ...editingFarm, photo: photoURL });
      }
   };

   const handleNewFarmPhoto = (e) => {
      const file = e.target.files[0];
      if (file) {
         setNewFarm({ ...newFarm, photo: URL.createObjectURL(file) });
      }
   };

   const openRegisterModal = () => {
      setNewFarm({ name: '', owner: '', location: '', size: '', type: '', description: '', photo: '' });
      setIsRegisterModalOpen(true);
   };

   // ✅ تصحيح: دالة لإغلاق Confirm وفتح Register مرة أخرى
   const handleConfirmAbort = () => {
      if (isConfirmUpdateOpen) {
         setIsConfirmUpdateOpen(false);
      }
      if (isConfirmRegisterOpen) {
         setIsConfirmRegisterOpen(false);
         // لا نعيد فتح Register Modal تلقائياً
      }
   };

   // ✅ تصحيح: دالة لفتح Confirm بعد التحقق
   const handleRegisterClick = () => {
      // التحقق من أن جميع الحقول مملوءة
      if (!newFarm.name || !newFarm.owner || !newFarm.location || !newFarm.size) {
         alert('Please fill all required fields');
         return;
      }
      setIsConfirmRegisterOpen(true);
   };

   return (
      <div className="w-full bg-white min-h-screen relative font-sans selection:bg-emerald-50 selection:text-emerald-900 pt-12">
         <div className="flex-grow flex flex-col h-full min-h-screen overflow-hidden">

            <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow text-left">
               <div className="max-w-[1440px] mx-auto space-y-6">

                  {/* SUMMARY STATISTICS DASHBOARD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                     <div className="bg-[#f0f7e6] p-6 rounded-sm border border-[#e2edd1] shadow-sm flex flex-col space-y-3 hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all duration-300">
                        <div className="flex justify-between items-start">
                           <span className="text-[13px] font-normal text-slate-600 lowercase">🌾 total sales</span>
                           <div className="p-2 bg-emerald-50 rounded-sm text-[#0b7a5a] text-center"><FaMoneyBillWave size={15} /></div>
                        </div>
                        <div className="flex items-baseline space-x-3">
                           <span className="text-[28px] font-normal text-slate-800 tracking-tighter">{dynamicStats.totalSales}</span>
                           <span className="text-[12px] font-normal text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+8% growth</span>
                        </div>
                        <p className="text-[13px] text-slate-600 font-normal">verified seasonal output</p>
                     </div>

                     <div className="bg-[#f0f7e6] p-6 rounded-sm border border-[#e2edd1] shadow-sm flex flex-col space-y-3 hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all duration-300">
                        <div className="flex justify-between items-start">
                           <span className="text-[13px] font-normal text-slate-600 lowercase">💰 total revenue</span>
                           <div className="p-2 bg-blue-50 rounded-sm text-blue-600"><FaChartLine size={15} /></div>
                        </div>
                        <div className="flex items-baseline space-x-3">
                           <span className="text-[28px] font-normal text-slate-800 tracking-tighter">
                              {dynamicStats.totalRevenue >= 1000000
                                 ? `${(dynamicStats.totalRevenue / 1000000).toFixed(1)}M`
                                 : dynamicStats.totalRevenue.toLocaleString()}
                              <span className="text-[12px] text-slate-400 font-normal uppercase ml-1">dzd</span>
                           </span>
                           <span className="text-[12px] font-normal text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">ytd progress</span>
                        </div>
                        <p className="text-[13px] text-slate-600 font-normal">official financial valuation</p>
                     </div>

                     <div className="bg-[#f0f7e6] p-6 rounded-sm border border-[#e2edd1] shadow-sm flex flex-col space-y-3 hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all duration-300">
                        <div className="flex justify-between items-start">
                           <span className="text-[13px] font-normal text-slate-600 lowercase">📦 active orders</span>
                           <div className="p-2 bg-purple-50 rounded-sm text-purple-600"><FaShoppingCart size={15} /></div>
                        </div>
                        <div className="flex items-baseline space-x-3">
                           <span className="text-[28px] font-normal text-slate-800 tracking-tighter">{dynamicStats.activeOrders}</span>
                           <span className="text-[12px] font-normal text-blue-500 bg-blue-50 px-3 py-1 rounded-full">processing</span>
                        </div>
                        <p className="text-[13px] text-slate-600 font-normal">pending logistical dispatch</p>
                     </div>

                     <div className="bg-[#f0f7e6] p-6 rounded-sm border border-[#e2edd1] shadow-sm flex flex-col space-y-3 hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all duration-300">
                        <div className="flex justify-between items-start">
                           <span className="text-[13px] font-normal text-slate-600 lowercase">⭐ products listed</span>
                           <div className="p-2 bg-orange-50 rounded-sm text-orange-600"><FaBoxOpen size={15} /></div>
                        </div>
                        <div className="flex items-baseline space-x-3">
                           <span className="text-[28px] font-normal text-slate-800 tracking-tighter">{dynamicStats.productsListed}</span>
                           <span className="text-[12px] font-normal text-orange-500 bg-orange-50 px-3 py-1 rounded-full">marketplace live</span>
                        </div>
                        <p className="text-[13px] text-slate-600 font-normal">active inventory status</p>
                     </div>
                  </div>

                  {/* ACTIVE REGISTRY ACTION HEADER */}
                  <div className="max-w-[1440px] mx-auto px-0 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100/50 pt-6">
                     <div>
                        <h2 className="text-[20px] font-normal text-[#0b7a5a] tracking-tight">Verified Estate Registry ({filteredFarms.length})</h2>
                        <p className="text-[12px] text-slate-500 font-normal mt-1 italic leading-none">Managed land sectors under active production</p>
                     </div>
                     <button
                        onClick={openRegisterModal}
                        className="bg-[#0b7a5a] hover:bg-[#085a43] text-white px-6 py-2.5 mt-4 sm:mt-0 rounded-sm text-[11px] lowercase tracking-tight font-normal transition-all shadow-sm flex items-center space-x-2 active:scale-95"
                     >
                        <FaPlus size={12} className="mb-0.5" />
                        <span>register new farm unit</span>
                     </button>
                  </div>

                  <div className="max-w-[1440px] mx-auto px-0 py-4">
                     <div className="grid grid-cols-1 gap-4">
                        {filteredFarms.map((farm) => (
                           <div
                              key={farm.id}
                              className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch w-full group transition-all hover:border-[#0b7a5a]/30 rounded-sm"
                           >
                              <div className="w-full md:w-48 h-32 md:h-28 relative shrink-0">
                                 <img src={farm.photo} alt={farm.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                 <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-[#0b7a5a] text-[9px] font-normal lowercase tracking-widest border border-emerald-50 shadow-sm font-sans">
                                    {farm.status}
                                 </div>
                              </div>

                              <div className="p-5 md:p-6 flex-grow flex flex-col justify-center space-y-3">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="text-[17px] font-normal text-slate-800 tracking-tight mb-0.5">{farm.name}</h3>
                                       <p className="text-slate-400 text-[11px] font-normal italic tracking-wide">{farm.type}</p>
                                    </div>
                                    <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                       <span className="text-[9px] font-normal lowercase">active unit</span>
                                    </div>
                                 </div>

                                 <div className="flex flex-col sm:flex-row sm:space-x-12 space-y-1 sm:space-y-0 pt-2 border-t border-gray-50">
                                    <div className="flex flex-col">
                                       <span className="text-[#0b7a5a] font-normal text-[9px] lowercase tracking-widest opacity-60">Legal Owner</span>
                                       <span className="text-slate-700 text-[13px] font-normal tracking-tight">{farm.owner}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[#0b7a5a] font-normal text-[9px] lowercase tracking-widest opacity-60">Logistics Region</span>
                                       <span className="text-slate-700 text-[13px] font-normal tracking-tight">{farm.location}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[#0b7a5a] font-normal text-[9px] lowercase tracking-widest opacity-60">Operational Scale</span>
                                       <span className="text-slate-700 text-[13px] font-normal tracking-tight">{farm.size}</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-row md:flex-col border-t md:border-t-0 md:border-l border-gray-100 w-full md:w-20 shrink-0 bg-slate-50/20">
                                 <button
                                    onClick={() => setEditingFarm(farm)}
                                    className="flex-1 py-1 text-[10px] font-normal lowercase tracking-tight bg-white hover:bg-emerald-50 text-slate-400 hover:text-[#0b7a5a] transition-all flex items-center justify-center border-b border-gray-100 md:border-b-0"
                                 >
                                    edit
                                 </button>
                                 <button
                                    onClick={() => setIsDeactivateAlertOpen(true)}
                                    className="flex-1 py-1 text-[10px] font-normal lowercase tracking-tight bg-white hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
                                 >
                                    off
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Deactivate Alert Modal */}
         {isDeactivateAlertOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0a1b0a]/80 backdrop-blur-sm px-4">
               <div className="bg-white w-full max-w-sm shadow-2xl p-10 border border-gray-100 flex flex-col items-center text-center animate-in scale-in duration-300 rounded-sm">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
                     <FaExclamationTriangle size={28} />
                  </div>
                  <h3 className="text-xl font-normal text-slate-800 mb-2 tracking-tight">Security Restriction</h3>
                  <p className="text-[13px] text-slate-500 mb-8 leading-relaxed font-normal">
                     Automated deactivation of verified production entities is currently restricted. Please submit a manual request to the administrative board.
                  </p>
                  <button
                     onClick={() => setIsDeactivateAlertOpen(false)}
                     className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-[11px] font-normal tracking-widest transition-all rounded-sm shadow-md lowercase"
                  >
                     acknowledge
                  </button>
               </div>
            </div>
         )}

         {/* Editing Modal */}
         {editingFarm && !isConfirmUpdateOpen && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#0a1b0a]/80 backdrop-blur-sm px-4">
               <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden p-8 border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in duration-300 zoom-in-95 rounded-sm">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                     <div>
                        <h2 className="text-2xl font-normal text-slate-800 tracking-tight lowercase">update farm information</h2>
                        <p className="text-[12px] text-slate-400 mt-1 font-normal lowercase tracking-[0.2em]">modify technical parameters</p>
                     </div>
                     <button onClick={() => setEditingFarm(null)} className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-sm">
                        <FaTimes size={16} />
                     </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 mb-8 text-left">
                     <div className="w-full md:w-1/3 shrink-0">
                        <label className="block text-[11px] text-[#0b7a5a] font-normal lowercase tracking-widest mb-3">Farm Visual Asset</label>
                        <div className="relative group aspect-square overflow-hidden bg-gray-50 border border-gray-100 rounded-sm shadow-sm font-sans">
                           <img src={editingFarm.photo} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                           <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[1px]">
                              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                              <div className="flex flex-col items-center text-white scale-90 group-hover:scale-100 transition-transform">
                                 <FaCamera size={24} className="mb-2" />
                                 <span className="text-[10px] font-normal lowercase tracking-widest">replace photo</span>
                              </div>
                           </label>
                        </div>
                     </div>

                     <div className="flex-grow space-y-6">
                        <div className="bg-gray-50/30 p-5 border border-gray-100/50 rounded-sm">
                           <h3 className="text-[10px] font-normal text-[#0b7a5a] tracking-[0.2em] mb-5 flex items-center lowercase">
                              <span className="w-1.5 h-1.5 bg-[#0b7a5a] mr-2.5 rounded-full"></span>
                              identity & ownership
                           </h3>
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] text-slate-400 font-normal lowercase tracking-widest">farm name</label>
                                 <input type="text" value={editingFarm.name} onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })} className="w-full bg-white border border-transparent border-b-gray-100 py-2.5 text-[14px] focus:border-[#0b7a5a] outline-none transition-all font-normal text-slate-700 rounded-none px-1" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] text-slate-400 font-normal lowercase tracking-widest">legal registrar</label>
                                 <input type="text" value={editingFarm.owner} onChange={(e) => setEditingFarm({ ...editingFarm, owner: e.target.value })} className="w-full bg-white border border-transparent border-b-gray-100 py-2.5 text-[14px] focus:border-[#0b7a5a] outline-none transition-all font-normal text-slate-700 rounded-none px-1" />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50/30 p-5 border border-gray-100/50 rounded-sm">
                           <h3 className="text-[10px] font-normal text-[#0b7a5a] tracking-[0.2em] mb-5 flex items-center lowercase">
                              <span className="w-1.5 h-1.5 bg-[#0b7a5a] mr-2.5 rounded-full"></span>
                              geography & scale
                           </h3>
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] text-slate-400 font-normal lowercase tracking-widest">location region</label>
                                 <input type="text" value={editingFarm.location} onChange={(e) => setEditingFarm({ ...editingFarm, location: e.target.value })} className="w-full bg-white border border-transparent border-b-gray-100 py-2.5 text-[14px] focus:border-[#0b7a5a] outline-none transition-all font-normal text-slate-700 rounded-none px-1" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="block text-[10px] text-slate-400 font-normal lowercase tracking-widest">operational scale</label>
                                 <input type="text" value={editingFarm.size} onChange={(e) => setEditingFarm({ ...editingFarm, size: e.target.value })} className="w-full bg-white border border-transparent border-b-gray-100 py-2.5 text-[14px] focus:border-[#0b7a5a] outline-none transition-all font-normal text-slate-700 rounded-none px-1" />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50/30 p-5 border border-gray-100/50 rounded-sm">
                           <h3 className="text-[10px] font-normal text-[#0b7a5a] tracking-[0.2em] mb-5 flex items-center lowercase">
                              <span className="w-1.5 h-1.5 bg-[#0b7a5a] mr-2.5 rounded-full"></span>
                              production specialization
                           </h3>
                           <div className="space-y-1.5">
                              <label className="block text-[10px] text-slate-400 font-normal lowercase tracking-widest">primary specialization</label>
                              <input type="text" value={editingFarm.type} onChange={(e) => setEditingFarm({ ...editingFarm, type: e.target.value })} className="w-full bg-white border border-transparent border-b-gray-100 py-2.5 text-[14px] focus:border-[#0b7a5a] outline-none transition-all font-normal text-slate-700 rounded-none px-1" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end space-x-3 border-t border-gray-50 pt-6">
                     <button onClick={() => setEditingFarm(null)} className="px-6 py-2 text-[11px] font-normal text-slate-400 hover:text-slate-600 transition-colors lowercase tracking-widest">
                        cancel
                     </button>
                     <button onClick={() => setIsConfirmUpdateOpen(true)} className="px-10 py-2.5 bg-[#0b7a5a] text-white text-[11px] font-normal tracking-widest transition-all shadow-md active:scale-95 rounded-sm lowercase">
                        update ledger
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ✅ Confirmation Modal - مصلح */}
         {(isConfirmUpdateOpen || isConfirmRegisterOpen) && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0a1b0a]/80 backdrop-blur-sm px-4">
               <div className="bg-white w-full max-w-sm shadow-2xl p-8 border border-gray-100 flex flex-col items-center text-center animate-in zoom-in duration-300 rounded-sm">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-[#0b7a5a] mb-5 shadow-sm">
                     <FaCheckCircle size={24} />
                  </div>
                  <h3 className="text-xl font-normal text-slate-800 mb-2 tracking-tight lowercase">final confirmation</h3>
                  <p className="text-[13px] text-slate-500 mb-8 leading-relaxed font-normal lowercase">
                     {isConfirmUpdateOpen
                        ? "are you sure you want to permanently apply these modifications to the agricultural registry parameters?"
                        : "confirm registration of new farm unit to the official agricultural registry?"}
                  </p>
                  <div className="flex space-x-3 w-full">
                     <button
                        onClick={handleConfirmAbort}
                        className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-slate-400 text-[11px] font-normal tracking-widest lowercase transition-all rounded-sm"
                     >
                        abort
                     </button>
                     <button
                        onClick={isConfirmUpdateOpen ? handleUpdateFarm : handleRegister}
                        className="flex-1 py-2.5 bg-[#0b7a5a] hover:bg-[#085a43] text-white text-[11px] font-normal tracking-widest lowercase transition-all shadow-lg active:scale-95 rounded-sm"
                     >
                        confirm
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ✅ Registration Modal - مصلح */}
         {isRegisterModalOpen && !isConfirmRegisterOpen && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#0a1b0a]/80 backdrop-blur-sm px-4">
               <div className="bg-white w-full max-w-md shadow-2xl border border-gray-100 flex flex-col rounded-sm overflow-hidden max-h-[85vh]">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 shrink-0">
                     <div>
                        <h2 className="text-xl font-normal text-slate-800 tracking-tight lowercase">new farm units registry</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-normal lowercase tracking-[0.2em]">register production site</p>
                     </div>
                     <button onClick={() => { setIsRegisterModalOpen(false); }} className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-sm">
                        <FaTimes size={16} />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="overflow-y-auto flex-grow px-6 py-5">
                     <div className="space-y-5">

                        {/* Photo Upload */}
                        <div className="bg-gray-50/30 p-4 border border-gray-100/50 rounded-sm">
                           <h3 className="text-[9px] font-normal text-[#0b7a5a] tracking-[0.2em] mb-3 flex items-center lowercase font-sans">
                              <span className="w-1.5 h-1.5 bg-[#0b7a5a] mr-2 rounded-full"></span>
                              visual site identity
                           </h3>
                           <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-white flex items-center justify-center relative overflow-hidden rounded-sm border border-gray-100 shadow-sm shrink-0">
                                 {newFarm.photo
                                    ? <img src={newFarm.photo} alt="Preview" className="w-full h-full object-cover" />
                                    : <FaTractor className="text-gray-200" size={24} />
                                 }
                              </div>
                              <div>
                                 <input type="file" accept="image/*" className="hidden" id="new-photo-upload" onChange={handleNewFarmPhoto} />
                                 <label htmlFor="new-photo-upload" className="inline-flex items-center space-x-1.5 text-[10px] font-normal text-[#0b7a5a] hover:text-white hover:bg-[#0b7a5a] cursor-pointer bg-white px-3 py-1.5 border border-emerald-50 shadow-sm transition-all rounded-sm lowercase tracking-wider">
                                    <FaCamera size={10} />
                                    <span>upload</span>
                                 </label>
                              </div>
                           </div>
                        </div>

                        {/* Form Fields */}
                        <div className="bg-gray-50/30 p-4 border border-gray-100/50 rounded-sm">
                           <h3 className="text-[10px] font-normal text-[#0b7a5a] tracking-[0.2em] mb-3 flex items-center lowercase">
                              <span className="w-1.5 h-1.5 bg-[#0b7a5a] mr-2 rounded-full"></span>
                              administrative parameters
                           </h3>
                           <div className="space-y-3">
                              <div>
                                 <label className="text-[9px] text-slate-400 font-normal lowercase tracking-wider">farm designation *</label>
                                 <input
                                    required
                                    type="text"
                                    placeholder="e.g. mitidja east sector"
                                    className="w-full bg-white border border-transparent border-b-gray-200 py-2 text-[13px] outline-none focus:border-[#0b7a5a] font-normal transition-all text-slate-700 px-1"
                                    value={newFarm.name}
                                    onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] text-slate-400 font-normal lowercase tracking-wider">legal registrar *</label>
                                 <input
                                    required
                                    type="text"
                                    placeholder="authorized entity name"
                                    className="w-full bg-white border border-transparent border-b-gray-200 py-2 text-[13px] outline-none focus:border-[#0b7a5a] font-normal transition-all text-slate-700 px-1"
                                    value={newFarm.owner}
                                    onChange={(e) => setNewFarm({ ...newFarm, owner: e.target.value })}
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] text-slate-400 font-normal lowercase tracking-wider">geographic sector *</label>
                                 <input
                                    required
                                    type="text"
                                    placeholder="region/wilaya"
                                    className="w-full bg-white border border-transparent border-b-gray-200 py-2 text-[13px] outline-none focus:border-[#0b7a5a] font-normal transition-all text-slate-700 px-1"
                                    value={newFarm.location}
                                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] text-slate-400 font-normal lowercase tracking-wider">operational scale *</label>
                                 <input
                                    required
                                    type="text"
                                    placeholder="e.g. 15.0 hectares"
                                    className="w-full bg-white border border-transparent border-b-gray-200 py-2 text-[13px] outline-none focus:border-[#0b7a5a] font-normal transition-all text-slate-700 px-1"
                                    value={newFarm.size}
                                    onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                                 />
                              </div>
                              <div>
                                 <label className="text-[9px] text-slate-400 font-normal lowercase tracking-wider">primary specialization</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. date palms, citrus"
                                    className="w-full bg-white border border-transparent border-b-gray-200 py-2 text-[13px] outline-none focus:border-[#0b7a5a] font-normal transition-all text-slate-700 px-1"
                                    value={newFarm.type}
                                    onChange={(e) => setNewFarm({ ...newFarm, type: e.target.value })}
                                 />
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 border-t border-gray-50 px-6 py-4 shrink-0">
                     <button
                        onClick={() => { setIsRegisterModalOpen(false); }}
                        className="px-5 py-2 text-[10px] font-normal text-slate-400 hover:text-slate-600 transition-colors lowercase tracking-wider"
                     >
                        cancel
                     </button>
                     {/* ✅ تصحيح: عند الضغط يفتح Confirm Modal فقط */}
                     <button
                        onClick={handleRegisterClick}
                        className="px-6 py-2 bg-[#0b7a5a] text-white text-[10px] font-normal tracking-wider transition-all shadow-lg active:scale-95 rounded-sm lowercase"
                     >
                        register site
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default FarmerManagement;