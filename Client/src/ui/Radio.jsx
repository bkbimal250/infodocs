import React from 'react';

/**
 * Reusable Radio Group Component
 */
const RadioGroup = React.memo(({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) => {
  const hasError = !!error;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const radioId = `radio-${name}-${optionValue}`;
          const isChecked = value === optionValue;

          return (
            <div key={optionValue} className="flex items-center">
              <input
                id={radioId}
                type="radio"
                name={name}
                value={optionValue}
                checked={isChecked}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`
                  h-4 w-4 border-gray-300
                  text-blue-600 focus:ring-2 focus:ring-blue-500
                  transition-colors duration-200
                  ${hasError ? 'border-red-500' : ''}
                  ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
                {...props}
              />
              <label
                htmlFor={radioId}
                className={`
                  ml-3 text-sm font-medium
                  ${hasError ? 'text-red-600' : 'text-gray-700'}
                  ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {optionLabel}
              </label>
            </div>
          );
        })}
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

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
