import React from 'react';
import OrderList from '../orders/OrderList';

const OrderHistory = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <OrderList userRole="buyer" />
      
      {/* Footer Support Message matching platform theme */}
      <div className="mt-12 text-center pb-8">
         <p className="text-gray-400 text-xs font-normal uppercase tracking-widest">
            Need help with an order? <button className="text-green-600 hover:text-green-700 underline underline-offset-2 ml-1">Contact Support</button>
         </p>
      </div>
    </div>
  );
};

export default OrderHistory;