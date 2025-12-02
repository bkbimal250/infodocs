# 🎨 Centralized Color System - Quick Reference

## 10 Professional Colors

| Color | Hex Code | CSS Variable | Usage |
|-------|----------|--------------|-------|
| **Primary** | `#6366f1` | `--color-primary` | Main buttons, primary actions |
| **Primary Dark** | `#4f46e5` | `--color-primary-dark` | Hover states |
| **Primary Light** | `#818cf8` | `--color-primary-light` | Light backgrounds |
| **Secondary** | `#ec4899` | `--color-secondary` | Secondary buttons, accents |
| **Success** | `#10b981` | `--color-success` | Success messages, confirmations |
| **Warning** | `#f59e0b` | `--color-warning` | Warning messages |
| **Error** | `#ef4444` | `--color-error` | Error messages, delete actions |
| **Info** | `#3b82f6` | `--color-info` | Info messages, links |
| **Gray Scale** | `#f9fafb` to `#111827` | `--color-gray-*` | Text, borders, backgrounds |
| **Text/Bg/Border** | Various | `--color-text-*` | Semantic color names |

## Quick Usage Examples

### In JSX/Tailwind
```jsx
// Background
<div className="bg-[var(--color-primary)]">...</div>

// Text
<p className="text-[var(--color-text-primary)]">...</p>

// Border
<div className="border-2 border-[var(--color-border-primary)]">...</div>

// Hover states
<button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
  Click Me
</button>
```

### In JavaScript
```javascript
import { colors } from '../config/colors';

// Direct usage
<div style={{ backgroundColor: colors.primary }}>...</div>

// With opacity
import { colorUtils } from '../config/colors';
<div style={{ backgroundColor: colorUtils.withOpacity(colors.primary, 0.1) }}>...</div>
```

### Gradients
```javascript
import { gradients } from '../config/colors';

<div style={{ background: gradients.primary }}>...</div>
```

## File Locations

- **CSS Variables**: `src/styles/colors.css`
- **JavaScript Config**: `src/config/colors.js`
- **Theme Utilities**: `src/utils/theme.js`
- **Examples**: `src/styles/color-examples.jsx`

## Migration Guide

Replace hardcoded colors with CSS variables:

**Before:**
```jsx
<div className="bg-indigo-600 text-white">...</div>
```

**After:**
```jsx
<div className="bg-[var(--color-primary)] text-[var(--color-text-inverse)]">...</div>
```

