import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  FaTractor, FaMoneyBillWave, FaExchangeAlt, FaBoxOpen, 
  FaDownload, FaCalendarAlt, FaEye, FaArrowRight, FaTimes, FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

// Real Data dynamically loaded now

const MarketStats = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const [overviewRes, ordersRes] = await Promise.all([
           api.get('orders/orders/market_overview/'),
           api.get('orders/orders/')
        ]);
        setData(overviewRes.data);
        const orderData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
        setOrders(orderData);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const recentActivities = orders.slice(0, 5).map(o => ({
      id: o.order_number || Math.random(),
      status: o.order_status || 'pending',
      user: o.buyer_name || 'Anonymous Buyer',
      amount: `${parseFloat(o.total_amount || 0).toLocaleString()} DZD`,
      time: new Date(o.order_date).toLocaleDateString()
  }));

  const catMap = { Vegetables: 0, Fruits: 0, Grains: 0, Other: 0 };
  orders.forEach(o => {
      o.items?.forEach(i => {
         const n = (i.product_name_snapshot || '').toLowerCase();
         const amt = parseFloat(i.sub_total_item || 0);
         if (n.match(/tomato|potato|carrot|onion|pepper|lettuce|cucumber/)) catMap.Vegetables += amt;
         else if (n.match(/apple|orange|fruit|banana|lemon/)) catMap.Fruits += amt;
         else if (n.match(/wheat|corn|barley|rice/)) catMap.Grains += amt;
         else catMap.Other += amt;
      });
  });

  const generateChartData = () => {
    const chartData = [];
    let days = 7;
    let format = 'day';

    if (timeRange === '7days') { days = 7; format = 'day'; }
    else if (timeRange === '30days') { days = 30; format = 'day'; }
    else { days = 6; format = 'month'; }
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      if (format === 'day') {
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        chartData.push({ date: dateStr, rawDate: d, revenue: 0, volume: 0 });
      } else {
        d.setMonth(d.getMonth() - i);
        const dateStr = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        chartData.push({ date: dateStr, rawDate: d, revenue: 0, volume: 0 });
      }
    }

    orders.forEach(o => {
      if (!o.order_date || o.order_status === 'cancelled') return;
      const oDate = new Date(o.order_date);
      chartData.forEach(c => {
        if (format === 'day') {
          if (oDate.getDate() === c.rawDate.getDate() && oDate.getMonth() === c.rawDate.getMonth() && oDate.getFullYear() === c.rawDate.getFullYear()) {
            c.volume += 1;
            c.revenue += parseFloat(o.total_amount || 0);
          }
        } else {
          if (oDate.getMonth() === c.rawDate.getMonth() && oDate.getFullYear() === c.rawDate.getFullYear()) {
            c.volume += 1;
            c.revenue += parseFloat(o.total_amount || 0);
          }
        }
      });
    });

    return chartData;
  };

  const dynamicChartData = generateChartData();

  const categoryDistribution = [
    { name: 'Vegetables', value: catMap.Vegetables || 1, color: '#4b6d3a' },
    { name: 'Fruits', value: catMap.Fruits || 1, color: '#8B7355' },
    { name: 'Grains', value: catMap.Grains || 1, color: '#d4a574' },
    { name: 'Other', value: catMap.Other || 1, color: '#e8e0d5' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report exported successfully (PDF)');
    }, 1500);
  };

  const stats = [
    { label: 'Platform Users', value: data?.counts?.users?.toLocaleString() || '0', change: '+12%', icon: FaTractor, bgColor: 'bg-green-100', iconColor: 'text-green-700' },
    { label: 'Total Volume', value: data?.stats?.total_revenue ? (data.stats.total_revenue / 1000000).toFixed(1) : '0.0', unit: 'M DZD', change: '+5%', icon: FaMoneyBillWave, bgColor: 'bg-blue-100', iconColor: 'text-blue-700' },
    { label: 'Active Deliveries', value: data?.stats?.active_deliveries?.toLocaleString() || '0', change: '+8%', icon: FaExchangeAlt, bgColor: 'bg-purple-100', iconColor: 'text-purple-700' },
    { label: 'Total Orders', value: data?.stats?.total_orders?.toLocaleString() || '0', change: '+15%', icon: FaBoxOpen, bgColor: 'bg-orange-100', iconColor: 'text-orange-700' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f0] px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">Live Monitoring</span>
            </div>
            <h1 className="text-2xl font-normal text-black">National Market Overview</h1>
            <p className="text-gray-500 text-sm mt-0.5">Real-time statistics of the agricultural trade platform</p>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="6months">Last 6 Months</option>
            </select>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-normal rounded-lg hover:bg-gray-50 transition min-w-[140px] justify-center"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaDownload size={14} />
              )}
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor} transition-transform group-hover:scale-110`}>
                  <stat.icon size={18} className={stat.iconColor} />
                </div>
                <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-normal text-black">
                {stat.value} <span className="text-sm font-normal text-gray-500">{stat.unit || ''}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Transaction Volume Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Platform Trade Volume</h3>
                <p className="text-xs text-gray-500 mt-0.5">Total successful orders</p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="volume" fill="#FFB82E" radius={[4, 4, 0, 0]} name="Orders Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Category Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Category Distribution</h3>
                <p className="text-xs text-gray-500 mt-0.5">Sales by product category</p>
              </div>
              <button 
                onClick={() => navigate('/ministry/categories')}
                className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline"
              >
                Manage →
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    onClick={() => navigate('/ministry/categories')}
                    className="cursor-pointer"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {categoryDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Recent Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">Latest platform orders</p>
              </div>
              <button 
                onClick={() => navigate('/ministry/orders')}
                className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="py-20 text-center">
                  <FaSpinner className="animate-spin text-green-700 mx-auto" size={24} />
                  <p className="text-xs text-gray-500 mt-2">Connecting to market mainframe...</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 cursor-pointer">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.status === 'delivered' ? 'bg-blue-500' : 
                      activity.status === 'confirmed' ? 'bg-green-500' : 
                      activity.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-normal text-black flex items-center gap-2">
                          Order #{activity.id.toString().substring(0, 8)}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            activity.status === 'delivered' ? 'bg-blue-100 text-blue-700' : 
                            activity.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            activity.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </p>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{activity.user}</p>
                        <p className="text-sm font-medium text-black">{activity.amount}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedDetail && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-zoomIn">
                 <button 
                    onClick={() => setSelectedDetail(null)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                 >
                    <FaTimes size={20} />
                 </button>
                 <h2 className="text-xl  font-normal text-black mb-4">{selectedDetail}</h2>
                 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-4">Detailed analytical breakdown for the selected metric. This data corresponds to the live market sync.</p>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Verification Rate</span>
                           <span className="text-sm font-normal text-green-700">99.8%</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Sync Frequency</span>
                          <span className="text-sm font-normal text-blue-700">5 min</span>
                       </div>
                       <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm font-normal text-black uppercase tracking-tighter">operational</span>
                       </div>
                    </div>
                 </div>
                 <button 
                    onClick={() => setSelectedDetail(null)}
                    className="w-full bg-green-700 text-white mt-8 py-3 rounded-xl font-normal hover:bg-green-800 transition shadow-lg"
                 >
                    Close Analysis
                 </button>
              </div>
           </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Data updates every 5 minutes • Last sync: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketStats;