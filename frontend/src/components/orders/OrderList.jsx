import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FaSpinner, FaBoxOpen, FaCheckCircle, FaTimesCircle, FaClock,
  FaTruck, FaMapMarkerAlt, FaLeaf, FaEye, FaEyeSlash, FaStar, FaTimes
} from 'react-icons/fa';
import AppraisalModal from '../buyers/AppraisalModal';

const CarrierModal = ({ isOpen, onClose, transporter }) => {
  if (!isOpen) return null;

  const hasTransporter = !!transporter.name;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[420px] w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-start">
          <div className="flex items-center gap-4">
            {hasTransporter && transporter.avatar ? (
              <img src={transporter.avatar} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-gray-400 text-xl" />
              </div>
            )}
            <div>
              <h3 className="text-base font-normal text-gray-900 tracking-tight">
                {hasTransporter ? "Verified Logistics" : "Support Center"}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-normal">
                {hasTransporter ? transporter.name : "Order Help"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {hasTransporter ? (
            <>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-normal">Phone Number</p>
                <p className="text-[13px] font-normal text-gray-900">{transporter.phone || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-normal">Email Address</p>
                <p className="text-[13px] font-normal text-gray-900">{transporter.email || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-normal">Home Address</p>
                <p className="text-[13px] font-normal text-gray-900">{transporter.address || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-normal">Carrier License</p>
                <p className="text-[13px] font-normal text-gray-900">{transporter.license || 'Not provided'}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-[11px] text-gray-500 font-normal leading-relaxed mb-4">
                Transporter assignment is currently in progress.
              </p>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-normal">Support</p>
                <p className="text-sm font-normal text-blue-600">0555 000 000</p>
              </div>
            </div>
          )}
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
          address: order.tracking_info?.transporter_address,
          avatar: order.tracking_info?.transporter_avatar,
          license: order.tracking_info?.transporter_license
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
            <div className="relative py-4">
              <p className="text-[10px] uppercase font-normal text-gray-400 tracking-widest mb-6">Tracking Timeline</p>

              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50">
                {(() => {
                  const orderStatus = order.order_status?.toLowerCase() === 'on shipping' ? 'shipped' : order.order_status?.toLowerCase();
                  const isCancelled = orderStatus === 'cancelled';

                  const normalSteps = [
                    {
                      label: 'Order Pending',
                      status: 'pending',
                      statusLabel: order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Today',
                      icon: FaClock,
                      desc: 'Your order is pending confirmation.',
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-500'
                    },
                    {
                      label: 'Order Confirmed',
                      status: 'confirmed',
                      statusLabel: 'Confirmed Status',
                      icon: FaCheckCircle,
                      desc: 'Your order has been received and verified.',
                      color: 'text-green-600',
                      bgColor: 'bg-green-500'
                    },
                    {
                      label: 'On Shipping',
                      status: 'shipped',
                      statusLabel: 'Updated Status',
                      icon: FaTruck,
                      desc: 'Your package has been picked up by our transport partner.',
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-600'
                    },
                    {
                      label: 'Delivered successfully',
                      status: 'delivered',
                      statusLabel: 'Recent Update',
                      icon: FaMapMarkerAlt,
                      desc: 'Package has arrived at its final destination.',
                      color: 'text-green-700',
                      bgColor: 'bg-green-600'
                    }
                  ];

                  // For cancelled orders: show pending step + cancelled step
                  if (isCancelled) {
                    return (
                      <>
                        {/* Pending step always shown */}
                        <div className="flex gap-6 items-start relative z-10">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-orange-500 text-white">
                            <FaClock size={16} />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider mb-0.5">
                              {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Today'}
                            </p>
                            <h4 className="text-sm font-normal text-orange-600 mb-0.5">Order Placed</h4>
                            <p className="text-xs text-gray-500 font-normal leading-relaxed">Your order was placed and sent to the farmer.</p>
                          </div>
                        </div>
                        {/* Cancelled step */}
                        <div className="flex gap-6 items-start relative z-10">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-red-500 text-white">
                            <FaTimesCircle size={16} />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider mb-0.5">Final Status</p>
                            <h4 className="text-sm font-normal text-red-600 mb-0.5">Order Cancelled</h4>
                            <p className="text-xs text-gray-500 font-normal leading-relaxed">This order was refused or cancelled. You may place a new order.</p>
                          </div>
                        </div>
                      </>
                    );
                  }

                  // Normal flow
                  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
                  const currentIndex = statuses.indexOf(orderStatus);
                  return normalSteps.map((step, i) => {
                    const stepIndex = statuses.indexOf(step.status);
                    const isReached = stepIndex <= currentIndex;
                    if (!isReached) return null;
                    return (
                      <div key={i} className="flex gap-6 items-start relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${step.bgColor} text-white`}>
                          {step.status === 'confirmed' ? <FaCheckCircle size={16} /> : <step.icon size={16} />}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider mb-0.5">{step.statusLabel}</p>
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className={`text-sm font-normal ${step.color}`}>{step.label}</h4>
                          </div>
                          <p className="text-xs text-gray-500 font-normal leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
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

const OrderList = ({ userRole, filterStatus, searchQuery, initialFilter = 'all' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [profileModal, setProfileModal] = useState(null);

  const ProfileModal = ({ isOpen, onClose, data, title, subtitle }) => {
    if (!isOpen || !data) return null;

    return (
      <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white shadow-2xl max-w-[520px] w-full overflow-hidden animate-scaleUp rounded-[2.5rem] border border-gray-100">
          {/* Header Background Decoration */}
          <div className="h-32 bg-gradient-to-r from-green-50 to-emerald-50 relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-full shadow-sm z-10"
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-10 pb-10 -mt-12 relative text-center">
            <div className="inline-block relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white mx-auto">
                {data.avatar ? (
                  <img src={data.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                    <FaUserCircle size={40} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                <FaCheckCircle size={10} />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{data.name}</h3>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-[0.2em] mt-1.5">{title}</p>
            </div>

            {/* Contact Details Grid */}
            <div className="mt-8 space-y-5 text-left">
              {[
                { label: 'Phone Number', value: data.phone },
                { label: 'Email Address', value: data.email },
                { label: 'Home Address', value: data.address }
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 transition-colors group-hover:text-green-500">{item.label}</p>
                  <div className="bg-gray-50/50 px-5 py-3.5 rounded-2xl border border-transparent transition-all group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-sm">
                    <p className="text-sm text-gray-700 font-medium">{item.value || 'Not provided'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-8 border-t border-gray-50 flex gap-4">
              <button className="flex-1 py-4 bg-green-600 text-white rounded-2xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                Send Message
              </button>
              <button className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    if (initialFilter) {
      setActiveTab(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'All Orders', key: 'all', count: orders.length },
    { id: 'Pending', key: 'pending', count: orders.filter(o => o.order_status === 'pending').length },
    { id: 'Confirmed', key: 'confirmed', count: orders.filter(o => o.order_status === 'confirmed').length },
    { id: 'On Shipping', key: 'shipped', count: orders.filter(o => o.order_status === 'shipped').length },
    { id: 'Delivered', key: 'delivered', count: orders.filter(o => o.order_status === 'delivered').length },
    { id: 'Cancelled', key: 'cancelled', count: orders.filter(o => o.order_status === 'cancelled').length }
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