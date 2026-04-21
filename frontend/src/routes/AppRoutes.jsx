import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';

// Farmer Components
import FarmerLayout from '../components/farmers/FarmerLayout';
import FarmerDashboard from '../components/farmers/FarmerDashboard';
import FarmerProducts from '../components/farmers/FarmerProducts';
import SalesStats from '../components/farmers/SalesStats';
import FarmList from '../components/farmers/FarmList';
import FarmForm from '../components/farmers/FarmForm';
import FarmerSettings from '../components/farmers/FarmerSettings';
import FarmerOrders from '../components/farmers/FarmerOrders';
import FarmerProfile from '../components/farmers/FarmerProfile';

// Other Dashboards
import BuyerDashboard from '../components/buyers/BuyerDashboard';
import BuyerProfile from '../components/buyers/BuyerProfile';
import Cart from '../components/buyers/Cart';
import Checkout from '../components/buyers/Checkout';
import TransporterDashboard from '../components/transporters/TransporterDashboard';
import MinistryDashboard from '../components/ministry/MinistryDashboard';

// Auth
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

      {/* Protected Dashboards (Simplified mapping) */}
      {/* Farmer Portal with Layout */}
      <Route path="/farmer" element={<FarmerLayout />}>
        <Route index element={<FarmerDashboard />} />
        <Route path="dashboard" element={<FarmerDashboard />} />
        <Route path="products" element={<FarmerProducts />} />
        <Route path="farms" element={<FarmList />} />
        <Route path="farms/new" element={<FarmForm />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="sales" element={<SalesStats />} />
        <Route path="settings" element={<FarmerSettings />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Route>
      {/* Buyer Flow */}
      <Route path="/buyer/cart" element={<Cart />} />
      <Route path="/buyer/checkout" element={<Checkout />} />
      <Route path="/buyer/profile" element={<BuyerProfile />} />
      <Route path="/buyer/*" element={<BuyerDashboard />} />

      <Route path="/transporter/*" element={<TransporterDashboard />} />
      <Route path="/ministry/*" element={<MinistryDashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;