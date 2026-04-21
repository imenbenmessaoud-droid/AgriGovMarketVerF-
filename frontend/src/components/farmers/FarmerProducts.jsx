import React, { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaBoxOpen,
    FaFilter, FaRedo, FaTimes, FaSave, FaTimesCircle,
    FaStar, FaStarHalf, FaEye
} from 'react-icons/fa';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const FarmerProducts = () => {
    const { searchQuery } = useOutletContext() || {};
    const location = useLocation();
    const navigate = useNavigate();
    const filterFarmId = location.state?.filterFarmId;
    const filterFarmName = location.state?.filterFarmName;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [blueprints, setBlueprints] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, catsRes, prodsRes, farmsRes] = await Promise.all([
                api.get('products/product-items/my_items/'),
                api.get('products/categories/'),
                api.get('products/products/'),
                api.get('farms/my-farms/')
            ]);
            setProducts(itemsRes.data);
            setCategories(catsRes.data);
            setBlueprints(prodsRes.data);
            setFarms(farmsRes.data);
        } catch (err) {
            console.error('Failed to fetch product data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [newProduct, setNewProduct] = useState({
        id_product: '',
        id_farm: '',
        product_price: '',
        quantity: '',
        production_date: new Date().toISOString().split('T')[0],
        is_available: true,
        image_file: null,
        image_preview: null
    });

    const filteredProducts = products.filter(p => {
        const title = p.product_name || '';
        const cat = p.category_name || '';
        const matchesSearch = title.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            cat.toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesCategory = filterCategory === 'all' || cat === filterCategory;
        const matchesFarm = !filterFarmId || p.id_farm === filterFarmId;
        return matchesSearch && matchesCategory && matchesFarm;
    });

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('id_product', parseInt(newProduct.id_product));
            formData.append('id_farm', newProduct.id_farm ? parseInt(newProduct.id_farm) : '');
            formData.append('product_price', parseFloat(newProduct.product_price));
            formData.append('quantity', parseFloat(newProduct.quantity));
            formData.append('production_date', newProduct.production_date);
            formData.append('is_available', newProduct.is_available);
            
            if (newProduct.image_file) {
                formData.append('product_image', newProduct.image_file);
            }
            
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (isEditing) {
                await api.put(`products/product-items/${editProductId}/`, formData, config);
            } else {
                await api.post('products/product-items/', formData, config);
            }
            
            fetchData();
            closeModal();
        } catch (err) {
            console.error('Failed to list product:', err.response?.data);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to list product. Make sure price is within official constraints.';
            alert(errorMsg);
        }
    };

    const openEditModal = (product) => {
        setNewProduct({
            id_product: product.id_product,
            id_farm: product.id_farm,
            product_price: product.product_price,
            quantity: product.quantity,
            production_date: product.production_date,
            is_available: product.is_available,
            image_file: null,
            image_preview: product.product_image || null
        });
        setEditProductId(product.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const openDetailsModal = (product) => {
        setSelectedProduct(product);
        setShowDetailsModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setShowDetailsModal(false);
        setIsEditing(false);
        setEditProductId(null);
        setSelectedProduct(null);
        setNewProduct({
            id_product: '',
            id_farm: '',
            product_price: '',
            quantity: '',
            production_date: new Date().toISOString().split('T')[0],
            is_available: true,
            image_file: null,
            image_preview: null
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({
                ...newProduct,
                image_file: file,
                image_preview: URL.createObjectURL(file)
            });
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to remove this listing?')) {
            try {
                await api.delete(`products/product-items/${id}/`);
                fetchData();
            } catch (err) {
                alert('Failed to delete listing.');
            }
        }
    };

    const getStockStatus = (stock, status) => {
        if (status === 'low_stock' || stock < 50) return 'low';
        if (stock > 500) return 'high';
        return 'normal';
    };

    const getStockColor = (status) => {
        if (status === 'low') return 'bg-red-100 text-red-700';
        if (status === 'high') return 'bg-green-100 text-green-700';
        return 'bg-blue-100 text-blue-700';
    };

    const getStockText = (status) => {
        if (status === 'low') return 'Low Stock';
        if (status === 'high') return 'High Stock';
        return 'In Stock';
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
        }
        if (hasHalfStar) {
            stars.push(<FaStarHalf key="half" className="text-yellow-400 text-xs" />);
        }
        return stars;
    };

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-normal text-gray-900">
                                {filterFarmName ? `Products: ${filterFarmName}` : 'My Products'}
                            </h1>
                            {filterFarmId && (
                                <button 
                                    onClick={() => navigate('/farmer/products', { replace: true, state: {} })}
                                    className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md hover:bg-red-200 transition flex items-center"
                                >
                                    <FaTimes size={10} className="mr-1" /> Clear farm
                                </button>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Manage your farm products and inventory</p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg transition-colors font-normal"
                    >
                        <FaPlus size={14} />
                        Add New Product
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Products</p>
                        <p className="text-2xl font-normal text-gray-900">{products.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">Active Products</p>
                        <p className="text-2xl font-normal text-green-700">{products.filter(p => p.is_available).length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">Low Stock</p>
                        <p className="text-2xl font-normal text-orange-600">{products.filter(p => (parseFloat(p.quantity) < 50)).length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Value</p>
                        <p className="text-2xl font-normal text-gray-900">
                            {products.reduce((sum, p) => sum + (parseFloat(p.product_price || 0) * parseFloat(p.quantity || 0)), 0).toLocaleString()} DZD
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <FaFilter size={14} />
                        <span className="text-xs font-normal">Filter by:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors
                                ${filterCategory === 'all'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id_category}
                                onClick={() => setFilterCategory(cat.category_name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors
                                    ${filterCategory === cat.category_name
                                        ? 'bg-green-700 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.category_name}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setFilterCategory('all')}
                        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                        title="Reset filters"
                    >
                        <FaRedo size={14} />
                    </button>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const isLow = product.quantity < 50;
                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    <div className="h-48 relative overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openDetailsModal(product)}>
                                        {product.product_image ? (
                                            <img
                                                src={product.product_image}
                                                alt={product.product_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200 ${product.product_image ? 'hidden' : ''}`}>
                                            <FaBoxOpen size={48} />
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-normal
                                                ${!isLow ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                                                {!isLow ? 'In Stock' : 'Low Stock'}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteProduct(product.id);
                                                }}
                                                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(product);
                                                }}
                                                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDetailsModal(product);
                                                }}
                                                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-green-700 font-normal">{product.category_name}</span>
                                        </div>
                                        <h3 className="font-normal text-gray-800 mb-2 line-clamp-2">{product.product_name}</h3>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.product_description}</p>
                                        <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Price</p>
                                                <p className="text-xl font-normal text-green-700">
                                                    {product.product_price} <span className="text-xs font-normal text-gray-500">DZD/kg</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Stock</p>
                                                <p className={`text-sm font-normal ${!isLow ? 'text-green-700' : 'text-orange-700'}`}>
                                                    {product.quantity} kg
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaBoxOpen size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-normal text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
                        <button
                            onClick={() => setFilterCategory('all')}
                            className="text-green-700 hover:text-green-800 text-sm font-normal"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-normal text-gray-900">
                                        {isEditing ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {isEditing ? 'Update product information' : 'Fill in product details'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-normal text-gray-700 mb-1">Select Product blueprint *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={newProduct.id_product}
                                            onChange={e => setNewProduct({ ...newProduct, id_product: e.target.value })}
                                        >
                                            <option value="">-- Choose a product --</option>
                                            {blueprints.map(b => (
                                                <option key={b.id_product} value={b.id_product}>{b.product_name} ({b.category_name})</option>
                                            ))}
                                        </select>

                                        <div className="mt-4">
                                            <label className="block text-xs font-normal text-gray-700 mb-1">Farm Source *</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                value={newProduct.id_farm}
                                                onChange={e => setNewProduct({ ...newProduct, id_farm: e.target.value })}
                                            >
                                                <option value="">-- Choose your farm --</option>
                                                {farms.map(f => (
                                                    <option key={f.IdFarm} value={f.IdFarm}>{f.FarmName} ({f.LocationFarm})</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {newProduct.id_product && blueprints.find(b => b.id_product === parseInt(newProduct.id_product))?.current_price && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg flex justify-between items-center animate-in slide-in-from-top-2 duration-300 transition-all">
                                                <span className="text-[10px] uppercase font-normal text-green-700 tracking-wider">Authorized Price Range:</span>
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[8px] text-green-600 uppercase font-normal">Minimum</p>
                                                        <p className="text-sm font-normal text-green-900">{blueprints.find(b => b.id_product === parseInt(newProduct.id_product)).current_price.min_price} DZD</p>
                                                    </div>
                                                    <div className="h-8 w-[1px] bg-green-200"></div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] text-green-600 uppercase font-normal">Maximum</p>
                                                        <p className="text-sm font-normal text-green-900">{blueprints.find(b => b.id_product === parseInt(newProduct.id_product)).current_price.max_price} DZD</p>
                                                    </div>
                                                </div>
                                            </div>
                                         )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-normal text-gray-700 mb-1">Price (DZD/kg) *</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={newProduct.product_price}
                                            onChange={e => setNewProduct({ ...newProduct, product_price: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-normal text-gray-700 mb-1">Stock Quantity (kg) *</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={newProduct.quantity}
                                            onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-normal text-gray-700 mb-1">Production Date *</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={newProduct.production_date}
                                            onChange={e => setNewProduct({ ...newProduct, production_date: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={newProduct.is_available}
                                                onChange={e => setNewProduct({...newProduct, is_available: e.target.checked})}
                                            />
                                            <span className="ml-3 text-sm font-normal text-gray-700">Available for sale</span>
                                        </label>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-normal text-gray-700 mb-2">Product Image</label>
                                        <div className="flex items-center gap-4">
                                            {newProduct.image_preview && (
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={newProduct.image_preview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setNewProduct({...newProduct, image_file: null, image_preview: null})}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                </div>
                                            )}
                                            <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                                                <div className="flex flex-col items-center justify-center pt-2 pb-2 text-gray-500">
                                                    <FaPlus className="mb-2" />
                                                    <p className="text-xs">Click to upload image</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-700 text-white py-2.5 rounded-lg font-normal hover:bg-green-800 transition-colors"
                                    >
                                        <FaSave className="inline mr-2" size={14} />
                                        {isEditing ? 'Update Listing' : 'Add Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-normal hover:bg-gray-200 transition-colors"
                                    >
                                        <FaTimesCircle className="inline mr-2" size={14} />
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Product Details Modal */}
                {showDetailsModal && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-normal text-gray-900">Product Details</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {selectedProduct.product_image ? (
                                    <img 
                                        src={selectedProduct.product_image} 
                                        alt={selectedProduct.product_name}
                                        className="w-full h-64 object-cover rounded-lg mb-6 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-emerald-50 rounded-lg mb-6 flex items-center justify-center text-emerald-200">
                                        <FaBoxOpen size={64} />
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-normal text-gray-900">{selectedProduct.product_name}</h2>
                                            <p className="text-sm text-green-700 mt-1">{selectedProduct.category_name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Price</p>
                                            <p className="text-2xl font-normal text-green-700">
                                                {selectedProduct.product_price} <span className="text-sm">DZD/kg</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Stock</p>
                                            <p className="text-lg font-normal text-gray-800">
                                                {selectedProduct.quantity} kg
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Quality</p>
                                            <p className="text-gray-800">{selectedProduct.product_quality}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Production Date</p>
                                            <p className="text-gray-800">{selectedProduct.production_date}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Description</p>
                                        <p className="text-gray-700">{selectedProduct.product_description}</p>
                                    </div>
                                        <button
                                            onClick={closeModal}
                                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-normal hover:bg-gray-200 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerProducts;