# Color System Documentation

## Overview
This project uses a centralized color system with 10 professional colors that can be used throughout the entire website.

## Color Palette

### Primary Colors (Indigo)
- **Primary**: `#6366f1` - Main brand color for primary actions and buttons
- **Primary Dark**: `#4f46e5` - Hover states and active states
- **Primary Light**: `#818cf8` - Light backgrounds and subtle accents

### Secondary Colors (Pink)
- **Secondary**: `#ec4899` - Secondary actions and accents
- **Secondary Dark**: `#db2777` - Hover states
- **Secondary Light**: `#f472b6` - Light backgrounds

### Status Colors
- **Success** (Green): `#10b981` - Success messages, positive actions
- **Warning** (Amber): `#f59e0b` - Warning messages, cautions
- **Error** (Red): `#ef4444` - Error messages, destructive actions
- **Info** (Blue): `#3b82f6` - Information messages, links

## Usage

### In CSS/Tailwind Classes

#### Using CSS Variables
```css
.my-element {
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}
```

#### Using Tailwind Arbitrary Values
```jsx
<div className="bg-[var(--color-primary)] text-[var(--color-text-inverse)]">
  Content
</div>
```

### In JavaScript/React

#### Import and Use
```javascript
import { colors, gradients } from '../config/colors';

// Direct color usage
<div style={{ backgroundColor: colors.primary }}>...</div>

// Gradient usage
<div style={{ background: gradients.primary }}>...</div>
```

#### Using Theme Utilities
```javascript
import theme from '../utils/theme';

// Get CSS variable
const primaryColor = theme.getCSSVar('primary');

// Get Tailwind class
const bgClass = theme.getColorClass('primary', 'bg');
```

## Color Naming Convention

- **Primary**: Main brand color
- **Secondary**: Supporting brand color
- **Success**: Positive/confirmation states
- **Warning**: Caution/warning states
- **Error**: Error/destructive states
- **Info**: Informational states
- **Gray**: Neutral colors (50-900 scale)
- **Text**: Text colors (primary, secondary, tertiary, inverse)
- **Border**: Border colors (primary, secondary, focus)
- **Bg**: Background colors (primary, secondary, tertiary)

## Best Practices

1. **Always use the centralized colors** - Don't hardcode hex values
2. **Use semantic names** - Use `primary` instead of `indigo-500`
3. **Maintain consistency** - Use the same color for similar UI elements
4. **Consider accessibility** - Ensure sufficient contrast ratios
5. **Use gradients sparingly** - Use predefined gradients from `gradients` object

## Examples

### Buttons
```jsx
// Primary button
<button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
  Primary Action
</button>

// Success button
<button className="bg-[var(--color-success)] hover:bg-[var(--color-success-dark)]">
  Confirm
</button>
```

### Cards
```jsx
<div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
  Card Content
</div>
```

### Text
```jsx
<h1 className="text-[var(--color-text-primary)]">Heading</h1>
<p className="text-[var(--color-text-secondary)]">Description</p>
```

