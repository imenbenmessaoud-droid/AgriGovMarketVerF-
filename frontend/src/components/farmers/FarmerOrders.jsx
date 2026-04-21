import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEllipsisV, FaChevronDown,
  FaCog, FaUserCircle, FaMapMarkerAlt, FaCalendarAlt,
  FaWallet, FaCheckCircle, FaClock, FaTruck, FaEdit, FaTrashAlt,
  FaFileExport, FaPlus, FaTimes, FaBoxOpen, FaClipboardList, FaFileInvoiceDollar,
  FaPhoneAlt, FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const initialOrders = [
  { id: '#2632', name: 'Brooklyn Zoe', address: 'Biskra Oasis Palms', date: '31 Mar 2024', price: '25,600', status: 'Food Processing', payment: 'Pending', avatar: 'https://i.pravatar.cc/150?u=2632', phone: '+213 550 12 34 56', itemsCount: 4, itemsList: 'Organic Medjool Dates x 2, Deglet Noor x 1, Honey x 1' },
  { id: '#2633', name: 'John McCormick', address: 'Blida Citrus Orchard', date: '01 Apr 2024', price: '12,500', status: 'Delivered', payment: 'Paid', avatar: 'https://i.pravatar.cc/150?u=2633', phone: '+213 661 23 45 67', itemsCount: 2, itemsList: 'Valencia Oranges x 10, Lemon Zest x 2' },
  { id: '#2634', name: 'Sandra Pugh', address: 'Verified Estate Registry', date: '02 Apr 2024', price: '8,400', status: 'Out for delivery', payment: 'Paid', avatar: 'https://i.pravatar.cc/150?u=2634', phone: '+213 772 34 56 78', itemsCount: 1, itemsList: 'Seedless Watermelon x 5' },
  { id: '#2635', name: 'Vernie Hart', address: 'Poultry Central Unit', date: '02 Apr 2024', price: '42,000', status: 'Food Processing', payment: 'Partial', avatar: 'https://i.pravatar.cc/150?u=2635', phone: '+213 555 66 77 88', itemsCount: 5, itemsList: 'Organic Eggs (Bulk) x 10, Free Range Chicken x 3' },
];

const FarmerOrders = () => {
  const { searchQuery } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('orders/orders/my_orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    setLoadingId(orderId);
    try {
      await api.patch(`orders/orders/${orderId}/accept/`);
      await fetchOrders();
    } catch (err) {
      alert('Failed to accept order');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRefuse = async (orderId) => {
    setLoadingId(orderId);
    try {
      await api.patch(`orders/orders/${orderId}/refuse/`);
      await fetchOrders();
    } catch (err) {
      alert('Failed to refuse order');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchStr = searchQuery?.toLowerCase() || '';
    const matchesSearch = 
      String(order.order_number).includes(searchStr) ||
      order.buyer_name?.toLowerCase().includes(searchStr);
    
    const matchesStatus = statusFilter === 'All Status' || order.order_status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const StatusDropdown = ({ currentStatus, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statuses = ['Pending', 'Food Processing', 'Out for delivery', 'Delivered'];

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between min-w-[160px] px-4 py-2 text-sm font-normal rounded-lg border transition-all ${getStatusColor(currentStatus)}`}
        >
          {currentStatus}
          <FaChevronDown className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} size={12} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-normal"
                >
                  {status}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-normal text-gray-900">Order Management</h1>
            <p className="text-gray-500 text-sm mt-1 font-normal">Monitor and fulfill your agricultural deployments</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setStatusFilter('All Status')}
              className={`px-5 py-2 rounded-lg text-sm font-normal transition-all ${
                statusFilter === 'All Status' 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-200'
              }`}
            >
              All Orders
            </button>
            <button 
              onClick={() => setStatusFilter('Pending')}
              className={`px-5 py-2 rounded-lg text-sm font-normal transition-all ${
                statusFilter === 'Pending' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-normal text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Pending Approval</p>
            <p className="text-2xl font-normal text-amber-600">{orders.filter(o => o.order_status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Confirmed</p>
            <p className="text-2xl font-normal text-green-600">{orders.filter(o => o.order_status === 'confirmed').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Cancelled</p>
            <p className="text-2xl font-normal text-red-600">{orders.filter(o => o.order_status === 'cancelled').length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
              <FaSpinner className="text-green-600 animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-500">Fetching order ledger...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order) => (
              <div 
                key={order.order_number} 
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:shadow-md transition-all duration-300 group"
              >
                {/* Left Side: Product Icon */}
                <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FaBoxOpen className="text-green-700" size={28} />
                </div>

                {/* Middle: Details */}
                <div className="flex-grow space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-normal text-gray-900">#ORD-{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-normal line-clamp-1">
                      {order.items?.map(i => `${i.product_name_snapshot} (${i.quantity_item})`).join(', ') || 'No items listed'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="bg-gray-50 px-2 py-0.5 rounded-full">{order.items?.length || 0} items</span>
                      <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {new Date(order.order_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-base font-normal text-gray-900">{order.buyer_name}</p>
                    <p className="text-xs text-gray-500 font-normal">
                       <FaMapMarkerAlt className="inline mr-1 text-green-600" size={10} />
                       {order.delivery_address || order.notes || 'Pick up at farm'}
                    </p>
                  </div>
                </div>

                {/* Right: Pricing and Actions */}
                <div className="flex flex-col items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                  <div className="text-right mb-1">
                    <p className="text-[10px] text-gray-400 font-normal uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-2xl font-normal text-gray-900">{order.total_amount?.toLocaleString()} <span className="text-xs font-normal text-gray-400">DZD</span></p>
                  </div>

                  {order.order_status === 'pending' && (
                    <div className="flex gap-2 w-full lg:w-auto">
                      <button 
                        onClick={() => handleAccept(order.order_number)}
                        disabled={loadingId === order.order_number}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-normal hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center min-w-[100px]"
                      >
                        {loadingId === order.order_number ? <FaSpinner className="animate-spin" /> : 'Accept'}
                      </button>
                      <button 
                        onClick={() => handleRefuse(order.order_number)}
                        disabled={loadingId === order.order_number}
                        className="flex-1 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-normal hover:bg-red-50 transition-colors flex items-center justify-center min-w-[100px]"
                      >
                        {loadingId === order.order_number ? <FaSpinner className="animate-spin" /> : 'Refuse'}
                      </button>
                    </div>
                  )}
                  {order.order_status === 'confirmed' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-normal border border-green-100">
                      <FaTruck size={12} />
                      Awaiting Logistics
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-normal text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-10 h-10 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <FaChevronDown className="rotate-90 mx-auto" size={12} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-normal transition-all ${
                    currentPage === i + 1 
                      ? 'bg-green-700 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-green-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-10 h-10 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <FaChevronDown className="-rotate-90 mx-auto" size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;