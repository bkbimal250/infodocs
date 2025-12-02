/**
 * Color Mapper Utility
 * Maps common Tailwind color classes to centralized CSS variables
 * 
 * Usage: Replace Tailwind classes with mapped CSS variable classes
 */

export const colorMap = {
  // Primary Colors (Indigo)
  'bg-blue-600': 'bg-[var(--color-primary)]',
  'bg-blue-700': 'bg-[var(--color-primary-dark)]',
  'bg-blue-500': 'bg-[var(--color-primary-light)]',
  'hover:bg-blue-700': 'hover:bg-[var(--color-primary-dark)]',
  'hover:bg-blue-800': 'hover:bg-[var(--color-primary-dark)]',
  'text-blue-600': 'text-[var(--color-primary)]',
  'text-blue-700': 'text-[var(--color-primary-dark)]',
  'border-blue-600': 'border-[var(--color-primary)]',
  'border-blue-500': 'border-[var(--color-primary-light)]',
  'ring-blue-500': 'ring-[var(--color-primary)]',
  'focus:ring-blue-500': 'focus:ring-[var(--color-primary)]',
  'focus:border-blue-500': 'focus:border-[var(--color-primary)]',
  
  // Secondary Colors (Pink)
  'bg-pink-600': 'bg-[var(--color-secondary)]',
  'bg-pink-700': 'bg-[var(--color-secondary-dark)]',
  'bg-purple-600': 'bg-[var(--color-secondary)]',
  'bg-purple-700': 'bg-[var(--color-secondary-dark)]',
  'hover:bg-pink-700': 'hover:bg-[var(--color-secondary-dark)]',
  'hover:bg-purple-700': 'hover:bg-[var(--color-secondary-dark)]',
  'text-pink-600': 'text-[var(--color-secondary)]',
  'text-purple-600': 'text-[var(--color-secondary)]',
  
  // Success Colors (Green)
  'bg-green-600': 'bg-[var(--color-success)]',
  'bg-green-700': 'bg-[var(--color-success-dark)]',
  'bg-green-500': 'bg-[var(--color-success-light)]',
  'hover:bg-green-700': 'hover:bg-[var(--color-success-dark)]',
  'text-green-600': 'text-[var(--color-success)]',
  'text-green-700': 'text-[var(--color-success-dark)]',
  'text-green-800': 'text-[var(--color-success-dark)]',
  'border-green-500': 'border-[var(--color-success)]',
  'bg-green-100': 'bg-[var(--color-success-light)]',
  'text-green-800': 'text-[var(--color-success-dark)]',
  
  // Error Colors (Red)
  'bg-red-600': 'bg-[var(--color-error)]',
  'bg-red-700': 'bg-[var(--color-error-dark)]',
  'bg-red-500': 'bg-[var(--color-error-light)]',
  'hover:bg-red-700': 'hover:bg-[var(--color-error-dark)]',
  'text-red-600': 'text-[var(--color-error)]',
  'text-red-700': 'text-[var(--color-error-dark)]',
  'border-red-500': 'border-[var(--color-error)]',
  'border-red-300': 'border-[var(--color-error-light)]',
  'bg-red-50': 'bg-[var(--color-error-light)]',
  'text-red-700': 'text-[var(--color-error-dark)]',
  
  // Warning Colors (Amber)
  'bg-yellow-600': 'bg-[var(--color-warning)]',
  'bg-amber-600': 'bg-[var(--color-warning)]',
  'bg-orange-600': 'bg-[var(--color-warning)]',
  'text-yellow-600': 'text-[var(--color-warning)]',
  'text-amber-600': 'text-[var(--color-warning)]',
  
  // Info Colors (Blue)
  'bg-blue-500': 'bg-[var(--color-info)]',
  'bg-blue-600': 'bg-[var(--color-info)]',
  'text-blue-500': 'text-[var(--color-info)]',
  'border-blue-500': 'border-[var(--color-info)]',
  
  // Gray Scale
  'bg-gray-50': 'bg-[var(--color-gray-50)]',
  'bg-gray-100': 'bg-[var(--color-gray-100)]',
  'bg-gray-200': 'bg-[var(--color-gray-200)]',
  'bg-gray-300': 'bg-[var(--color-gray-300)]',
  'bg-gray-500': 'bg-[var(--color-gray-500)]',
  'bg-gray-600': 'bg-[var(--color-gray-600)]',
  'bg-gray-700': 'bg-[var(--color-gray-700)]',
  'bg-gray-800': 'bg-[var(--color-gray-800)]',
  'bg-gray-900': 'bg-[var(--color-gray-900)]',
  'text-gray-50': 'text-[var(--color-gray-50)]',
  'text-gray-100': 'text-[var(--color-gray-100)]',
  'text-gray-200': 'text-[var(--color-gray-200)]',
  'text-gray-300': 'text-[var(--color-gray-300)]',
  'text-gray-400': 'text-[var(--color-gray-400)]',
  'text-gray-500': 'text-[var(--color-text-secondary)]',
  'text-gray-600': 'text-[var(--color-text-secondary)]',
  'text-gray-700': 'text-[var(--color-text-primary)]',
  'text-gray-800': 'text-[var(--color-text-primary)]',
  'text-gray-900': 'text-[var(--color-text-primary)]',
  'border-gray-200': 'border-[var(--color-border-primary)]',
  'border-gray-300': 'border-[var(--color-border-primary)]',
  'border-gray-400': 'border-[var(--color-border-secondary)]',
};

/**
 * Common replacement patterns for buttons
 */
export const buttonPatterns = {
  primary: {
    old: 'bg-blue-600 hover:bg-blue-700 text-white',
    new: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)]'
  },
  secondary: {
    old: 'bg-purple-600 hover:bg-purple-700 text-white',
    new: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-[var(--color-text-inverse)]'
  },
  success: {
    old: 'bg-green-600 hover:bg-green-700 text-white',
    new: 'bg-[var(--color-success)] hover:bg-[var(--color-success-dark)] text-[var(--color-text-inverse)]'
  },
  error: {
    old: 'bg-red-600 hover:bg-red-700 text-white',
    new: 'bg-[var(--color-error)] hover:bg-[var(--color-error-dark)] text-[var(--color-text-inverse)]'
  },
};

