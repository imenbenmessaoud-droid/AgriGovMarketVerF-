import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const FarmerAddProduct = () => {
    const [blueprints, setBlueprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id_product: '',
        quantity: '',
        product_price: '',
        production_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                const res = await api.get('products/products/');
                setBlueprints(res.data);
            } catch (err) {
                console.error("Failed to load official blueprints", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlueprints();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('products/product-items/', {
                id_product: parseInt(formData.id_product),
                quantity: parseFloat(formData.quantity),
                product_price: parseFloat(formData.product_price),
                production_date: formData.production_date,
                is_available: true
            });
            alert('Offer added successfully to the Market Exchange!');
            setFormData({
                id_product: '',
                quantity: '',
                product_price: '',
                production_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Error", err.response?.data);
            alert(err.response?.data?.message || 'Failed to add product. Make sure price is within official constraints.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-[#fcfdfd] min-h-screen p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[40px] p-10 md:p-16 shadow-sm space-y-12 animate-in fade-in py-10">
                    
                    <div>
                        <h2 className="text-2xl font-normal text-gray-800">Publish Market Offer</h2>
                        <p className="text-sm text-gray-500 mt-2 font-normal">Create an inventory listing based on the official Ministry catalogs.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-normal text-gray-800 uppercase tracking-widest px-2">Official Market Blueprint *</label>
                        {loading ? (
                           <div className="text-sm text-gray-400 py-4 flex items-center gap-2"><FaSpinner className="animate-spin text-green-700"/> Fetching Official Catalog...</div>
                        ) : (
                           <div className="space-y-4">
                               <select
                                   required
                                   value={formData.id_product}
                                   onChange={(e) => setFormData({...formData, id_product: e.target.value})}
                                   className="w-full h-16 px-8 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-600 transition-all text-sm appearance-none cursor-pointer"
                               >
                                   <option value="">-- Select Master Product --</option>
                                   {blueprints.map(bp => (
                                      <option key={bp.id_product} value={bp.id_product}>{bp.product_name} ({bp.category_name})</option>
                                   ))}
                               </select>
                               
                               {formData.id_product && blueprints.find(bp => bp.id_product === parseInt(formData.id_product))?.current_price && (
                                   <div className="mt-4 p-5 bg-green-50 border border-green-100 rounded-3xl flex justify-between items-center transition-all animate-in slide-in-from-top-4 duration-500">
                                       <div className="flex items-center gap-3">
                                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                           <span className="text-[10px] uppercase font-normal text-green-700 tracking-widest">Pricing Policy Active</span>
                                       </div>
                                       <div className="flex gap-8">
                                           <div className="text-right">
                                               <p className="text-[9px] text-green-600 uppercase font-normal tracking-tighter">Min Authorized</p>
                                               <p className="text-lg font-normal text-green-900">{blueprints.find(bp => bp.id_product === parseInt(formData.id_product)).current_price.min_price} <span className="text-[10px] font-normal">DZD</span></p>
                                           </div>
                                           <div className="w-[1px] bg-green-200"></div>
                                           <div className="text-right">
                                               <p className="text-[9px] text-green-600 uppercase font-normal tracking-tighter">Max Authorized</p>
                                               <p className="text-lg font-normal text-green-900">{blueprints.find(bp => bp.id_product === parseInt(formData.id_product)).current_price.max_price} <span className="text-[10px] font-normal">DZD</span></p>
                                           </div>
                                       </div>
                                   </div>
                               )}
                           </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-normal text-gray-800 uppercase tracking-widest px-2">Harvest / Production Date</label>
                            <input
                                required
                                type="date"
                                value={formData.production_date}
                                onChange={(e) => setFormData({...formData, production_date: e.target.value})}
                                className="w-full h-16 px-8 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-600 transition-all text-sm text-gray-700"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-normal text-gray-800 uppercase tracking-widest px-2">Volume / Quantity Available (KG)</label>
                            <input
                                required
                                type="number"
                                placeholder="e.g. 500"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                className="w-full h-16 px-8 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-600 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-normal text-gray-800 uppercase tracking-widest px-2">Offer Price (DZD / KG)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 100"
                            value={formData.product_price}
                            onChange={(e) => setFormData({...formData, product_price: e.target.value})}
                            className="w-full h-16 px-8 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-600 transition-all text-sm placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 px-3 mt-2">Note: Price must fall within the Ministry's target margins for the chosen blueprint.</p>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#112a1a] hover:bg-green-800 text-white px-16 py-5 rounded-2xl text-[10px] font-normal uppercase tracking-[0.3em] transition-all shadow-xl shadow-green-900/10 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'PUBLISHING...' : 'PUBLISH OFFER'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FarmerAddProduct;
