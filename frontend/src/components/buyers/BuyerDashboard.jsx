import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaMinus, FaPlus, FaStar, FaHeart, FaRegHeart,
  FaShoppingBag, FaTimes, FaMapMarkerAlt, FaBoxOpen, FaBars,
  FaLeaf, FaFilter, FaThLarge, FaList, FaTruck,
  FaCarrot, FaMoneyBillWave, FaShieldAlt, FaSpinner
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import OrderHistory from './OrderHistory';

const BuyerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [activeTab, setActiveTab] = useState('products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
   const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [qtyModalProduct, setQtyModalProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalUnit, setModalUnit] = useState('kg');

  // API data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [tempPriceMin, setTempPriceMin] = useState('');
  const [tempPriceMax, setTempPriceMax] = useState('');
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [sortBy, setSortBy] = useState('Default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('products/product-items/available/'),
          api.get('products/categories/')
        ]);
        setProducts(itemsRes.data.results || itemsRes.data);
        const rawCats = catsRes.data.results || catsRes.data;
        setCategories([
          { id_category: 'all', category_name: 'All Products' },
          ...rawCats
        ]);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/orders')) setActiveTab('orders');
    else if (path.includes('/favorites')) setActiveTab('favorites');
    else setActiveTab('products');
  }, [location.pathname]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const applyPriceFilter = () => {
    setPriceRange({
      min: tempPriceMin !== '' ? Number(tempPriceMin) : 0,
      max: tempPriceMax !== '' ? Number(tempPriceMax) : 99999
    });
  };

  const filteredProducts = products.filter(p => {
    const name = p.product_name || '';
    const desc = p.product_description || '';
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'all' ||
      (p.category_name || '').toLowerCase() === activeCategory.toLowerCase();
    const matchPrice = p.product_price >= priceRange.min && p.product_price <= priceRange.max;
    const matchQuality = !selectedQuality || p.product_quality === selectedQuality;
    return matchSearch && matchCat && matchPrice && matchQuality;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.product_price - b.product_price;
    if (sortBy === 'Price: High to Low') return b.product_price - a.product_price;
    return 0;
  });

  const cartCount = cart?.length || 0;

  const getRatingFromQuality = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'premium': return 5;
      case 'standard': return 4;
      case 'economy': return 3;
      default: return 4; // Default baseline if undefined
    }
  };

  const renderStars = (rating = 4) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} size={12} />
    ));
  };

  const ProductCard = ({ product }) => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group cursor-pointer h-full flex flex-col"
      onClick={() => setSelectedProduct(product)}
    >
      <div className="relative h-40 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
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
        <div className={`w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center ${product.product_image ? 'hidden' : ''}`}>
          <FaLeaf className="text-green-300 text-5xl" />
        </div>
        {product.product_quality === 'premium' && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">
            Premium
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition"
        >
          {favorites.includes(product.id) ? (
            <FaHeart className="text-red-500 text-xs" />
          ) : (
            <FaRegHeart className="text-gray-400 text-xs" />
          )}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[9px] text-green-600 tracking-tight bg-green-50 px-1.5 py-0.5 rounded">
            {product.category_name || 'General'}
          </span>
          <div className="flex items-center gap-0.5">{renderStars(getRatingFromQuality(product.product_quality))}</div>
        </div>
        <h3 className="text-sm text-gray-900 mb-1 line-clamp-1 leading-tight">
          {product.product_name}
        </h3>
        <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
          <FaMapMarkerAlt className="text-green-500 opacity-70" size={8} />
          {product.farmer_name || 'Farmer'}
        </p>
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="text-sm text-gray-900 mb-2">
            {product.product_price}
            <span className="text-[10px] font-normal text-gray-400 ml-0.5">DZD</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
              className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition"
            >
              View
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setQtyModalProduct(product); setModalQty(1); setModalUnit('kg'); }}
              className="flex-1 bg-gray-900 text-white py-1.5 rounded-lg text-xs hover:bg-green-600 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex group cursor-pointer p-3 gap-4"
      onClick={() => setSelectedProduct(product)}
    >
      <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {product.product_image ? (
          <img 
            src={product.product_image} 
            alt={product.product_name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <FaLeaf className={`text-green-300 text-3xl ${product.product_image ? 'hidden' : ''}`} />
      </div>
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-green-600 uppercase tracking-tight bg-green-50 px-1.5 py-0.5 rounded">
              {product.category_name || 'General'}
            </span>
            <div className="flex items-center gap-1">{renderStars(getRatingFromQuality(product.product_quality))}</div>
          </div>
          <h3 className="text-base text-gray-900 mb-1">{product.product_name}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FaMapMarkerAlt className="text-green-500 opacity-70" size={10} />
            {product.farmer_name || 'Farmer'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-lg text-gray-900">
            {product.product_price}<span className="text-xs font-normal text-gray-400 ml-1">DZD / kg</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
            >
              View
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setQtyModalProduct(product); setModalQty(1); setModalUnit('kg'); }}
              className="px-4 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4EFE6]"
      style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/light-paper-fibers.png')`, backgroundBlendMode: 'multiply' }}
    >
      {/* Hero Section Always Visible */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-24 shadow-md bg-fixed"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80"></div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center pt-8">
          <h1 className="text-3xl md:text-4xl font-normal mb-4 animate-fadeInUp tracking-wide">Shop Fresh Products</h1>
          <p className="text-lg md:text-sm font-normal text-gray-200 mb-8 animate-fadeInUp">A convenient place where you can find high-quality, fresh items.</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for fresh products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-gray-800 rounded-full outline-none shadow-2xl focus:ring-4 focus:ring-white/30 transition-all bg-white backdrop-blur-md font-normal placeholder-gray-400"
              />
              <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-hover:text-green-500 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {activeTab === 'orders' ? (
        <OrderHistory />
      ) : activeTab === 'favorites' ? (
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h2 className="text-2xl text-gray-800 tracking-tight font-normal mb-8">Your Favorites</h2>
          {products.filter(p => favorites.includes(p.id)).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm"><p className="text-gray-500">Your favorites list is empty.</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.filter(p => favorites.includes(p.id)).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      ) : (
        <>
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-16 mt-8">

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => {
              const catKey = cat.id_category === 'all' ? 'all' : cat.category_name;
              const isActive = activeCategory === catKey;
              const count = cat.id_category === 'all'
                ? products.length
                : products.filter(p =>
                    (p.category_name || '').toLowerCase() === (cat.category_name || '').toLowerCase()
                  ).length;
              return (
                <button
                  key={cat.id_category}
                  onClick={() => setActiveCategory(catKey)}
                  className={`relative w-40 pt-6 pb-5 px-4 rounded-[2rem] shadow-xl transition-all duration-300 flex flex-col items-center
                    ${isActive ? 'bg-[#FFB82E] text-white scale-105' : 'bg-white text-gray-800 hover:-translate-y-2'}`}
                >
                  <h3 className={`font-normal text-base leading-tight mb-1 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {cat.category_name}
                  </h3>
                  <p className={`text-[10px] mb-3 ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                    {count} items
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all font-normal text-sm"
            >
              <FaFilter size={12} /><span>Filters</span>
            </button>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-50">
              <span className="text-[11px] font-normal text-gray-400 uppercase tracking-widest">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-normal text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
              >
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-50">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">Show:</span>
              <span className="text-sm font-normal text-green-600">{filteredProducts.length}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-2xl shadow-sm border border-gray-50 p-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-50'}`}
              ><FaThLarge size={14} /></button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-50'}`}
              ><FaList size={14} /></button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showMobileFilters && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-10 flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <h4 className="text-sm text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" /> Price Range
              </h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-normal text-gray-400 uppercase mb-1 block">Min DZD</label>
                  <input type="number" value={tempPriceMin} onChange={(e) => setTempPriceMin(e.target.value)} placeholder="0"
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-400 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 mb-1 block">Max DZD</label>
                  <input type="number" value={tempPriceMax} onChange={(e) => setTempPriceMax(e.target.value)} placeholder="99999"
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-400 transition-all" />
                </div>
              </div>
              <button onClick={applyPriceFilter} className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition-all text-xs">
                Apply Price Filter
              </button>
            </div>
            <div className="flex-1 border-gray-100 border-t md:border-t-0 md:border-l md:pl-10 pt-8 md:pt-0">
              <h4 className="text-sm text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FaShieldAlt className="text-green-500" /> Quality Grade
              </h4>
              <div className="flex flex-col gap-3">
                {['premium', 'standard'].map(q => (
                  <button key={q} onClick={() => setSelectedQuality(selectedQuality === q ? null : q)}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-normal transition-all border capitalize
                      ${selectedQuality === q ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                  >
                    {q === 'premium' ? 'Premium (Grade A)' : 'Standard (Grade B)'}
                  </button>
                ))}
                <button onClick={() => setSelectedQuality(null)}
                  className={`text-left px-4 py-3 rounded-xl text-xs font-normal transition-all border
                    ${!selectedQuality ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  All Qualities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FaSpinner className="text-4xl text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading products from the backend…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
            : "flex flex-col gap-4"
          }>
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm">
                <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                <p className="text-gray-400 text-sm mt-2">Make sure the backend server is running and has product data.</p>
              </div>
            ) : (
              filteredProducts.map(product =>
                viewMode === 'grid'
                  ? <ProductCard key={product.id} product={product} />
                  : <ProductListItem key={product.id} product={product} />
              )
            )}
          </div>
        )}
      </main>

      {/* Quantity Modal */}
      {qtyModalProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 relative animate-scaleUp">
            
            <button 
              onClick={() => setQtyModalProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaTimes size={14} />
            </button>
            
            <div className="text-center mt-2 mb-6">
              <h3 className="text-xl font-normal text-gray-800">{qtyModalProduct.product_name}</h3>
            </div>

            <div className="mb-6 flex flex-col gap-2">
              <label className="text-[11px] font-normal text-gray-500 uppercase tracking-widest px-1">Quantity Details</label>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all shadow-sm bg-white">
                <input 
                  type="number" 
                  step="any"
                  min="0.1"
                  placeholder="Enter quantity"
                  value={modalQty === 1 ? '' : modalQty}
                  autoFocus
                  onChange={(e) => setModalQty(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-4 py-4 text-gray-800 focus:outline-none placeholder-gray-400 bg-transparent w-full font-normal"
                />
                <div className="flex flex-col justify-center border-l border-gray-100 bg-gray-50 px-2 min-w-[80px]">
                  <select 
                    value={modalUnit}
                    onChange={(e) => setModalUnit(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-normal text-gray-600 uppercase tracking-widest cursor-pointer py-1"
                  >
                    <option value="kg">KG</option>
                    <option value="ton">TON</option>
                    <option value="litre">LITRE</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const finalQty = parseFloat(modalQty || 1);
                if (finalQty > 0) {
                  addToCart(qtyModalProduct, finalQty, modalUnit);
                  setQtyModalProduct(null);
                }
              }}
              className="w-full bg-[#16a34a] text-white py-4 rounded-lg font-normal text-base hover:bg-green-700 transition-colors shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] active:scale-[0.98]"
            >
              Add to Cart
            </button>
            
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-scaleUp">
            <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center overflow-hidden">
              {selectedProduct.product_image ? (
                <img 
                  src={selectedProduct.product_image} 
                  alt={selectedProduct.product_name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <FaLeaf className="text-green-200 text-9xl" />
              )}
            </div>
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              <button onClick={() => setSelectedProduct(null)} className="float-right w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FaTimes className="text-gray-500 text-sm" />
              </button>
              <h2 className="text-2xl font-normal mb-2">{selectedProduct.product_name}</h2>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                {selectedProduct.farmer_name} &bull; {selectedProduct.category_name}
              </p>
              <div className="flex items-center gap-2 mb-4">{renderStars()}</div>
              <p className="text-gray-600 mb-6">{selectedProduct.product_description || 'Fresh agricultural product, listed directly by the farmer.'}</p>
              <div className="text-3xl font-normal text-green-600 mb-6">
                {selectedProduct.product_price} DZD <span className="text-sm text-gray-400">/ kg</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setQtyModalProduct(selectedProduct);
                    setModalQty(1);
                    setModalUnit('kg');
                    setSelectedProduct(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-normal hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all ${favorites.includes(selectedProduct.id)
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500'}`}
                >
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s ease-out; }
      `}</style>
      </>
      )}
    </div>
  );
};

export default BuyerDashboard;