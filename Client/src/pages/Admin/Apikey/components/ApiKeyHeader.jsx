import React from 'react';
import { HiOutlinePlus } from 'react-icons/hi';

const ApiKeyHeader = ({ onCreate }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Integration API Keys
        </h1>

        <p className="mt-1 text-gray-500">
          Manage internal system integration keys.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
      >
        <HiOutlinePlus className="text-lg" />
        Generate API Key
      </button>
    </div>
  );
};

export default ApiKeyHeader;
