import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { spaLabel } from './StaffHelpers';

export const StaffFilters = ({ filters, setFilters, spas, showSpa }) => {
  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <FaSearch className="absolute left-3 top-3 text-xs text-gray-400" />
          <input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search name or phone"
            className="w-full rounded-md border px-8 py-2 text-sm outline-none focus:border-gray-900"
          />
        </div>
        {showSpa && (
          <select value={filters.current_spa_id} onChange={(e) => update({ current_spa_id: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All SPAs</option>
            {spas.map((spa) => <option key={spa.id} value={spa.id}>{spaLabel(spa)}</option>)}
          </select>
        )}
        <input value={filters.city} onChange={(e) => update({ city: e.target.value })} placeholder="City" className="rounded-md border px-3 py-2 text-sm" />
        <select value={filters.employment_status} onChange={(e) => update({ employment_status: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Employment</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="resigned">Resigned</option>
        </select>
        <select value={filters.verification_status} onChange={(e) => update({ verification_status: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Verification</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.blacklist} onChange={(e) => update({ blacklist: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Blacklist</option>
          <option value="true">Blacklisted</option>
          <option value="false">Not blacklisted</option>
        </select>
      </div>
    </div>
  );
};
