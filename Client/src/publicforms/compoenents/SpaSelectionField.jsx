import React, { useState, useEffect, useRef, memo } from 'react';
import { HiLocationMarker, HiX, HiCheckCircle, HiSearch } from 'react-icons/hi';

/**
 * SpaSelectionField Component
 * Searchable SPA selection for public forms (Candidate/Hiring)
 */
const SpaSelectionField = ({
  spaSearch,
  handleSpaSearchChange,
  selectedSpaId,
  selectedSpa,
  handleSpaSelect,
  isDropdownOpen,
  setIsDropdownOpen,
  filteredSpas,
  spaLoading,
  title = "SPA Information",
  subtitle = "Select a branch location to link with your application",
  required = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredSpas.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSpas.length) {
          handleSpaSelect(filteredSpas[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSpas]);

  // Handle click outside - Optimized to ONLY listen when open
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, setIsDropdownOpen]);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-blue-600">📍</span>
        {title} {required && <span className="text-red-500">*</span>}
      </h2>

      {subtitle && (
        <p className="text-xs text-gray-500 -mt-2 mb-2 font-medium">
          {subtitle}
        </p>
      )}

      <div className="relative group">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className={`h-5 w-5 transition-colors ${isDropdownOpen ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            value={spaSearch}
            onChange={(e) => {
              handleSpaSearchChange(e);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search SPA (name, code, area, city)..."
            className={`block w-full pl-10 pr-10 py-3 text-sm border-2 rounded-xl transition-all outline-none
              ${isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-50/50 shadow-sm' : 'border-gray-500 hover:border-gray-200'}
              ${selectedSpaId ? 'bg-blue-50/30' : 'bg-white'}
            `}
            autoComplete="off"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
            {spaSearch && (
              <button
                type="button"
                onClick={() => {
                  handleSpaSearchChange({ target: { value: '' } });
                  handleSpaSelect(null);
                  setIsDropdownOpen(true);
                }}
                className="p-1 text-gray-300 hover:text-gray-600 rounded-full transition-colors"
                title="Clear search"
              >
                <HiX className="h-4 w-4" />
              </button>
            )}
            <div className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▾
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-500 rounded-2xl shadow-2xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {spaLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-xs font-bold text-gray-400  tracking-widest">Searching Locations...</p>
              </div>
            ) : filteredSpas.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredSpas.slice(0, 15).map((spa, index) => (
                  <button
                    key={spa.id}
                    type="button"
                    onClick={() => {
                      handleSpaSelect(spa);
                      setIsDropdownOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1 border-2
                      ${selectedSpaId === spa.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[0.99]'
                        : selectedIndex === index
                          ? 'bg-blue-50 border-blue-100 text-blue-700'
                          : 'bg-white border-transparent hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-black  tracking-tight ${selectedSpaId === spa.id ? 'text-white' : 'text-gray-900'}`}>
                        {spa.name}
                      </span>
                      {spa.code && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold  tracking-wider ${selectedSpaId === spa.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {spa.code}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 font-bold italic ${selectedSpaId === spa.id ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                      <HiLocationMarker className="shrink-0" />
                      {spa.area && <span>{spa.area}</span>}
                      {spa.area && spa.city && <span>•</span>}
                      {spa.city && <span>{spa.city}</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="text-3xl mb-2 opacity-20">🔍</div>
                <p className="text-sm font-bold text-gray-400">No locations matched your search</p>
                <p className="text-[10px] text-gray-300  tracking-widest mt-1">Try check for typos or use city name</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Indicator */}
      {selectedSpaId && !isDropdownOpen && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/50 shadow-sm animate-in slide-in-from-top-1 duration-300 group">
          <HiCheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black  tracking-tight">{selectedSpa?.name}</span>
              {selectedSpa?.code && <span className="text-[8px] bg-emerald-100 px-1.5 py-0.5 rounded font-black">{selectedSpa.code}</span>}
            </div>
            <p className="text-[10px] opacity-70 font-bold truncate italic">
              {[selectedSpa?.area, selectedSpa?.city].filter(Boolean).join(' • ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSpaSelect(null)}
            className="text-[10px] font-black text-emerald-600 hover:text-emerald-800  tracking-widest underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Change
          </button>
        </div>
      )}

      {required && !selectedSpaId && (
        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 px-1 animate-pulse">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          Selection Required
        </p>
      )}
    </div>
  );
};

export default memo(SpaSelectionField);
