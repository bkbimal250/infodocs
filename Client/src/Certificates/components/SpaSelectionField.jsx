import React, { useState, useEffect, useRef } from 'react';
import { HiCloudDownload, HiX, HiCheckCircle, HiLocationMarker } from 'react-icons/hi';

/**
 * SpaSelectionField Component (Certificates)
 * Optimized branch selection with keyboard navigation and full data support
 */
const SpaSelectionField = React.memo(({
  spaSearch,
  handleSpaSearchChange,
  selectedSpaId,
  selectedSpa,
  handleSpaSelect,
  showSpaDropdown,
  setShowSpaDropdown,
  filteredSpas,
  spaLoading,
  formatSpaAddress
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Limit displayed results for performance
  const displayResults = filteredSpas.slice(0, 15);

  // Reset highlighted index when dropdown opens or results change
  useEffect(() => {
    if (showSpaDropdown) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [showSpaDropdown, filteredSpas.length]);

  const handleKeyDown = (e) => {
    if (!showSpaDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < displayResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && displayResults[highlightedIndex]) {
          handleSpaSelect(displayResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSpaDropdown(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="card shadow-soft bg-white/80 backdrop-blur-md border-primary/5 animate-in slide-in-from-top-4 duration-500 overflow-visible">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
          <HiCloudDownload size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 tracking-tight leading-none">
            Branch Association
          </h3>
          <p className="text-[9px] font-bold text-gray-400  tracking-widest mt-1">
            Link document to operational entity
          </p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div className="relative spa-dropdown-container" ref={dropdownRef}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <HiLocationMarker className="h-4 w-4 text-gray-300" />
            </div>
            <input
              type="text"
              value={spaSearch}
              onChange={handleSpaSearchChange}
              onFocus={() => setShowSpaDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search branch name, code or city..."
              className={`w-full input pl-10 pr-10 py-2.5 text-xs font-bold transition-all ${selectedSpaId ? 'border-primary/30 bg-primary/5' : 'border-gray-500'
                }`}
            />
            {spaSearch && (
              <button
                type="button"
                onClick={() => handleSpaSelect(null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <HiX size={14} />
              </button>
            )}
          </div>

          {showSpaDropdown && (
            <div className="absolute z-[60] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-500 bg-white shadow-2xl animate-in zoom-in-95 duration-200 origin-top">
              {spaLoading ? (
                <div className="p-4 text-center text-[10px] font-bold text-gray-400  tracking-widest">
                  <div className="mx-auto mb-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-b-transparent" />
                  Searching...
                </div>
              ) : displayResults.length > 0 ? (
                <div className="p-1">
                  {displayResults.map((spa, index) => (
                    <button
                      key={spa.id}
                      onClick={() => handleSpaSelect(spa)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all mb-0.5 flex flex-col gap-0.5 ${highlightedIndex === index
                        ? 'bg-primary/10 text-primary'
                        : selectedSpaId === spa.id
                          ? 'bg-primary/5 text-primary'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black  tracking-tight">{spa.name}</span>
                        {spa.code && (
                          <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                            {spa.code}
                          </span>
                        )}
                        {selectedSpaId === spa.id && (
                          <HiCheckCircle className="ml-auto text-primary" size={12} />
                        )}
                      </div>
                      <div className="text-[9px] font-bold text-gray-400  tracking-tighter">
                        {spa.area} {spa.area && spa.city && '•'} {spa.city}
                      </div>
                    </button>
                  ))}
                  {filteredSpas.length > 15 && (
                    <div className="px-4 py-2 border-t border-gray-50 text-[8px] font-bold text-gray-300 text-center  tracking-widest">
                      Keep typing to refine {filteredSpas.length - 15} more results
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-[10px] font-black text-gray-400">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSpa && (
          <div className="p-3 md:p-4 rounded-xl border border-primary/10 bg-primary/5 animate-in slide-in-from-left-4 duration-300 ring-1 ring-primary/20">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-primary flex items-center justify-center text-white shrink-0">
                    <HiCheckCircle size={14} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900">{selectedSpa.name}</h4>
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded  tracking-widest">
                    {selectedSpa.code}
                  </span>
                </div>
                <p className="mt-1 text-[10px] font-bold text-gray-500 line-clamp-1 pl-7">
                  {formatSpaAddress(selectedSpa) || 'Location details not specified'}
                </p>
              </div>

              <div className="flex gap-4 border-t md:border-t-0 md:border-l border-primary/10 pt-3 md:pt-0 md:pl-4 overflow-x-auto shrink-0 pl-7 md:pl-4">
                <div className="shrink-0">
                  <p className="text-[8px] font-black text-gray-400  tracking-widest mb-0.5">Contact</p>
                  <p className="text-[10px] font-black text-gray-900 tracking-tight">{selectedSpa.phone_number || '—'}</p>
                </div>
                <div className="shrink-0">
                  <p className="text-[8px] font-black text-gray-400  tracking-widest mb-0.5">Location</p>
                  <p className="text-[10px] font-black text-primary lowercase tracking-tight">{selectedSpa.city || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SpaSelectionField;
