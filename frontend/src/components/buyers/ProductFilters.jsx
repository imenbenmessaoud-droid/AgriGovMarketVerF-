import React, { useState } from 'react';

const ProductFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: [],
    region: 'all',
    priceMin: '',
    priceMax: '',
    organic: false
  });

  const categories = []; // Sync: Should ideally be fetched from API
  const regions = [];    // Sync: Should ideally be fetched from API

  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId];
    
    const newFilters = { ...filters, category: newCategories };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const applyFilters = () => {
    if (onFilterChange) onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-normal mb-6">Filters</h2>
      
      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-normal text-gray-700 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">
                {cat.icon} {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Region */}
      <div className="mb-6">
        <h3 className="text-sm font-normal text-gray-700 mb-3">Region</h3>
        <select
          value={filters.region}
          onChange={(e) => handleChange('region', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {regions.map(region => (
            <option key={region} value={region.toLowerCase()}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-normal text-gray-700 mb-3">Price Range (DZD/kg)</h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => handleChange('priceMin', e.target.value)}
            className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => handleChange('priceMax', e.target.value)}
            className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Organic Only */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.organic}
            onChange={(e) => handleChange('organic', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Organic Only</span>
        </label>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-gray-900 text-white py-2 rounded-lg font-normal hover:bg-green-600 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilters;