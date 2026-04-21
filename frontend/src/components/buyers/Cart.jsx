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
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/buyer')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FaChevronLeft size={12} />
            <span className="text-xs font-normal uppercase tracking-wider">Continue Shopping</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-normal text-gray-900 border-l-4 border-green-600 pl-4">Shopping Cart</h1>
                <span className="text-sm font-normal text-gray-400 uppercase tracking-widest">{cart.length} items</span>
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
                <>
                  <div className="divide-y divide-gray-100">
                    {cart.map(item => (
                      <div key={item._cartId || Math.random()} className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 items-center group">
                        <div className="md:col-span-6 flex gap-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                            {item.product_image || item.image ? (
                              <img src={item.product_image || item.image} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                            ) : (
                              <FaLeaf className="text-green-300 text-3xl" />
                            )}
                          </div>
                          <div className="flex flex-col justify-center">
                            <h3 className="font-normal text-gray-900 text-lg mb-1">{item.product_name || item.name}</h3>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-normal text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded tracking-tighter">
                                 {item.category_name || 'Agri Product'}
                               </span>
                               <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                                 <FaMapMarkerAlt size={10} className="text-green-500 opacity-50" />
                                 {item.farmer_name || 'Unknown Farm'}
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col items-center">
                          <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-xl p-2 w-full max-w-[140px]">
                            <button
                              onClick={() => handleUpdateQty(item._cartId, -0.5, item.quantity)}
                              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow transition-all active:scale-90"
                            ><FaMinus size={10} /></button>
                            <input 
                              type="number"
                              step="0.1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item._cartId, parseFloat(e.target.value) || 0.1)}
                              className="w-12 text-center font-normal bg-transparent border-none outline-none focus:ring-0 text-gray-900"
                            />
                            <button
                              onClick={() => handleUpdateQty(item._cartId, 0.5, item.quantity)}
                              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow transition-all active:scale-90"
                            ><FaPlus size={10} /></button>
                          </div>
                          <span className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mt-1">
                            {item.unit === 'ton' ? 'Tons' : item.unit === 'litre' ? 'Litres' : 'Kilograms'}
                          </span>
                        </div>

                        <div className="md:col-span-3 flex items-center justify-between pl-4">
                          <div className="text-right">
                             <div className="text-lg font-normal text-gray-900">
                               {(getPrice(item) * item.quantity * (item.unit === 'ton' ? 1000 : 1)).toLocaleString()} <span className="text-[10px] font-normal text-gray-400 ml-0.5">DZD</span>
                             </div>
                             <div className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">
                               {getPrice(item)} DZD / kg
                             </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._cartId)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all ml-4"
                          ><FaTimes size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl  mb-6">Order Summary</h2>
                
                <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{subtotal.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span >{deliveryFee === 0 ? 'Free' : deliveryFee.toLocaleString() + ' DZD'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (19%)</span>
                    <span >{tax.toLocaleString()} DZD</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 pb-6">
                  <span className=" text-lg">Total</span>
                  <span className="text-2xl  text-green-600">{total.toLocaleString()} DZD</span>
                </div>
                
                <button
                  onClick={() => navigate('/buyer/checkout')}
                  className="w-full bg-green-600 text-white py-3 rounded-xl  hover:bg-green-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <p className="text-xs text-gray-400 text-center mt-4">
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
