import React, { useState } from 'react';
import { FaSearch, FaShoppingCart, FaLeaf, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import ProductFilters from './ProductFilters';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({});

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fid => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredProducts = []; // Cleanup: Removed mock data. Real data is handled in BuyerDashboard.

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} size={12} />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <ProductFilters onFilterChange={setFilters} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, farms, or regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500">{filteredProducts.length} products found</span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-gray-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.isOrganic && (
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-normal px-2 py-1 rounded-full">
                        Organic
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      {favorites.includes(product.id) ? (
                        <FaHeart className="text-red-500 text-sm" />
                      ) : (
                        <FaRegHeart className="text-gray-400 text-sm" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{product.farm}</span>
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                      </div>
                    </div>
                    
                    <h3 className="font-normal text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{product.region}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-normal text-green-600">{product.price} DZD</span>
                        <span className="text-xs text-gray-400">/ {product.unit}</span>
                      </div>
                      
                      <button className="px-4 py-2 bg-gray-900 text-white text-xs font-normal rounded-lg hover:bg-green-600 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;