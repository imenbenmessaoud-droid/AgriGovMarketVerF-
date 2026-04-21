import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, FaMoneyBillWave, FaClipboardCheck, FaChartLine, FaTractor, 
  FaArrowRight, FaSeedling, FaTruck, FaCalendarAlt, FaWarehouse, FaLeaf,
  FaShoppingCart, FaStar, FaBox, FaStore
} from 'react-icons/fa';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../services/api';

// ============================================
// 1. STATIC DATA
// ============================================

const STATS_CONFIG = [
  { id: 1, label: 'Yield Projection', value: '1,240', unit: 'tons', icon: FaChartLine, path: '/farmer/products' },
  { id: 2, label: 'Operational Efficiency', value: '94', unit: '%', icon: FaTractor, path: '/farmer/farms' },
  { id: 3, label: 'Net Revenue', value: '852', unit: 'k DZD', icon: FaMoneyBillWave, path: '/farmer/sales' },
  { id: 4, label: 'Quality Index', value: 'A+', unit: 'grade', icon: FaClipboardCheck, path: '/farmer/orders' }
];



const RECENT_ACTIVITIES = [
  { id: 1, title: 'New Order #ORD-8822', description: 'Ahmed Slimani purchased 20kg tomatoes', time: '2 hours ago', path: '/farmer/orders' },
  { id: 2, title: 'Inventory Alert', description: 'Deglet Nour dates running low', time: '5 hours ago', path: '/farmer/products' },
  { id: 3, title: 'Payment Received', description: 'DZD 12,500 transferred', time: 'Yesterday', path: '/farmer/sales' },
  { id: 4, title: 'Farm Updated', description: 'Biskra oasis irrigation log updated', time: 'Yesterday', path: '/farmer/farms' }
];

const QUICK_ACTIONS = [
  { title: 'Add Product', description: 'List your harvest for sale', buttonText: 'Add', icon: FaBox, path: '/farmer/products' },
  { title: 'Manage Orders', description: 'Orders waiting for confirmation', buttonText: 'View', icon: FaShoppingCart, path: '/farmer/orders' },
  { title: 'View Analytics', description: 'Check sales performance', buttonText: 'Stats', icon: FaChartLine, path: '/farmer/sales' }
];

// ============================================
// 2. REUSABLE COMPONENTS
// ============================================

const StatCard = ({ stat, onClick }) => {
  const Icon = stat.icon;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-green-700" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-normal text-gray-900">{stat.value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{stat.unit}</p>
        <p className="text-sm font-normal text-gray-700 mt-1">{stat.label}</p>
      </div>
    </div>
  );
};

const HarvestCard = ({ harvest, onClick }) => {
  const statusColors = {
    'Active': 'bg-green-100 text-green-700',
    'Growing': 'bg-blue-100 text-blue-700',
    'Ready': 'bg-amber-100 text-amber-700'
  };
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
    >
      <div>
        <p className="font-normal text-gray-900">{harvest.name}</p>
        <p className="text-xs text-gray-500">{harvest.location}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${statusColors[harvest.status]}`}>
          {harvest.status}
        </span>
        <div className="mt-2 w-20 bg-gray-200 rounded-full h-1">
          <div className="bg-green-600 h-1 rounded-full" style={{ width: `${harvest.progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-gray-100"
    >
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
        <FaCheckCircle size={12} className="text-green-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-normal text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.description}</p>
        <p className="text-[10px] text-gray-400 mt-1">{activity.time}</p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, buttonText, icon: Icon, onClick }) => {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
        <Icon size={18} className="text-green-700" />
      </div>
      <h4 className="font-normal text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <button className="text-sm text-green-700 font-normal flex items-center gap-1">
        {buttonText} <FaArrowRight size={10} />
      </button>
    </div>
  );
};

// ============================================
// 3. MAIN COMPONENT
// ============================================

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { searchQuery: globalSearchQuery } = useOutletContext() || {};
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeHarvests, setActiveHarvests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, farmsRes] = await Promise.all([
          api.get('/orders/orders/statistics/'),
          api.get('/orders/orders/my_orders/'),
          api.get('/farms/my-farms/')
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
        
        const mappedFarms = farmsRes.data.slice(0, 4).map(f => ({
          id: f.IdFarm,
          name: f.FarmName,
          location: f.LocationFarm,
          status: f.is_active ? 'Active' : 'Inactive',
          progress: Math.min(100, Math.round(f.Size * 5))
        }));
        setActiveHarvests(mappedFarms);
      } catch (err) {
        console.error('Failed to fetch farmer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsConfig = [
    { id: 1, label: 'Pending Orders', value: stats?.pending_orders || 0, unit: 'orders', icon: FaShoppingCart, path: '/farmer/orders' },
    { id: 2, label: 'Confirmed Sales', value: stats?.confirmed_orders || 0, unit: 'completed', icon: FaClipboardCheck, path: '/farmer/orders' },
    { id: 3, label: 'Net Revenue', value: stats?.total_revenue || 0, unit: 'DZD', icon: FaMoneyBillWave, path: '/farmer/sales' },
    { id: 4, label: 'Total Requests', value: stats?.total_orders || 0, unit: 'lifetime', icon: FaChartLine, path: '/farmer/orders' }
  ];

  const displayActivities = recentOrders.map(order => ({
    id: order.order_number,
    title: `Order #${order.order_number}`,
    description: `${order.buyer_name} ordered items for ${order.total_amount} DZD`,
    time: new Date(order.order_date).toLocaleDateString(),
    path: '/farmer/orders'
  }));

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">

          <h1 className="text-2xl font-normal text-gray-900">
            {greeting}, Farmer 
          </h1>
          <p className="text-gray-500 text-sm font-normal mt-1">
            Welcome back to your farm dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <StatCard key={stat.id} stat={stat} onClick={() => navigate(stat.path)} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Harvests */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-normal text-gray-900">Active Harvests</h3>
                <button 
                  onClick={() => navigate('/farmer/farms')}
                  className="text-xs text-green-700 font-normal hover:text-green-800"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-2">
                {activeHarvests.length > 0 ? (
                  activeHarvests.map((harvest) => (
                    <HarvestCard 
                      key={harvest.id} 
                      harvest={harvest}
                      onClick={() => navigate('/farmer/farms')}
                    />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No active farms registered yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, idx) => (
                <QuickActionCard
                  key={idx}
                  title={action.title}
                  description={action.description}
                  buttonText={action.buttonText}
                  icon={action.icon}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-normal text-gray-900">Recent Activity</h3>
              <FaCalendarAlt size={14} className="text-gray-400" />
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm animate-pulse">Loading activity...</p>
                </div>
              ) : displayActivities.length > 0 ? (
                displayActivities.map((activity) => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    onClick={() => navigate(activity.path)} 
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No recent activities</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/farmer/orders')}
              className="mt-4 w-full py-2 bg-green-700 text-white text-sm font-normal rounded-lg hover:bg-green-800 transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;