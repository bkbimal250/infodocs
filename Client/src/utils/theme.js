/**
 * Theme Utilities
 * Easy access to colors and theme values throughout the application
 */

import { colors, gradients, colorUtils } from '../config/colors';

/**
 * Get Tailwind class names for colors
 * Usage: theme.getColorClass('primary', 'bg')
 */
export const theme = {
  colors,
  gradients,
  colorUtils,
  
  /**
   * Get Tailwind color classes
   * @param {string} colorName - Color name (primary, secondary, etc.)
   * @param {string} type - Type (bg, text, border)
   * @returns {string} Tailwind class name
   */
  getColorClass: (colorName, type = 'bg') => {
    // For Tailwind v4, we'll use arbitrary values with CSS variables
    const colorMap = {
      primary: 'var(--color-primary)',
      primaryDark: 'var(--color-primary-dark)',
      primaryLight: 'var(--color-primary-light)',
      secondary: 'var(--color-secondary)',
      secondaryDark: 'var(--color-secondary-dark)',
      secondaryLight: 'var(--color-secondary-light)',
      success: 'var(--color-success)',
      successDark: 'var(--color-success-dark)',
      successLight: 'var(--color-success-light)',
      warning: 'var(--color-warning)',
      warningDark: 'var(--color-warning-dark)',
      warningLight: 'var(--color-warning-light)',
      error: 'var(--color-error)',
      errorDark: 'var(--color-error-dark)',
      errorLight: 'var(--color-error-light)',
      info: 'var(--color-info)',
      infoDark: 'var(--color-info-dark)',
      infoLight: 'var(--color-info-light)',
    };
    
    const color = colorMap[colorName] || colorMap.primary;
    return `${type}-[${color}]`;
  },
  
  /**
   * Get CSS variable name
   * @param {string} colorName - Color name
   * @returns {string} CSS variable name
   */
  getCSSVar: (colorName) => {
    const varMap = {
      primary: '--color-primary',
      primaryDark: '--color-primary-dark',
      primaryLight: '--color-primary-light',
      secondary: '--color-secondary',
      secondaryDark: '--color-secondary-dark',
      secondaryLight: '--color-secondary-light',
      success: '--color-success',
      successDark: '--color-success-dark',
      successLight: '--color-success-light',
      warning: '--color-warning',
      warningDark: '--color-warning-dark',
      warningLight: '--color-warning-light',
      error: '--color-error',
      errorDark: '--color-error-dark',
      errorLight: '--color-error-light',
      info: '--color-info',
      infoDark: '--color-info-dark',
      infoLight: '--color-info-light',
    };
    return varMap[colorName] || varMap.primary;
  },
};

export default theme;

