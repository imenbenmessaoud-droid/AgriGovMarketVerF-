import React, { useState, useEffect } from 'react';
import { FaSave, FaHistory, FaSearch, FaTimes, FaEdit, FaChartLine, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import api from '../../services/api';

const OfficialPriceManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingDetailsId, setEditingDetailsId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editForm, setEditForm] = useState({ min_price: 0, max_price: 0 });
  const [detailsForm, setDetailsForm] = useState({ product_name: '', id_category: '' });
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '', product_description: '', product_quality: 'standard', id_category: ''
  });

  // History State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('products/products/'),
        api.get('products/categories/')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (productReq) => {
    setEditingId(productReq.id_product);
    setEditingDetailsId(null);
    setEditForm({ 
      min_price: productReq.current_price?.min_price || 0, 
      max_price: productReq.current_price?.max_price || 0
    });
  };

  const handleEditDetails = (item) => {
    setEditingDetailsId(item.id_product);
    setEditingId(null);
    setDetailsForm({
      product_name: item.product_name,
      id_category: item.id_category
    });
  };

  const handleSave = async (id) => {
    try {
      await api.post(`products/products/${id}/set_price/`, {
        min_price: editForm.min_price,
        max_price: editForm.max_price,
        price_unit: 'DZD/kg',
        valid_until: null // valid indefinitely for now
      });
      fetchData();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update pricing:", err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to update pricing constraints";
      alert(errorMsg);
    }
  };

  const handleUpdateDetails = async (id) => {
    try {
      await api.patch(`products/products/${id}/`, detailsForm);
      fetchData();
      setEditingDetailsId(null);
    } catch (err) {
      console.error("Failed to update product details:", err);
      alert("Failed to update product details.");
    }
  };

  const handleViewHistory = async (product) => {
    setHistoryProduct(product);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`products/products/${product.id_product}/price_history/`);
      setPriceHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('products/products/', {
        ...newProduct,
        is_active: true
      });
      setShowAddForm(false);
      setNewProduct({ product_name: '', product_description: '', product_quality: 'standard', id_category: ''});
      fetchData();
    } catch (err) {
      alert('Failed to create new product blueprint.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product? All associated prices and inventory will be removed.')) {
      try {
        await api.delete(`products/products/${id}/`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const filteredPrices = products.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#faf8f0] px-4 pt-0 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaChartLine className="text-green-700" size={16} />
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">Market Catalogs</span>
            </div>
            <h1 className="text-xl font-normal text-black">Master Products Base</h1>
            <p className="text-gray-500 text-[13px] mt-0.5">Define platform catalogues and regulate market margins</p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-normal rounded-lg hover:bg-green-800 transition shadow-sm"
          >
            <FaPlus size={14} /> Add Product Blueprint
          </button>
        </div>

        {/* Add Product Inline Form */}
        {showAddForm && (
          <div className="bg-white border border-green-200 rounded-lg p-5 shadow-sm animate-in slide-in-from-top-2">
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-normal text-lg text-gray-800">New Product Configuration</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-800"><FaTimes/></button>
             </div>
             <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4">
               <div className="md:col-span-1">
                  <label className="block text-xs font-normal text-gray-700 uppercase tracking-wider mb-1">Product Name</label>
                  <input required value={newProduct.product_name} onChange={e=>setNewProduct({...newProduct, product_name: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="e.g. Tomato (Roma)"/>
               </div>
               <div className="md:col-span-1">
                  <label className="block text-xs font-normal text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <select required value={newProduct.id_category} onChange={e=>setNewProduct({...newProduct, id_category: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
                    <option value="">-- Choose --</option>
                    {categories.map(cat => <option key={cat.id_category} value={cat.id_category}>{cat.category_name}</option>)}
                  </select>
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-normal text-gray-700 uppercase tracking-wider mb-1">Description</label>
                  <input required value={newProduct.product_description} onChange={e=>setNewProduct({...newProduct, product_description: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="Short description..."/>
               </div>
               <div className="md:col-span-1 flex items-end">
                  <button type="submit" className="w-full py-2 bg-green-700 text-white font-normal rounded-md hover:bg-green-800 shadow-sm transition">Create</button>
               </div>
             </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search product directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id_category} value={cat.category_name}>{cat.category_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="text-sm font-normal text-black">
            Directory ({filteredPrices.length} Items)
          </h2>
          <p className="text-xs text-gray-400">
            Prices configured in DZD/kg
          </p>
        </div>

        {/* Price Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
               <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                  <FaSpinner className="animate-spin text-green-700 mb-4" size={32}/>
                  Syncing National Registry...
               </div>
            ) : (
            <table className="w-full">
              <thead className="bg-[#fcfdfd] border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-normal text-gray-500 uppercase tracking-widest">Product Reference</th>
                  <th className="px-5 py-3 text-left text-[10px] font-normal text-gray-500 uppercase tracking-widest">Pricing Thresholds</th>
                  <th className="px-5 py-3 text-left text-[10px] font-normal text-green-700 uppercase tracking-widest">Target Margin</th>
                  <th className="px-5 py-3 text-right text-[10px] font-normal text-gray-500 uppercase tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPrices.map((item) => (
                  <tr key={item.id_product} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3">
                      {editingDetailsId === item.id_product ? (
                        <div className="space-y-2">
                          <input 
                            type="text"
                            value={detailsForm.product_name}
                            onChange={e => setDetailsForm({...detailsForm, product_name: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                          />
                          <select 
                            value={detailsForm.id_category}
                            onChange={e => setDetailsForm({...detailsForm, id_category: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                          >
                            {categories.map(cat => (
                              <option key={cat.id_category} value={cat.id_category}>{cat.category_name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-normal text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-green-700 font-normal">{item.category_name}</p>
                        </>
                      )}
                    </td>
                    
                    {/* Constraints */}
                    <td className="px-5 py-4">
                      {editingId === item.id_product ? (
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             step="any"
                             value={editForm.min_price} 
                             onChange={e => setEditForm({...editForm, min_price: e.target.value})} 
                             className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center"
                             placeholder="MIN"
                           />
                           <span className="text-gray-400">-</span>
                           <input 
                             type="number" 
                             step="any"
                             value={editForm.max_price} 
                             onChange={e => setEditForm({...editForm, max_price: e.target.value})} 
                             className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center"
                             placeholder="MAX"
                           />
                        </div>
                      ) : (
                        <div className="flex flex-col">
                           {item.current_price ? (
                              <span className="text-sm font-normal text-gray-700 bg-gray-100 px-3 py-1 rounded inline-block w-max">
                                 {item.current_price.min_price} - {item.current_price.max_price} DZD
                              </span>
                           ) : (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 font-normal w-max">Unregulated</span>
                           )}
                        </div>
                      )}
                     </td>

                    {/* Meta Price visual */}
                    <td className="px-5 py-4">
                      {item.current_price ? (
                         <span className="inline-flex px-3 py-1.5 bg-green-50 text-green-800 font-normal text-sm rounded shadow-sm border border-green-200">
                           ~{((parseFloat(item.current_price.max_price) + parseFloat(item.current_price.min_price))/2).toFixed(1)} DZD
                         </span>
                      ) : (
                         <span className="text-gray-300 text-sm">—</span>
                      )}
                     </td>
                    
                    <td className="px-5 py-3 text-right align-middle">
                      {editingId === item.id_product ? (
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-normal uppercase rounded hover:bg-gray-200 transition">Cancel</button>
                           <button onClick={() => handleSave(item.id_product)} className="px-3 py-2 bg-green-700 text-white text-xs font-normal uppercase rounded hover:bg-green-800 transition">Commit</button>
                        </div>
                      ) : editingDetailsId === item.id_product ? (
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setEditingDetailsId(null)} className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-normal uppercase rounded hover:bg-gray-200 transition">Cancel</button>
                           <button onClick={() => handleUpdateDetails(item.id_product)} className="px-3 py-2 bg-green-700 text-white text-xs font-normal uppercase rounded hover:bg-green-800 transition">Save</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteProduct(item.id_product)} 
                            className="px-3 py-2 border border-red-200 text-red-600 text-xs font-normal uppercase rounded hover:bg-red-50 hover:border-red-300 transition"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => handleEditDetails(item)} 
                            className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-normal uppercase rounded hover:bg-gray-100 hover:text-green-700 hover:border-green-300 transition"
                          >
                            Update
                          </button>
                          <button 
                            onClick={() => handleViewHistory(item)} 
                            className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-normal uppercase rounded hover:bg-gray-100 hover:text-green-700 hover:border-green-300 transition"
                            title="View Price History"
                          >
                            <FaHistory />
                          </button>
                          <button 
                            onClick={() => handleEdit(item)} 
                            className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-normal uppercase rounded hover:bg-gray-100 hover:text-green-700 hover:border-green-300 transition"
                          >
                            Regulate
                          </button>
                        </div>
                      )}
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
          
          {!loading && filteredPrices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products match your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Price History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsHistoryModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-[101] overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfd]">
              <div>
                <h3 className="text-lg font-normal text-gray-900">Price History</h3>
                <p className="text-xs text-green-700 font-normal">{historyProduct?.product_name} • Official Thresholds</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {historyLoading ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <FaSpinner className="animate-spin text-green-700 mb-4" size={32} />
                  <p className="text-sm text-gray-500">Retrieving historical records...</p>
                </div>
              ) : priceHistory.length > 0 ? (
                <div className="space-y-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-[10px] font-normal text-gray-400 uppercase tracking-widest">Effective Date</th>
                        <th className="text-left py-3 text-[10px] font-normal text-gray-400 uppercase tracking-widest">Price Range</th>
                        <th className="text-right py-3 text-[10px] font-normal text-gray-400 uppercase tracking-widest">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {priceHistory.map((history, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-800 font-normal">
                                {new Date(history.date_set).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {idx === 0 && <span className="text-[9px] text-green-600 font-normal uppercase tracking-tighter">Current Official</span>}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-sm font-normal text-gray-700 px-2.5 py-1 bg-gray-100 rounded">
                              {history.min_price} - {history.max_price} <span className="text-[10px] text-gray-400">DZD/kg</span>
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-xs text-gray-500 font-normal italic">
                              {history.admin_name || 'System Admin'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHistory className="text-gray-200" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">No historical price changes found for this product.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialPriceManager;