 import React, { useState } from 'react';
import {
  FaTruck, FaMapMarkerAlt, FaShoppingBag,
  FaChevronDown, FaChevronUp, FaCheckCircle,
  FaUserCircle, FaPhoneAlt, FaClock, FaBox,
  FaCalendarAlt, FaFilter, FaEye
} from 'react-icons/fa';

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
      
      {/* Header - مسافة أقل */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2.5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FaBox className="text-white/80 text-[10px]" />
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">ORDER REF</p>
              <p className="text-sm font-normal text-white">{order.order_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <FaCalendarAlt className="text-white/60 text-[9px]" />
              <span className="text-[11px] text-white/80">{new Date(order.order_date).toLocaleDateString()}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-normal border ${getStatusStyle(order.order_status)} uppercase`}>
              {order.order_status}
            </span>
          </div>
        </div>
      </div>

      {/* Body - مسافة أقل */}
      <div className="p-4">
        
        {/* Route - مسافة أقل */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaTruck className="text-emerald-600 text-sm" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Farmer</p>
                <p className="text-sm font-normal text-gray-800">{order.farmer_name || 'AgriGov Farmer'}</p>
              </div>
            </div>

            <div className="flex-1 mx-3">
              <div className="relative">
                <div className="border-t border-dashed border-gray-300"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaMapMarkerAlt className="text-blue-600 text-sm" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Destination</p>
                <p className="text-sm font-normal text-gray-800">{order.notes || 'Default Address'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items - مسافة أقل */}
        <div className="space-y-1.5 mb-4 max-h-44 overflow-y-auto custom-scrollbar">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <FaBox className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-normal text-gray-800">{item.product_name_snapshot}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {item.price_item} DZD unit price
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-normal text-gray-800">x{item.quantity_item}</p>
                <p className="text-[10px] font-normal text-gray-900">{item.sub_total_item} DZD</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer - مسافة أقل */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2.5 border-t border-gray-100">
          <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Amount Paid</p>
            <p className="text-xl font-normal text-gray-900">{order.total_amount} <span className="text-xs font-normal text-gray-400">DZD</span></p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-normal hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <FaEye size={10} />
            <span>{expanded ? 'Hide Details' : 'View Details'}</span>
            {expanded ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
        </div>

        {/* Expanded Content - مسافة أقل */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
            
            {/* Tracking Timeline */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-0.5 h-4 bg-gray-500 rounded-full"></div>
              <h4 className="text-xs font-normal text-gray-700 uppercase tracking-wider">Tracking Timeline</h4>
            </div>
            
            <div className="space-y-3 mb-4">
              
              {/* 1. Order confirmed - VERT */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md shadow-green-200">
                    <FaCheckCircle className="text-white text-[10px]" />
                  </div>
                  <div className="w-0.5 h-8 bg-green-200 mt-0.5"></div>
                </div>
                <div className="flex-1 pb-1.5">
                  <p className="text-[10px] text-gray-400">20 May 2026</p>
                  <p className="text-sm font-normal text-green-700">Order confirmed</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Your order has been received</p>
                </div>
              </div>

              {/* 2. On Shipping - BLEU */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-md shadow-blue-200">
                    <FaTruck className="text-white text-[10px]" />
                  </div>
                  <div className="w-0.5 h-8 bg-blue-200 mt-0.5"></div>
                </div>
                <div className="flex-1 pb-1.5">
                  <p className="text-[10px] text-gray-400">20 May 2026</p>
                  <p className="text-sm font-normal text-blue-700">On Shipping</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Your order is on the way</p>
                </div>
              </div>

              {/* 3. Delivered - ROUGE */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md shadow-red-200">
                    <FaMapMarkerAlt className="text-white text-[10px]" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400">20 May 2026</p>
                  <p className="text-sm font-normal text-red-700">Delivered to Sétif Distribution</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Package delivered successfully</p>
                </div>
              </div>

            </div>

            {/* Transporter Info - مسافة أقل */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 flex items-center justify-between border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                  <FaUserCircle className="text-white text-base" />
                </div>
                <div>
                  <p className="text-sm font-normal text-gray-800">Khaled Transport</p>
                  <p className="text-[10px] text-gray-400">Carrier • TR-2024-001</p>
                </div>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-normal text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-300">
                <FaPhoneAlt size={9} />
                Contact
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
        `
      }} />
    </div>
  );
};

export default OrderCard;