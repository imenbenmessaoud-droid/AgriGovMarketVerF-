import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBriefcase } from 'react-icons/fa';

const Register = () => {
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
      name: '', email: '', phone: '', user_type: 'farmer', password: '', password_confirm: ''
   });
   const [errorMsg, setErrorMsg] = useState('');

   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

   const handleRegister = async (e) => {
      e.preventDefault();
      setErrorMsg('');
      if (formData.password !== formData.password_confirm) {
         return setErrorMsg("Passwords do not match");
      }
      try {
         await api.post('/users/register/', formData);
         navigate('/login');
      } catch (err) {
         setErrorMsg(err.response?.data?.email?.[0] || err.response?.data?.message || 'Registration failed');
      }
   };

   return (
      <div className="min-h-screen w-full flex items-start justify-center bg-[#fcfdfd] p-4 md:p-8 pt-20 md:pt-32 font-sans overflow-hidden relative">

         {/* Background decorative shapes */}
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#224233]/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#224233]/5 rounded-full blur-3xl"></div>

         {/* Centered Register Window Card - flex-row-reverse to put image on right */}
         <div className="w-full max-w-2xl h-fit flex flex-row-reverse bg-white rounded-[32px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.12)] overflow-hidden relative z-10 animate-scaleIn">

            {/* Right Side (Image): Thematic Illustration */}
            <div
               className="hidden lg:flex w-1/2 relative bg-cover bg-center items-center justify-center overflow-hidden group"
               style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1920&auto=format&fit=crop')`, // Synced with Login
               }}
            >
               {/* Visual filtering overlay */}
               <div className="absolute inset-0 bg-[#224233]/25 backdrop-blur-[0.5px] group-hover:backdrop-blur-0 transition-all duration-1000"></div>

               {/* Artistic Join Us Text */}
               <div className="relative z-10 text-center animate-fadeInUp">
                  <h2 className="text-3xl md:text-4xl font-normal text-white/90 tracking-[0.2em] uppercase select-none mb-2">
                     Join Us
                  </h2>
                  <div className="w-12 h-[1px] bg-white/50 mx-auto"></div>
                  <p className="mt-3 text-white/60 text-[7px] tracking-[0.3em] uppercase font-light">Empowering Agriculture</p>
               </div>

               {/* Decorative Elements */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full backdrop-blur-xl"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-tr-full backdrop-blur-xl"></div>
            </div>

            {/* Left Side (Form): Scrollable Minimalist Form */}
            <div className="w-full lg:w-1/2 flex items-start justify-center p-8 md:p-10 pb-1 md:pb-1 bg-white overflow-y-auto hide-scrollbar animate-fadeIn">
               <div className="w-full max-w-sm pt-1 pb-6">

                  <div className="mb-2">
                     <h1 className="text-3xl font-normal text-[#112a1a] mb-1 tracking-tight">Register</h1>
                     <p className="text-gray-400 text-[10px] font-normal">Become part of the network</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                     {/* Full Name */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Full name</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaUser className="w-3.5 h-3.5" />
                           </div>
                           <input
                              name="name"
                              onChange={handleChange}
                              required
                              type="text"
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal bg-transparent"
                              placeholder="John Doe"
                           />
                        </div>
                     </div>

                     {/* Email */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Email address</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaEnvelope className="w-3.5 h-3.5" />
                           </div>
                           <input
                              name="email"
                              onChange={handleChange}
                              required
                              type="email"
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal bg-transparent"
                              placeholder="john@example.com"
                           />
                        </div>
                     </div>

                     {/* Phone Number */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Phone number</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaPhone className="w-3.5 h-3.5" />
                           </div>
                           <div className="flex flex-grow items-center px-4">
                              <span className="text-[11px] font-normal text-gray-400 mr-1">+213</span>
                              <input
                                 name="phone"
                                 onChange={handleChange}
                                 required
                                 type="text"
                                 className="flex-grow outline-none text-[11px] text-[#112a1a] font-normal bg-transparent"
                                 placeholder="550..."
                              />
                           </div>
                        </div>
                     </div>

                     {/* Account Role */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Account role</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaBriefcase className="w-3.5 h-3.5" />
                           </div>
                           <select
                              name="user_type"
                              onChange={handleChange}
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal bg-transparent appearance-none"
                           >
                              <option value="farmer">Farmer</option>
                              <option value="buyer">Buyer</option>
                              <option value="transporter">Transporter</option>
                              <option value="admin">Ministry / Admin</option>
                           </select>
                        </div>
                     </div>

                     {/* Password */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Password</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaLock className="w-3.5 h-3.5" />
                           </div>
                           <input
                              name="password"
                              onChange={handleChange}
                              required
                              type="password"
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal bg-transparent"
                              placeholder="••••••••"
                           />
                        </div>
                     </div>

                     {/* Confirm Password */}
                     <div className="relative group transition-transform duration-300 focus-within:translate-x-1">
                        <label className="block text-[10px] font-normal text-gray-400 mb-1 group-focus-within:text-[#224233]">Confirm password</label>
                        <div className="flex items-stretch bg-white border border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#224233] transition-all h-10">
                           <div className="w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 group-focus-within:text-[#224233] transition-colors">
                              <FaLock className="w-3.5 h-3.5" />
                           </div>
                           <input
                              name="password_confirm"
                              onChange={handleChange}
                              required
                              type="password"
                              className="flex-grow px-4 outline-none text-[11px] text-[#112a1a] font-normal bg-transparent"
                              placeholder="••••••••"
                           />
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
                           Create Account
                        </button>
                     </div>
                  </form>

                  <div className="mt-2 text-center">
                     <p className="text-[10px] text-gray-400 font-normal">
                        Already have an account? <Link to="/login" className="text-[#112a1a] font-normal underline underline-offset-4 hover:text-green-600 transition-colors ml-1">Log in</Link>
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
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
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

export default Register;