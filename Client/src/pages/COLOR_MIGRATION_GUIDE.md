# Color Migration Guide for Pages

## Status
✅ **Completed:**
- Auth pages (Login, Register, ForgotPassword)
- Common components (Pagination)
- Admin Dashboard Stats
- Admin Users page

## Color Replacement Patterns

### Common Replacements

#### Backgrounds
- `bg-gray-50` → `bg-[var(--color-bg-secondary)]`
- `bg-white` → `bg-[var(--color-bg-primary)]`
- `bg-blue-600` → `bg-[var(--color-primary)]`
- `bg-green-600` → `bg-[var(--color-success)]`
- `bg-red-600` → `bg-[var(--color-error)]`
- `bg-purple-600` → `bg-[var(--color-secondary)]`

#### Text Colors
- `text-gray-900` → `text-[var(--color-text-primary)]`
- `text-gray-600` → `text-[var(--color-text-secondary)]`
- `text-gray-500` → `text-[var(--color-text-secondary)]`
- `text-blue-600` → `text-[var(--color-primary)]`
- `text-white` → `text-[var(--color-text-inverse)]`

#### Borders
- `border-gray-200` → `border-[var(--color-border-primary)]`
- `border-gray-300` → `border-[var(--color-border-primary)]`
- `border-blue-500` → `border-[var(--color-primary)]`

#### Buttons
- `bg-blue-600 hover:bg-blue-700 text-white` → `bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)]`
- `bg-green-600 hover:bg-green-700` → `bg-[var(--color-success)] hover:bg-[var(--color-success-dark)]`
- `bg-red-600 hover:bg-red-700` → `bg-[var(--color-error)] hover:bg-[var(--color-error-dark)]`

#### Status Messages
- `bg-red-50 border-red-200 text-red-700` → `bg-[var(--color-error-light)] border-[var(--color-error-light)] text-[var(--color-error-dark)]`
- `bg-green-50 border-green-200 text-green-700` → `bg-[var(--color-success-light)] border-[var(--color-success-light)] text-[var(--color-success-dark)]`

#### Focus States
- `focus:ring-blue-500 focus:border-blue-500` → `focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]`

## Files to Update

### Priority 1 (High Usage)
- [x] `auth/Login.jsx`
- [x] `auth/Register.jsx`
- [x] `auth/ForgotPassword.jsx`
- [x] `common/Pagination.jsx`
- [x] `Admin/Dashboard/DashboardStats.jsx`
- [x] `Admin/Users/Users.jsx`
- [ ] `Admin/Users/Userstable.jsx`
- [ ] `Admin/Spa/Spas.jsx`
- [ ] `Admin/Spa/SpaTable.jsx`
- [ ] `Admin/FormsData/CandidatesTable.jsx`

### Priority 2 (Medium Usage)
- [ ] All Admin pages
- [ ] All HR pages
- [ ] All Manager pages
- [ ] All User pages

### Priority 3 (Low Usage)
- [ ] Print components
- [ ] View detail components

## Quick Find & Replace

Use these patterns in your IDE's find & replace:

1. **Find:** `bg-gray-50`
   **Replace:** `bg-[var(--color-bg-secondary)]`

2. **Find:** `bg-white`
   **Replace:** `bg-[var(--color-bg-primary)]`

3. **Find:** `text-gray-900`
   **Replace:** `text-[var(--color-text-primary)]`

4. **Find:** `text-gray-600`
   **Replace:** `text-[var(--color-text-secondary)]`

5. **Find:** `border-gray-200`
   **Replace:** `border-[var(--color-border-primary)]`

6. **Find:** `bg-blue-600`
   **Replace:** `bg-[var(--color-primary)]`

7. **Find:** `hover:bg-blue-700`
   **Replace:** `hover:bg-[var(--color-primary-dark)]`

8. **Find:** `text-blue-600`
   **Replace:** `text-[var(--color-primary)]`

9. **Find:** `focus:ring-blue-500`
   **Replace:** `focus:ring-[var(--color-primary)]`

10. **Find:** `focus:border-blue-500`
    **Replace:** `focus:border-[var(--color-primary)]`

## Testing Checklist

After updating each file:
- [ ] Check visual appearance
- [ ] Test hover states
- [ ] Test focus states
- [ ] Verify button colors
- [ ] Check error/success messages
- [ ] Test responsive design

## Notes

- Always use CSS variables: `var(--color-*)`
- Maintain semantic color usage (primary for main actions, error for errors, etc.)
- Test in both light and dark modes if applicable
- Keep accessibility in mind (contrast ratios)

