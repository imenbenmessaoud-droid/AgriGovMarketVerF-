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
    product: o.items && o.items.length > 0 ? o.items[0].product_name_snapshot + (o.items.length > 1 ? ` (+${o.items.length-1})` : '') : 'Unknown',
    qty: o.items && o.items.length > 0 ? o.items.reduce((sum, i) => sum + i.quantity_item, 0) : 0,
    price: parseFloat(o.total_amount || 0),
    status: o.order_status,
    date: new Date(o.order_date).toLocaleDateString(),
    buyer: o.buyer_name || 'Anonymous'
  }));

  const monthlyMap = {};
  orders.forEach(o => {
    if (o.order_status === 'confirmed') {
      const date = new Date(o.order_date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, revenue: 0, expenses: 0, profit: 0 };
      }
      const amt = parseFloat(o.total_amount || 0);
      monthlyMap[month].revenue += amt;
      monthlyMap[month].profit += amt * 0.7;
      monthlyMap[month].expenses += amt * 0.3;
    }
  });

  const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = Object.values(monthlyMap).sort((a,b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
  const monthlyRevenue = monthlyData.length > 0 ? monthlyData : [
      { month: new Date().toLocaleString('default', { month: 'short' }), revenue: 0, expenses: 0, profit: 0 }
  ];

  const productSalesMap = {};
  orders.forEach(o => {
    if (o.order_status === 'confirmed') {
      o.items?.forEach(i => {
         const pName = i.product_name_snapshot || 'Unknown Product';
         if (!productSalesMap[pName]) productSalesMap[pName] = 0;
         productSalesMap[pName] += parseFloat(i.sub_total_item || 0);
      });
    }
  });

  const totalSalesRevenue = Object.values(productSalesMap).reduce((sum, val) => sum + val, 0);
  const topProducts = Object.keys(productSalesMap).map(p => ({
      name: p,
      sales: productSalesMap[p],
      growth: 0,
      percentage: totalSalesRevenue ? (productSalesMap[p] / totalSalesRevenue) * 100 : 0
  })).sort((a,b) => b.sales - a.sales).slice(0, 5);

  const catMap = { Vegetables: 0, Fruits: 0, Other: 0 };
  orders.forEach(o => {
    if (o.order_status === 'confirmed') {
      o.items?.forEach(i => {
         const n = (i.product_name_snapshot || '').toLowerCase();
         const amt = parseFloat(i.sub_total_item || 0);
         if (n.match(/tomato|potato|carrot|onion|pepper|lettuce|cucumber/)) catMap.Vegetables += amt;
         else if (n.match(/apple|orange|fruit|banana|lemon/)) catMap.Fruits += amt;
         else catMap.Other += amt;
      });
    }
  });

  const categoryData = [
    { name: "Vegetables", value: catMap.Vegetables || 1, color: "#4b6d3a" },
    { name: "Fruits", value: catMap.Fruits || 1, color: "#8B7355" },
    { name: "Other", value: catMap.Other || 1, color: "#d4a574" },
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
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
            <h1 className="text-2xl font-normal text-gray-900">Sales Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Track your harvest revenue and market performance</p>
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

          <div className="bg-gray-800 rounded-xl p-5">
            <div className="p-2 bg-white/10 rounded-lg w-fit mb-3">
              <FaTruck className="text-white" size={18} />
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Completed Deliveries</p>
            <p className="text-2xl font-normal text-white mt-1">{deliveredOrders}</p>
            <p className="text-xs text-gray-400 mt-1">{totalOrders > 0 ? Math.round((deliveredOrders/totalOrders)*100) : 0}% success rate</p>
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
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4b6d3a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4b6d3a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B7355" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B7355" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#4b6d3a" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (DZD)" />
                  <Area type="monotone" dataKey="profit" stroke="#8B7355" fillOpacity={1} fill="url(#colorProfit)" name="Profit (DZD)" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">Top Selling Products</h3>
                <p className="text-xs text-gray-500 mt-0.5">Revenue by crop type</p>
              </div>
              <FaChartLine className="text-gray-400" size={16} />
            </div>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-normal text-gray-700">{product.name}</span>
                    <div className="flex gap-4">
                      <span className="text-gray-900 font-normal">
                        {product.sales.toLocaleString()} DZD
                      </span>
                      <span className="text-green-600 text-xs font-normal">
                        +{product.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-700 h-2 rounded-full"
                      style={{ width: `${product.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleViewAllProducts}
              className="w-full mt-5 text-center text-sm text-green-700 hover:text-green-800 py-2 border-t border-gray-100 mt-4 pt-4 font-normal"
            >
              View all products →
            </button>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-normal text-gray-900">Recent Deliveries</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest orders from buyers</p>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                  {recentOrders.map((order, idx) => (
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
