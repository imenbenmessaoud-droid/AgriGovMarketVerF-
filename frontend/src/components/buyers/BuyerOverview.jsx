import React, { useState } from 'react';
import {
  FaShoppingBag, FaClock, FaCheckCircle, FaWallet,
  FaArrowUp, FaChevronRight, FaChevronLeft, FaEye, FaTimes, FaLeaf, FaTruck, FaMapMarkerAlt, FaStar, FaPlus
} from 'react-icons/fa';

const DetailModal = ({ isOpen, onClose, title, subtitle, data, avatar }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-white shadow-2xl max-w-[330px] w-full overflow-hidden animate-scaleUp rounded-[1.5rem] border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
            <div>
              <h3 className="text-sm font-normal text-gray-900 tracking-tight">{title}</h3>
              <p className="text-[10px] text-gray-400 font-normal">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
            <FaTimes size={16} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[8px] text-gray-400 font-normal uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <p className="text-sm text-gray-900 font-normal">{item.value || 'Not provided'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderQuickViewModal = ({ order, onClose }) => {
  const [detailModal, setDetailModal] = useState(null);
  if (!order) return null;
  const raw = order.raw || {};
  const tracking = raw.tracking_info || {};

  const handleShowFarmer = () => {
    setDetailModal({
      type: 'Farmer',
      title: 'Verified Farmer',
      subtitle: raw.farmer_name,
      avatar: order.avatar,
      data: [
        { label: 'Phone Number', value: raw.farmer_phone },
        { label: 'Email Address', value: raw.farmer_email },
        { label: 'Home Address', value: raw.farmer_address || 'Verified Farm Location' }
      ]
    });
  };

  const handleShowCarrier = () => {
    if (!tracking.transporter_name) return;
    setDetailModal({
      type: 'Carrier',
      title: 'Verified Logistics',
      subtitle: tracking.transporter_name,
      avatar: tracking.transporter_avatar,
      data: [
        { label: 'Phone Number', value: tracking.transporter_phone },
        { label: 'Email Address', value: tracking.transporter_email },
        { label: 'Home Address', value: tracking.transporter_address || 'Verified Logistics Hub' },
        { label: 'Carrier License', value: tracking.transporter_license || 'TR-PRO-2026-X' }
      ]
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn cursor-pointer" onClick={onClose}>
        <div className="bg-white shadow-2xl max-w-[620px] w-full overflow-hidden animate-scaleUp border border-gray-100 flex flex-col max-h-[85vh] rounded-xl cursor-default" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-normal text-gray-900 tracking-tight">Order Details</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-widest">{order.id}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto flex-1 pb-6 scrollbar-none">
            <div className="space-y-4">

              {/* Detailed Info Columns */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-2 py-0 pt-1">
                <div className="space-y-2">
                  <div className="cursor-pointer group" onClick={handleShowFarmer}>
                    <p className="text-[9px] text-gray-400 font-normal mb-0.5 uppercase tracking-[0.15em]">Farmer</p>
                    <p className="text-sm text-gray-800 font-normal group-hover:text-green-600 transition-colors">{order.farmer}</p>
                  </div>

                  <div className="cursor-pointer group" onClick={handleShowCarrier}>
                    <p className="text-[9px] text-gray-400 font-normal mb-0.5 uppercase tracking-[0.15em]">Carrier</p>
                    <p className="text-sm text-gray-800 font-normal group-hover:text-green-600 transition-colors">{tracking.transporter_name || 'No assigned transporter'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-gray-400 font-normal mb-0.5 uppercase tracking-[0.15em]">Pickup Address</p>
                    <p className="text-[11px] text-gray-700 font-normal leading-relaxed">{raw.farmer_address || 'city saleh bey num:102'}</p>
                  </div>

                  <div>
                    <p className="text-[9px] text-gray-400 font-normal mb-0.5 uppercase tracking-[0.15em]">Destination</p>
                    <p className="text-[11px] text-gray-700 font-normal leading-relaxed">{raw.delivery_address || '123 Rue des Oliviers, Alger Centre, Algiers'}</p>
                  </div>
                </div>
              </div>

              {/* Items Summary Field */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 font-normal mb-3 uppercase tracking-[0.15em]">Items Summary</p>
                <div className="space-y-2">
                  {raw.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center pb-2 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><FaLeaf size={14} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 font-normal truncate">{item.product_name_snapshot}</p>
                        <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider">x{item.quantity_item} {item.quantity_unit || 'kg'} • {parseFloat(item.price_item).toLocaleString()} DA</p>
                      </div>
                      <span className="text-xs text-gray-900 font-normal">{item.sub_total_item.toLocaleString()} DA</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline (Vertical) */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 font-normal mb-2 uppercase tracking-[0.15em]">Tracking Timeline</p>
                <div className="space-y-3 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50">
                  {[
                    {
                      label: 'Order Pending',
                      status: 'Pending',
                      icon: FaClock,
                      desc: 'Your order is pending confirmation.',
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-500'
                    },
                    {
                      label: 'Order Confirmed',
                      status: 'Confirmed',
                      icon: FaCheckCircle,
                      desc: 'Your order has been received and verified.',
                      color: 'text-green-600',
                      bgColor: 'bg-green-500'
                    },
                    {
                      label: 'On Shipping',
                      status: 'Shipped',
                      icon: FaTruck,
                      desc: 'Your package has been picked up by our transport partner.',
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-600'
                    },
                    {
                      label: 'Delivered successfully',
                      status: 'Delivered',
                      icon: FaMapMarkerAlt,
                      desc: 'Package has arrived at its final destination.',
                      color: 'text-red-900',
                      bgColor: 'bg-red-900'
                    }
                  ].map((step, i) => {
                    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
                    const currentIndex = statuses.indexOf(order.status);
                    const stepIndex = statuses.indexOf(step.status);
                    const isReached = stepIndex <= currentIndex;

                    if (!isReached && order.status !== 'Delivered') return null;

                    return (
                      <div key={i} className="flex gap-4 items-start relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${step.bgColor} text-white`}>
                          {step.status === 'Confirmed' ? <FaCheckCircle size={14} /> : <step.icon size={12} />}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className={`text-xs font-normal ${step.color}`}>{step.label}</h4>
                            <span className="text-[10px] text-gray-400 font-normal">{order.date}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-normal leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer Summary */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0 mb-2">
            <div>
              <p className="text-[10px] text-gray-400 font-normal mb-1 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl text-green-600 font-normal tracking-tight leading-none">{order.total}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-green-600 font-medium uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                Secure Transaction
              </p>
            </div>
          </div>

        </div>
      </div>
      <DetailModal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        {...detailModal}
      />
    </>
  );
};

const BuyerOverview = ({ onNavigate, onAddToCart, realProducts, realStats, realOrders, realCategoryData }) => {
  const [profileModal, setProfileModal] = useState(null);
  const [quickViewOrder, setQuickViewOrder] = useState(null);
  const [priceMonth, setPriceMonth] = useState('All Months');
  const [priceCategory, setPriceCategory] = useState('All Categories');
  const [insightPage, setInsightPage] = useState(0);

  const months = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = ['All Categories', ...new Set((realProducts || []).map(p => p.category_name).filter(Boolean))];

  // Mock Data as fallback
  const fallbackStats = [
    { id: 1, label: 'Total Orders', value: '12', change: '+2 this month', icon: FaShoppingBag, color: 'bg-green-100 text-green-600' },
    { id: 2, label: 'Pending Orders', value: '3', action: 'View details', icon: FaClock, color: 'bg-orange-100 text-orange-600' },
    { id: 3, label: 'Delivered Orders', value: '8', action: 'View details', icon: FaCheckCircle, color: 'bg-green-100 text-green-600' },
    { id: 4, label: 'Total Spent', value: '24,560 DA', change: '+12% from last month', icon: FaWallet, color: 'bg-blue-100 text-blue-600' },
  ];

  const fallbackOrders = [
    { id: '#ORD-1025', farmer: 'SMA Farm', date: 'May 27, 2025', total: '3,450 DA', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { id: '#ORD-1024', farmer: 'ALI Farm', date: 'May 25, 2025', total: '2,150 DA', status: 'Confirmed', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: '#ORD-1023', farmer: 'Green Valley', date: 'May 22, 2025', total: '4,780 DA', status: 'Delivered', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { id: '#ORD-1022', farmer: 'SMA Farm', date: 'May 20, 2025', total: '1,230 DA', status: 'Delivered', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
  ];

  const stats = realStats || fallbackStats;
  const recentOrders = (Array.isArray(realOrders) && realOrders.length > 0) ? realOrders : fallbackOrders;

  return (
    <div className="space-y-8 animate-fadeIn" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Ensure all text uses Outfit */
        * { font-family: 'Outfit', sans-serif !important; }
      `}</style>
      <OrderQuickViewModal
        order={quickViewOrder}
        onClose={() => setQuickViewOrder(null)}
      />
      <DetailModal
        isOpen={!!profileModal}
        onClose={() => setProfileModal(null)}
        {...profileModal}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 font-normal mb-1">{stat.label}</p>
                <h3 className="text-2xl font-normal text-gray-900">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stat.change && (
                <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <FaArrowUp size={8} /> {stat.change}
                </span>
              )}
              {stat.action && (
                <button
                  onClick={() => onNavigate('orders', stat.filter)}
                  className="text-xs text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1"
                >
                  {stat.action} <FaChevronRight size={8} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-lg font-normal text-gray-900">Recent Orders</h3>
          <button
            onClick={() => onNavigate('orders')}
            className="text-sm text-green-700 font-normal hover:underline"
          >
            View All Orders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="pb-4 px-2 font-medium">Order ID</th>
                <th className="pb-4 font-medium">Farmer</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Total</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-gray-900 font-normal">{order.id}</td>
                  <td className="py-4">
                    <button
                      onClick={() => setProfileModal({
                        type: 'Farmer',
                        title: 'Verified Farmer',
                        subtitle: order.farmer,
                        avatar: order.avatar,
                        data: [
                          { label: 'Phone Number', value: order.raw?.farmer_phone || 'Not available' },
                          { label: 'Email Address', value: order.raw?.farmer_email || 'Not available' },
                          { label: 'Home Address', value: order.raw?.farmer_address || 'Verified Farm Location' }
                        ]
                      })}
                      className="flex items-center gap-3 group hover:bg-gray-50/80 p-1 -m-1 rounded-lg transition-all text-left w-full"
                    >
                      <img src={order.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:ring-2 group-hover:ring-green-100 transition-all" alt="" />
                      <span className="text-sm text-gray-700 font-normal group-hover:text-green-600 transition-colors">{order.farmer}</span>
                    </button>
                  </td>
                  <td className="py-4 text-sm text-gray-500 font-normal">{order.date}</td>
                  <td className="py-4 text-sm text-gray-900 font-normal">{order.total}</td>
                  <td className="py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${order.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                      order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Shipped' ? 'bg-amber-50 text-amber-600' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-green-50 text-green-600'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setQuickViewOrder(order)}
                      className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition-all border border-transparent hover:border-green-100 shadow-sm"
                    >
                      <FaEye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Price Insights */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-normal text-gray-900">Market Price Insights</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">30-Day Historical Trends</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={priceMonth}
                onChange={(e) => { setPriceMonth(e.target.value); setInsightPage(0); }}
                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all appearance-none cursor-pointer pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat shadow-sm hover:border-gray-300"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <select
                value={priceCategory}
                onChange={(e) => { setPriceCategory(e.target.value); setInsightPage(0); }}
                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all appearance-none cursor-pointer pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat shadow-sm hover:border-gray-300"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-normal text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
              Live Market
            </span>
          </div>
        </div>

        <div className="relative px-4">
          {(() => {
            const filteredAll = (Array.isArray(realProducts) && realProducts.length > 0)
              ? realProducts.filter(p => {
                const matchCat = priceCategory === 'All Categories' || p.category_name === priceCategory;

                let matchMonth = true;
                if (priceMonth !== 'All Months') {
                  const dateStr = p.production_date || p.item_date || p.created_at;
                  if (dateStr) {
                    const date = new Date(dateStr);
                    const pMonth = date.toLocaleString('en-US', { month: 'long' });
                    matchMonth = pMonth.toLowerCase() === priceMonth.toLowerCase();
                  } else {
                    matchMonth = false;
                  }
                }

                return matchCat && matchMonth;
              })
              : [];

            const maxPages = Math.ceil(filteredAll.length / 4) || 1;
            const filtered = filteredAll.slice(insightPage * 4, (insightPage + 1) * 4);

            if (filteredAll.length > 0) {
              return (
                <>
                  <button
                    onClick={() => setInsightPage(p => Math.max(0, p - 1))}
                    disabled={insightPage === 0}
                    className={`absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-green-100 transition-all z-10 
                      ${insightPage === 0 ? 'opacity-30 cursor-not-allowed text-gray-300' : 'text-green-600 hover:bg-green-50 hover:scale-110'}`}
                  >
                    <FaChevronLeft size={12} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filtered.map(p => ({
                      name: p.product_name,
                      farmer: p.farmer_name || 'Verified Farmer',
                      current: p.product_price,
                      low: p.min_price || Math.floor(p.product_price * 0.85),
                      high: p.max_price || Math.ceil(p.product_price * 1.15),
                      change: (Math.random() * 10).toFixed(1) + '%',
                      up: Math.random() > 0.3,
                      img: p.product_image,
                      stock: (p.quantity > 0 && p.is_available !== false) ? 'in stock' : 'outstock',
                      inStock: (p.quantity > 0 && p.is_available !== false),
                      label: p.category_name || 'Vegetables',
                      fallback: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'
                    })).map((item, idx) => (
                      <div key={idx} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50">
                              <img
                                src={item.img || item.fallback}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = item.fallback;
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-normal text-gray-900">{item.name}</h4>
                              <p className="text-[9px] text-gray-400 uppercase tracking-widest">{item.farmer}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal ${item.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {item.up ? <FaArrowUp size={8} /> : <FaArrowUp className="rotate-180" size={8} />}
                              {item.change}
                            </div>
                            <span className={`text-[9px] font-medium uppercase tracking-wider ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {item.stock}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Current Price</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-normal text-gray-900">{item.current}</span>
                                <span className="text-[10px] text-gray-400 font-normal">DA/KG</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                              <div className="w-24 h-8 flex items-end gap-0.5">
                                {[...Array(8)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-full rounded-t-sm transition-all duration-500 ${item.up ? 'bg-green-100 hover:bg-green-300' : 'bg-red-100 hover:bg-red-300'}`}
                                    style={{ height: `${Math.random() * 100}%` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100/50">
                            <div>
                              <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">30D Lowest</p>
                              <p className="text-xs font-normal text-gray-700">{item.low} DA</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">30D Highest</p>
                              <p className="text-xs font-normal text-gray-700">{item.high} DA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setInsightPage(p => Math.min(maxPages - 1, p + 1))}
                    disabled={insightPage >= maxPages - 1}
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-green-100 transition-all z-10
                      ${insightPage >= maxPages - 1 ? 'opacity-30 cursor-not-allowed text-gray-300' : 'text-green-600 hover:bg-green-50 hover:scale-110'}`}
                  >
                    <FaChevronRight size={12} />
                  </button>
                </>
              );
            }

            // Fallback for no results
            return (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <FaLeaf className="text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-500 font-normal">No products found for this selection</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Try adjusting your filters</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom Layout - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Rated Products - Left Side */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-normal text-gray-900 tracking-tight">Top Rated Products</h3>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest">Handpicked fresh from our verified farms</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-sm text-green-700 font-normal hover:underline flex items-center gap-2"
            >
              Explore All <FaChevronRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(realProducts) && realProducts.length > 0 ? [...realProducts] : [
              { id: 1, product_name: 'Fresh Organic Carrots', farmer_name: 'Aissa Farm', product_price: 120, average_rating: 5, review_count: 48, product_image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', product_quality: 'premium' },
              { id: 2, product_name: 'Red Delicious Apples', farmer_name: 'Green Valley', product_price: 250, average_rating: 4.9, review_count: 124, product_image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=400', product_quality: 'premium' },
              { id: 3, product_name: 'Golden Honey', farmer_name: 'Bzz Farm', product_price: 1500, average_rating: 4.8, review_count: 89, product_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', product_quality: 'premium' },
              { id: 4, product_name: 'Extra Virgin Olive Oil', farmer_name: 'Zitoun Farm', product_price: 850, average_rating: 4.8, review_count: 56, product_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbad8a0f?w=400', product_quality: 'premium' },
              { id: 5, product_name: 'Fresh Farm Eggs', farmer_name: 'Poultry Pro', product_price: 15, average_rating: 4.7, review_count: 210, product_image: 'https://images.unsplash.com/photo-1582722872445-44c59ebc41dd?w=400', product_quality: 'standard' },
              { id: 6, product_name: 'Cherry Tomatoes', farmer_name: 'Sun Garden', product_price: 180, average_rating: 4.7, review_count: 42, product_image: 'https://images.unsplash.com/photo-1561131245-c9302e082ee8?w=400', product_quality: 'premium' },
            ])
              .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0) || (b.review_count || 0) - (a.review_count || 0))
              .slice(0, 6)
              .map((product, idx) => (
                <div key={product.id || idx} className="group flex flex-col bg-gray-50/30 rounded-2xl p-3 border border-transparent hover:border-green-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                    <img
                      src={product.product_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {idx === 0 && (
                        <span className="bg-amber-400 text-white text-[8px] px-2 py-0.5 rounded-full font-normal shadow-sm uppercase tracking-wider">Top Rated</span>
                      )}
                      {product.review_count > 100 && (
                        <span className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full font-normal shadow-sm uppercase tracking-wider">Best Seller</span>
                      )}
                      {idx < 3 && (
                        <span className="bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-normal shadow-sm uppercase tracking-wider">Trending</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 px-1">
                    <h4 className="text-xs font-normal text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">{product.product_name}</h4>
                    <p className="text-[10px] text-gray-400 font-normal">{product.farmer_name}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={8} className={i < Math.floor(product.average_rating || 4) ? 'fill-current' : 'text-gray-200'} />
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-500 font-normal">({product.review_count || 0})</span>
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-sm font-normal text-gray-900">{product.product_price} <span className="text-[10px] text-gray-400">DA</span></span>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-green-600 hover:border-green-100 flex items-center justify-center transition-all shadow-sm"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Orders - Right Side */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col h-full max-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-normal text-gray-900 tracking-tight">Top Orders</h3>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest">Your highest value purchases</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-none">
            {[...recentOrders]
              .filter(order => order.status && order.status.toLowerCase() === 'delivered')
              .sort((a, b) => {
                const parseTotal = (t) => parseFloat(String(t).replace(/[^\d.-]/g, '')) || 0;
                return parseTotal(b.total) - parseTotal(a.total);
              })
              .slice(0, 5)
              .map((order, idx) => (
                <div key={order.id || idx} className="bg-gray-50/30 rounded-2xl p-4 border border-transparent hover:border-amber-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-sm font-normal text-gray-900 group-hover:text-amber-600 transition-colors">{order.id}</h4>
                        <p className="text-[10px] text-gray-400 font-normal">{order.date}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${order.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                      order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Shipped' ? 'bg-amber-50 text-amber-600' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-green-50 text-green-600'
                      }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100/50">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-0.5">Total</span>
                      <span className="text-sm font-normal text-gray-900">{order.total}</span>
                    </div>
                    <button
                      onClick={() => setQuickViewOrder(order)}
                      className="text-[11px] text-gray-500 hover:text-amber-600 font-normal flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-100 hover:border-amber-200 shadow-sm"
                    >
                      <FaEye size={10} /> View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default BuyerOverview;
