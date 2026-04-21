import React from "react";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaBoxOpen,
  FaClipboardCheck,
  FaTractor,
  FaSeedling,
  FaWarehouse,
  FaTruck,
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
} from "recharts";

// Sample data
const monthlyRevenue = [
  { month: "Jan", revenue: 45, expenses: 32 },
  { month: "Feb", revenue: 52, expenses: 35 },
  { month: "Mar", revenue: 61, expenses: 38 },
  { month: "Apr", revenue: 58, expenses: 40 },
  { month: "May", revenue: 73, expenses: 42 },
  { month: "Jun", revenue: 89, expenses: 45 },
];

const topProducts = [
  { name: "Tomatoes", sales: 12400, growth: 23 },
  { name: "Potatoes", sales: 9800, growth: 15 },
  { name: "Carrots", sales: 7200, growth: 8 },
  { name: "Onions", sales: 6500, growth: 12 },
  { name: "Peppers", sales: 5100, growth: 18 },
];

const FarmerSales = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaTractor className="text-gray-700" size={20} />
              <p className="text-sm font-normal text-gray-500 uppercase tracking-wide">
                Farmer Dashboard
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-normal text-gray-900">
              Sales Overview
            </h1>
            <p className="text-gray-500 text-base mt-1 font-normal">
              Track your harvest revenue and market performance
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white text-gray-700 text-sm font-normal rounded-xl border border-gray-200 hover:bg-gray-50 transition shadow-sm">
              Download Report
            </button>
            <button className="px-5 py-2.5 bg-gray-900 text-white text-sm font-normal rounded-xl hover:bg-gray-800 transition shadow-sm">
              Add Harvest
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FaMoneyBillWave className="text-gray-700" size={18} />
              </div>
              <span className="text-xs font-normal bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                +28%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="text-2xl font-normal text-gray-900 mt-1">
              378,500 <span className="text-sm font-normal text-gray-400">DZD</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="p-2 bg-gray-100 rounded-lg w-fit">
              <FaSeedling className="text-gray-700" size={18} />
            </div>
            <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide">
              Total Harvest (kg)
            </p>
            <p className="text-2xl font-normal text-gray-900 mt-1">
              12,450 <span className="text-sm font-normal text-gray-400">kg</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="p-2 bg-gray-100 rounded-lg w-fit">
              <FaWarehouse className="text-gray-700" size={18} />
            </div>
            <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide">
              Active Fields
            </p>
            <p className="text-2xl font-normal text-gray-900 mt-1">
              8 <span className="text-sm font-normal text-gray-400">hectares</span>
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="p-2 bg-white/10 rounded-lg w-fit">
              <FaTruck className="text-white" size={18} />
            </div>
            <p className="text-xs text-gray-400 mt-4 uppercase tracking-wide">
              Orders Delivered
            </p>
            <p className="text-2xl font-normal text-white mt-1">156</p>
            <p className="text-xs text-gray-400 mt-1">this season</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">
                  Revenue vs Expenses
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monthly performance (1000 DZD)
                </p>
              </div>
              <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#9ca3af" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-normal text-gray-900">
                  Top Selling Products
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Revenue by crop type
                </p>
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
                      className="bg-gray-700 h-2 rounded-full"
                      style={{
                        width: `${(product.sales / 12400) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 text-center text-sm text-gray-500 hover:text-gray-700 py-2 border-t border-gray-100 mt-4 pt-4">
              View all products →
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-normal text-gray-900">
              Recent Deliveries
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest orders from buyers
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">
                    Quantity (kg)
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-normal text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: "Fresh Tomatoes", qty: 500, price: 45000, status: "Delivered", date: "2024-03-15" },
                  { product: "Organic Potatoes", qty: 800, price: 32000, status: "In Transit", date: "2024-03-14" },
                  { product: "Sweet Carrots", qty: 300, price: 21000, status: "Delivered", date: "2024-03-12" },
                  { product: "Red Onions", qty: 450, price: 27000, status: "Processing", date: "2024-03-10" },
                ].map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-normal text-gray-900">{order.product}</td>
                    <td className="px-5 py-3 text-gray-600">{order.qty} kg</td>
                    <td className="px-5 py-3 text-gray-900 font-normal">{order.price.toLocaleString()} DZD</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "In Transit"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerSales;