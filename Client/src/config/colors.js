/**
 * Centralized Color Configuration
 * Professional color palette for programmatic access
 * 
 * Usage in JavaScript/React:
 * import { colors } from '../config/colors';
 * <div style={{ backgroundColor: colors.primary }}>...</div>
 * className={`bg-[${colors.primary}]`}
 */

export const colors = {
  // Primary Colors
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Secondary Colors
  secondary: '#ec4899',
  secondaryDark: '#db2777',
  secondaryLight: '#f472b6',
  
  // Success Colors
  success: '#10b981',
  successDark: '#059669',
  successLight: '#34d399',
  
  // Warning Colors
  warning: '#f59e0b',
  warningDark: '#d97706',
  warningLight: '#fbbf24',
  
  // Error/Danger Colors
  error: '#ef4444',
  errorDark: '#dc2626',
  errorLight: '#f87171',
  
  // Info Colors
  info: '#3b82f6',
  infoDark: '#2563eb',
  infoLight: '#60a5fa',
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background Colors
  bg: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    focus: '#6366f1',
  },
};

/**
 * Gradient Presets
 * Pre-defined gradient combinations
 */
export const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  primaryReverse: 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  purple: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  warm: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
};

/**
 * Color Utilities
 * Helper functions for color manipulation
 */
export const colorUtils = {
  /**
   * Get color with opacity
   * @param {string} color - Hex color code
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} RGBA color string
   */
  withOpacity: (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  /**
   * Get hover color (darker version)
   * @param {string} colorName - Color name from colors object
   * @returns {string} Darker color
   */
  getHoverColor: (colorName) => {
    const hoverMap = {
      primary: colors.primaryDark,
      secondary: colors.secondaryDark,
      success: colors.successDark,
      warning: colors.warningDark,
      error: colors.errorDark,
      info: colors.infoDark,
    };
    return hoverMap[colorName] || colors.primaryDark;
  },
};

export default colors;

