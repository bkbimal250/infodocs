import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

const SearchSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Search and select...",
    label,
    error,
    disabled = false,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Find the selected option to display its label
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search term
    const filteredOptions = options.filter(opt => {
        const search = searchTerm.toLowerCase();
        return (
            opt.label?.toLowerCase().includes(search) ||
            opt.city?.toLowerCase().includes(search) ||
            opt.state?.toLowerCase().includes(search)
        );
    });

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(''); // Reset search when clicking outside
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    const toggleOpen = () => {
        if (!disabled) {
            if (!isOpen) {
                setSearchTerm(''); // Reset on open
            }
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            
            <div 
                className={`relative w-full cursor-pointer bg-white border shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 sm:text-sm transition-colors rounded-md ${
                    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                    isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400'
                } ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                onClick={toggleOpen}
            >
                {/* Display Value / Search Input */}
                <div className="flex items-center min-h-[20px]">
                    {isOpen ? (
                        <input
                            type="text"
                            className="w-full outline-none bg-transparent text-gray-900 border-none p-0 focus:ring-0 sm:text-sm"
                            placeholder={selectedOption ? selectedOption.label : placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    )}
                </div>
                
                {/* Icons */}
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                   {value && !disabled && (
                       <button
                           type="button"
                           onClick={handleClear}
                           className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 mr-1 rounded-full hover:bg-gray-100 transition-colors"
                           title="Clear selection"
                       >
                           <FaTimes size={12} />
                       </button>
                   )}
                   <FaChevronDown 
                       className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                       aria-hidden="true" 
                   />
                </span>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                    {filteredOptions.length === 0 ? (
                        <div className="text-gray-500 px-4 py-3 text-sm text-center">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors ${
                                    value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                }`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default SearchSelect;
