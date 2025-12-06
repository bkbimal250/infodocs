import React from 'react';

/**
 * Loading Skeleton Component
 * Provides better UX than spinners during loading states
 */

export const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const TemplateCardSkeleton = () => (
  <div className="animate-pulse rounded-lg overflow-hidden border border-gray-200">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6 space-y-4">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default {
  CardSkeleton,
  TemplateCardSkeleton,
  FormSkeleton,
  TableSkeleton,
};
