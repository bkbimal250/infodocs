import { Toaster } from 'react-hot-toast';

/**
 * Toast Notification Component
 * Provides toast notifications throughout the application
 */
const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,
        style: {
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        // Success toast options
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'var(--color-text-inverse)',
          },
          style: {
            background: 'var(--color-success-light)',
            color: 'var(--color-success-dark)',
            border: '1px solid var(--color-success)',
          },
        },
        // Error toast options
        error: {
          duration: 4000,
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'var(--color-text-inverse)',
          },
          style: {
            background: 'var(--color-error-light)',
            color: 'var(--color-error-dark)',
            border: '1px solid var(--color-error)',
          },
        },
        // Loading toast options
        loading: {
          iconTheme: {
            primary: 'var(--color-primary)',
            secondary: 'var(--color-text-inverse)',
          },
        },
      }}
    />
  );
};

export default Toast;

