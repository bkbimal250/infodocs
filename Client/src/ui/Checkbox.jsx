import React from 'react';

/**
 * Reusable Checkbox Component
 */
const Checkbox = React.memo(({
  label,
  name,
  checked,
  onChange,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) => {
  const checkboxId = `checkbox-${name}`;
  const hasError = !!error;

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            h-4 w-4 rounded border-gray-300
            text-blue-600 focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
            ${hasError ? 'border-red-500' : ''}
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label 
            htmlFor={checkboxId}
            className={`
              font-medium
              ${hasError ? 'text-red-600' : 'text-gray-700'}
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
