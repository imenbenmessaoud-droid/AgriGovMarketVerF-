import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload, FaFilter, FaSearch, FaTimes, FaCalendarAlt, FaChartBar } from 'react-icons/fa';

const mockReports = [
  { id: 1, name: 'National Agricultural Yield Q1 2026', type: 'PDF', date: '2026-03-25', size: '2.4 MB', category: 'Yield', downloads: 145 },
  { id: 2, name: 'Price Fluctuation Analysis - Tomatoes', type: 'Excel', date: '2026-03-20', size: '1.1 MB', category: 'Pricing', downloads: 89 },
  { id: 3, name: 'Monthly Registered Logistics Capacity', type: 'PDF', date: '2026-03-15', size: '3.8 MB', category: 'Logistics', downloads: 234 },
  { id: 4, name: 'Regional Crop Distribution Report', type: 'Excel', date: '2026-03-10', size: '4.5 MB', category: 'Distribution', downloads: 67 },
  { id: 5, name: 'Annual Farmer Revenue Estimations 2025', type: 'PDF', date: '2026-01-30', size: '8.2 MB', category: 'Revenue', downloads: 312 },
  { id: 6, name: 'Market Demand Forecast Q2 2026', type: 'Excel', date: '2026-03-28', size: '1.8 MB', category: 'Forecast', downloads: 56 },
  { id: 7, name: 'Transporter Performance Report', type: 'PDF', date: '2026-03-22', size: '2.1 MB', category: 'Logistics', downloads: 78 },
];
const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const types = ['All', 'PDF', 'Excel'];
  const categories = ['All', 'Yield', 'Pricing', 'Logistics', 'Distribution', 'Revenue', 'Forecast'];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || report.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const stats = {
    total: mockReports.length,
    pdfCount: mockReports.filter(r => r.type === 'PDF').length,
    excelCount: mockReports.filter(r => r.type === 'Excel').length,
    totalDownloads: mockReports.reduce((sum, r) => sum + r.downloads, 0)
  };

  const handleDownload = (report) => {
    setDownloadingId(report.id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Successfully downloaded: ${report.name}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaChartBar className="text-green-700" size={16} />
              <span className="text-xs font-normal text-gray-500 uppercase tracking-wide">Reports & Analytics</span>
            </div>
            <h1 className="text-2xl font-normal text-black">Platform Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Download aggregated data and analytics on agricultural trade</p>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-normal rounded-lg hover:bg-gray-50 transition"
          >
            <FaFilter size={14} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Reports</p>
            <p className="text-2xl font-normal text-black">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">PDF Reports</p>
            <p className="text-2xl font-normal text-red-600">{stats.pdfCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Excel Reports</p>
            <p className="text-2xl font-normal text-green-700">{stats.excelCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Downloads</p>
            <p className="text-2xl font-normal text-blue-700">{stats.totalDownloads.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search reports by name..."
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

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Type</label>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => {
                  setTypeFilter('All');
                  setCategoryFilter('All');
                  setSearchQuery('');
                }}
                className="self-end px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-normal text-black">
            Available Reports ({filteredReports.length})
          </h2>
          <p className="text-xs text-gray-400">
            Showing {filteredReports.length} of {mockReports.length} reports
          </p>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredReports.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <li key={report.id} className="p-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-lg ${
                        report.type === 'PDF' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {report.type === 'PDF' ? <FaFilePdf size={22} /> : <FaFileExcel size={22} />}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <h3 className="font-normal text-black hover:text-green-700 transition-colors cursor-pointer">
                          {report.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={10} />
                            {report.date}
                          </span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-normal ${
                            report.type === 'PDF' 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {report.type}
                          </span>
                          <span>•</span>
                          <span>{report.category}</span>
                          <span>•</span>
                          <span>{report.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <button 
                      onClick={() => handleDownload(report)}
                      disabled={downloadingId === report.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-normal rounded-lg hover:bg-green-800 transition min-w-[120px] justify-center"
                    >
                      {downloadingId === report.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaDownload size={14} />
                      )}
                      {downloadingId === report.id ? 'Wait...' : 'Download'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaSearch className="text-gray-300" size={24} />
              </div>
              <p className="text-gray-600 font-normal mb-1">No reports found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Reports are generated monthly • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;