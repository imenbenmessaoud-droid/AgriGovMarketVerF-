import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FaSpinner, FaBoxOpen, FaCheckCircle, FaTimesCircle, FaClock,
  FaTruck, FaMapMarkerAlt, FaLeaf, FaEye, FaEyeSlash, FaStar
} from 'react-icons/fa';
import AppraisalModal from '../buyers/AppraisalModal';

const CarrierModal = ({ isOpen, onClose, transporter }) => {
  if (!isOpen) return null;

  const hasTransporter = !!transporter.name;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-[320px] w-full overflow-hidden animate-scaleUp border border-gray-100 relative">
        {/* Close icon */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 z-20 transition-colors p-1"
        >
          <FaTimesCircle size={18} />
        </button>

        <div className="p-6 text-center relative border-b border-gray-50">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-100">
            <FaTruck size={22} className={hasTransporter ? "text-green-600" : "text-blue-600"} />
          </div>
          <h3 className="text-lg font-normal tracking-tight text-gray-900">
            {hasTransporter ? "Carrier Details" : "Support Center"}
          </h3>
          <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mt-1 font-normal">
            {hasTransporter ? "Verified Logistics" : "Order Help"}
          </p>
        </div>
        
        <div className="p-5 bg-white">
          <div className="space-y-2.5">
            {hasTransporter ? (
              <>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5 font-normal">Full Name</p>
                  <p className="text-xs font-normal text-gray-900">{transporter.name}</p>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5 font-normal">Email Address</p>
                  <p className="text-xs font-normal text-gray-900 break-all">{transporter.email || 'No email'}</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5 font-normal">Location</p>
                  <p className="text-xs font-normal text-gray-900">{transporter.address || 'No address'}</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5 font-normal">Contact</p>
                  <p className="text-xs font-normal text-green-600">{transporter.phone || 'No phone'}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-[10px] text-gray-500 font-normal leading-relaxed mb-3">
                  Transporter assignment in progress.
                </p>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-left">
                   <p className="text-[7px] text-gray-400 uppercase tracking-widest mb-0.5 font-normal">Support</p>
                   <p className="text-xs font-normal text-blue-600">0555 000 000</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, userRole, onRate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);

  const formatStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'shipped') return 'On Shipping';
    if (s === 'delivered') return 'Arrived';
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-white text-gray-800';
      case 'confirmed': return 'bg-blue-50 text-blue-800';
      case 'shipped': return 'bg-amber-50 text-amber-800';
      case 'delivered': return 'bg-green-50 text-green-800';
      case 'cancelled': return 'bg-red-50 text-red-800';
      default: return 'bg-white text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 font-sans">
      {/* Carrier Modal */}
      <CarrierModal 
        isOpen={showCarrierModal} 
        onClose={() => setShowCarrierModal(false)} 
        transporter={{
          name: order.tracking_info?.transporter_name,
          phone: order.tracking_info?.transporter_phone,
          email: order.tracking_info?.transporter_email,
          address: order.tracking_info?.transporter_address
        }}
      />
      {/* Header */}
      <div className="bg-[#1e2330] px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FaBoxOpen className="text-gray-300" size={16} />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-normal tracking-widest uppercase mb-0.5">Order ID</p>
            <p className="text-white font-normal text-sm tracking-wide">ORD-{order.order_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="bg-white/10 text-gray-300 text-[11px] px-3 py-1.5 rounded-full font-normal tracking-wide">
            # {new Date(order.order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className={`text-[11px] px-4 py-1.5 rounded-full font-normal shadow-sm ${getStatusColor(order.order_status)}`}>
            {formatStatus(order.order_status)}
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-6">
        {/* Tracking Origin/Destination Line */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 mb-6 relative">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl z-10 shadow-sm border border-gray-100 w-full md:w-auto flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
              <FaTruck size={14} />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-normal uppercase tracking-widest">Origin</p>
              <p className="text-xs font-normal text-gray-800">{order.farmer_name || 'Various Farm Units'}</p>
            </div>
          </div>

          {/* Dotted Line connector */}
          <div className="hidden md:block flex-1 border-t-2 border-dashed border-gray-200 relative mx-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
          </div>

          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl z-10 shadow-sm border border-gray-100 w-full md:w-auto flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <FaMapMarkerAlt size={14} />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-normal uppercase tracking-widest">Destination</p>
              <p className="text-xs font-normal text-gray-800 truncate max-w-[150px]">{order.delivery_address || 'No address provided'}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-6 border border-gray-100 rounded-2xl overflow-hidden">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200/50">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                  ) : (
                    <FaLeaf className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-normal text-gray-800">{item.product_name_snapshot}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-normal">{parseFloat(item.price_item)} DZD / {item.quantity_unit || 'kg'}</p>
                </div>
              </div>
              <div className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                x{parseFloat(item.quantity_item)}
              </div>
            </div>
          ))}
        </div>

        {/* Total & Action */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest mb-1 bg-white inline-block px-2 py-0.5 rounded shadow-sm border border-gray-100">Total Amount</p>
            <div className="text-2xl font-normal text-gray-800 mt-1 flex items-baseline gap-1.5">
              {parseFloat(order.total_amount).toLocaleString()} <span className="text-sm font-normal text-gray-400">DZD</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-normal text-xs transition-colors shadow-sm"
          >
            {isExpanded ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>

          {userRole === 'buyer' && !order.appraisal && order.order_status?.toLowerCase() === 'delivered' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate(order);
              }}
              className="flex items-center gap-2 bg-[#FFB82E] hover:bg-[#e5a62a] text-white px-5 py-2.5 rounded-lg font-normal text-xs transition-colors shadow-sm"
            >
              <FaStar size={12} />
              <span>Rate Service</span>
            </button>
          )}

          {order.appraisal && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-4 py-2.5 rounded-lg">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < order.appraisal.rating ? 'text-yellow-400' : 'text-gray-200'} size={10} />
                ))}
              </div>
              <span className="text-[10px] font-normal text-yellow-700 uppercase tracking-wider">Rated</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-fadeIn">
            <div className="border-l-[3px] border-gray-100 ml-4 pl-8 pb-6 relative">
              <p className="text-[10px] uppercase font-normal text-gray-400 tracking-widest absolute -top-3 left-0 bg-white pr-3">Tracking Timeline</p>

              {/* Dynamic Timeline based on order status */}
              <div className="space-y-8 mt-8">
                {order.order_status?.toLowerCase() === 'cancelled' ? (
                  <div className="relative">
                    <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-sm">
                      <FaTimesCircle className="text-white text-[10px]" />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-0.5 font-normal">{new Date(order.order_date).toLocaleDateString('en-GB')}</p>
                    <p className="text-sm font-normal text-red-700">Order Rejected</p>
                    <p className="text-[11px] text-gray-500 mt-1">This order has been rejected or cancelled by the farmer.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className={`absolute -left-[45px] top-0 w-6 h-6 rounded-full ${order.order_status?.toLowerCase() === 'pending' ? 'bg-yellow-500' : 'bg-green-500'} flex items-center justify-center border-[3px] border-white shadow-sm`}>
                      {order.order_status?.toLowerCase() === 'pending' ? <FaClock className="text-white text-[10px]" /> : <FaCheckCircle className="text-white text-[10px]" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mb-0.5 font-normal">{new Date(order.order_date).toLocaleDateString('en-GB')}</p>
                    <p className={`text-sm font-normal ${order.order_status?.toLowerCase() === 'pending' ? 'text-yellow-700' : 'text-green-700'}`}>
                      {order.order_status?.toLowerCase() === 'pending' ? 'Order Pending' : 'Order Confirmed'}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {order.order_status?.toLowerCase() === 'pending' ? 'Awaiting farmer approval.' : 'Your order has been received and verified.'}
                    </p>
                  </div>
                )}
                {['shipped', 'delivered'].includes(order.order_status?.toLowerCase()) && (
                  <div className="relative">
                    <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-[3px] border-white shadow-sm">
                      <FaTruck className="text-white text-[10px]" />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-0.5 font-normal">Updated Status</p>
                    <p className="text-sm font-normal text-blue-700">On Shipping</p>
                    <p className="text-[11px] text-gray-500 mt-1">Your package has been picked up by our transport partner.</p>
                  </div>
                )}

                {order.order_status?.toLowerCase() === 'delivered' && (
                  <div className="relative">
                    <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-sm">
                      <FaMapMarkerAlt className="text-white text-[10px]" />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-0.5 font-normal">Recent Update</p>
                    <p className="text-sm font-normal text-red-700">Delivered successfully</p>
                    <p className="text-[11px] text-gray-500 mt-1">Package has arrived at its final destination.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Carrier block */}
            <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100/80">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1e2330] rounded-full flex items-center justify-center text-white shadow-sm">
                  <FaTruck size={14} />
                </div>
                <div>
                  <p className="text-sm font-normal text-gray-900">{order.tracking_info?.transporter_name || 'Assigned Logistics Partner'}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 font-normal">Carrier • TR-{new Date().getFullYear()}-001</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCarrierModal(true)}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-normal text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderList = ({ userRole, filterStatus, searchQuery }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('orders/orders/my_orders/'),
        api.get('products/product-items/available/').catch(() => ({ data: [] }))
      ]);

      const rawOrders = ordersRes.data.results || ordersRes.data;
      const products = productsRes.data.results || productsRes.data || [];

      // Build a lookup map: product name (lowercase) -> image URL
      const imageMap = {};
      products.forEach(p => {
        if (p.product_name && p.product_image) {
          imageMap[p.product_name.toLowerCase()] = p.product_image;
        }
      });

      // Enrich order items with product images
      const enrichedOrders = rawOrders.map(order => ({
        ...order,
        items: order.items?.map(item => ({
          ...item,
          product_image: item.product_image ||
            imageMap[(item.product_name_snapshot || '').toLowerCase()] ||
            null
        }))
      }));

      setOrders(enrichedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'All', key: 'all', count: orders.length },
    { id: 'Pending', key: 'pending', count: orders.filter(o => o.order_status === 'pending').length },
    { id: 'On Shipping', key: 'shipped', count: orders.filter(o => o.order_status === 'shipped').length },
    { id: 'Arrived', key: 'delivered', count: orders.filter(o => o.order_status === 'delivered').length }
  ];

  let displayOrders = orders;

  const currentFilterKey = filterStatus && filterStatus !== 'all' ? filterStatus : activeTab;

  if (currentFilterKey !== 'all') {
    displayOrders = orders.filter(o => o.order_status.toLowerCase() === currentFilterKey);
  }

  if (searchQuery) {
    displayOrders = displayOrders.filter(o =>
      String(o.order_number).includes(searchQuery) ||
      o.items?.some(item => item.product_name_snapshot?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // We always show tabs locally unless explicitly hidden, but since OrderHistory is being simplified,
  // we'll manage the pristine tabs right here.
  const showTabs = !filterStatus || filterStatus === 'all' || filterStatus === undefined;

  return (
    <div className="w-full">
      {/* Pills Navigation matching screenshot */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-normal transition-all whitespace-nowrap shadow-sm border border-gray-100 ${isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.id}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-normal ${isActive
                  ? 'bg-white text-black'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <FaSpinner className="text-green-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-[10px] font-normal text-gray-400 uppercase tracking-[0.2em]">Retrieving your orders...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur rounded-[2rem] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen className="text-gray-300" size={32} />
            </div>
            <p className="text-[10px] font-normal text-gray-400 uppercase tracking-[0.2em]">No orders found in this category</p>
          </div>
        ) : (
          displayOrders.map(order => (
            <OrderCard
              key={order.order_number}
              order={order}
              userRole={userRole}
              onRate={(ord) => {
                setSelectedOrder(ord);
                setShowAppraisalModal(true);
              }}
            />
          ))
        )}
      </div>

      {selectedOrder && (
        <AppraisalModal
          order={selectedOrder}
          isOpen={showAppraisalModal}
          onClose={() => setShowAppraisalModal(false)}
          onRefresh={fetchOrders}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default OrderList;