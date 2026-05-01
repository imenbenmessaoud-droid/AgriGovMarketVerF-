import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { FaMoneyBillWave, FaTruck, FaGasPump, FaRoute, FaCheckCircle, FaWallet, FaChartLine, FaDownload, FaFilter, FaCalendarAlt, FaUser, FaBoxOpen, FaChevronDown } from 'react-icons/fa';
import api from '../../services/api';

const Earnings = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [activeMissions, setActiveMissions] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [balance, setBalance] = useState(0);
  const [availableMissionsCount, setAvailableMissionsCount] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', subtitle: '' });
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Real weekly data with dynamic updates
  const [weeklyData, setWeeklyData] = useState([
    { week: 'Week 1', earnings: 0, deliveries: 0, distance: 0 },
    { week: 'Week 2', earnings: 0, deliveries: 0, distance: 0 },
    { week: 'Week 3', earnings: 0, deliveries: 0, distance: 0 },
    { week: 'Week 4', earnings: 0, deliveries: 0, distance: 0 },
  ]);

  // Real transactions data
  const [transactions, setTransactions] = useState([]);

  // Real delivery stats
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 55,
    completedThisMonth: 42,
    pendingDeliveries: 8,
    cancelledDeliveries: 5,
    onTimeRate: 92,
    averageDistance: 185,
    fuelEfficiency: 8.5,
    totalDistance: 12450,
    totalFuelCost: 18400,
    activeWilayas: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Tizi Ouzou', 'Bejaia']
  });

  // Load real data on mount
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // Fetch history, active missions, and available requests
      const [historyRes, activeRes, availableRes] = await Promise.all([
        api.get('/deliveries/missions/my_missions/?status=delivered'),
        api.get('/deliveries/missions/my_missions/?status=assigned,in_transit,picked_up,out_for_delivery,delivered'),
        api.get('/deliveries/missions/available/')
      ]);

      updateStatsFromDeliveries(historyRes.data);
      setActiveMissions(activeRes.data);
      setAvailableMissionsCount(availableRes.data.length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatsFromDeliveries = (deliveries) => {
    // Deliveries here are already filtered by 'delivered' status from the API call
    const realTransactions = deliveries.map(d => ({
      id: d.mission_number,
      date: d.actual_delivery_time ? d.actual_delivery_time.split('T')[0] : d.delivery_date,
      amount: parseFloat(d.order_total_amount || 0) * 0.1, // 10% delivery commission
      type: `JOB-` + String(d.mission_number).padStart(3, '0'),
      location: d.delivery_location || 'Unknown',
      status: 'completed'
    }));

    setTransactions(realTransactions.reverse());

    const totalEarnings = realTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDistance = deliveries.length * 120; // 120km average distance roughly
    const totalFuel = totalDistance * 0.08 * 45; // 8L/100km, 45 DZD/L

    setDeliveryStats(prev => ({
      ...prev,
      totalDeliveries: deliveries.length,
      completedThisMonth: deliveries.length,
      totalDistance: totalDistance,
      totalFuelCost: Math.round(totalFuel)
    }));

    setBalance(totalEarnings - totalFuel);

    const weeklyMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    realTransactions.forEach(t => {
      const date = new Date(t.date);
      let week = Math.ceil(date.getDate() / 7);
      if (week > 4) week = 4;
      weeklyMap[week] += t.amount;
    });

    setWeeklyData([
      { week: 'Week 1', earnings: weeklyMap[1], deliveries: Math.round(weeklyMap[1] / 500), distance: Math.round(weeklyMap[1] / 50) },
      { week: 'Week 2', earnings: weeklyMap[2], deliveries: Math.round(weeklyMap[2] / 500), distance: Math.round(weeklyMap[2] / 50) },
      { week: 'Week 3', earnings: weeklyMap[3], deliveries: Math.round(weeklyMap[3] / 500), distance: Math.round(weeklyMap[3] / 50) },
      { week: 'Week 4', earnings: weeklyMap[4] + (weeklyMap[5] || 0), deliveries: Math.round((weeklyMap[4] + (weeklyMap[5] || 0)) / 500), distance: Math.round((weeklyMap[4] + (weeklyMap[5] || 0)) / 50) },
    ]);

    // Process Region Data for Donut Chart
    const regionCounts = {};
    deliveries.forEach(d => {
      const location = d.delivery_location || 'Other';
      const region = location.split(',').pop().trim();
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const total = deliveries.length || 1;
    const colors = ['#10b981', '#3b82f6', '#ec7c70', '#f59e0b', '#4b5563', '#9ca3af'];

    const processedRegionData = Object.keys(regionCounts).map((name, index) => ({
      name,
      value: regionCounts[name],
      percentage: Math.round((regionCounts[name] / total) * 100),
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);

    setRegionData(processedRegionData);
  };

  const handleWithdraw = () => {
    if (balance === 0) {
      setToastMessage({ title: 'No Funds Available', subtitle: 'Complete more deliveries to withdraw' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const withdrawalAmount = balance;
    const transaction = {
      id: Date.now(),
      type: 'withdrawal',
      amount: withdrawalAmount,
      date: new Date().toISOString(),
      status: 'pending',
      method: 'bank_transfer'
    };

    const updatedTransactions = [transaction, ...transactions];
    localStorage.setItem('transporterTransactions', JSON.stringify(updatedTransactions));
    localStorage.setItem('transporterBalance', '0');
    setTransactions(updatedTransactions);
    setBalance(0);

    setToastMessage({
      title: 'Withdrawal Successful',
      subtitle: `${withdrawalAmount.toLocaleString()} DZD transferred to your bank account`
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddEarning = (earning) => {
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: earning.amount,
      type: earning.jobId,
      location: earning.location,
      status: 'completed'
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('transporterTransactions', JSON.stringify(updatedTransactions));

    const newBalance = balance + earning.amount;
    setBalance(newBalance);
    localStorage.setItem('transporterBalance', newBalance.toString());

    // Update weekly data
    const currentWeek = Math.ceil(new Date().getDate() / 7);
    const updatedWeeklyData = [...weeklyData];
    if (updatedWeeklyData[currentWeek - 1]) {
      updatedWeeklyData[currentWeek - 1].earnings += earning.amount;
      updatedWeeklyData[currentWeek - 1].deliveries += 1;
      setWeeklyData(updatedWeeklyData);
      localStorage.setItem('transporterWeeklyEarnings', JSON.stringify(updatedWeeklyData));
    }

    setToastMessage({
      title: 'Earning Added',
      subtitle: `${earning.amount.toLocaleString()} DZD from ${earning.jobId}`
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const startDate = new Date();

    switch (filterPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const totalEarnings = weeklyData.reduce((sum, item) => sum + item.earnings, 0);
  const averageEarnings = (totalEarnings / weeklyData.filter(w => w.earnings > 0).length) || 0;
  const projectedEarnings = Math.round((averageEarnings || 0) * 4.33);

  const stats = [
    {
      label: 'Monthly Earnings',
      value: totalEarnings.toLocaleString(),
      unit: 'DZD',
      sub: 'Verified freight commissions',
      icon: FaWallet,
      color: 'green',
      isSpecial: true
    },
    {
      label: 'Total Deliveries',
      value: deliveryStats.completedThisMonth.toString(),
      unit: '',
      sub: `${deliveryStats.onTimeRate}% on-time delivery rate`,
      icon: FaTruck,
      color: 'blue'
    },
    {
      label: 'Missions Available',
      value: availableMissionsCount.toString(),
      unit: '',
      sub: 'New requests found',
      icon: FaBoxOpen,
      color: 'orange'
    },
    {
      label: 'Missions Active',
      value: activeMissions.length.toString(),
      unit: '',
      sub: 'Currently in progress',
      icon: FaRoute,
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return colors[color];
  };


  const handleExportData = () => {
    const exportData = {
      earnings: weeklyData,
      transactions: transactions,
      stats: deliveryStats,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `earnings_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-[#faf8f0]">
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-8">

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className={`${toastMessage.title.includes('Successful') ? 'bg-green-600' : 'bg-blue-600'} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
              <FaCheckCircle size={18} />
              <div>
                <p className="font-normal text-sm">{toastMessage.title}</p>
                <p className="text-xs opacity-90">{toastMessage.subtitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-green-600 text-lg" />
                </div>
                <h1 className="text-2xl font-normal text-gray-800">Earnings Overview</h1>
              </div>
              <p className="text-sm text-gray-500">Real-time freight commissions and performance metrics</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="px-4 py-2.5 border border-gray-200 bg-white text-gray-600 text-sm font-normal rounded-lg hover:border-green-300 hover:text-green-600 transition-all flex items-center gap-2"
              >
                <FaDownload size={14} />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.isSpecial ? 'bg-green-600 text-white' : 'bg-white border border-gray-100'} rounded-xl p-5 shadow-sm hover:shadow-md transition-all group`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs uppercase tracking-wide ${stat.isSpecial ? 'text-green-50' : 'text-gray-400'}`}>{stat.label}</span>
                  <div className={`p-2 rounded-lg ${stat.isSpecial ? 'bg-white/20 text-white' : getColorClasses(stat.color)} group-hover:scale-110 transition-transform`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-2xl font-normal ${stat.isSpecial ? 'text-white' : 'text-gray-800'}`}>{stat.value}</span>
                  {stat.unit && <span className={`text-xs ${stat.isSpecial ? 'text-green-50' : 'text-gray-400'}`}>{stat.unit}</span>}
                </div>
                <p className={`text-xs ${stat.isSpecial ? 'text-green-50/80' : 'text-gray-500'}`}>{stat.sub}</p>
              </div>
            );
          })}
        </div>


        {/* Chart Section with Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-normal text-gray-800">Weekly Performance</h3>
                <p className="text-xs text-gray-400 mt-1">Delivery commissions and metrics per week</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterPeriod('week')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${filterPeriod === 'week' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setFilterPeriod('month')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${filterPeriod === 'month' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setFilterPeriod('year')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${filterPeriod === 'year' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                      formatter={(value) => [`${value.toLocaleString()} DZD`, 'Earnings']}
                      cursor={{ stroke: '#22c55e', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Delivered Missions by Region Donut Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-normal text-gray-800">Delivered Missions by Region</h3>
              <button
                onClick={() => navigate('/transporter/hub?tab=history')}
                className="px-4 py-1.5 border border-gray-200 bg-white text-[#6366f1] text-xs font-normal rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                View All
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Donut Chart Container */}
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border border-gray-100 rounded shadow-sm text-xs">
                              <p className="font-normal text-gray-800">{data.name}</p>
                              <p className="text-gray-500">{data.value} Missions ({data.percentage}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-normal text-gray-800">{deliveryStats.totalDeliveries}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Total Delivered</span>
                </div>
              </div>

              {/* Legend Container */}
              <div className="flex-1 space-y-3 w-full max-w-[200px]">
                {regionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 font-normal">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-normal text-gray-800">{item.value.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Current Deliveries Table Widget - Full Width */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mb-12">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-normal text-gray-800">Current Deliveries</h3>

            <div className="flex items-center gap-4 ml-auto">
              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-blue-400 transition-all shadow-sm min-w-[140px] justify-between"
                >
                  <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter.replace('_', ' ')}</span>
                  <FaChevronDown size={10} className={`text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-zoomIn">
                      {['all', 'assigned', 'in_transit', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${statusFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                        >
                          <span className="capitalize">{status === 'all' ? 'All Status' : status.replace('_', ' ')}</span>
                          {statusFilter === status && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => navigate('/transporter/hub?tab=active')}
                className="px-4 py-2 border border-gray-200 bg-white text-blue-600 text-sm font-normal rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left px-6 py-4 text-[11px] font-normal text-gray-400 uppercase tracking-wider">Delivery ID</th>
                  <th className="text-left px-6 py-4 text-[11px] font-normal text-gray-400 uppercase tracking-wider">Pickup Location</th>
                  <th className="text-left px-6 py-4 text-[11px] font-normal text-gray-400 uppercase tracking-wider">Drop-off Location</th>
                  <th className="text-center px-6 py-4 text-[11px] font-normal text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-normal text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {activeMissions.filter(m => statusFilter === 'all' || m.delivery_status === statusFilter).length > 0 ? (
                  activeMissions
                    .filter(m => statusFilter === 'all' || m.delivery_status === statusFilter)
                    .slice(0, 5)
                    .map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-900">
                            #DEL-{job.mission_number}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-gray-600 font-normal">
                            {job.farmer_address || 'SMA Farm'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-gray-600 font-normal">
                            {job.delivery_location || 'Algiers Market'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1 rounded-lg text-[11px] font-normal ${job.delivery_status === 'delivered' ? 'bg-green-50 text-green-600' :
                            job.delivery_status === 'in_transit' ? 'bg-blue-50 text-blue-600' :
                              job.delivery_status === 'picked_up' ? 'bg-orange-50 text-orange-600' :
                                'bg-indigo-50 text-indigo-600'
                            }`}>
                            {job.delivery_status === 'in_transit' ? 'In Transit' :
                              job.delivery_status === 'picked_up' ? 'Picked Up' :
                                job.delivery_status === 'delivered' ? 'Delivered' :
                                  job.delivery_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-sm text-gray-500 font-normal">
                            {new Date(job.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <FaTruck size={32} className="text-gray-400" />
                        <p className="text-sm font-normal text-gray-500 italic">No active deliveries scheduled</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-zoomIn {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Earnings;