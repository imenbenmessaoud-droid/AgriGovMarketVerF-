import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaTractor, FaCamera, FaCheckCircle, 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import logoImg from '../../logo.svg';

const ProductItemForm = () => {
  const navigate = useNavigate();
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    farm: 'Domaine Sud',
    category: 'Vegetables',
    name: 'Tomatoes',
    quantity: '500',
    Unit: 'kilogram (kg)',
    price: '80',
    quality: 'Quality A',
    description: 'Provide details about harvesting date, soil type, etc.',
    photo: 'https://images.unsplash.com/photo-1595856728068-1bc0015cb876?auto=format&fit=crop&w=600&q=80'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowFinalConfirm(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
       const photoURL = URL.createObjectURL(file);
       if (formData.photo) {
          setPendingPhoto(photoURL);
          setShowPhotoConfirm(true);
       } else {
          setFormData({ ...formData, photo: photoURL });
       }
    }
  };

  const confirmPhotoReplace = () => {
    setFormData({ ...formData, photo: pendingPhoto });
    setPendingPhoto(null);
    setShowPhotoConfirm(false);
  };

  const cancelPhotoReplace = () => {
    setPendingPhoto(null);
    setShowPhotoConfirm(false);
  };

  const performSync = () => {
    setShowFinalConfirm(false);
    setShowSuccessMsg(true);
    setTimeout(() => {
      setShowSuccessMsg(false);
      navigate('/farmer/products');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#e2eee2] flex flex-col pt-16 lg:pt-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm/50 mt-16 lg:mt-0">
         <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/farmer/products')} className="p-2 text-slate-400 hover:text-[#33634a] border border-gray-100 rounded-sm hover:border-[#33634a] transition-all"><FaTimes size={16} /></button>
            <div className="flex items-center space-x-2 text-[#112a1a]">
               <div className="w-7 h-7 flex items-center justify-center">
                  <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
               </div>
               <div className="flex-row items-center space-x-1.5 hidden sm:flex">
                  <span className="text-xl font-normal tracking-tight text-[#112a1a] font-sans leading-none">AgriSouk</span>
                  <span className="text-xl font-normal tracking-tight text-[#112a1a] font-sans leading-none">DZ</span>
               </div>
               <h1 className="text-xl font-normal text-[#112a1a] tracking-tight ml-2 border-l border-gray-100 pl-4">Resource Management <span className="text-slate-300 ml-2 font-normal">/ New Item</span></h1>
            </div>
         </div>
      </div>

      <div className="flex-grow max-w-[1000px] w-full mx-auto p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8 items-start">
         {/* LEFT COLUMN: THE CARD */}
         <div className="w-full lg:w-[240px] shrink-0 sticky top-28">
            <div className="bg-white p-3 shadow-sm border border-gray-100 rounded-sm flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-500">
               <label htmlFor="edit-photo-upload" className="w-full aspect-[4/5] overflow-hidden mb-4 relative group cursor-pointer block">
                  <img src={formData.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="px-5 py-1.5 bg-white text-slate-700 text-base font-normal capitalize">Change photo</div>
                  </div>
               </label>
               <h3 className="text-[16px] font-normal text-slate-800 tracking-tight mb-0.5">{formData.name || 'Product Name'}</h3>
               <p className="text-base font-normal text-slate-500 capitalize mb-1">{formData.farm || 'Farm source'}</p>
            </div>
         </div>
         
         {/* RIGHT COLUMN: THE FORM */}
         <div className="flex-grow w-full bg-white px-8 py-10 md:px-12 md:py-12 border border-gray-100 shadow-sm rounded-sm animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
            <div className="space-y-8">
               {/* Gallery Upload Section */}
               <div>
                  <label className="block text-base text-slate-600 mb-3 font-normal capitalize">Production gallery / photos</label>
                  <div className="flex items-center space-x-6">
                     <div className="w-[70px] h-[70px] bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                        <img src={formData.photo} className="w-full h-full object-cover" alt="Thumb" />
                     </div>
                     <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="edit-photo-upload" />
                     <label htmlFor="edit-photo-upload" className="px-6 py-2 border border-slate-300 text-slate-600 text-base font-normal hover:bg-slate-50 cursor-pointer transition-colors rounded-sm shadow-sm capitalize">Upload new asset</label>
                  </div>
               </div>

               <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                     <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Product name</label>
                     <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50/50 border border-transparent focus:border-[#3C5718]/20 focus:bg-white transition-all px-4 py-3 text-xl outline-none text-slate-700 font-normal rounded-sm" />
                  </div>

                  {/* 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div className="md:col-span-1">
                        <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Farm source</label>
                        <CustomSelect value={formData.farm} onChange={(val) => setFormData({...formData, farm: val})} options={["Domaine Sud", "Coopérative El Falah", "Biskra Oasis Palms"]} className="w-full bg-gray-50/50 p-2 text-xl text-slate-700 font-normal rounded-sm border border-transparent" />
                     </div>
                     <div>
                        <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Price (dzd)</label>
                        <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50/50 px-4 py-3 text-xl text-slate-700 font-normal outline-none rounded-sm border border-transparent focus:bg-white focus:border-[#3C5718]/20 transition-all" />
                     </div>
                     <div>
                        <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Unit</label>
                        <CustomSelect value={formData.Unit} onChange={(val) => setFormData({...formData, Unit: val})} options={["kilogram (kg)", "ton", "Boxes"]} className="w-full bg-gray-50/50 p-2 text-xl text-slate-700 font-normal rounded-sm border border-transparent" />
                     </div>
                  </div>

                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                     <div>
                        <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Quantity pool</label>
                        <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-gray-50/50 px-4 py-3 text-xl text-slate-700 font-normal outline-none rounded-sm border border-transparent focus:bg-white focus:border-[#3C5718]/20 transition-all" />
                     </div>
                     <div>
                        <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Quality grade</label>
                        <CustomSelect value={formData.quality} onChange={(val) => setFormData({...formData, quality: val})} options={["Premium", "Quality A", "Quality B"]} className="w-full bg-gray-50/50 p-2 text-xl text-slate-700 font-normal rounded-sm border border-transparent" />
                     </div>
                  </div>

                  {/* Description */}
                  <div className="pt-1">
                     <label className="block text-base text-slate-600 mb-2 font-normal capitalize">Detailed description</label>
                     <textarea rows="4" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Provide details about harvesting date, soil type, etc." className="w-full bg-gray-50/50 px-4 py-3 text-xl text-slate-700 font-normal outline-none rounded-sm border border-transparent focus:bg-white focus:border-[#3C5718]/20 transition-all resize-none"></textarea>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex items-center justify-start space-x-3 pt-6 border-t border-gray-100 mt-6">
                     <button onClick={() => setShowFinalConfirm(true)} className="flex items-center space-x-2 px-6 py-2.5 bg-[#3c5718] text-white font-normal text-lg shadow-sm rounded-sm hover:bg-[#254d38] transition-all">
                        <FaCheckCircle size={14} />
                        <span>Save changes</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showPhotoConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0a1128]/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white p-12 max-w-sm w-full text-center space-y-8 rounded-md shadow-2xl border border-gray-50 scale-in-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaCamera className="text-blue-500" size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-normal text-slate-800 tracking-tight">Replace Photo Asset?</h3>
                 <p className="text-base text-slate-400 font-normal mt-2">Do you want to change the currently established photo or keep the existing one?</p>
              </div>
              <div className="flex space-x-3">
                 <button onClick={cancelPhotoReplace} className="flex-1 py-3 bg-gray-50 text-slate-400 font-normal rounded-sm text-lg hover:bg-gray-100 transition-all">Keep Current</button>
                 <button onClick={confirmPhotoReplace} className="flex-1 py-3 bg-blue-600 text-white font-normal rounded-sm text-lg shadow-xl hover:bg-blue-700 transition-all">Change Photo</button>
              </div>
           </div>
        </div>
      )}

      {showFinalConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0a1128]/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white p-12 max-w-sm w-full text-center space-y-8 rounded-md shadow-2xl border border-gray-50 scale-in-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaCheckCircle className="text-[#3C5718]" size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-normal text-slate-800 tracking-tight">Confirm Global Sync?</h3>
                 <p className="text-base text-slate-400 font-normal mt-2">Deploy new resource parameter to the market infrastructure?</p>
              </div>
              <div className="flex space-x-3">
                 <button onClick={() => setShowFinalConfirm(false)} className="flex-1 py-3 bg-gray-50 text-slate-400 font-normal rounded-sm text-lg hover:bg-gray-100 transition-all">Abort Sync</button>
                 <button onClick={performSync} className="flex-1 py-3 bg-[#3C5718] text-white font-normal rounded-sm text-lg shadow-xl hover:bg-[#23330E] transition-all">Upload Item</button>
              </div>
           </div>
        </div>
      )}

      {showSuccessMsg && (
        <div className="fixed inset-x-0 bottom-4 z-[300] flex justify-center animate-in slide-in-from-bottom-5">
           <div className="bg-[#3C5718] text-white px-8 py-3 rounded-full shadow-2xl flex items-center space-x-3">
              <FaCheckCircle size={18} />
              <span className="text-lg font-normal tracking-widest uppercase">Successfully Synced to Market</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductItemForm;
