import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaLeaf, FaAppleAlt, FaCarrot, 
  FaSeedling, FaSearch, FaTimes, FaBoxes, FaChartLine,
  FaSave, FaTimesCircle, FaUser, FaWarehouse
} from 'react-icons/fa';
import api from '../../services/api';

const iconOptions = [
  { name: 'FaCarrot', component: <FaCarrot size={20} />, color: 'orange' },
  { name: 'FaAppleAlt', component: <FaAppleAlt size={20} />, color: 'red' },
  { name: 'FaSeedling', component: <FaSeedling size={20} />, color: 'yellow' },
  { name: 'FaLeaf', component: <FaLeaf size={20} />, color: 'green' },
  { name: 'FaBoxes', component: <FaBoxes size={20} />, color: 'gray' },
];

const colorOptions = [
  { name: 'orange', class: 'bg-orange-100 text-orange-600' },
  { name: 'red', class: 'bg-red-100 text-red-600' },
  { name: 'yellow', class: 'bg-yellow-100 text-yellow-600' },
  { name: 'green', class: 'bg-green-100 text-green-700' },
  { name: 'blue', class: 'bg-blue-100 text-blue-600' },
  { name: 'purple', class: 'bg-purple-100 text-purple-600' },
  { name: 'gray', class: 'bg-gray-100 text-gray-600' },
];

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showFarmModal, setShowFarmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FaLeaf',
    color: 'green'
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/');
      const formatted = res.data.map(cat => ({
        id: cat.id_category,
        name: cat.category_name,
        code: `CTG-${cat.category_name.substring(0, 3).toUpperCase()}`,
        products: cat.products_count || 0,
        icon: 'FaLeaf',
        color: 'green'
      }));
      setCategories(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      await api.post('/products/categories/', {
        category_name: formData.name,
        category_description: formData.description || ''
      });
      fetchCategories();
      resetForm();
    } catch (err) {
      console.error("Add category failed", err);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      await api.patch(`/products/categories/${editId}/`, {
        category_name: formData.name,
      });
      fetchCategories();
      resetForm();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/products/categories/${id}/`);
        fetchCategories();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleCategoryClick = async (category) => {
    try {
      const res = await api.get(`/products/product-items/?category=${category.id}`);
      setCategoryProducts(res.data);
      setSelectedCategory(category);
      setProductSearchQuery('');
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const handleFarmerClick = (product) => {
    setSelectedFarmer({
      name: product.farmer_name,
      phone: product.farmer_phone || '07 77 76 75 74',
      email: product.farmer_email || 'FarmerUser1@gmail.com',
      address: product.farmer_address || 'city saleh bey num:102',
      avatar: product.farmer_avatar || product.avatar
    });
    setShowFarmerModal(true);
  };

  const handleFarmClick = (product) => {
    setSelectedFarm({
      name: product.farm_name,
      address: product.farm_address || 'No assigned address',
      phone: product.farm_phone || 'No assigned phone',
      email: product.farm_email || 'No assigned email',
      size: product.farm_size || '0'
    });
    setShowFarmModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      icon: 'FaLeaf',
      color: 'green'
    });
  };

  const getIconComponent = (iconName) => {
    const icon = iconOptions.find(i => i.name === iconName);
    return icon ? icon.component : <FaLeaf size={20} />;
  };

  const getColorClass = (colorName) => {
    const color = colorOptions.find(c => c.name === colorName);
    return color ? color.class : 'bg-gray-100 text-gray-600';
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategoryProducts = categoryProducts.filter(product =>
    (product.product_name?.toLowerCase() || '').includes(productSearchQuery.toLowerCase()) ||
    (product.farmer_name?.toLowerCase() || '').includes(productSearchQuery.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, cat) => sum + cat.products, 0);
  const totalCategories = categories.length;

  return (
    <div className="min-h-screen bg-[#faf8f0] px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaLeaf className="text-green-700" size={18} />
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">Category Management</span>
            </div>
            <h1 className="text-2xl font-normal text-black">
              {selectedCategory ? `Products in ${selectedCategory.name}` : 'Product Categories'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {selectedCategory ? 'View associated agricultural products' : 'Manage agricultural product categories'}
            </p>
          </div>
          
          {selectedCategory ? (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-black px-4 py-2 rounded-lg text-sm font-normal hover:bg-gray-50 transition"
            >
              Back to Categories
            </button>
          ) : (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-normal hover:bg-green-800 transition"
            >
              <FaPlus size={14} />
              Add Category
            </button>
          )}
        </div>

        {/* Content */}
        {!selectedCategory ? (
          <>
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Categories</p>
                <p className="text-2xl font-normal text-black">{totalCategories}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaLeaf className="text-green-700" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl font-normal text-black">{totalProducts.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBoxes className="text-blue-700" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg. Products/Category</p>
                <p className="text-2xl font-normal text-black">
                  {totalCategories > 0 ? Math.round(totalProducts / totalCategories).toLocaleString() : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-purple-700" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(cat); }} 
                        className="p-2 text-gray-400 hover:text-green-700 rounded-lg hover:bg-green-50 transition"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }} 
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-normal text-black mb-1">{cat.name}</h3>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {cat.code}
                    </span>
                    <span className="text-sm font-normal text-gray-700">
                      {cat.products.toLocaleString()} products
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaSearch className="text-gray-300" size={24} />
            </div>
            <p className="text-gray-600 font-normal mb-1">No categories found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or add a new category</p>
          </div>
        )}
          </>
        ) : (
          <div className="space-y-4">
            {/* Search Bar for Products */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search products by name or farmer..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 text-sm"
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {filteredCategoryProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredCategoryProducts.map(product => (
                    <div key={product.id} className="p-5 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                      <div>
                        <h3 className="text-lg font-normal text-black mb-1">{product.product_name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 mb-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleFarmerClick(product); }}
                            className="text-sm text-gray-600 hover:text-green-700 flex items-center gap-1.5 transition-colors group/farmer"
                          >
                            <FaUser size={12} className="text-gray-400 group-hover/farmer:text-green-700"/> 
                            <span className="border-b border-transparent group-hover/farmer:border-green-700">{product.farmer_name}</span>
                          </button>
                          
                          <span className="text-sm text-gray-600 flex items-center gap-1.5">
                            <FaBoxes size={12} className="text-gray-400"/> {product.quantity} Kg
                          </span>

                          <button 
                            onClick={(e) => { e.stopPropagation(); handleFarmClick(product); }}
                            className="text-sm text-gray-600 hover:text-green-700 flex items-center gap-1.5 transition-colors group/farm"
                          >
                            <FaWarehouse size={12} className="text-gray-400 group-hover/farm:text-green-700"/> 
                            <span className="border-b border-transparent group-hover/farm:border-green-700">{product.farm_name}</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">{product.product_description || 'No description available.'}</p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="text-sm text-gray-700 flex flex-col md:items-end mt-1">
                          <span className="text-xs text-gray-500">Price:</span>
                          <span className="text-lg font-medium text-green-700">{parseFloat(product.product_price).toLocaleString()} DZD</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBoxes className="text-gray-300" size={24} />
                  </div>
                  <p className="text-gray-600 font-normal mb-1">No products found</p>
                  <p className="text-gray-400 text-sm">There are currently no matching products in this category.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-[20px] w-full max-w-[380px] p-6 shadow-xl">
            <h2 className="text-[18px] font-normal text-gray-900 mb-6">
              {isEditing ? 'Edit category' : 'Add a category'}
            </h2>

            <form onSubmit={isEditing ? handleUpdate : handleAdd}>
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-500 mb-1.5 text-xs">
                    Category name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Vegetables"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm placeholder-gray-400"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1.5 text-xs">
                    Description
                  </label>
                  <textarea
                    placeholder="Short description..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm placeholder-gray-400 min-h-[80px]"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-black text-sm font-normal hover:bg-gray-50 bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-700 text-white text-sm font-normal hover:bg-green-800 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Farmer Details Modal */}
      {showFarmerModal && selectedFarmer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-[16px] w-full max-w-[320px] overflow-hidden shadow-2xl animate-zoomIn">
            <div className="p-4 flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden bg-gray-50">
                  {selectedFarmer.avatar ? (
                    <img src={selectedFarmer.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700 font-bold text-base">
                      {selectedFarmer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-[14px] font-normal text-gray-900 leading-tight">Verified Farmer</h3>
                  <p className="text-[13px] text-gray-400">{selectedFarmer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFarmerModal(false)}
                className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">PHONE NUMBER</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarmer.phone}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">EMAIL ADDRESS</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarmer.email}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">HOME ADDRESS</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarmer.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farm Details Modal */}
      {showFarmModal && selectedFarm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-[16px] w-full max-w-[320px] overflow-hidden shadow-2xl animate-zoomIn">
            <div className="p-4 flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                  <FaWarehouse className="text-green-600" size={18} />
                </div>
                <div>
                  <h3 className="text-[14px] font-normal text-gray-900 leading-tight">Farm Profile</h3>
                  <p className="text-[13px] text-gray-400">{selectedFarm.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFarmModal(false)}
                className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">FARM ADDRESS</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarm.address}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">PHONE NUMBER</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarm.phone}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">EMAIL ADDRESS</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarm.email}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">FARM AREA</p>
                <p className="text-[14px] text-gray-800 font-normal">{selectedFarm.size} Hectares</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoomIn {
          animation: zoomIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CategoryManager;