import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaInfoCircle, FaTractor, FaMapMarkerAlt, FaSeedling, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

// Accepts optional props for modal mode:
//   onClose(success) — called when form closes (success=true after save)
//   editingFarm      — farm to edit (overrides location.state)
const FarmForm = ({ onClose, editingFarm: editingFarmProp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Support both modal props and standalone route (location.state)
  const isModal = typeof onClose === 'function';
  const editingFarm = editingFarmProp || location.state?.farm;

  const [formData, setFormData] = useState({
    FarmName: editingFarm?.FarmName || editingFarm?.name || '',
    LocationFarm: editingFarm?.LocationFarm || editingFarm?.region || 'Algiers',
    Size: editingFarm?.Size || editingFarm?.size || '',
    description: editingFarm?.description || '',
    status: editingFarm?.status || 'Active',
    crops: editingFarm?.crops || [],
    phone: editingFarm?.phone || '',
    email: editingFarm?.email || '',
    address: editingFarm?.address || ''
  });

  const [newCrop, setNewCrop] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const regions = ['Algiers', 'Blida', 'Biskra', 'Oran', 'Medea', 'Sétif', 'Constantine', 'Tizi Ouzou', 'Bejaia', 'Annaba'];

  const handleClose = (success = false) => {
    if (isModal) {
      onClose(success);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        FarmName: formData.FarmName,
        LocationFarm: formData.LocationFarm,
        Size: parseFloat(formData.Size),
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email
      };

      if (editingFarm) {
        await api.put(`/farms/${editingFarm.IdFarm || editingFarm.id}/update/`, payload);
      } else {
        await api.post('/farms/create/', payload);
      }
      handleClose(true);
    } catch (err) {
      console.error('Error saving farm:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const addCrop = () => {
    if (newCrop.trim() && !formData.crops.includes(newCrop.trim())) {
      setFormData({ ...formData, crops: [...formData.crops, newCrop.trim()] });
      setNewCrop('');
    }
  };

  const removeCrop = (cropToRemove) => {
    setFormData({ ...formData, crops: formData.crops.filter(crop => crop !== cropToRemove) });
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 text-sm";
  const labelClass = "block text-xs font-normal text-gray-700 mb-1.5";

  const formContent = (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Farm Name */}
        <div>
          <label className={labelClass}>Farm Name *</label>
          <input
            required
            type="text"
            placeholder="e.g., Blida Citrus Orchards"
            className={inputClass}
            value={formData.FarmName}
            onChange={(e) => setFormData({...formData, FarmName: e.target.value})}
          />
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Address *</label>
          <input
            required
            type="text"
            placeholder="e.g., 123 Rue de la Liberté, Blida"
            className={inputClass}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        {/* Region & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <FaMapMarkerAlt className="inline mr-1" size={10} />
              Region *
            </label>
            <select
              className={inputClass}
              value={formData.LocationFarm}
              onChange={(e) => setFormData({...formData, LocationFarm: e.target.value})}
              required
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              <span className="text-gray-500 mr-2 text-xs font-normal font-mono">Ha</span>
              Size (Hectares) *
            </label>
            <input
              required
              type="number"
              min="0.1"
              step="0.1"
              placeholder="0.00"
              className={inputClass}
              value={formData.Size}
              onChange={(e) => setFormData({...formData, Size: e.target.value})}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <FaPhone className="inline mr-1" size={10} />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+213 555 123 456"
              className={inputClass}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}>
              <FaEnvelope className="inline mr-1" size={10} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="farm@example.com"
              className={inputClass}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Crops */}
        <div>
          <label className={labelClass}>
            <FaSeedling className="inline mr-1" size={10} />
            Main Crops
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g., Tomatoes, Potatoes"
              className={`${inputClass} flex-1`}
              value={newCrop}
              onChange={(e) => setNewCrop(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
            />
            <button
              type="button"
              onClick={addCrop}
              className="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-normal hover:bg-green-800 transition"
            >
              Add
            </button>
          </div>
          {formData.crops.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.crops.map((crop, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700">
                  {crop}
                  <button type="button" onClick={() => removeCrop(crop)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            <FaInfoCircle className="inline mr-1" size={10} />
            Description
          </label>
          <textarea
            rows="3"
            placeholder="Describe your farm: farming methods, certifications, irrigation systems, etc."
            className={`${inputClass} resize-none`}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Farm Status</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="Active"
                checked={formData.status === 'Active'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-4 h-4 text-green-700 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="Inactive"
                checked={formData.status === 'Inactive'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-4 h-4 text-gray-400 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">Inactive</span>
            </label>
          </div>
        </div>

        {/* Verification Checkbox */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-green-700 rounded border-gray-300 focus:ring-green-500 mt-0.5"
            />
            <div>
              <p className="text-sm font-normal text-gray-800 mb-1">Verification Declaration *</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                I certify that this farm operates according to agricultural guidelines.
                All registrations are subject to validation by regional inspectors.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-normal text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-green-700 text-white px-6 py-2.5 rounded-lg font-normal text-sm hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <FaCheck size={14} />
            <span>{submitting ? 'Saving...' : editingFarm ? 'Update Farm' : 'Register Farm'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  // Standalone page mode (route navigation)
  if (!isModal) {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => handleClose()}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm transition-colors"
            >
              <FaArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaTractor size={20} className="text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl font-normal text-gray-900">
                  {editingFarm ? 'Edit Farm' : 'Register New Farm'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {editingFarm ? 'Update farm information' : 'Add a new agricultural unit to your profile'}
                </p>
              </div>
            </div>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  // Modal mode — just return the form content (overlay is in FarmList)
  return formContent;
};

export default FarmForm;