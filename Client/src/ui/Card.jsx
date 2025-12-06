import React from 'react';

/**
 * Reusable Card Component
 */
const Card = React.memo(({
  children,
  title = null,
  footer = null,
  className = '',
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border border-gray-200
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
