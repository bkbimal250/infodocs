import React from 'react';

/**
 * Reusable DatePicker Component
 * Wrapper around native HTML5 date input with consistent styling
 */
const DatePicker = React.memo(({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  min = null,
  max = null,
  className = '',
  ...props
}) => {
  const datePickerId = `datepicker-${name}`;
  const hasError = !!error;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={datePickerId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={datePickerId}
          type="date"
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed opacity-60' 
              : 'bg-white cursor-pointer'
            }
          `}
          {...props}
        />
        {/* Calendar icon indicator */}
        {!disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
