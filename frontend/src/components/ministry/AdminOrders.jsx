import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBoxOpen, FaUser, FaTractor, FaCalendarAlt, FaMoneyBillWave, FaTimes, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('orders/orders/');
      const orderData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setOrders(orderData);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.buyer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.farmer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#faf8f0] px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FaBoxOpen className="text-green-700" size={18} />
            <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">Orders Management</span>
          </div>
          <h1 className="text-2xl font-normal text-black">All Platform Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor and manage all transactions across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2 font-medium">Total Orders</p>
            <p className="text-3xl font-normal text-black">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2 font-medium">Pending Approval</p>
            <p className="text-3xl font-normal text-[#e67e22]">{orders.filter(o => o.order_status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2 font-medium">Confirmed</p>
            <p className="text-3xl font-normal text-[#27ae60]">{orders.filter(o => o.order_status === 'confirmed').length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2 font-medium">Cancelled</p>
            <p className="text-3xl font-normal text-[#c0392b]">{orders.filter(o => o.order_status === 'cancelled').length}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by Order ID, Buyer, or Farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <div className="relative w-full md:w-64">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <FaSpinner className="animate-spin text-green-700 mx-auto mb-4" size={24} />
              <p className="text-gray-500 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Buyer</th>
                    <th className="px-6 py-4 font-medium">Farmer</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <tr key={order.order_number} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-black">#{order.order_number?.toString().substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at || order.order_date).toLocaleString([], {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" size={12} />
                          <span className="text-sm text-gray-700">{order.buyer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaTractor className="text-gray-400" size={12} />
                          <span className="text-sm text-gray-700">{order.farmer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-black">
                          {parseFloat(order.total_amount || 0).toLocaleString()} DZD
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-green-700 hover:text-green-800 font-medium hover:underline bg-green-50 px-3 py-1 rounded-lg"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBoxOpen className="text-gray-300" size={24} />
              </div>
              <p className="text-gray-600 font-medium mb-1">No orders found</p>
              <p className="text-gray-400 text-sm">Adjust your search or filter settings to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-medium text-black flex items-center gap-3">
                  Order Details
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-mono">#{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Buyer Information</p>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <p className="text-sm font-medium text-black">{selectedOrder.buyer_name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" />
                      <p className="text-sm text-gray-700">{selectedOrder.delivery_address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Farmer Information</p>
                    <div className="flex items-center gap-2">
                      <FaTractor className="text-gray-400" />
                      <p className="text-sm font-medium text-black">{selectedOrder.farmer_name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Date & Time</p>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {new Date(selectedOrder.created_at || selectedOrder.order_date).toLocaleString([], {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-xs text-gray-500 font-medium">Product</th>
                        <th className="px-4 py-2 text-xs text-gray-500 font-medium text-center">Qty</th>
                        <th className="px-4 py-2 text-xs text-gray-500 font-medium text-right">Price</th>
                        <th className="px-4 py-2 text-xs text-gray-500 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-black">{item.product_name_snapshot}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity_item} {item.quantity_unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.price_item} DZD</td>
                          <td className="px-4 py-3 text-sm font-medium text-black text-right">{item.sub_total_item} DZD</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 font-medium text-right">Total Amount:</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">
                          {parseFloat(selectedOrder.total_amount || 0).toLocaleString()} DZD
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-black font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
