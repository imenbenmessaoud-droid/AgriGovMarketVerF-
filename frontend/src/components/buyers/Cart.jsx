import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaMinus, FaChevronLeft, FaLeaf, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useCart();

  const handleUpdateQty = (_cartId, delta, currentQty) => {
    const newQty = Math.max(0.1, parseFloat(currentQty) + delta);
    updateQuantity(_cartId, newQty);
  };

  const getPrice = (item) => item.product_price || item.price || 0;
  const subtotal = cartSubtotal;
  const tax = cart.length > 0 ? subtotal * 0.19 : 0;
  const deliveryFee = cart.length > 0 && subtotal < 5000 ? 500 : 0;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-[#faf8f0] font-sans pb-16">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center text-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')`,
            filter: 'brightness(0.6)'
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl font-normal text-white mb-4 tracking-tight">Shopping Cart</h1>
          <p className="text-xs md:text-sm font-normal text-white/90 max-w-2xl uppercase tracking-[0.2em]">
            Finalize your selections and secure your farm-to-table delivery.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                   <div className="w-1 h-8 bg-green-600 rounded-full"></div>
                   <h2 className="text-2xl font-normal text-gray-900">Your Selection</h2>
                </div>
                <span className="text-xs font-normal text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1 rounded-full">{cart.length} items</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaShoppingBag className="text-3xl text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-normal mb-6">Your fresh harvest bag is empty</p>
                  <button
                    onClick={() => navigate('/buyer')}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-normal hover:bg-green-600 transition-all shadow-lg active:scale-95"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map(item => (
                    <div key={item._cartId || Math.random()} className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 items-center group border-b border-gray-50 last:border-0">
                      <div className="md:col-span-6 flex gap-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-all duration-500">
                          {item.product_image || item.image ? (
                            <img src={item.product_image || item.image} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaLeaf className="text-green-300 text-4xl" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-normal text-gray-900 text-xl mb-1.5 tracking-tight">{item.product_name || item.name}</h3>
                          <div className="flex items-center gap-4">
                             <span className="text-[11px] font-normal text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full tracking-wider">
                               {item.category_name || 'Agri Product'}
                             </span>
                             <span className="text-sm text-gray-400 font-normal flex items-center gap-1.5">
                               <FaMapMarkerAlt size={12} className="text-green-500 opacity-50" />
                               {item.farmer_name || 'Unknown Farm'}
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex flex-col items-center">
                        <div className="flex items-center justify-center gap-5 bg-gray-50 rounded-2xl p-3 w-full max-w-[160px]">
                          <button
                            onClick={() => handleUpdateQty(item._cartId, -0.5, item.quantity)}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-md transition-all active:scale-90"
                          ><FaMinus size={12} /></button>
                          <input 
                            type="number"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._cartId, parseFloat(e.target.value) || 0.1)}
                            className="w-14 text-center font-normal bg-transparent border-none outline-none focus:ring-0 text-gray-900 text-lg"
                          />
                          <button
                            onClick={() => handleUpdateQty(item._cartId, 0.5, item.quantity)}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-md transition-all active:scale-90"
                          ><FaPlus size={12} /></button>
                        </div>
                        <span className="text-[11px] font-normal text-gray-400 uppercase tracking-widest mt-2">
                          {item.unit === 'ton' ? 'Tons' : item.unit === 'litre' ? 'Litres' : 'Kilograms'}
                        </span>
                      </div>

                      <div className="md:col-span-3 flex items-center justify-between pl-6">
                        <div className="text-right">
                           <div className="text-2xl font-normal text-gray-900 tracking-tight">
                             {(getPrice(item) * item.quantity * (item.unit === 'ton' ? 1000 : 1)).toLocaleString()} <span className="text-xs font-normal text-gray-400 ml-1">DZD</span>
                           </div>
                           <div className="text-[11px] text-gray-400 font-normal uppercase tracking-[0.1em] mt-1">
                             {getPrice(item)} DZD / kg
                           </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._cartId)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all ml-6"
                        ><FaTimes size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-normal text-gray-900 mb-8 border-b border-gray-50 pb-4">Order Summary</h2>

                <div className="space-y-4 pb-6 border-b border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-normal">Subtotal</span>
                    <span className="text-gray-900">{subtotal.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-normal">Delivery Fee</span>
                    <span className="text-gray-900">{deliveryFee === 0 ? 'Free' : deliveryFee.toLocaleString() + ' DZD'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-normal">Tax (19%)</span>
                    <span className="text-gray-900">{tax.toLocaleString()} DZD</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 pb-10">
                  <span className="text-lg text-gray-500">Total</span>
                  <span className="text-3xl font-normal text-green-600 tracking-tighter">{total.toLocaleString()} DZD</span>
                </div>

                <button
                  onClick={() => navigate('/buyer/checkout')}
                  className="w-full bg-[#1e2330] text-white py-4 rounded-2xl font-normal text-sm hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                  Proceed to Checkout
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest">
                  Free delivery on orders over 5000 DZD
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
