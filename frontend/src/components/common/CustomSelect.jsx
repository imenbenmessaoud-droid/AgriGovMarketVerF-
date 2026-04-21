import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

/**
 * CustomSelect Component
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback function when value changes
 * @param {string[]} options - Array of string options
 * @param {string} className - Additional CSS classes
 * @param {string} placeholder - Placeholder text when no value is selected
 */
const CustomSelect = ({ value, onChange, options = [], className = '', placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-700 hover:border-emerald-400 focus:outline-none transition-all shadow-sm"
      >
        <span className="truncate">{displayValue}</span>
        <FaChevronDown className={`ml-2 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={10} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.length > 0 ? (
              options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                    value === option ? 'text-emerald-700 bg-emerald-50 font-normal' : 'text-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-2.5 text-sm text-slate-400 italic">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
