import React from 'react';

/**
 * Modern floating label input component.
 * Uses Tailwind peer-focus and peer-placeholder-shown for the animation.
 */
const FloatingInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false,
  error = null,
  ...props 
}) => {
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        id={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className={`peer block w-full px-4 pt-6 pb-2 text-sm font-medium text-[var(--color-text-primary)] bg-gray-50/50 border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] focus:bg-white transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={name}
        className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none ${
          error ? 'text-red-500' : 'text-[var(--color-text-secondary)]'
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="mt-1 text-[10px] text-red-500 font-medium px-4">{error}</p>}
    </div>
  );
};

export default FloatingInput;
