import React from 'react';
import { FaMapMarkerAlt, FaRulerCombined, FaEdit, FaPowerOff, FaSeedling, FaBoxes, FaCalendarAlt } from 'react-icons/fa';

const FarmCard = ({ farm, onToggleStatus, onEdit, onDelete, onManageStock }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md ${
      farm.status === 'Active' 
        ? 'hover:border-gray-300' 
        : 'opacity-60 bg-gray-50'
    }`}>
      
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaSeedling className="text-green-700" size={14} />
              <h3 className="text-base font-normal text-black">
                {farm.name}
              </h3>
            </div>
            <span className={`inline-flex text-xs font-normal px-2 py-0.5 rounded-full ${
              farm.status === 'Active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {farm.status === 'Active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit && onEdit(farm)}
              className="p-2 text-gray-400 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              title="Edit farm"
            >
              <FaEdit size={14} />
            </button>
            <button 
              onClick={() => onToggleStatus(farm.id)}
              className={`p-2 rounded-lg transition-colors ${
                farm.status === 'Active' 
                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
              title={farm.status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              <FaPowerOff size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 space-y-4">
        {farm.address && (
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5" size={12} />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Address</p>
              <p className="text-sm font-normal text-black leading-relaxed">
                {farm.address}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5" size={12} />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Region</p>
              <p className="text-sm font-normal text-black">
                {farm.region}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <FaRulerCombined className="text-gray-400 mt-0.5" size={12} />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Size</p>
              <p className="text-sm font-normal text-black">
                {farm.size} hectares
              </p>
            </div>
          </div>
        </div>

        {/* Crops Section */}
        {farm.crops && farm.crops.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Main Crops</p>
            <div className="flex flex-wrap gap-1.5">
              {farm.crops.map((crop, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Registered Date</p>
              <p className="text-xs text-gray-600">
                <FaCalendarAlt className="inline mr-1" size={10} />
                {farm.registeredDate}
              </p>
            </div>
            
            {farm.status === 'Active' ? (
              <button 
                onClick={() => onManageStock && onManageStock(farm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-normal rounded-lg hover:bg-green-800 transition-colors"
              >
                <FaBoxes size={12} />
                Manage Stock
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">
                Inactive Asset
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
