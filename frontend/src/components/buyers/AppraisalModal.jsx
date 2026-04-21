import React, { useState } from 'react';
import { FaStar, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const AppraisalModal = ({ order, isOpen, onClose, onRefresh }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      await api.post(`orders/orders/${order.order_number}/submit_appraisal/`, {
        rating: rating,
        feedback: feedback
      });
      setStatus('success');
      setTimeout(() => {
        onRefresh();
        onClose();
        setStatus('idle');
        setFeedback('');
        setRating(5);
      }, 2000);
    } catch (err) {
      console.error('Appraisal failed:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl animate-scaleUp">
        
        {/* Header Decor */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 h-2 w-full"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={14} />
        </button>

        {status === 'success' ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <FaCheckCircle className="text-green-600" size={40} />
            </div>
            <h3 className="text-xl font-normal text-gray-800 mb-2">Appraisal Received!</h3>
            <p className="text-sm text-gray-500">Thank you for your genuine feedback. It helps our farming community grow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="text-center mb-8">
              <span className="text-[10px] font-normal text-green-600 uppercase tracking-[0.2em] mb-2 block">Order Appraisal</span>
              <h2 className="text-2xl font-normal text-gray-900 leading-tight">How was your experience?</h2>
              <p className="text-xs text-gray-500 mt-2">Rate your order from Farmer {order.farmer_name || 'AgriGov Partner'}</p>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="flex gap-2 mb-3">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating" 
                        value={ratingValue} 
                        className="hidden"
                        onClick={() => setRating(ratingValue)}
                      />
                      <FaStar 
                        className="transition-all duration-200"
                        color={ratingValue <= (hover || rating) ? "#FFB82E" : "#e2e8f0"}
                        size={36}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-2 block">Detailed Feedback (Optional)</label>
              <textarea
                placeholder="Tell us about the quality, delivery, or service..."
                className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none transition-all"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-500 mb-4 text-center">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-normal text-sm hover:bg-green-600 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <span>Submit Appraisal</span>
                  <FaCheckCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-4">Submitted appraisals are linked to your profile for transparency.</p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default AppraisalModal;
