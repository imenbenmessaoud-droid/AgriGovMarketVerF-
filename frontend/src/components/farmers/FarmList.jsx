import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaTimes, FaChevronDown, FaTractor, FaFilter, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import FarmCard from './FarmCard';
import FarmForm from './FarmForm';
import api from '../../services/api';

const FarmList = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { searchQuery: globalSearchQuery } = useOutletContext() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [modalFarm, setModalFarm] = useState(null); // null = register new, object = edit

  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farms/my-farms/');
      
      const mappedFarms = response.data.map(f => ({
          ...f,
          id: f.IdFarm,
          name: f.FarmName,
          region: f.LocationFarm,
          size: f.Size,
          status: f.is_active ? 'Active' : 'Inactive',
          registeredDate: f.created_at.split('T')[0],
          crops: [] // Handled separately if implemented
      }));
      setFarms(mappedFarms);
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const toggleFarmStatus = async (id) => {
    try {
      const farmTarget = farms.find(f => f.id === id);
      const isCurrentlyActive = farmTarget.status === 'Active';
      
      await api.patch(`/farms/${id}/update/`, { 
        is_active: !isCurrentlyActive 
      });
      
      // Update local state smoothly
      setFarms(farms.map(f => {
        if(f.id === id) {
          return { ...f, status: !isCurrentlyActive ? 'Active' : 'Inactive' };
        }
        return f;
      }));
    } catch (error) {
      console.error('Failed to toggle farm status:', error);
      alert('Could not update the status on the server. Make sure you have permission.');
    }
  };

  const deleteFarm = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      try {
        await api.delete(`/farms/${id}/delete/`);
        fetchFarms();
      } catch (err) {
         console.error('Error deleting farm:', err);
         alert(err.response?.data?.join(' ') || 'Could not delete farm as it might have active products attached.');
      }
    }
  };

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const openFarmModal = (farm = null) => {
    setModalFarm(farm);
    setShowFarmModal(true);
  };

  const closeFarmModal = (success) => {
    setShowFarmModal(false);
    setModalFarm(null);
    if (success) fetchFarms();
  };

  const editFarm = (farm) => {
    openFarmModal(farm);
  };

  const manageStock = (farm) => {
    navigate('/farmer/products', { state: { filterFarmId: farm.id, filterFarmName: farm.name } });
  };

  const filteredFarms = farms.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesRegion = regionFilter === 'All' || f.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const regions = ['All', 'Biskra', 'Blida', 'Medea', 'Oran', 'Algiers', 'Constantine', 'Tizi Ouzou'];
  const statuses = ['All', 'Active', 'Inactive'];

  const stats = {
    total: farms.length,
    active: farms.filter(f => f.status === 'Active').length,
    totalSize: farms.reduce((sum, f) => sum + f.size, 0).toFixed(1)
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaTractor className="text-green-700" size={18} />
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">Farm Management</span>
            </div>
            <h1 className="text-2xl font-normal text-gray-900">My Farms</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor your agricultural units</p>
          </div>
          
          <button
            onClick={() => openFarmModal()}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg font-normal text-sm hover:bg-green-800 transition"
          >
            <FaPlus size={14} />
            <span>Register Farm</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Farms</p>
            <p className="text-2xl font-normal text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Active Farms</p>
            <p className="text-2xl font-normal text-green-700">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Area</p>
            <p className="text-2xl font-normal text-gray-900">{stats.totalSize} <span className="text-sm font-normal text-gray-500">ha</span></p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by farm name or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-gray-500">
              <FaFilter size={12} />
              <span className="text-xs font-normal">Filter by:</span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsRegionOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-normal text-gray-700 hover:bg-gray-100 transition"
              >
                <span>Status: {statusFilter}</span>
                <FaChevronDown size={10} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px] overflow-hidden">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition ${
                          statusFilter === status ? 'bg-green-50 text-green-700 font-normal' : 'text-gray-600'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Region Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRegionOpen(!isRegionOpen);
                  setIsStatusOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-normal text-gray-700 hover:bg-gray-100 transition"
              >
                <span>Region: {regionFilter}</span>
                <FaChevronDown size={10} className={`transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isRegionOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsRegionOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px] overflow-hidden max-h-60 overflow-y-auto">
                    {regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setRegionFilter(region);
                          setIsRegionOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition ${
                          regionFilter === region ? 'bg-green-50 text-green-700 font-normal' : 'text-gray-600'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reset Button */}
            {(statusFilter !== 'All' || regionFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setRegionFilter('All');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-normal text-gray-900">
            All Farms ({filteredFarms.length})
          </h2>
          <p className="text-xs text-gray-400">
            Showing {filteredFarms.length} of {farms.length}
          </p>
        </div>

        {/* Farms Grid */}
        {filteredFarms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFarms.map(farm => (
              <FarmCard 
                key={farm.id} 
                farm={farm} 
                onToggleStatus={toggleFarmStatus} 
                onDelete={deleteFarm}
                onEdit={editFarm}
                onManageStock={manageStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-400" size={28} />
            </div>
            <p className="text-gray-600 font-normal mb-1">No farms found</p>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or register a new farm</p>
            <button
              onClick={() => openFarmModal()}
              className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-normal"
            >
              <FaPlus size={12} />
              Register New Farm
            </button>
          </div>
        )}
      </div>

      {/* Farm Form Modal */}
      {showFarmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeFarmModal(false); }}
        >
          <div className="bg-[#faf8f0] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaTractor size={16} className="text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-normal text-gray-900">
                    {modalFarm ? 'Edit Farm' : 'Register New Farm'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {modalFarm ? 'Update farm information' : 'Add a new agricultural unit to your profile'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => closeFarmModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Body — FarmForm in modal mode */}
            <div className="p-6">
              <FarmForm onClose={closeFarmModal} editingFarm={modalFarm} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleUp { animation: scaleUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default FarmList;
