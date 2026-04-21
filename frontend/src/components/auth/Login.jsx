import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserTie, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
   const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [role, setRole] = useState('buyer'); // For the UI dropdown
   const [errorMsg, setErrorMsg] = useState('');
   const navigate = useNavigate();
   const { login } = useAuth(); // Extract login from context

   const handleLogin = async (e) => {
      e.preventDefault();
      setErrorMsg('');

      const res = await login(email, password);

      if (res && res.success) {
         // Optionally navigate dynamically if the backend returns the role
         const userRole = res.user?.user_type || role;
         if (userRole === 'transporter') {
            navigate('/transporter');
         } else if (userRole === 'farmer') {
            navigate('/farmer');
         } else if (userRole === 'admin' || userRole === 'ministry') {
            navigate('/ministry');
         } else {
            navigate('/buyer');
         }
      } else {
         setErrorMsg(res?.error || 'Login failed. Please check credentials.');
      }
   };

   return (
      <div className="min-h-screen w-full flex items-start justify-center bg-[#fcfdfd] p-4 md:p-8 pt-20 md:pt-32 font-sans overflow-hidden relative">

         {/* Subtle background decorative shapes */}
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#112a1a]/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#112a1a]/5 rounded-full blur-3xl"></div>

         {/* Centered Login Window Card */}
         <div className="w-full max-w-2xl h-fit flex bg-white rounded-[32px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.12)] overflow-hidden relative z-10 animate-scaleIn">

            {/* Left Side: Thematic Illustration */}
            <div
               className="hidden lg:flex w-1/2 relative bg-cover bg-center items-center justify-center overflow-hidden group"
               style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1920&auto=format&fit=crop')`, // Vibrant fruit/market theme
               }}
            >
               {/* Visual filtering overlay */}
               <div className="absolute inset-0 bg-[#112a1a]/25 backdrop-blur-[0.5px] group-hover:backdrop-blur-0 transition-all duration-1000"></div>

               {/* Artistic Welcome Text */}
               <div className="relative z-10 text-center animate-fadeInUp">
                  <h2 className="text-3xl md:text-4xl font-normal text-white/90 tracking-[0.2em] uppercase select-none mb-2">
                     Welcome
                  </h2>
                  <div className="w-10 h-[1px] bg-white/50 mx-auto"></div>
                  <p className="mt-4 text-white/60 text-[7px] tracking-[0.3em] uppercase font-light">Sustainable Distribution</p>
               </div>

               {/* Decorative Elements */}
               <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-br-full backdrop-blur-xl"></div>
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-tl-full backdrop-blur-xl"></div>
            </div>

            {/* Right Side: Minimalist Form */}
            <div className="w-full lg:w-1/2 flex items-start justify-center p-8 md:p-10 pb-1 md:pb-1 bg-white overflow-y-auto hide-scrollbar animate-fadeIn">
               <div className="w-full max-w-sm pt-1 pb-6">

                  <div className="mb-2">
                     <h1 className="text-3xl font-normal text-[#112a1a] mb-1 tracking-tight">Login</h1>
                     <p className="text-gray-400 text-[10px] font-normal">Welcome back back to AgriSouk</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                     {/* Role Selector */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 transition-colors group-focus-within:text-[#224233]">Login role</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-11">
                           <div className="w-11 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaUserTie className="w-3.5 h-3.5" />
                           </div>
                           <select
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal appearance-none cursor-pointer bg-transparent"
                           >
                              <option value="buyer">Buyer</option>
                              <option value="farmer">Farmer</option>
                              <option value="transporter">Transporter</option>
                              <option value="ministry">Ministry / Admin</option>
                           </select>
                           <div className="flex items-center px-4 pointer-events-none text-gray-300">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                           </div>
                        </div>
                     </div>

                     {/* Email Field */}
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

                     {/* Password Field */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <div className="flex justify-between items-center mb-1">
                           <label className="block text-[10px] font-normal text-gray-400 transition-colors group-focus-within:text-[#224233]">Password</label>
                           <Link to="/forgot-password" size="sm" className="text-[9px] font-normal text-gray-400 hover:text-[#112a1a] transition-colors">Forgot?</Link>
                        </div>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-11 shadow-sm">
                           <div className="w-11 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaLock className="w-3.5 h-3.5" />
                           </div>
                           <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal placeholder-gray-200 bg-transparent"
                              placeholder="••••••••"
                           />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-gray-300 hover:text-[#112a1a] transition-colors bg-transparent">
                              {showPassword ? (
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                              ) : (
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              )}
                           </button>
                        </div>
                     </div>

                     {errorMsg && (
                        <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
                           <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                           <p className="text-[9px] text-red-600 font-normal">{errorMsg}</p>
                        </div>
                     )}

                     <div className="pt-2">
                        <button type="submit" className="w-full bg-[#112a1a] text-white py-3 rounded-2xl text-[9px] font-normal uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 shadow-xl shadow-gray-200 active:scale-[0.98]">
                           Login
                        </button>
                     </div>
                  </form>

                  <div className="mt-2 text-center">
                     <p className="text-[10px] text-gray-400 font-normal">
                        Don't have an account? <Link to="/register" className="text-[#112a1a] font-normal underline underline-offset-4 hover:text-green-600 transition-colors ml-1">Sign up</Link>
                     </p>
                  </div>

               </div>
            </div>
         </div>

         <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes scaleIn {
               from { opacity: 0; transform: scale(0.95); }
               to { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeInUp {
               from { opacity: 0; transform: translateY(20px); }
               to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
               from { opacity: 0; }
               to { opacity: 1; }
            }
            @keyframes shake {
               0%, 100% { transform: translateX(0); }
               25% { transform: translateX(-4px); }
               75% { transform: translateX(4px); }
            }
            .animate-scaleIn { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
            .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
            .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
         `}} />
      </div>
   );
};

export default Login;