import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSearch, FaTimes, FaFilter, FaSpinner, FaUserCircle, FaComments } from 'react-icons/fa';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { messagingService } from '../../services/messagingService';

const UserValidation = ({ searchQuery: globalSearchQuery }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = globalSearchQuery || localSearchQuery;
  const [typeFilter, setTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const handleStartChat = async (participantId) => {
    if (!participantId) return;
    setChatLoading(true);
    try {
      await messagingService.startConversation(participantId);
      navigate('/messaging');
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Read type from query params
    const type = searchParams.get('type');
    if (type) {
      const typeMap = {
        'farmers': 'Farmer',
        'transporters': 'Transporter',
        'buyers': 'Buyer'
      };
      if (typeMap[type]) {
        setTypeFilter(typeMap[type]);
        setShowFilters(true);
      }
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('users/administrators/registrations/');
      const mapped = response.data.map(user => ({
        id: user.id_user,
        name: user.name,
        avatar: user.avatar,
        updatedAt: user.updated_at,
        type: user.user_type_display || user.user_type,
        region: user.wilaya || 'Unknown',
        date: new Date(user.created_at).toISOString().split('T')[0],
        documents: 'Verified digitally',
        status: user.is_active ? (user.is_validated ? 'Approved' : 'Pending') : 'Rejected',
      }));
      setUsers(mapped);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await api.post(`users/administrators/${id}/approve/`);
        alert('User Approved Successfully!');
      } else {
        await api.post(`users/administrators/${id}/reject/`);
        alert('User Rejected Successfully.');
      }
      fetchUsers(); // Refresh state
    } catch (error) {
       console.error(`Error on ${action}:`, error);
       alert(error.response?.data?.detail || error.response?.data?.status || error.message || `Failed to ${action} user.`);
    }
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const types = ['All', 'Farmer', 'Buyer','Transporter'];
  const regions = ['All', 'Algiers', 'Blida', 'Biskra', 'Medea', 'Oran', 'Constantine', 'Setif'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          String(user.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || user.type === typeFilter;
    const matchesRegion = regionFilter === 'All' || user.region === regionFilter;
    return matchesSearch && matchesType && matchesRegion;
  });

  const pendingUsers = filteredUsers.filter(u => u.status === 'Pending');
  const approvedUsers = filteredUsers.filter(u => u.status === 'Approved');
  const rejectedUsers = filteredUsers.filter(u => u.status === 'Rejected');

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'Pending').length,
    approved: users.filter(u => u.status === 'Approved').length,
    rejected: users.filter(u => u.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#faf8f0] px-4 pt-0 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">User Management</span>
            </div>
            <h1 className="text-xl font-normal text-black">User Validation</h1>
            <p className="text-gray-500 text-[13px] mt-0.5">Review and approve new registrations</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-normal rounded-lg hover:bg-gray-50 transition"
            >
              <FaFilter size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Total Applications</p>
            <p className="text-xl font-normal text-black">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Pending Review</p>
            <p className="text-xl font-normal text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Approved</p>
            <p className="text-xl font-normal text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Rejected</p>
            <p className="text-xl font-normal text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-28 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-800 text-sm transition-all"
            />
            <div className="absolute right-1 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <button className="bg-green-700 text-white px-4 py-1.5 rounded-md text-xs font-normal hover:bg-green-800 transition">
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-xs text-gray-500 mb-1">User Type</label>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Region</label>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => {
                  setTypeFilter('All');
                  setRegionFilter('All');
                  setLocalSearchQuery('');
                }}
                className="self-end px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-normal text-black">
            Pending Approvals ({pendingUsers.length})
          </h2>
          <p className="text-xs text-gray-400">
            Showing {filteredUsers.length} of {users.length} applications
          </p>
        </div>

        {loading ? (
           <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-green-600 text-3xl" />
           </div>
        ) : (
        /* Users Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-normal text-gray-500 uppercase">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-normal text-gray-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-normal text-gray-500 uppercase">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-normal text-gray-500 uppercase">Region / Details</th>
                  <th className="px-5 py-3 text-left text-xs font-normal text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-center text-xs font-normal text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-normal text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-normal text-gray-800">{user.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 bg-white flex items-center justify-center shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaUserCircle className="text-gray-200" size={32} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-normal text-black">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-normal">
                            Updated: {new Date(user.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-normal ${
                        user.type === 'Farmer' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-normal text-gray-800">{user.region}</p>
                      <p className="text-xs text-gray-500">{user.crops || user.vehicles}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{user.date}</td>
                    <td className="px-5 py-3 text-center">
                      {user.status === 'Pending' && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-normal bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                      {user.status === 'Approved' && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-normal bg-green-100 text-green-700">
                          Approved
                        </span>
                      )}
                      {user.status === 'Rejected' && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-normal bg-red-100 text-red-700">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => handleViewDocuments(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="View Documents"
                        >
                          <FaEye size={16} />
                        </button>
                        
                        {user.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleAction(user.id, 'approve')}
                              className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition"
                              title="Approve"
                            >
                              <FaCheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(user.id, 'reject')}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Reject"
                            >
                              <FaTimesCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Processed</span>
                        )}

                        <button 
                          onClick={() => handleStartChat(user.id)}
                          className="p-2 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 transition-all shadow-sm border border-green-100"
                          title="Chat with User"
                        >
                          <FaComments size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing {filteredUsers.length} applications</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-600 hover:bg-white transition disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-600 hover:bg-white transition disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Document View Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl w-full max-w-[340px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-gray-200" size={48} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-normal text-black">User Documents</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                 <label className="block text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">User ID</label>
                <p className="text-sm text-gray-800">{selectedUser.id}</p>
              </div>
              <div>
                <label className="block text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Type</label>
                <p className="text-sm text-gray-800">{selectedUser.type}</p>
              </div>
              <div>
                <label className="block text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Region</label>
                <p className="text-sm text-gray-800">{selectedUser.region}</p>
              </div>
              <div>
                <label className="block text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Submitted Documents</label>
                <p className="text-sm text-gray-800">{selectedUser.documents}</p>
              </div>
              <div>
                <label className="block text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Registration Date</label>
                <p className="text-sm text-gray-800">{selectedUser.date}</p>
              </div>
              {selectedUser.status === 'Pending' && (
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => {
                      handleAction(selectedUser.id, 'approve');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-700 text-white py-2 rounded-lg text-sm font-normal hover:bg-green-800 transition"
                  >
                    Approve User
                  </button>
                  <button
                    onClick={() => {
                      handleAction(selectedUser.id, 'reject');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-normal hover:bg-red-700 transition"
                  >
                    Reject User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserValidation;