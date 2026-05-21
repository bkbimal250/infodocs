import React from 'react';

export const Stat = ({ label, value }) => (
  <div className="rounded-lg border bg-white p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);
