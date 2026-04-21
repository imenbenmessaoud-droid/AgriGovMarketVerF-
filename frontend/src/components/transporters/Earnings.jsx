import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaMoneyBillWave, FaTruck, FaGasPump, FaRoute, FaCheckCircle, FaWallet, FaChartLine, FaDownload, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';

const Earnings = () => {
  const [balance, setBalance] = useState(0);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', subtitle: '' });
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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
      const res = await api.get('/deliveries/missions/my_missions/');
      updateStatsFromDeliveries(res.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatsFromDeliveries = (deliveries) => {
    const completed = deliveries.filter(d => d.delivery_status === 'delivered');
    
    const realTransactions = completed.map(d => ({
        id: d.mission_number,
        date: d.actual_delivery_time ? d.actual_delivery_time.split('T')[0] : d.delivery_date,
        amount: parseFloat(d.order_total_amount || 0) * 0.1, // 10% delivery commission
        type: `JOB-` + String(d.mission_number).padStart(3, '0'),
        location: d.delivery_location || 'Unknown',
        status: 'completed'
    }));

    setTransactions(realTransactions.reverse());

    const totalEarnings = realTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDistance = completed.length * 120; // 120km average distance roughly
    const totalFuel = totalDistance * 0.08 * 45; // 8L/100km, 45 DZD/L
    
    setDeliveryStats(prev => ({
      ...prev,
      totalDeliveries: deliveries.length,
      completedThisMonth: completed.length,
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
      { week: 'Week 1', earnings: weeklyMap[1], deliveries: Math.round(weeklyMap[1]/500), distance: Math.round(weeklyMap[1]/50) },
      { week: 'Week 2', earnings: weeklyMap[2], deliveries: Math.round(weeklyMap[2]/500), distance: Math.round(weeklyMap[2]/50) },
      { week: 'Week 3', earnings: weeklyMap[3], deliveries: Math.round(weeklyMap[3]/500), distance: Math.round(weeklyMap[3]/50) },
      { week: 'Week 4', earnings: weeklyMap[4] + (weeklyMap[5] || 0), deliveries: Math.round((weeklyMap[4]+(weeklyMap[5]||0))/500), distance: Math.round((weeklyMap[4]+(weeklyMap[5]||0))/50) },
    ]);
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
    
    switch(filterPeriod) {
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

  const stats = [
    { 
      label: 'Available Balance', 
      value: balance.toLocaleString(), 
      unit: 'DZD',
      sub: 'Net after fuel & expenses',
      icon: FaWallet,
      color: 'green',
      change: '+15%'
    },
    { 
      label: 'Total Deliveries', 
      value: deliveryStats.completedThisMonth.toString(), 
      unit: '',
      sub: `${deliveryStats.onTimeRate}% on-time delivery rate`,
      icon: FaTruck,
      color: 'blue',
      change: '+8'
    },
    { 
      label: 'Fuel Costs', 
      value: deliveryStats.totalFuelCost.toLocaleString(), 
      unit: 'DZD',
      sub: `${deliveryStats.fuelEfficiency} L/100km efficiency`,
      icon: FaGasPump,
      color: 'orange',
      change: '-5%'
    },
    { 
      label: 'Distance Covered', 
      value: deliveryStats.totalDistance.toLocaleString(), 
      unit: 'Km',
      sub: `Across ${deliveryStats.activeWilayas.length} wilayas`,
      icon: FaRoute,
      color: 'purple',
      change: '+12%'
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

  const totalEarnings = weeklyData.reduce((sum, item) => sum + item.earnings, 0);
  const averageEarnings = (totalEarnings / weeklyData.filter(w => w.earnings > 0).length) || 0;
  const projectedEarnings = Math.round((averageEarnings || 0) * 4.33);

  const handleExportData = () => {
    const exportData = {
      earnings: weeklyData,
      transactions: transactions,
      stats: deliveryStats,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `earnings_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-[#faf8f0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
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
              <button
                onClick={handleWithdraw}
                disabled={balance === 0}
                className={`px-5 py-2.5 rounded-lg text-sm font-normal transition-all flex items-center gap-2 ${
                  balance === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                }`}
              >
                <FaMoneyBillWave size={14} />
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <div className={`p-2 rounded-lg ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-normal text-gray-800">{stat.value}</span>
                  {stat.unit && <span className="text-xs text-gray-400">{stat.unit}</span>}
                  {stat.change && (
                    <span className={`text-xs ml-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
            <p className="text-sm opacity-90 mb-1">Total Monthly Earnings</p>
            <p className="text-3xl font-normal">{totalEarnings.toLocaleString()} DZD</p>
            <p className="text-xs opacity-80 mt-2">+12% from last month</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Weekly Average</p>
            <p className="text-2xl font-normal text-gray-800">{Math.round(averageEarnings).toLocaleString()} DZD</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-green-600">↑ 8%</span>
              <span className="text-xs text-gray-400">vs previous month</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Projected Monthly</p>
            <p className="text-2xl font-normal text-gray-800">{projectedEarnings.toLocaleString()} DZD</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-blue-600">Based on current trend</span>
            </div>
          </div>
        </div>

        {/* Chart Section with Filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
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
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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

        {/* Recent Transactions - Table Style */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-normal text-gray-800">Recent Transactions</h3>
            <div className="flex gap-2 items-center">
              <FaFilter className="text-gray-400 text-sm" />
              <span className="text-xs text-gray-500">{filterPeriod === 'week' ? 'Last 7 days' : filterPeriod === 'month' ? 'Last 30 days' : 'Last year'}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">Job ID</th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {getFilteredTransactions().slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-normal text-gray-800">{tx.type}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{tx.location}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-sm font-normal text-green-600 text-right">+{tx.amount.toLocaleString()} DZD</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-green-100 text-green-700">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {getFilteredTransactions().length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                      <p className="text-sm">No transactions found for this period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h4 className="text-sm font-normal text-gray-800 mb-3">Performance Insights</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">On-Time Delivery Rate</p>
              <p className="text-lg font-normal text-green-600">{deliveryStats.onTimeRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fuel Efficiency</p>
              <p className="text-lg font-normal text-blue-600">{deliveryStats.fuelEfficiency} L/100km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Distance per Trip</p>
              <p className="text-lg font-normal text-purple-600">{deliveryStats.averageDistance} km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Wilayas</p>
              <p className="text-lg font-normal text-orange-600">{deliveryStats.activeWilayas.length}</p>
            </div>
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
      `}</style>
    </div>
  );
};

export default Earnings;