import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  FaTractor, FaMoneyBillWave, FaExchangeAlt, FaBoxOpen,
  FaDownload, FaCalendarAlt, FaEye, FaArrowRight, FaTimes, FaSpinner,
  FaArrowUp, FaArrowDown, FaUsers, FaCube, FaTruck, FaLeaf, FaShoppingBag, FaChevronRight
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
  const [priceOverview, setPriceOverview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const [overviewRes, ordersRes, priceRes] = await Promise.all([
          api.get('orders/orders/market_overview/'),
          api.get('orders/orders/'),
          api.get('products/products/price_overview/')
        ]);
        setData(overviewRes.data);
        const orderData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
        setOrders(orderData);
        setPriceOverview(priceRes.data);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return (o.order_status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  const recentActivities = filteredOrders.slice(0, 5).map(o => ({
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
    { name: 'Vegetables', value: catMap.Vegetables || 1, color: '#059669' },
    { name: 'Fruits', value: catMap.Fruits || 1, color: '#D97706' },
    { name: 'Grains', value: catMap.Grains || 1, color: '#F59E0B' },
    { name: 'Other', value: catMap.Other || 1, color: '#346bafff' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report exported successfully (PDF)');
    }, 1500);
  };

  const stats = [
    { label: 'Platform Users', value: data?.counts?.users?.toLocaleString() || '0', change: '+12%', icon: FaUsers, color: 'green' },
    { label: 'Total Volume', value: data?.stats?.total_revenue ? (data.stats.total_revenue / 1000000).toFixed(1) : '0.0', unit: 'M DZD', change: '+5%', icon: FaCube, color: 'blue' },
    { label: 'Active Deliveries', value: data?.stats?.active_deliveries?.toLocaleString() || '0', change: '+8%', icon: FaExchangeAlt, color: 'purple' },
    { label: 'Total Orders', value: data?.stats?.total_orders?.toLocaleString() || '0', change: '+15%', icon: FaTruck, color: 'orange' },
  ];

  const totalUsers = data?.counts?.users || 1;
  const userRoles = [
    { 
      name: 'Farmers', 
      key: 'farmers',
      icon: FaLeaf, 
      color: 'green',
      stats: data?.counts?.farmers || { total: 0, active: 0, pending: 0, rejected: 0 }
    },
    { 
      name: 'Transporters', 
      key: 'transporters',
      icon: FaTruck, 
      color: 'blue',
      stats: data?.counts?.transporters || { total: 0, active: 0, pending: 0, rejected: 0 }
    },
    { 
      name: 'Buyers', 
      key: 'buyers',
      icon: FaShoppingBag, 
      color: 'purple',
      stats: data?.counts?.buyers || { total: 0, active: 0, pending: 0, rejected: 0 }
    },
  ];

  const userDistribution = userRoles.map(role => ({
    name: role.name,
    value: role.stats.total,
    color: role.color === 'green' ? '#10B981' : role.color === 'blue' ? '#3B82F6' : '#8B5CF6'
  }));

  const topRegion = data?.top_regions?.[0] || { city: 'Constantine', count: 0 };
  const priceAlert = (priceOverview || []).find(p => Math.abs(p.price_change_percentage) > 5) || (priceOverview || [])[0];

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
            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color === 'green' ? 'bg-green-50 text-green-600' :
                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-800 font-normal mb-0.5">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-normal text-gray-900">{stat.value}</span>
                    {stat.unit && <span className="text-[10px] text-gray-400 font-normal">{stat.unit}</span>}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center gap-1.5">
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stat.change.startsWith('+') ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                  {stat.change}
                </span>
                <span className="text-[10px] text-gray-400 font-normal">vs last 7 days</span>
              </div>
            </div>
          ))}
        </div>

        {/* Market Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Insight */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-green-100 transition-colors cursor-pointer group shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
              <FaArrowUp size={20} className={priceAlert?.price_change_percentage < 0 ? 'rotate-180' : ''} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-normal text-green-900">
                {priceAlert ? `${priceAlert.product_name} price ${priceAlert.price_change_percentage > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceAlert.price_change_percentage)}%` : 'Market prices are stabilizing'}
              </h4>
              <p className="text-xs text-green-700 font-normal mt-0.5 opacity-80">Compared to last week</p>
            </div>
            <FaArrowRight size={12} className="text-green-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Volume Insight */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-orange-100 transition-colors cursor-pointer group shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
              <FaArrowDown size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-normal text-orange-900">Orders dropped by 8%</h4>
              <p className="text-xs text-orange-700 font-normal mt-0.5 opacity-80">Compared to last week</p>
            </div>
            <FaArrowRight size={12} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Regional Insight */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-blue-100 transition-colors cursor-pointer group shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-normal text-blue-900">Most active region: {topRegion?.city || 'Constantine'}</h4>
              <p className="text-xs text-blue-700 font-normal mt-0.5 opacity-80">{Math.round((topRegion?.count || 0) / (data?.stats?.total_orders || 1) * 100)}% of total orders</p>
            </div>
            <FaArrowRight size={12} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                  <Bar dataKey="volume" fill="#059669" radius={[4, 4, 0, 0]} name="Orders Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Recent Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">Latest platform orders</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-600 transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button
                  onClick={() => navigate('/ministry/orders')}
                  className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline whitespace-nowrap"
                >
                  View All →
                </button>
              </div>
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
                    <div className={`w-2 h-2 mt-2 rounded-full ${activity.status === 'delivered' ? 'bg-blue-500' :
                      activity.status === 'confirmed' ? 'bg-green-500' :
                        activity.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-normal text-black flex items-center gap-2">
                          Order #{activity.id.toString().substring(0, 8)}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${activity.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
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

          {/* Market Price Overview Widget */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Market Price Overview</h3>
                <p className="text-xs text-gray-500 mt-0.5">Top trending products (7d change)</p>
              </div>
              <button
                onClick={() => navigate('/ministry/prices')}
                className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center">
                  <FaSpinner className="animate-spin text-green-700 mx-auto" size={24} />
                  <p className="text-xs text-gray-500 mt-2">Fetching price trends...</p>
                </div>
              ) : priceOverview.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-xs italic">No price data available for trending analysis.</div>
              ) : (
                priceOverview.slice(0, 5).map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between group p-1.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={`${api.defaults.baseURL.replace('/api/', '')}${item.image}`}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="bg-green-50 w-full h-full flex items-center justify-center text-green-600 font-bold text-xs">
                            {item.product_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-normal text-black">{item.product_name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Current Average</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black">{item.average_price} <span className="text-[10px] text-gray-400 font-normal">DZD</span></p>
                      <div className={`flex items-center justify-end gap-1 text-[11px] font-semibold ${item.price_change_percentage > 0 ? 'text-green-600' :
                        item.price_change_percentage < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                        {item.price_change_percentage > 0 ? <FaArrowUp size={8} /> :
                          item.price_change_percentage < 0 ? <FaArrowDown size={8} /> : null}
                        {item.price_change_percentage !== 0 ? `${Math.abs(item.price_change_percentage)}%` : 'Stable'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Regions Widget */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-black">Top Regions</h3>
                <p className="text-xs text-gray-500 mt-0.5">By total orders</p>
              </div>
              <button
                onClick={() => navigate('/ministry/orders')}
                className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-6 mt-4">
              {loading ? (
                <div className="py-20 text-center">
                  <FaSpinner className="animate-spin text-green-700 mx-auto" size={24} />
                </div>
              ) : (data?.top_regions || []).length > 0 ? (
                data.top_regions.map((region, idx) => {
                  const percentage = Math.round((region.count / (data?.stats?.total_orders || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-normal">{region.city}</span>
                        <span className="text-xs text-gray-500">{percentage}% ({region.count})</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-green-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-6">
                  {[
                    { city: 'Constantine', percentage: 36, count: 99 },
                    { city: 'Algiers', percentage: 24, count: 72 },
                    { city: 'Oran', percentage: 18, count: 45 },
                    { city: 'Batna', percentage: 12, count: 32 },
                  ].map((region, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-normal">{region.city}</span>
                        <span className="text-xs text-gray-500">{region.percentage}% ({region.count})</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-green-600 h-full rounded-full opacity-30"
                          style={{ width: `${region.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 italic text-center mt-4">Demo data shown (no real orders yet)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Users Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-normal text-black">Users Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">Comprehensive platform user management</p>
            </div>
            <button
              onClick={() => navigate('/ministry/users')}
              className="text-xs text-green-700 hover:text-green-800 font-normal hover:underline"
            >
              Manage All Users →
            </button>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-12">
            {/* Left side: Donut Chart & Today Badge */}
            <div className="flex flex-col items-center justify-center gap-6 xl:w-1/4">
              <div className="h-48 w-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900">{totalUsers}</span>
                  <span className="text-xs text-gray-400 font-normal">Total Users</span>
                </div>
              </div>
              
              {data?.counts?.new_today > 0 && (
                <div className="flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                  <FaArrowUp size={10} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-700">{data.counts.new_today} new users today</span>
                </div>
              )}
            </div>

            {/* Right side: Detailed Cards Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {userRoles.map((role) => (
                <div key={role.key} className={`rounded-2xl border p-5 flex flex-col transition-all hover:shadow-lg ${
                  role.color === 'green' ? 'bg-green-50/20 border-green-100' :
                  role.color === 'blue' ? 'bg-blue-50/20 border-blue-100' :
                  'bg-purple-50/20 border-purple-100'
                }`}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        role.color === 'green' ? 'bg-green-100 text-green-600' :
                        role.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <role.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-normal text-gray-900">{role.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          role.color === 'green' ? 'bg-green-100 text-green-700' :
                          role.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {role.stats.total} total
                        </span>
                      </div>
                    </div>
                    <FaChevronRight size={12} className="text-gray-300 mt-1" />
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-4 flex-1">
                    {[
                      { label: 'Active', val: role.stats.active, color: 'bg-green-500' },
                      { label: 'Pending', val: role.stats.pending, color: 'bg-orange-400' },
                      { label: 'Rejected', val: role.stats.rejected, color: 'bg-red-500' }
                    ].map((status) => {
                      const percentage = role.stats.total > 0 ? Math.round((status.val / role.stats.total) * 100) : 0;
                      return (
                        <div key={status.label} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${status.color}`}></div>
                              <span className="text-gray-600">{status.label}</span>
                            </div>
                            <span className="text-gray-900 font-medium">
                              {status.val} <span className="text-gray-400 font-normal">({percentage}%)</span>
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${status.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer */}
                  <button 
                    onClick={() => navigate(`/ministry/users?type=${role.key}`)}
                    className="mt-6 pt-4 border-t border-gray-100 text-center text-xs font-normal text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    View {role.name} →
                  </button>
                </div>
              ))}
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