import React from 'react';

/**
 * Responsive Stepper component to visualize form progress.
 */
const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8 px-2 overflow-hidden">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step Item */}
            <div className="flex flex-col items-center relative z-10 transition-all duration-500">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white ring-4 ring-blue-100 scale-110 shadow-lg shadow-blue-200'
                    : isCompleted
                    ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-[10px] font-bold tracking-tight uppercase transition-colors duration-300 whitespace-nowrap hidden sm:block ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-text-muted'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-gray-200 relative top-[-10px] sm:top-[-20px]">
                <div
                  className="h-full bg-blue-500 transition-all duration-700 ease-in-out"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
