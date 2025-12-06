import React from 'react';

/**
 * Reusable Input Component
 * Supports text, email, password, number, date, etc.
 */
const Input = React.memo(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  const hasError = !!error;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
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
            : 'bg-white'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
