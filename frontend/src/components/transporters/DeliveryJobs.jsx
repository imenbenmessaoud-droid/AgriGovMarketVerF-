// components/DeliveryJobs.js
import React, { useState, useEffect } from 'react';
import {
  FaBoxOpen, FaRoute, FaHistory, FaCheckCircle, FaTruck,
  FaClock, FaMoneyBillWave, FaWeightHanging, FaCalendarAlt,
  FaUserTie, FaPhone, FaWhatsapp, FaSearch, FaTimes,
  FaStar, FaMapMarkerAlt, FaTimesCircle, FaInfoCircle,
  FaArrowRight, FaDownload, FaPrint, FaEye, FaSpinner, FaPlus, FaEnvelope, FaIdCard
} from 'react-icons/fa';
import api from '../../services/api';


const DeliveryJobs = ({ searchQuery: externalSearchQuery, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSearchQuery !== undefined ? () => { } : setInternalSearchQuery;
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [toast, setToast] = useState(null);

  const [ignoredJobs, setIgnoredJobs] = useState(() => {
    const saved = localStorage.getItem('ignored_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [transporterProfile, setTransporterProfile] = useState(null);

  const fetchTransporterProfile = async () => {
    try {
      const res = await api.get('users/transporters/me/'); // Assuming there's a 'me' or just get first from list
      // Or filter list by current user ID. Let's try users/me first then filter.
      const profileRes = await api.get('users/me/');
      if (profileRes.data && profileRes.data.profile) {
        setTransporterProfile(profileRes.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch transporter profile:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'requests') endpoint = 'deliveries/missions/available/';
      else if (activeTab === 'active') endpoint = 'deliveries/missions/my_missions/?status=in_transit';
      else if (activeTab === 'history') endpoint = 'deliveries/missions/my_missions/?status=delivered';

      const res = await api.get(endpoint);
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchTransporterProfile();
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'requests' && ignoredJobs.includes(job.mission_number)) return false;

    const matchSearch = String(job.mission_number).includes(searchQuery.toLowerCase()) ||
      (job.delivery_location && job.delivery_location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const handleAccept = async (id) => {
    try {
      await api.patch(`deliveries/missions/${id}/accept/`);
      showToast(`Mission #${id} assigned to you`, 'success');
      fetchJobs();
    } catch (err) {
      console.error('Accept mission error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Error accepting mission. Please try again.';
      showToast(errorMsg, 'error');
    }
  };

  const handleDecline = (id) => {
    const newIgnored = [...ignoredJobs, id];
    setIgnoredJobs(newIgnored);
    localStorage.setItem('ignored_jobs', JSON.stringify(newIgnored));
    setShowDeclineConfirm(null);
    showToast(`Mission #${id} declined`, 'info');
  };

  const handleDeliver = async (id) => {
    try {
      await api.patch(`deliveries/missions/${id}/update_status/`, { status: 'delivered' });
      showToast(`Mission #${id} delivered!`, 'success');
      fetchJobs();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDownloadInvoice = (job) => {
    const invoiceData = {
      invoiceNumber: `INV-MSN-${job.mission_number}`,
      date: new Date().toISOString().split('T')[0],
      jobDetails: {
        id: job.mission_number,
        type: job.load_type || 'Transport',
        origin: job.farmer_address || `${job.farmer_name} Farm`,
        destination: job.delivery_location || 'Not specified',
        distance: 'TBD',
        cargo: job.load_type || 'N/A',
        orderValue: parseFloat(job.order_total_amount) || 0
      },
      farmer: {
        name: job.farmer_name,
        phone: job.farmer_phone || 'N/A',
        email: job.farmer_email || 'N/A'
      },
      breakdown: {
        orderTotal: parseFloat(job.order_total_amount) || 0
      }
    };

    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `invoice_${job.mission_number}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showToast(`Invoice for MSN-${job.mission_number} downloaded`, 'success');
  };

  const handlePrintInvoice = (job) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice MSN-${job.mission_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; }
          .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
          .invoice-header { background: #2d6a4f; color: white; padding: 20px; text-align: center; }
          .invoice-header h1 { margin: 0; font-size: 24px; }
          .invoice-header p { margin: 5px 0 0; opacity: 0.9; }
          .invoice-body { padding: 20px; }
          .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          .section-title { font-size: 16px; font-weight: normal; color: #2d6a4f; margin-bottom: 10px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { width: 120px; font-weight: normal; color: #666; }
          .value { flex: 1; color: #333; }
          .total-row { background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 4px; }
          .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>DELIVERY INVOICE</h1>
            <p>MSN-${job.mission_number}</p>
          </div>
          <div class="invoice-body">
            <div class="section">
              <div class="section-title">JOB INFORMATION</div>
              <div class="row"><div class="label">Job ID:</div><div class="value">MSN-${job.mission_number}</div></div>
              <div class="row"><div class="label">Type:</div><div class="value">${job.load_type || 'Standard Produce'}</div></div>
              <div class="row"><div class="label">Date:</div><div class="value">${new Date().toLocaleDateString()}</div></div>
            </div>
            
            <div class="section">
              <div class="section-title">ROUTE DETAILS</div>
              <div class="row"><div class="label">From:</div><div class="value">${job.farmer_address || job.farmer_name + ' Farm'}</div></div>
              <div class="row"><div class="label">To:</div><div class="value">${job.delivery_location || 'Not specified'}</div></div>
              <div class="row"><div class="label">Distance:</div><div class="value">TBD</div></div>
              <div class="row"><div class="label">Cargo:</div><div class="value">${job.load_type || 'N/A'}</div></div>
            </div>
            
            <div class="section">
              <div class="section-title">FARMER INFORMATION</div>
              <div class="row"><div class="label">Name:</div><div class="value">${job.farmer_name || 'N/A'}</div></div>
              <div class="row"><div class="label">Phone:</div><div class="value">${job.farmer_phone || 'N/A'}</div></div>
              <div class="row"><div class="label">Email:</div><div class="value">${job.farmer_email || 'N/A'}</div></div>
            </div>
            
            <div class="section">
              <div class="section-title">COMMERCE BREAKDOWN</div>
              <table>
                <tr><th>Description</th><th class="text-right">Amount (DZD)</th></tr>
                <tr><td>Order Value</td><td class="text-right">${(parseFloat(job.order_total_amount) || 0).toLocaleString()}</td></tr>
                <tr style="background:#f5f5f5; font-weight:bold;"><td>Total Authorized</td><td class="text-right">${(parseFloat(job.order_total_amount) || 0).toLocaleString()} DZD</td></tr>
              </table>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your business! | Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showToast(`Printing invoice for MSN-${job.mission_number}`, 'success');
  };

  const stats = {
    requests: activeTab === 'requests' ? filteredJobs.length : 0,
    active: activeTab === 'active' ? filteredJobs.length : 0,
    history: activeTab === 'history' ? filteredJobs.length : 0,
    earnings: activeTab === 'history' ? filteredJobs.reduce((sum, j) => sum + (parseFloat(j.order_total_amount) || 0), 0) : 0
  };

  const StatusBadge = ({ status }) => {
    const config = {
      'pending': { bg: 'bg-amber-50', text: 'text-amber-600', icon: FaClock },
      'in_transit': { bg: 'bg-blue-50', text: 'text-blue-600', icon: FaTruck },
      'delivered': { bg: 'bg-green-50', text: 'text-green-600', icon: FaCheckCircle },
      'cancelled': { bg: 'bg-red-50', text: 'text-red-600', icon: FaTimesCircle }
    };
    const { bg, text, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`flex items-center gap-1 text-[10px] font-normal px-2 py-1 rounded-full ${bg} ${text} capitalize`}>
        <Icon size={10} /> {status.replace('_', ' ')}
      </span>
    );
  };

  const DetailModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-normal text-gray-800">Job Details</h2>
            <p className="text-sm text-gray-500 mt-1">#MSN-{job.mission_number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <FaTimes size={14} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <StatusBadge status={job.delivery_status} />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase">Order Value</p>
              <p className="text-2xl font-normal text-green-600">{(parseFloat(job.order_total_amount) || 0).toLocaleString()} DZD</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-normal text-gray-700 mb-4 flex items-center gap-2">
              <FaRoute size={14} className="text-green-600" /> Route
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Pickup</p>
                  <p className="font-normal text-gray-800">{job.farmer_address || `${job.farmer_name} Farm`}</p>
                  <p className="text-sm text-gray-500">{new Date(job.delivery_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-center">
                <FaArrowRight className="text-gray-300" />
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaMapMarkerAlt size={12} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Delivery Address</p>
                  <p className="font-normal text-gray-800">{job.delivery_location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-normal text-gray-700 mb-3 flex items-center gap-2">
              <FaWeightHanging size={14} className="text-green-600" /> Logistics Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-400">Order Ref</p><p className="text-sm font-normal">#ORD-{job.order_number}</p></div>
              <div><p className="text-xs text-gray-400">Scheduled Date</p><p className="text-sm font-normal">{job.delivery_date ? new Date(job.delivery_date).toLocaleDateString() : 'TBD'}</p></div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-normal text-gray-700 mb-3 flex items-center gap-2">
              <FaUserTie size={14} className="text-green-600" /> Farmer
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaUserTie size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-normal text-gray-800">{job.farmer_name}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={10} className={'text-amber-400'} />
                  ))}
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <a href={`tel:${job.farmer_phone}`} className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-2"><FaPhone size={10} /> {job.farmer_phone || 'N/A'}</a>
                  <a href={`mailto:${job.farmer_email}`} className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-2"><FaEnvelope size={10} /> {job.farmer_email || 'N/A'}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-normal text-gray-700 mb-3 flex items-center gap-2">
              <FaTruck size={14} className="text-green-600" /> Vehicle Information
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <FaIdCard size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-normal">Assigned Vehicle</p>
                  <p className="text-sm font-normal text-gray-800">
                    {job.vehicle_license_snapshot || transporterProfile?.license_number || 'Pending Assignment'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-normal">Type</p>
                <p className="text-xs font-normal text-gray-600">{job.load_type || transporterProfile?.vehicle_type || 'N/A'}</p>
              </div>
            </div>
          </div>


          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadInvoice(job)}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-normal flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <FaDownload size={12} /> Invoice
            </button>
            <button
              onClick={() => handlePrintInvoice(job)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-normal flex items-center justify-center gap-2 hover:border-green-300 hover:text-green-600 transition-colors"
            >
              <FaPrint size={12} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-normal px-2 py-0.5 rounded bg-gray-100 text-gray-600">MISSION</span>
              <StatusBadge status={job.delivery_status} />
            </div>
            <h3 className="font-mono text-sm font-normal text-gray-800">#MSN-{job.mission_number}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Order #ORD-{job.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400">ORDER TOTAL</p>
            <p className="text-lg font-normal text-green-600">{(parseFloat(job.order_total_amount) || 0).toLocaleString()} DZD</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <FaMapMarkerAlt size={10} className="text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Destination</p>
            <p className="text-sm font-normal text-gray-800">{job.delivery_location || 'AgriGov Distribution Point'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <FaTruck size={14} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Load Type</p>
            <p className="text-xs font-normal text-gray-800">{job.load_type || 'Standard Agricultural Produce'}</p>
          </div>
        </div>

        {job.vehicle_license_snapshot && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase">Vehicle</p>
            <p className="text-xs font-normal text-gray-800">{job.vehicle_license_snapshot}</p>
          </div>
        )}
      </div>

      <div className="p-4">
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {/* Vehicle Selection Area */}
            {!job.vehicle_license_snapshot && !transporterProfile?.license_number ? (
              <button
                onClick={() => onNavigate && onNavigate('fleet')}
                className="w-full py-2.5 border-2 border-dashed border-green-200 text-green-700 text-sm font-normal rounded-lg hover:bg-green-50 flex items-center justify-center gap-2 transition-all"
              >
                <FaPlus size={12} /> Add Vehicle in Fleet
              </button>
            ) : (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaTruck size={12} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-normal">Primary Vehicle Selected</p>
                    <p className="text-xs font-normal text-gray-800">
                      {job.vehicle_license_snapshot || transporterProfile?.license_number}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleAccept(job.mission_number)}
                className={`flex-1 py-2.5 text-white text-sm font-normal rounded-lg flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-700`}
              >
                <FaCheckCircle size={14} /> Accept Mission
              </button>
              <button onClick={() => setShowDeclineConfirm(job.mission_number)} className="px-3 py-2.5 bg-red-50 text-red-600 text-sm font-normal rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                <FaTimes size={14} />
              </button>
            </div>
          </div>
        )}
        {activeTab === 'active' && (
          <button onClick={() => handleDeliver(job.mission_number)} className="w-full py-2.5 bg-blue-600 text-white text-sm font-normal rounded-lg hover:bg-blue-700 transition-colors shadow-sm mb-3">
            Confirm Delivery
          </button>
        )}
        <button onClick={() => setSelectedJob(job)} className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-normal rounded-lg hover:border-green-300 hover:text-green-600 flex items-center justify-center gap-2 transition-all">
          <FaEye size={14} /> View Manifest
        </button>
      </div>

      {showDeclineConfirm === job.mission_number && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-normal text-gray-800 mb-2">Decline Job?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to decline #{job.mission_number}?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeclineConfirm(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg">Cancel</button>
                <button onClick={() => handleDecline(job.mission_number)} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {toast && (
          <div className="fixed top-20 right-6 z-50 animate-slide-up">
            <div className={`px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
              }`}>
              <FaCheckCircle size={16} />
              <span className="text-sm">{toast.message}</span>
            </div>
          </div>
        )}

        {!externalSearchQuery && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-normal text-gray-800">Delivery Jobs</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your deliveries</p>
              </div>
              <div className="relative w-full md:w-64">
                <FaSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search job..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase">Earnings</p>
            <p className="text-lg font-normal text-green-600">{stats.earnings.toLocaleString()} DZD</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase">Pending</p>
            <p className="text-lg font-normal text-gray-800">{stats.requests}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase">Active</p>
            <p className="text-lg font-normal text-gray-800">{stats.active}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase">Completed</p>
            <p className="text-lg font-normal text-gray-800">{stats.history}</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-100 mb-6">
          {[
            { id: 'requests', label: 'Requests', icon: FaBoxOpen, count: stats.requests },
            { id: 'active', label: 'Active', icon: FaRoute, count: stats.active },
            { id: 'history', label: 'History', icon: FaHistory, count: stats.history }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-normal transition-all ${isActive ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <FaSpinner className="text-green-600 animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-500">Scanning logistics neural network...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBoxOpen size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-normal">No missions currently in this section</p>
            </div>
          ) : (
            filteredJobs.map(job => <JobCard key={job.mission_number} job={job} />)
          )}
        </div>
      </div>

      {selectedJob && <DetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default DeliveryJobs;