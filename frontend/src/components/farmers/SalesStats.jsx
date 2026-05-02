import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaBoxOpen,
  FaClipboardCheck,
  FaTractor,
  FaSeedling,
  FaWarehouse,
  FaTruck,
  FaDownload,
  FaPlus,
  FaEye,
  FaChevronDown,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const FarmerSales = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0
  });
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('orders/orders/statistics/');
        setStats(statsRes.data);

        const ordersRes = await api.get('orders/orders/my_orders/');
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentOrders = orders.slice(0, 10).map(o => ({
    id: o.order_number,
    product: o.items && o.items.length > 0 ? o.items[0].product_name_snapshot + (o.items.length > 1 ? ` (+${o.items.length - 1})` : '') : 'Unknown',
    qty: o.items && o.items.length > 0 ? o.items.reduce((sum, i) => sum + i.quantity_item, 0) : 0,
    price: parseFloat(o.total_amount || 0),
    status: o.order_status,
    date: new Date(o.order_date).toLocaleDateString(),
    buyer: o.buyer_name || 'Anonymous'
  }));

  const generateMonthlyTemplate = (range) => {
    const template = {};
    const d = new Date();
    const count = range === '6months' ? 6 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const month = pastDate.toLocaleString('default', { month: 'short' });
      template[month] = { month, revenue: 0, expenses: 0, profit: 0 };
    }
    return template;
  };

  const monthlyMap = generateMonthlyTemplate(timeRange);
  
  orders.forEach(o => {
    if (o.order_status === 'confirmed' || o.order_status === 'delivered') {
      const date = new Date(o.order_date);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Only add to map if the month is within our current template range
      if (monthlyMap[month] !== undefined) {
        const amt = parseFloat(o.total_amount || 0);
        monthlyMap[month].revenue += amt;
        monthlyMap[month].profit += amt * 0.7;
        monthlyMap[month].expenses += amt * 0.3;
      }
    }
  });

  const monthlyRevenue = Object.values(monthlyMap);

  const productSalesMap = {};
  orders.forEach(o => {
    if (o.order_status === 'confirmed' || o.order_status === 'delivered') {
      o.items?.forEach(i => {
        const pName = i.product_name_snapshot || 'Unknown Product';
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { sales: 0, qty: 0, image: i.product_image || null, unit: i.unit_measure || 'kg' };
        }
        productSalesMap[pName].sales += parseFloat(i.sub_total_item || 0);
        productSalesMap[pName].qty += parseFloat(i.quantity_item || 0);
      });
    }
  });

  const totalSalesRevenue = Object.values(productSalesMap).reduce((sum, val) => sum + val.sales, 0);
  const topProducts = Object.keys(productSalesMap)
    .filter(name => name !== 'Unknown Product' && name.toLowerCase() !== 'orange')
    .map(p => ({
      name: p,
      sales: productSalesMap[p].sales,
      qty: productSalesMap[p].qty,
      unit: productSalesMap[p].unit,
      image: productSalesMap[p].image,
      growth: 0,
      percentage: totalSalesRevenue ? (productSalesMap[p].sales / totalSalesRevenue) * 100 : 0
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);

  const catMap = { Vegetables: 0, Fruits: 0, "Dairy & Poultry": 0, Other: 0 };
  orders.forEach(o => {
    if (o.order_status === 'confirmed' || o.order_status === 'delivered') {
      o.items?.forEach(i => {
        const n = (i.product_name_snapshot || '').toLowerCase();
        const amt = parseFloat(i.sub_total_item || 0);
        
        if (n.match(/tomato|potato|carrot|onion|pepper|lettuce|cucumber|garlic|cabbage|squash|corn|bean|pea/)) {
          catMap.Vegetables += amt;
        } else if (n.match(/apple|orange|fruit|banana|lemon|date|deglet|watermelon|melon|grape|peach|cherry/)) {
          catMap.Fruits += amt;
        } else if (n.match(/egg|chicken|poultry|milk|cheese|meat|beef|honey/)) {
          catMap["Dairy & Poultry"] += amt;
        } else {
          catMap.Other += amt;
        }
      });
    }
  });

  const categoryData = [
    { name: "Vegetables", value: catMap.Vegetables || 0, color: "#ef4444" },
    { name: "Fruits", value: catMap.Fruits || 0, color: "#22c55e" },
    { name: "Dairy & Poultry", value: catMap["Dairy & Poultry"] || 0, color: "#f59e0b" },
    { name: "Other", value: catMap.Other || 0, color: "#3b82f6" },
  ].filter(c => c.value > 0); // Only show categories with sales

  if (categoryData.length === 0) {
    categoryData.push({ name: "No Sales", value: 1, color: "#e5e7eb" });
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = parseFloat(stats.total_revenue || 0);
  const totalProfit = totalRevenue * 0.7; // Estimated
  const totalOrders = stats.total_orders || 0;
  const deliveredOrders = stats.confirmed_orders || 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#faf8f0]"><div className="p-8 text-center text-gray-500 font-normal">Loading sales data...</div></div>;

  // ✅ Connect functions to real routes
  const handleExportReport = () => {
    // Basic CSV export logic directly from the data state
    if (!orders || orders.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Order ID", "Product", "Qty", "Total (DZD)", "Status", "Date", "Buyer"];
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + recentOrders.map(e => `${e.id},"${e.product}",${e.qty},${e.price},${e.status},${e.date},"${e.buyer}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddHarvest = () => {
    navigate('/farmer/products');
  };

  const handleViewAllProducts = () => {
    navigate('/farmer/products');
  };

  const handleViewAllOrders = () => {
    navigate('/farmer/orders');
  };

  const handleViewOrderDetails = (orderId) => {
    // Navigate to orders. If you add routing for specific order IDs later, you can pass state or change path.
    navigate('/farmer/orders');
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    alert(`📅 Time range changed to: ${e.target.value}`);
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaTractor className="text-green-700" size={18} />
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">Sales Analytics</span>
            </div>
            <h1 className="text-2xl font-normal text-gray-900">Statistics Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Track your harvest statistics and market performance</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-normal rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <FaDownload size={14} />
              Export Report
            </button>
            <button
              onClick={handleAddHarvest}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-normal rounded-lg hover:bg-green-800 transition"
            >
              <FaPlus size={14} />
              Add Harvest
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="text-green-700" size={18} />
              </div>
              <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full">+28%</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-normal text-gray-900 mt-1">
              {totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">DZD</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
              <FaSeedling className="text-blue-700" size={18} />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Profit</p>
            <p className="text-2xl font-normal text-gray-900 mt-1">
              {totalProfit.toLocaleString()} <span className="text-sm font-normal text-gray-500">DZD</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
              <FaBoxOpen className="text-purple-700" size={18} />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl font-normal text-gray-900 mt-1">{totalOrders}</p>
          </div>

          <div className="rounded-xl p-5 relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 shadow-md">
            {/* Decorative abstract elements for wavy effect */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-green-400 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg w-fit mb-3">
                <FaTruck className="text-white" size={18} />
              </div>
              <p className="text-xs text-green-100 uppercase tracking-wide">Completed Deliveries</p>
              <p className="text-2xl font-normal text-white mt-1">{deliveredOrders}</p>
              <p className="text-xs text-green-200 mt-1">{totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}% success rate</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">Revenue Overview</h3>
                <p className="text-xs text-gray-500 mt-0.5">Monthly revenue and profit trends</p>
              </div>
              <select
                className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600"
                value={timeRange}
                onChange={handleTimeRangeChange}
              >
                <option value="6months">Last 6 months</option>
                <option value="year">Last year</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f3f4f6",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (DZD)" />
                  <Area type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Profit (DZD)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution - Pie Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="mb-4">
              <h3 className="text-base font-normal text-gray-900">Sales by Category</h3>
              <p className="text-xs text-gray-500 mt-0.5">Product distribution</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2 h-fit">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">Top Selling Products</h3>
                <p className="text-xs text-gray-500 mt-0.5">Revenue by crop type</p>
              </div>
              <FaChartLine className="text-gray-400" size={16} />
            </div>
            <div className="space-y-3 mt-2">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center group-hover:border-green-200 transition-colors">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaSeedling className="text-gray-300" size={16} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between text-sm mb-1">
                      <div>
                        <span className="font-normal text-gray-900 block truncate max-w-[120px]">{product.name}</span>
                        <span className="text-xs text-gray-500">{product.qty} {product.unit} sold</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 font-normal block text-xs">
                          {product.sales.toLocaleString()} DZD
                        </span>
                        <span className="text-green-600 text-[10px] font-normal uppercase">
                          {product.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                      <div
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleViewAllProducts}
              className="w-full mt-3 text-center text-xs text-green-700 hover:text-green-800 py-2 border-t border-gray-100 mt-4 pt-3 font-normal"
            >
              View all products →
            </button>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-3">
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">Recent Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">Latest orders from buyers</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-normal text-gray-700 hover:bg-gray-50 transition min-w-[120px]"
                >
                  <span className="capitalize">{orderStatusFilter === 'all' ? 'All Status' : orderStatusFilter}</span>
                  <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                    {['all', 'confirmed', 'shipped', 'delivered'].map((status) => {
                      const isSelected = orderStatusFilter === status;
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            setOrderStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center ${
                            isSelected 
                              ? 'bg-blue-600 text-white font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 font-normal'
                          }`}
                        >
                          <span className="capitalize">{status === 'all' ? 'All Status' : status}</span>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase">Order ID</th>
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase">Product</th>
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase">Qty</th>
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders
                    .filter(o => orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter)
                    .map((order, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 text-xs font-normal text-gray-600">{order.id}</td>
                        <td className="px-5 py-3 text-sm text-gray-800">{order.product}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{order.qty} kg</td>
                        <td className="px-5 py-3 text-sm font-normal text-gray-900">{order.price.toLocaleString()} DZD</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleViewOrderDetails(order.id)}
                            className="text-green-700 hover:text-green-800 transition-colors"
                          >
                            <FaEye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAllOrders}
                className="w-full text-center text-sm text-green-700 hover:text-green-800 font-normal"
              >
                View all orders →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerSales;
