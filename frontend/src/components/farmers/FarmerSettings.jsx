import React, { useState, useEffect } from 'react';
import {
   FaUserCircle, FaTimes, FaCheckCircle, FaCog, FaPlus, FaSpinner,
   FaCamera, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaGlobe,
   FaTwitter, FaLinkedin, FaFacebook, FaEdit, FaCheck, FaQuestionCircle,
   FaShieldAlt, FaKey
} from 'react-icons/fa';

const FarmerSettings = () => {
   const [isEditing, setIsEditing] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [activeSection, setActiveSection] = useState('Account'); // 'Account', 'Security', 'Notifications'

   const [formData, setFormData] = useState(() => {
      const saved = localStorage.getItem('farmerProfile');
      if (saved) return JSON.parse(saved);
      return {
         username: 'intissar.zermane',
         firstName: 'Intissar',
         lastName: 'Zermane',
         name: 'Intissar Zermane',
         email: 'intissarze1@gmail.com',
         phone: '06 9935 10 36',
         address: 'Coopérative El Falah, Oran',
         wilaya: '31 - Oran',
         nation: 'Algeria',
         city: 'Oran',
         zipCode: '31000',
         gender: 'Female',
         dobMonth: 'August',
         dobDay: '12',
         dobYear: '1992',
         slogan: 'Harvesting Excellence for a Sustainable Future.',
         twitter: 'twitter.com/intissar_agri',
         linkedin: 'linkedin.com/in/intissar',
         facebook: 'facebook.com/intissar',
         photo: '',
         farmName: 'Coopérative El Falah',
         memberSince: 'March 2024'
      };
   });

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
         const finalData = { ...formData, name: `${formData.firstName} ${formData.lastName}` };
         setFormData(finalData);
         localStorage.setItem('farmerProfile', JSON.stringify(finalData));
         window.dispatchEvent(new Event('storage'));
         setIsSaving(false);
         setIsEditing(false);
      }, 1200);
   };

   const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const photoURL = URL.createObjectURL(file);
         setFormData({ ...formData, photo: photoURL });
      }
   };

   const SectionTab = ({ id, icon: Icon, label }) => (
      <button
         onClick={() => setActiveSection(id)}
         className={`flex items-center space-x-3 px-6 py-4 w-full text-left transition-all rounded-2xl ${activeSection === id
               ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
               : 'text-emerald-900/40 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
      >
         <Icon size={16} />
         <span className="text-[11px] font-normal uppercase tracking-widest">{label}</span>
      </button>
   );

   return (
      <div className="w-full bg-[#F8FAF9] min-h-screen font-sans px-4 md:px-8 py-8 lg:py-12 selection:bg-emerald-100 selection:text-emerald-900">
         <div className="max-w-6xl mx-auto space-y-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div className="space-y-1">
                  <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                     <FaCog size={24} />
                     <span className="text-[10px] font-normal uppercase tracking-widest">System Preferences</span>
                  </div>
                  <h1 className="text-3xl font-normal text-emerald-900 tracking-tight lowercase">settings & profile</h1>
                  <p className="text-emerald-600/60 font-normal">Manage your digital identity and portal configuration.</p>
               </div>
               {!isEditing && (
                  <button
                     onClick={() => setIsEditing(true)}
                     className="flex items-center space-x-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-normal text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95"
                  >
                     <FaEdit size={14} />
                     <span>Modify Credentials</span>
                  </button>
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
               {/* Sidebar Nav */}
               <div className="lg:col-span-1 space-y-4">
                  <SectionTab id="Account" icon={FaUserCircle} label="Public Profile" />
                  <SectionTab id="Security" icon={FaShieldAlt} label="Security Core" />
                  <SectionTab id="Notifications" icon={FaCheckCircle} label="Notifications" />
               </div>

               {/* Main Content Area */}
               <div className="lg:col-span-3">
                  {activeSection === 'Account' && (
                     <div className="bg-white rounded-[40px] border border-emerald-100 shadow-2xl shadow-emerald-900/5 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">

                        {/* Profile Banner / Avatar Section */}
                        <div className="relative h-48 bg-emerald-900 overflow-hidden">
                           <div className="absolute inset-0 opacity-10">
                              <div className="grid grid-cols-8 gap-4 p-4">
                                 {[...Array(32)].map((_, i) => (
                                    <div key={i} className="aspect-square border border-white rounded-full"></div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="px-10 pb-12 -mt-16 relative z-10">
                           <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
                              <div className="relative group">
                                 <div className="w-32 h-32 rounded-[32px] bg-white p-1 hover:rotate-2 transition-transform duration-500 shadow-2xl border border-emerald-50">
                                    <div className="w-full h-full rounded-[28px] overflow-hidden bg-emerald-50 flex items-center justify-center">
                                       {formData.photo ? (
                                          <img src={formData.photo} alt="Avatar" className="w-full h-full object-cover" />
                                       ) : (
                                          <FaUserCircle size={80} className="text-emerald-100" />
                                       )}
                                    </div>
                                 </div>
                                 {isEditing && (
                                    <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:bg-emerald-700 hover:rotate-12 transition-all">
                                       <FaCamera size={14} />
                                       <input type="file" id="photo-upload" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                    </label>
                                 )}
                              </div>

                              <div className="flex-grow pb-2">
                                 <h2 className="text-3xl font-normal text-emerald-900 tracking-tight truncate lowercase">{formData.firstName} {formData.lastName}</h2>
                                 <p className="text-[10px] font-normal text-emerald-600 uppercase tracking-widest flex items-center mt-1">
                                    <FaCheckCircle className="mr-2" size={12} />
                                    Verified Agricultural Partner
                                 </p>
                              </div>
                           </div>

                           {isEditing ? (
                              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-10">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                       <label className="text-[10px] font-normal text-emerald-900/40 uppercase tracking-widest px-1">First Name</label>
                                       <input
                                          name="firstName"
                                          value={formData.firstName}
                                          onChange={handleChange}
                                          className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-normal text-emerald-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                       />
                                    </div>
                                    <div className="space-y-3">
                                       <label className="text-[10px] font-normal text-emerald-900/40 uppercase tracking-widest px-1">Last Name</label>
                                       <input
                                          name="lastName"
                                          value={formData.lastName}
                                          onChange={handleChange}
                                          className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-normal text-emerald-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                       />
                                    </div>
                                    <div className="space-y-3">
                                       <label className="text-[10px] font-normal text-emerald-900/40 uppercase tracking-widest px-1">Email Address</label>
                                       <input
                                          name="email"
                                          value={formData.email}
                                          onChange={handleChange}
                                          className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-normal text-emerald-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                       />
                                    </div>
                                    <div className="space-y-3">
                                       <label className="text-[10px] font-normal text-emerald-900/40 uppercase tracking-widest px-1">Phone Connectivity</label>
                                       <input
                                          name="phone"
                                          value={formData.phone}
                                          onChange={handleChange}
                                          className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-normal text-emerald-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                       />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                       <label className="text-[10px] font-normal text-emerald-900/40 uppercase tracking-widest px-1">Professional Bio / Slogan</label>
                                       <textarea
                                          name="slogan"
                                          value={formData.slogan}
                                          onChange={handleChange}
                                          rows="3"
                                          className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-normal text-emerald-900 focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none"
                                       />
                                    </div>
                                 </div>

                                 <div className="pt-10 border-t border-emerald-50 flex items-center space-x-6">
                                    <button
                                       type="submit"
                                       disabled={isSaving}
                                       className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-normal text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center space-x-3 min-w-[200px]"
                                    >
                                       {isSaving ? <FaSpinner className="animate-spin" /> : <><FaCheck size={14} /><span>Apply Changes</span></>}
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => setIsEditing(false)}
                                       className="text-emerald-900/40 hover:text-emerald-900 font-normal text-xs uppercase tracking-widest transition-all"
                                    >
                                       Discard Edits
                                    </button>
                                 </div>
                              </form>
                           ) : (
                              <div className="space-y-12">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                       <h4 className="text-[11px] font-normal text-emerald-900/20 uppercase tracking-widest">Identity Core</h4>
                                       <div className="space-y-6">
                                          <div className="flex items-center space-x-5 group">
                                             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner border border-emerald-100/50">
                                                <FaEnvelope size={14} />
                                             </div>
                                             <div>
                                                <p className="text-[9px] font-normal text-emerald-900/40 uppercase tracking-widest leading-none">Primary Email</p>
                                                <p className="font-normal text-emerald-900 mt-1">{formData.email}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center space-x-5 group">
                                             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner border border-emerald-100/50">
                                                <FaPhoneAlt size={14} />
                                             </div>
                                             <div>
                                                <p className="text-[9px] font-normal text-emerald-900/40 uppercase tracking-widest leading-none">Phone Line</p>
                                                <p className="font-normal text-emerald-900 mt-1">+213 {formData.phone}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center space-x-5 group">
                                             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner border border-emerald-100/50">
                                                <FaMapMarkerAlt size={14} />
                                             </div>
                                             <div>
                                                <p className="text-[9px] font-normal text-emerald-900/40 uppercase tracking-widest leading-none">Regional Node</p>
                                                <p className="font-normal text-emerald-900 mt-1">{formData.wilaya}, {formData.nation}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="space-y-8">
                                       <h4 className="text-[11px] font-normal text-emerald-900/20 uppercase tracking-widest">Social Footprint</h4>
                                       <div className="space-y-6">
                                          <div className="flex items-center space-x-4">
                                             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100"><FaTwitter size={16} /></div>
                                             <span className="text-sm font-normal text-emerald-900/60 lowercase">{formData.twitter}</span>
                                          </div>
                                          <div className="flex items-center space-x-4">
                                             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100"><FaLinkedin size={16} /></div>
                                             <span className="text-sm font-normal text-indigo-900/60 lowercase">{formData.linkedin}</span>
                                          </div>
                                          <div className="flex items-center space-x-4">
                                             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100"><FaGlobe size={16} /></div>
                                             <span className="text-sm font-normal text-emerald-900/60 lowercase">agrisouk.dz/f/{formData.username}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                                    <h4 className="text-[10px] font-normal text-emerald-900/30 uppercase tracking-widest mb-4">Professional Motto</h4>
                                    <p className="text-lg font-normal text-emerald-900 italic leading-relaxed">
                                       "{formData.slogan}"
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {activeSection === 'Security' && (
                     <div className="bg-white rounded-[40px] border border-emerald-100 shadow-2xl shadow-emerald-900/5 p-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div>
                           <h3 className="text-2xl font-normal text-emerald-900 tracking-tight lowercase">security infrastructure</h3>
                           <p className="text-emerald-600/60 font-normal">Protect your account with high-level encryption and validation.</p>
                        </div>

                        <div className="space-y-6">
                           <div className="p-6 bg-white border border-emerald-100 rounded-3xl flex items-center justify-between group hover:border-emerald-500 mt-2 transition-all shadow-sm">
                              <div className="flex items-center space-x-5">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <FaKey size={18} />
                                 </div>
                                 <div>
                                    <p className="font-normal text-emerald-900">Access Password</p>
                                    <p className="text-xs font-normal text-emerald-900/40">Last synchronized 3 months ago</p>
                                 </div>
                              </div>
                              <button className="px-6 py-2 border-2 border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-normal uppercase tracking-widest hover:bg-emerald-50 transition-all">Update</button>
                           </div>

                           <div className="p-6 bg-white border border-emerald-100 rounded-3xl flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
                              <div className="flex items-center space-x-5">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <FaShieldAlt size={18} />
                                 </div>
                                 <div>
                                    <p className="font-normal text-emerald-900">Two-Factor Authentication</p>
                                    <p className="text-xs font-normal text-emerald-500">Active and Synchronized</p>
                                 </div>
                              </div>
                              <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-normal uppercase tracking-widest shadow-lg shadow-emerald-600/20">Configured</button>
                           </div>

                           <div className="p-10 bg-rose-50 rounded-[32px] border border-rose-100 space-y-4">
                              <h4 className="text-rose-900 font-normal tracking-tight">Danger Zone</h4>
                              <p className="text-xs font-normal text-rose-900/60 leading-relaxed max-w-md">Once you delete your agricultural entity, there is no going back. Please be certain of this operation.</p>
                              <button className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-normal text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all active:scale-95">Deactivate Global Identity</button>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeSection === 'Notifications' && (
                     <div className="bg-white rounded-[40px] border border-emerald-100 shadow-2xl shadow-emerald-900/5 p-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div>
                           <h3 className="text-2xl font-normal text-emerald-900 tracking-tight lowercase">notification pulse</h3>
                           <p className="text-emerald-600/60 font-normal">Configure how you receive supply chain updates.</p>
                        </div>

                        <div className="space-y-4">
                           {[
                              { title: 'New Order Requests', desc: 'Alert when a buyer requests your products' },
                              { title: 'Logistics Synchronized', desc: 'Alert when a transporter accepts your delivery' },
                              { title: 'Settlement Completed', desc: 'Financial payment confirmation alerts' },
                              { title: 'Market Trends', desc: 'Weekly agricultural market intelligence' }
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-6 border-b border-emerald-50 last:border-0">
                                 <div>
                                    <p className="font-normal text-emerald-900 leading-none">{item.title}</p>
                                    <p className="text-xs font-normal text-emerald-900/40 mt-2">{item.desc}</p>
                                 </div>
                                 <div className="w-12 h-6 bg-emerald-100 rounded-full relative cursor-pointer group">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-emerald-600 rounded-full group-hover:scale-110 transition-transform"></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Help/Support Sticky */}
         <div className="fixed bottom-10 right-10">
            <button className="w-14 h-14 bg-emerald-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-emerald-900/40 hover:bg-[#112a1a] hover:-translate-y-2 transition-all duration-500 active:scale-90 group relative">
               <FaQuestionCircle size={22} className="group-hover:rotate-12 transition-transform" />
               <div className="absolute right-full mr-4 bg-emerald-900 text-white px-4 py-2 rounded-xl text-[10px] font-normal uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Support Nexus
               </div>
            </button>
         </div>
      </div>
   );
};

export default FarmerSettings;
