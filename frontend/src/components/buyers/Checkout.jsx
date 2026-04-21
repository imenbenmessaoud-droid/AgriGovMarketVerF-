import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTruck, FaMoneyBillWave, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaChevronLeft, FaLeaf, FaCreditCard,
  FaMapMarkerAlt, FaPhone, FaUser, FaEnvelope, FaClock,
  FaArrowRight, FaLock, FaShoppingBag, FaTag, FaPercent
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: 'Ahmed Benali',
    email: 'ahmed.benali@example.com',
    phone: '0555123456',
    address: 'Zone Industrielle Oued Smar, Lot 44',
    wilaya: 'Algiers',
    postalCode: '16000',
    notes: ''
  });

  const { cart, cartSubtotal, clearCart } = useCart();

  const deliveryFee = cart.length > 0 && cartSubtotal < 5000 ? 500 : 0;
  const tax = cartSubtotal * 0.19;
  const discount = cartSubtotal > 10000 ? cartSubtotal * 0.05 : 0;
  const totalDue = cartSubtotal + deliveryFee + tax - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [countdown, setCountdown] = useState(3);

  React.useEffect(() => {
    let timer;
    if (step === 3) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/buyer/orders');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, navigate]);

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setOrderError(null);

    try {
      // Group cart items by farmer to create one order per farmer
      // For simplicity, take the first unique farmer_id from cart
      const farmerIds = [...new Set(cart.map(item => item.farmer_id).filter(Boolean))];
      const farmerId = farmerIds[0];

      if (!farmerId) {
        setOrderError('Could not determine the farmer. Please re-add products to cart.');
        setIsProcessing(false);
        return;
      }

      const payload = {
        farmer_id: farmerId,
        delivery_address: `${formData.address}, ${formData.wilaya}`,
        items: cart.map(item => ({
          product_item_id: item.id || item.id_order_item,
          quantity: item.quantity,
          unit: item.unit || 'kg',
        })),
      };

      await api.post('orders/orders/create_order/', payload);
      clearCart();
      setIsProcessing(false);
      setStep(3);
    } catch (err) {
      console.error('Order failed:', err);
      setOrderError(
        err.response?.data?.error ||
        'Order submission failed. Please make sure you are logged in and try again.'
      );
      setIsProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 fixed inset-0 z-[1000] animate-fadeIn">
        <div className="bg-white/95 border border-white/20 rounded-[3rem] shadow-2xl max-w-lg w-full p-12 text-center relative overflow-hidden animate-scaleUp">
          {/* Success Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
          
          <div className="inline-flex items-center justify-center w-28 h-28 bg-green-50 rounded-full mb-8 relative group">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <FaCheckCircle className="text-green-600 text-6xl relative z-10" />
          </div>
          
          <h2 className="text-4xl font-normal text-gray-900 mb-4 tracking-tight">Order Confirmed!</h2>
          <p className="text-gray-500 text-lg mb-8 font-normal">
            Thank you for supporting local farmers. Your fresh harvest is being prepared.
          </p>
          
          <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 mb-10 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-normal text-gray-400 uppercase tracking-widest">Order Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-normal uppercase rounded-full">Pending Confirmation</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-normal">Estimated arrival</span>
              <span className="font-normal text-gray-900">2-3 Business Days</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/buyer/orders')}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-normal text-sm hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              <FaShoppingBag /> Track My Order
            </button>
            <p className="text-[10px] text-gray-400 font-normal uppercase tracking-widest mt-2 animate-pulse">
              Redirecting you in {countdown}s...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/buyer/cart')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <FaChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-normal">Back to Cart</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FaLeaf className="text-white text-sm" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="flex-1">
            <form onSubmit={handleConfirmOrder} className="space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FaTruck className="text-blue-500 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-gray-800">Delivery Information</h2>
                    <p className="text-xs text-gray-500">Enter your shipping details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-normal text-gray-700 mb-2 flex items-center gap-2">
                      <FaUser size={12} className="text-gray-400" />
                      Full Name
                    </label>
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2 flex items-center gap-2">
                      <FaEnvelope size={12} className="text-gray-400" />
                      Email Address
                    </label>
                    <input
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2 flex items-center gap-2">
                      <FaPhone size={12} className="text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-normal text-gray-700 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt size={12} className="text-gray-400" />
                      Street Address
                    </label>
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2">Wilaya</label>
                    <select
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option>Algiers</option>
                      <option>Blida</option>
                      <option>Boumerdes</option>
                      <option>Oran</option>
                      <option>Constantine</option>
                      <option>Annaba</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-2">Postal Code</label>
                    <input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-normal text-gray-700 mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Special delivery instructions or notes for the farmer..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <FaMoneyBillWave className="text-green-500 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-gray-800">Payment Method</h2>
                    <p className="text-xs text-gray-500">Select how you want to pay</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <input type="radio" checked readOnly className="mt-1 w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <label className="font-normal text-gray-800 flex items-center gap-2">
                          Cash on Delivery
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                        </label>
                        <p className="text-sm text-gray-500 mt-1">Pay when your order arrives. Inspect the products before payment.</p>
                      </div>
                      <FaCheckCircle className="text-green-500 text-lg" />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 opacity-50 cursor-not-allowed relative">
                    <div className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-[10px] font-normal px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                    <div className="flex items-start gap-3">
                      <input type="radio" disabled className="mt-1 w-4 h-4 text-gray-300" />
                      <div>
                        <label className="font-normal text-gray-500">Digital Payment</label>
                        <p className="text-sm text-gray-400 mt-1">Credit Card, EDAHABIA, or Bank Transfer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5 text-lg" />
                <div>
                  <p className="text-sm text-yellow-800 font-normal">Secure Transaction</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    By confirming this order, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                    Your information is protected by our security system.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {orderError && (
                <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{orderError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-normal text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <FaLock size={16} />
                    Confirm Order - {totalDue.toLocaleString()} DZD
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FaShoppingBag className="text-purple-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-normal text-gray-800">Order Summary</h2>
                  <p className="text-xs text-gray-500">{cart.length} item(s) in your cart</p>
                </div>
              </div>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={item._cartId || idx} className="flex justify-between items-center group">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-normal text-gray-800 truncate group-hover:text-green-600 transition-colors uppercase tracking-tight">
                        {item.product_name}
                      </p>
                      <p className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mt-0.5">
                         {item.quantity} kg • {item.farmer_name || 'Direct from Farm'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-normal text-gray-900">
                        {((item.product_price || 0) * item.quantity).toLocaleString()} <span className="text-[10px] text-gray-400">DZD</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-normal text-gray-700">{cartSubtotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <FaTruck size={12} /> Delivery Fee
                  </span>
                  <span className="font-normal text-gray-700">
                    {deliveryFee === 0 ? 'Free' : deliveryFee.toLocaleString() + ' DZD'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (19% VAT)</span>
                  <span className="font-normal text-gray-700">{tax.toLocaleString()} DZD</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <FaTag size={12} /> Discount (5%)
                    </span>
                    <span className="font-normal text-green-600">-{discount.toLocaleString()} DZD</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                <div>
                  <span className="font-normal text-gray-800 text-lg">Total</span>
                  <p className="text-xs text-gray-500">Including VAT & Delivery</p>
                </div>
                <span className="text-2xl font-normal text-green-600">{totalDue.toLocaleString()} DZD</span>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-green-500" />
                  <span>Free delivery on orders over 5,000 DZD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <FaClock className="text-green-500" />
                  <span>Estimated delivery: 2-4 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Checkout;