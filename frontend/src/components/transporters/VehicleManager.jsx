import React, { useState, useEffect } from 'react';
import { FaTruck, FaPlus, FaTrashAlt, FaEdit, FaCheck, FaTimes, FaMapMarkerAlt, FaWeightHanging, FaIdCard, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const wilayasList = [
  'Algiers', 'Blida', 'Tipaza', 'Boumerdès', 'Oran',
  'Constantine', 'Sétif', 'Biskra', 'Médéa', 'Tizi Ouzou',
  'Chlef', 'Djelfa', 'Mascara'
];

const VehicleManager = ({ onNavigate }) => {
  const [fleet, setFleet] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [topCity, setTopCity] = useState(null);

  const [formData, setFormData] = useState({
    plates: '',
    model: '',
    type: 'REFRIGERATED',
    capacity: '',
    wilayas: []
  });

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const res = await api.get('users/vehicles/');
      setFleet(res.data || []);
      
      const deliveriesRes = await api.get('/deliveries/missions/my_missions/?status=delivered');
      const deliveries = deliveriesRes.data || [];
      if (deliveries.length > 0) {
        const cityCounts = {};
        deliveries.forEach(d => {
          const loc = d.delivery_location || 'Unknown';
          const city = loc.split(',').pop().trim();
          if (city && city !== 'Unknown') {
            cityCounts[city] = (cityCounts[city] || 0) + 1;
          }
        });
        const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
        if (sortedCities.length > 0) {
          setTopCity(sortedCities[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleWilaya = (wilaya) => {
    setFormData(prev => ({
      ...prev,
      wilayas: prev.wilayas.includes(wilaya)
        ? prev.wilayas.filter(w => w !== wilaya)
        : [...prev.wilayas, wilaya]
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      plates: '',
      model: '',
      type: 'REFRIGERATED',
      capacity: '',
      wilayas: []
    });
  };

  const handleUpdate = (vehicle) => {
    setFormData({
      id: vehicle.id,
      plates: vehicle.license_number,
      model: vehicle.model || '',
      type: vehicle.vehicle_type || 'REFRIGERATED',
      capacity: vehicle.capacity || '',
      wilayas: vehicle.area_service && vehicle.area_service !== 'National' ? vehicle.area_service.split(',').map(s => s.trim()) : []
    });
    setIsFormOpen(true);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!formData.plates.trim() || !formData.capacity) return;

    setSaving(true);
    try {
      const areas = formData.wilayas.length === 0 ? 'National' : formData.wilayas.join(', ');

      const payload = {
        license_number: formData.plates,
        capacity: parseFloat(formData.capacity),
        vehicle_type: formData.type,
        model: formData.model,
        area_service: areas
      };

      if (formData.id) {
        await api.patch(`users/vehicles/${formData.id}/`, payload);
      } else {
        await api.post('users/vehicles/', payload);
      }

      await fetchFleet();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save vehicle", err);
      const errorMsg = err.response?.data?.license_number?.[0] ||
        err.response?.data?.detail ||
        "Failed to register vehicle. This license plate may already be registered.";
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently remove this vehicle from your fleet?')) {
      try {
        await api.delete(`users/vehicles/${id}/`);
        await fetchFleet();
      } catch (err) {
        console.error("Failed to delete vehicle", err);
        alert("Failed to delete vehicle. Please try again.");
      }
    }
  };

  const stats = {
    total: fleet.length,
    active: fleet.filter(v => v.is_active).length,
    totalCapacity: fleet.reduce((sum, v) => sum + parseFloat(v.capacity || 0), 0)
  };

  const getDisplayRegions = () => {
    if (fleet.length === 0) return 'None';
    const allAreas = new Set();
    let hasNational = false;
    
    fleet.forEach(v => {
      if (!v.area_service || v.area_service === 'National') {
        hasNational = true;
      } else {
        v.area_service.split(',').forEach(area => allAreas.add(area.trim()));
      }
    });
    
    if (hasNational) return 'National';
    
    const uniqueAreas = Array.from(allAreas);
    if (uniqueAreas.length === 0) return 'None';
    
    return uniqueAreas.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <FaSpinner className="text-green-600 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf5]">
      <div className="max-w-7xl mx-auto px-4 pt-0 pb-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaTruck className="text-green-600 text-sm" />
                </div>
                <h1 className="text-lg font-normal text-gray-800">Vehicle Fleet</h1>
              </div>
              <p className="text-[11px] text-gray-500">Manage your delivery vehicle (One primary vehicle per profile)</p>
            </div>

            <button
              onClick={() => {
                if (!isFormOpen) resetForm();
                setIsFormOpen(!isFormOpen);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-normal transition-all ${isFormOpen
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-700 text-white hover:bg-green-800 shadow-sm'
                }`}
            >
              {isFormOpen ? <FaTimes size={14} /> : <FaPlus size={14} />}
              {isFormOpen ? 'Cancel' : 'Add Vehicle'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Registered Vehicles</p>
            <p className="text-lg font-normal text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm relative">
            <p className="text-[10px] text-gray-400 uppercase">Top Delivery Region</p>
            <p className="text-xs font-medium text-green-700 mt-1">
              {topCity ? topCity[0] : getDisplayRegions()}
            </p>
            {topCity ? (
              <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">
                Total Deliveries: <span className="font-medium text-gray-700">{topCity[1]}</span>
              </p>
            ) : (
              <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">
                <span className="italic">Awaiting first delivery</span>
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Total Capacity</p>
            <p className="text-lg font-normal text-green-700">{stats.totalCapacity} Tons</p>
          </div>
        </div>

        {/* Add Vehicle Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-normal text-gray-800">{formData.id ? 'Update Vehicle' : 'Vehicle Registration'}</h2>
            </div>

            <form onSubmit={handleAddVehicle} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <div>
                  <label className="text-xs font-normal text-gray-500 block mb-1">License Plate *</label>
                  <input
                    type="text"
                    name="plates"
                    value={formData.plates}
                    onChange={handleChange}
                    placeholder="e.g., 16-105-XX"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-normal text-gray-500 block mb-1">Model (Optional)</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Isuzu NPR"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-normal text-gray-500 block mb-1">Cargo Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="REFRIGERATED">Refrigerated</option>
                    <option value="STANDARD">Standard</option>
                    <option value="SEMI-TRAILER">Semi-Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-normal text-gray-500 block mb-1">Capacity (Tons) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Max payload"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Wilayas Selection */}
              <div className="mb-6">
                <label className="text-xs font-normal text-gray-500 block mb-3">Service Areas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {wilayasList.map(wilaya => (
                    <button
                      key={wilaya}
                      type="button"
                      onClick={() => toggleWilaya(wilaya)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-normal transition-all ${formData.wilayas.includes(wilaya)
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                        }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${formData.wilayas.includes(wilaya) ? 'bg-green-700 border-green-700' : 'border-gray-300'
                        }`}>
                        {formData.wilayas.includes(wilaya) && <FaCheck size={8} className="text-white" />}
                      </div>
                      {wilaya}
                    </button>
                  ))}
                </div>
                {formData.wilayas.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">Leave empty for National coverage</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                {onNavigate && (
                  <button type="button" onClick={() => onNavigate('hub')} className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-normal rounded-lg hover:bg-gray-200">
                    Skip / Return
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-700 text-white text-sm font-normal rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2"
                >
                  {saving && <FaSpinner className="animate-spin" />}
                  {formData.id ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fleet Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-normal text-gray-800">Vehicle Fleet</h2>
            {fleet.length > 0 && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-normal">MANAGED</span>}
          </div>

          {fleet.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTruck className="text-2xl text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">No vehicles registered</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-3 text-sm text-green-700 hover:text-green-800 font-normal"
              >
                Add your vehicles to manage your fleet
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-xs font-normal text-gray-500 uppercase">License Plate</th>
                    <th className="px-5 py-3 text-xs font-normal text-gray-500 uppercase">Model / Type</th>
                    <th className="px-5 py-3 text-xs font-normal text-gray-500 uppercase">Capacity</th>
                    <th className="px-5 py-3 text-xs font-normal text-gray-500 uppercase hidden lg:table-cell">Area</th>
                    <th className="px-5 py-3 text-xs font-normal text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fleet.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                            <FaIdCard className="text-gray-400 text-lg" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{vehicle.license_number}</span>
                            <span className="text-[10px] text-gray-400 tracking-wider">REG: {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-normal text-gray-800">{vehicle.model || 'Unknown Model'}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{vehicle.vehicle_type_display || vehicle.vehicle_type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <FaWeightHanging className="text-gray-400 text-[10px]" />
                          <span className="text-sm text-gray-700 font-medium">{vehicle.capacity} Tons</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-600 font-normal bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{vehicle.area_service || 'National'}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdate(vehicle)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Vehicle"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Vehicle"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManager;