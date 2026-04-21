import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('users/password-reset/', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.error || 'Account not found or connection error.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-[#fcfdfd] p-4 md:p-8 pt-20 md:pt-32 font-sans overflow-hidden relative">

      {/* Background decorative shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#112a1a]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#112a1a]/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.12)] p-10 md:p-12 relative z-10 animate-scaleIn">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-normal text-[#112a1a] mb-1 tracking-tight">Recover</h1>
          <p className="text-gray-400 text-[11px] font-normal">We'll help you get back into your account</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
              <label className="block text-[10px] font-normal text-gray-400 mb-1 transition-colors group-focus-within:text-[#224233]">Email address</label>
              <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-11 shadow-sm">
                <div className="w-11 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                  <FaEnvelope className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal placeholder-gray-200 bg-transparent"
                  placeholder="you@agrisouk.dz"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#112a1a] text-white py-3 rounded-2xl text-[9px] font-normal uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center animate-fadeIn">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-[#112a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-xs text-gray-500 mb-8 leading-relaxed">Check your inbox. We've sent instructions to <strong>{email}</strong>.</p>
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-[10px] text-gray-400 font-normal">
            Remember your password? <Link to="/login" className="text-[#112a1a] font-normal underline underline-offset-4 hover:text-green-600 transition-colors ml-1">Log in</Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-scaleIn { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
         `}} />
    </div>
  );
};

export default ForgotPassword;