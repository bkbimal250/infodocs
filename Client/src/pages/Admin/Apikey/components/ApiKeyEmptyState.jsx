
import React from 'react';

const ApiKeyEmptyState = () => {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <h3 className="text-xl font-semibold">
        No API Keys Found
      </h3>

      <p className="mt-2 text-gray-500">
        Create your first internal integration API key.
      </p>
    </div>
  );
};

export default ApiKeyEmptyState;
