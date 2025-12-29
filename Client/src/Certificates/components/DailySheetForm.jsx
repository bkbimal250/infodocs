import React from 'react';

/**
 * Daily Sheet Form Component
 * Daily Sheet certificates only use SPA data - no additional form fields needed
 */
const DailySheetForm = ({ formData, handleInputChange }) => {
  return (
    <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] p-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Daily Sheet certificates use SPA location data only. Please select a SPA location above.
      </p>
      {formData.spa_name && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--color-text-tertiary)]">Selected SPA:</p>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{formData.spa_name}</p>
        </div>
      )}
    </div>
  );
};

export default DailySheetForm;
